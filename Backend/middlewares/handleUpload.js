import multer from "multer";
import upload from "./upload.js";

export function handleUpload(req, res, next) {
    upload.single("file")(req, res, (error) => {
        if (error instanceof multer.MulterError) {
            return res.status(400).json({
                message: error.message
            });
        }

        if (error) {
            return res.status(400).json({
                message: "File upload rejected"
            });
        }

        next();
    });
}