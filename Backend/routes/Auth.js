import express from "express";
import {
    forgotPassword,
    getMe,
    login,
    register,
    resetPassword
} from "../controllers/auth.js";

import { authenticate } from "../middlewares/authenticate.js";
import passport from "passport";
import "../strategies/google.js";

import jwt from "jsonwebtoken";
import { randomBytes, timingSafeEqual, createHash } from "node:crypto";
import OAuthCode from "../models/OAuthCode.js";

const AuthRouther = express.Router();

// ==========================================
// AUTENTICAZIONE TRADIZIONALE
// ==========================================

AuthRouther.post("/register", register);
AuthRouther.post("/login", login);
AuthRouther.get("/me", authenticate, getMe);
AuthRouther.post("/forgot-password", forgotPassword);
AuthRouther.post("/reset-password", resetPassword);

// ==========================================
// GOOGLE OAUTH - AVVIO AUTENTICAZIONE
// ==========================================

AuthRouther.get(
    "/google",

    (req, res, next) => {

        console.log("STEP 1 - Richiesta Google ricevuta");

        const state = randomBytes(32).toString("hex");

        res.cookie("google_oauth_state", state, {
            httpOnly: true,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
            maxAge: 5 * 60 * 1000
        });

        res.locals.oauthState = state;

        console.log("STEP 2 - State generato");

        next();
    },

    (req, res, next) => {

        console.log("STEP 3 - Avvio Passport Google");

        passport.authenticate("google", {
            scope: ["openid", "profile", "email"],
            session: false,
            state: res.locals.oauthState
        })(req, res, next);
    }
);

// ==========================================
// GOOGLE OAUTH - CALLBACK
// ==========================================

AuthRouther.get(
    "/google/callback",

    // Verifica dello state
    (req, res, next) => {
        const receivedState = req.query.state;
        const savedState = req.cookies?.google_oauth_state;

        res.clearCookie("google_oauth_state", {
            httpOnly: true,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production"
        });

        if (
            typeof receivedState !== "string" ||
            typeof savedState !== "string" ||
            !/^[a-f0-9]{64}$/.test(receivedState) ||
            !/^[a-f0-9]{64}$/.test(savedState)
        ) {
            return res.status(403).json({
                message: "Invalid OAuth state"
            });
        }

        const receivedBuffer = Buffer.from(receivedState, "hex");
        const savedBuffer = Buffer.from(savedState, "hex");

        if (
            receivedBuffer.length !== savedBuffer.length ||
            !timingSafeEqual(receivedBuffer, savedBuffer)
        ) {
            return res.status(403).json({
                message: "Invalid OAuth state"
            });
        }

        next();
    },

    // Autenticazione tramite Passport
    passport.authenticate("google", {
        session: false
    }),

    // Generazione codice temporaneo
    async (req, res) => {
        try {
            // Generiamo un codice casuale
            const code = randomBytes(32).toString("hex");

            // Calcoliamo l'hash del codice
            const codeHash = createHash("sha256")
                .update(code)
                .digest("hex");

            // Il codice scade dopo 60 secondi
            const expiresAt = new Date(Date.now() + 60 * 1000);

            // Salviamo il codice su MongoDB
            await OAuthCode.create({
                user: req.user._id,
                codeHash,
                expiresAt
            });

            // Reindirizziamo al frontend React
            const frontendURL =
                process.env.FRONTEND_URL || "http://localhost:5173";

            const redirectURL = new URL(
                "/auth/callback",
                frontendURL
            );

            redirectURL.searchParams.set("code", code);

            return res.redirect(redirectURL.toString());

        } catch (error) {
            console.error("Google OAuth callback error:", error.message);

            return res.status(500).json({
                message: "Errore durante l'autenticazione Google"
            });
        }
    }
);

// ==========================================
// GOOGLE OAUTH - SCAMBIO CODICE CON JWT
// ==========================================

AuthRouther.post("/google/exchange", async (req, res) => {
    try {
        const { code } = req.body;

        if (
            typeof code !== "string" ||
            !/^[a-f0-9]{64}$/.test(code)
        ) {
            return res.status(400).json({
                message: "Codice non valido"
            });
        }

        // Calcoliamo l'hash del codice ricevuto
        const codeHash = createHash("sha256")
            .update(code)
            .digest("hex");

        // Cerchiamo il codice e lo eliminiamo in un'unica operazione
        const oauthCode = await OAuthCode.findOneAndDelete({
            codeHash,
            expiresAt: { $gt: new Date() }
        });

        if (!oauthCode) {
            return res.status(401).json({
                message: "Codice scaduto o già utilizzato"
            });
        }

        // Generiamo il JWT per l'utente autenticato
        const token = jwt.sign(
            { id: oauthCode.user },
            process.env.JWT_SECRET,
            {
                expiresIn: process.env.JWT_EXPIRES_IN
            }
        );

        return res.status(200).json({
            token
        });

    } catch (error) {
        console.error("Google OAuth exchange error:", error.message);

        return res.status(500).json({
            message: "Errore durante lo scambio del codice"
        });
    }
});

export default AuthRouther;