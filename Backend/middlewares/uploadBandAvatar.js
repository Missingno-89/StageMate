
import multer from "multer";

const allowedMimeTypes = [
    "image/jpeg",
    "image/png",
    "image/webp"
];
const uploadBandAvatar = multer({
    storage: multer.memoryStorage(),
    fileFilter: (req, file, cb) => {
        if (allowedMimeTypes.includes(file.mimetype)) {
            return cb(null, true);
        }
        return cb(new Error("Formato immagine non supportato"));
    },
    limits: {
        fileSize: 5 * 1024 * 1024
    }
});
export function handleBandAvatarUpload(req, res, next) {
    uploadBandAvatar.single("avatar")(req, res, (error) => {
        if (error instanceof multer.MulterError) {
            return res.status(400).json({
                message: error.message
            });
        }

        if (error) {
            return res.status(400).json({
                message: error.message
            });
        }

        next();
    });
}
export default uploadBandAvatar;
