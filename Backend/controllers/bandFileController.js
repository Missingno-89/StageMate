import mongoose from "mongoose";
import Band from "../models/Band.js";
import BandFile from "../models/BandFile.js";
import cloudinary from "../config/cloudinary.js";
import { fileTypeFromBuffer } from "file-type";


function normalizeMime(mime) {
    if (mime === "audio/x-wav") {
        return "audio/wav";
    }

    return mime;
}

export async function uploadBandFile(req, res) {
    let uploadResult;
    try {
        const { id } = req.params;
        const userId = req.userId;
        const allowedMimeTypes = [
            "audio/mpeg",
            "audio/wav",
            "audio/x-wav",
            "application/pdf",
            "image/jpeg",
            "image/png"
        ];


        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "Invalid band id"
            });
        }
        const band = await Band.findById(id);
        if (!band) {
            return res.status(404).json({
                message: "Band not found"
            });
        }

        const isOwner = band.owner.toString() === userId.toString();
        const isMember = band.members.some(
            member => member.toString() === userId.toString());


        if (!isOwner && !isMember) {
            return res.status(403).json({
                message: "Forbidden"
            });
        }
        const file = req.file
        if (!file) {
            return res.status(400).json({
                message: "No file uploaded"
            });
        }
        const detectedType = await fileTypeFromBuffer(file.buffer);
        if (!detectedType) {
            return res.status(400).json({
                message: "Invalid file type"
            });
        }
        if (!allowedMimeTypes.includes(detectedType.mime)) {
            return res.status(400).json({
                message: "File format not allowed"
            });
        }
        const declaredMime = normalizeMime(file.mimetype);
        const actualMime = normalizeMime(detectedType.mime);
        if (declaredMime !== actualMime) {
            return res.status(400).json({
                message: "File MIME mismatch"
            });
        }

        uploadResult = await new Promise((resolve, reject) => {

            const stream = cloudinary.uploader.upload_stream(
                {
                    folder: `stagemate/bands/${id}`,
                    resource_type: "auto"
                },
                (error, result) => {
                    if (error) {
                        return reject(error);
                    }

                    resolve(result);
                }
            );

            stream.end(file.buffer);
        });
        let fileType;

        if (actualMime.startsWith("audio/")) {
            fileType = "audio";
        } else if (actualMime.startsWith("image/")) {
            fileType = "image";
        } else {
            fileType = "document";
        }
        const newFile = await BandFile.create({
            band: id,
            uploadedBy: userId,
            name: file.originalname,
            url: uploadResult.secure_url,
            publicId: uploadResult.public_id,
            fileType: fileType,
            size: file.size,
            resourceType: uploadResult.resource_type


        });
        return res.status(201).json({ message: "file uploaded", newFile })


    } catch (error) {
        if (uploadResult?.public_id) {
            try {
                await cloudinary.uploader.destroy(
                    uploadResult.public_id,
                    {
                        resource_type: uploadResult.resource_type
                    }
                );
            } catch (cleanupError) {
                console.error("Cloudinary cleanup error:", cleanupError);
            }
        }
        console.error("Upload file error:", error);
        return res.status(500).json({ message: "Internal server error" })
    }
};

export async function getBandFiles(req, res) {
    try {
        const { id } = req.params;

        const files = await BandFile.find({
            band: id
        }).sort({ created_at: -1 });
        return res.status(200).json({ files })

    } catch (error) {
        console.error("Get band files error:", error);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
};


export async function deleteBandFile(req, res) {
    try {
        const { id, fileId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "Invalid band id"
            });
        }

        if (!mongoose.Types.ObjectId.isValid(fileId)) {
            return res.status(400).json({
                message: "Invalid file id"
            });
        }


        const file = await BandFile.findOne({
            _id: fileId,
            band: id
        });

        if (!file) {
            return res.status(404).json({
                message: "File not found"
            });
        }


        const cloudinaryResult = await cloudinary.uploader.destroy(
            file.publicId,
            {
                resource_type: file.resourceType,
                invalidate: true
            }
        );


        if (
            cloudinaryResult.result !== "ok" &&
            cloudinaryResult.result !== "not found"
        ) {
            return res.status(502).json({
                message: "Cloudinary deletion failed"
            });
        }

const deletedFile = await BandFile.findOneAndDelete({
    _id: fileId,
    band: id
});

if (!deletedFile) {
    return res.status(409).json({
        message: "File record could not be deleted"
    });
}


        return res.status(200).json({
            message: "File deleted successfully"
        });

    } catch (error) {
        console.error("Delete band file error:", error);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
}