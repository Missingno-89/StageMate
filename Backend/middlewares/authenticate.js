import jwt from "jsonwebtoken";

export function authenticate(req, res, next) {
    try {
        const authHeader = req.headers.authorization
        if (!authHeader) {
            return res.status(401).json({
                message: "Authentication required"
            })
        }
        const parts = authHeader.split(" ");
        const token = parts[1]
        if (parts[0] !== "Bearer" || parts.length !== 2 || !token) {
            return res.status(401).json({
                message: "invalid authorization header"
            })
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        req.userId = decoded.id;
        next()

    } catch (error) {
        if (error.name === "JsonWebTokenError" ||
            error.name === "TokenExpiredError") {
            return res.status(401).json({
                message: "Invalid or expired token"
            });
        }
        return res.status(500).json({
            message: "Internal server error"
        });

    }
}