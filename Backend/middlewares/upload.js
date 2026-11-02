import multer from "multer";

const storage = multer.memoryStorage();
const allowedMimeTypes = [
    "audio/mpeg",
    "audio/wav",
    "audio/x-wav",
    "application/pdf",
    "image/jpeg",
    "image/png"
];

const fileFilter = (req, file, cb) => {
    if(allowedMimeTypes.includes(file.mimetype)){
        return cb(null,true)
    } else {
        return cb(new Error("File type not allowed"))
    }

};
const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 20 * 1024 * 1024
    }
});

export default upload;