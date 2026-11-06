
import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "node:crypto";
import { sendEmail } from "../services/emailService.js";

// ==========================================
// REGISTRAZIONE
// ==========================================

export async function register(req, res) {
    try {
        const { name, surname, email, password } = req.body ?? {};

        if (
            typeof name !== "string" ||
            typeof surname !== "string" ||
            typeof email !== "string" ||
            typeof password !== "string" ||
            !name.trim() ||
            !surname.trim() ||
            !email.trim() ||
            password.length < 8
        ) {
            return res.status(400).json({
                message: "All fields are required and password must contain at least 8 characters"
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const existingUser = await User.findOne({
            email: normalizedEmail
        });

        if (existingUser) {
            return res.status(409).json({
                message: "User already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await User.create({
            name: name.trim(),
            surname: surname.trim(),
            email: normalizedEmail,
            password: hashedPassword
        });

        return res.status(201).json({
            message: "User created"
        });

    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                message: "User already exists"
            });
        }

        console.error("Register error:", error.message);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
}

// ==========================================
// LOGIN
// ==========================================

export async function login(req, res) {
    try {
        const { email, password } = req.body ?? {};

        if (
            typeof email !== "string" ||
            typeof password !== "string" ||
            !email.trim() ||
            !password.trim()
        ) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        const existingUser = await User.findOne({
            email: email.trim().toLowerCase()
        }).select("+password");

        // Utente inesistente oppure senza password locale
        if (!existingUser || !existingUser.password) {
            return res.status(401).json({
                message: "Invalid credentials"
            });
        }

        const isPasswordValid = await bcrypt.compare(
            password,
            existingUser.password
        );

        if (!isPasswordValid) {
            return res.status(401).json({
                message: "Invalid credentials"
            });
        }

        const token = jwt.sign(
            {
                id: existingUser._id
            },
            process.env.JWT_SECRET,
            {
                expiresIn: process.env.JWT_EXPIRES_IN
            }
        );

        return res.status(200).json({
            token
        });

    } catch (error) {
        console.error("Login error:", error.message);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
}

// ==========================================
// UTENTE AUTENTICATO
// ==========================================

export async function getMe(req, res) {
    try {
        const user = await User.findById(req.userId)
            .select("-password -resetPasswordToken -resetPasswordExpires");

        if (!user) {
            return res.status(404).json({
                message: "User not available"
            });
        }

        return res.status(200).json({
            user
        });

    } catch (error) {
        console.error("GetMe error:", error.message);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
}

// ==========================================
// PASSWORD DIMENTICATA
// ==========================================

export async function forgotPassword(req, res) {
    const genericMessage =
        "Se l'indirizzo è registrato, riceverai un'email con le istruzioni.";

    try {
        const { email } = req.body ?? {};

        // 1. Validazione email
        if (
            typeof email !== "string" ||
            !email.trim()
        ) {
            return res.status(400).json({
                message: "Valid email required"
            });
        }

        // 2. Normalizzazione email
        const normalizedEmail = email.trim().toLowerCase();

        // 3. Ricerca utente
        const user = await User.findOne({
            email: normalizedEmail
        });

        // Non riveliamo se l'email è registrata
        if (!user) {
            return res.status(200).json({
                message: genericMessage
            });
        }

        // 4. Generazione token casuale
        const resetToken = crypto
            .randomBytes(32)
            .toString("hex");

        // 5. Hash del token
        const hashedToken = crypto
            .createHash("sha256")
            .update(resetToken)
            .digest("hex");

        // 6. Scadenza dopo 15 minuti
        const expiresAt = new Date(
            Date.now() + 15 * 60 * 1000
        );

        // 7. Salvataggio nel database
        user.resetPasswordToken = hashedToken;
        user.resetPasswordExpires = expiresAt;

        await user.save();

        // 8. Creazione link recupero password
        const frontendUrl =
            process.env.FRONTEND_URL || "http://localhost:5173";

        const resetUrl =
            `${frontendUrl}/reset-password?token=${resetToken}`;

        // 9. Preparazione email
        const subject = "Recupero password StageMate";

        const html = `
            <h1>Recupero password StageMate</h1>

            <p>
                Abbiamo ricevuto una richiesta di recupero
                della password.
            </p>

            <p>
                Clicca sul collegamento seguente per
                impostare una nuova password:
            </p>

            <a href="${resetUrl}">
                Reimposta la password
            </a>

            <p>
                Questo link scadrà tra 15 minuti.
            </p>

            <p>
                Se non hai richiesto il recupero,
                puoi ignorare questa email.
            </p>
        `;

        // 10. Invio email
        try {
            await sendEmail(user.email, subject, html);

        } catch (emailError) {
            console.error(
                "Errore invio email:",
                emailError.message
            );

            // Rimuoviamo soltanto il token
            // generato da questa richiesta
            try {
                await User.updateOne(
                    {
                        _id: user._id,
                        resetPasswordToken: hashedToken
                    },
                    {
                        $unset: {
                            resetPasswordToken: "",
                            resetPasswordExpires: ""
                        }
                    }
                );

            } catch (cleanupError) {
                console.error(
                    "Errore pulizia token:",
                    cleanupError.message
                );
            }
        }

        // 11. Risposta generica
        return res.status(200).json({
            message: genericMessage
        });

    } catch (error) {
        console.error(
            "ForgotPassword error:",
            error.message
        );

        return res.status(500).json({
            message: "Internal server error"
        });
    }
}

// ==========================================
// REIMPOSTAZIONE PASSWORD
// ==========================================

export async function resetPassword(req, res) {
    try {
        // 1. Recupero dati
        const { token, newPassword } = req.body ?? {};

        // 2. Validazione token
        if (
            typeof token !== "string" ||
            !/^[a-f0-9]{64}$/i.test(token)
        ) {
            return res.status(400).json({
                message: "Invalid or missing token"
            });
        }

        // 3. Validazione password
        if (
            typeof newPassword !== "string" ||
            newPassword.length < 8
        ) {
            return res.status(400).json({
                message: "Password must contain at least 8 characters"
            });
        }

        // 4. Hash del token ricevuto
        const hashedToken = crypto
            .createHash("sha256")
            .update(token)
            .digest("hex");

        // 5. Hash della nuova password
        const hashedPassword = await bcrypt.hash(
            newPassword,
            10
        );

        // 6. Ricerca e aggiornamento atomico
        const updatedUser = await User.findOneAndUpdate(
            {
                resetPasswordToken: hashedToken,
                resetPasswordExpires: {
                    $gt: new Date()
                }
            },
            {
                $set: {
                    password: hashedPassword
                },
                $unset: {
                    resetPasswordToken: "",
                    resetPasswordExpires: ""
                }
            },
            {
                new: true,
                runValidators: true
            }
        );

        // 7. Token inesistente, scaduto o già utilizzato
        if (!updatedUser) {
            return res.status(400).json({
                message: "Invalid or expired token"
            });
        }

        // 8. Password aggiornata correttamente
        return res.status(200).json({
            message: "Password updated successfully"
        });

    } catch (error) {
        console.error(
            "ResetPassword error:",
            error.message
        );

        return res.status(500).json({
            message: "Internal server error"
        });
    }
}
