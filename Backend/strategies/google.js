import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/User.js";
import { OAuth2Client } from "google-auth-library";

const googleClient = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID
);

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: process.env.GOOGLE_CALLBACK_URL,
            passReqToCallback: true
        },

        async (req, accessToken, refreshToken, params, profile, done) => {
            try {
                const idToken = params.id_token;

                if (!idToken) {
                    return done(null, false);
                }

                const ticket = await googleClient.verifyIdToken({
                    idToken,
                    audience: process.env.GOOGLE_CLIENT_ID
                });

                const payload = ticket.getPayload();

                if (!payload?.email_verified || !payload.email || !payload.sub) {
                    return done(null, false);
                }

                const googleId = payload.sub;

                if (profile.id !== googleId) {
                    return done(null, false);
                }

                // Verifica se l'utente Google esiste già
                const user = await User.findOne({
                    googleId
                });

                if (user) {
                    return done(null, user);
                }

                // Recupera i dati dell'utente Google
                const name = profile.name?.givenName;
                const surname = profile.name?.familyName || "";
                const email = payload.email.trim().toLowerCase();
                const avatar = profile.photos?.[0]?.value;

                if (!email || !name) {
                    return done(null, false);
                }

                // Controlla se l'email è già registrata su StageMate
                const existingUser = await User.findOne({
                    email
                });

                if (existingUser) {
                    return done(null, false);
                }

                // Crea un nuovo utente Google
                const newUser = await User.create({
                    googleId,
                    name,
                    surname,
                    email,
                    avatar
                });

                return done(null, newUser);

            } catch (error) {
                return done(error, false);
            }
        }
    )
);