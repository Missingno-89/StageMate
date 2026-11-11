
import jwt from "jsonwebtoken";
import User from "../models/User.js";

export async function authenticate(req, res, next) {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({
                message: "Authentication required"
            });
        }
        const parts = authHeader.split(" ");
        const token = parts[1];
        if (
            parts[0] !== "Bearer" ||
            parts.length !== 2 ||
            !token
        ) {
            return res.status(401).json({
                message: "Invalid authorization header"
            });
        }
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );
        if (!decoded.id) {
            return res.status(401).json({
                message: "Invalid token"
            });
        }
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(401).json({
                message: "User not found"
            });
        }
        if (user.emailVerified === false) {
            return res.status(403).json({
                code: "EMAIL_NOT_VERIFIED",
                message: "Please verify your email before accessing StageMate"
            });
        }
        req.userId = user._id;
        next();

    } catch (error) {
        if (
            error.name === "JsonWebTokenError" ||
            error.name === "TokenExpiredError" ||
            error.name === "NotBeforeError"
        ) {
            return res.status(401).json({
                message: "Invalid or expired token"
            });
        }

        console.error("Authentication error:", error.message);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
}
