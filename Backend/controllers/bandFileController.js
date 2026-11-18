
import mongoose from "mongoose";
import Band from "../models/Band.js";
import BandFile from "../models/BandFile.js";
import cloudinary from "../config/cloudinary.js";
import { fileTypeFromBuffer } from "file-type";

const ALLOWED_MIME_TYPES = new Set([
    "audio/mpeg",
    "audio/wav",
    "application/pdf",
    "image/jpeg",
    "image/png"
]);

function normalizeMime(mime) {
    return mime === "audio/x-wav" ? "audio/wav" : mime;
}

// Verifica che l'utente possa accedere alla band
async function getAuthorizedBand(req, res) {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
        res.status(400).json({ message: "ID band non valido" });
        return null;
    }

    const band = await Band.findById(id);

    if (!band) {
        res.status(404).json({ message: "Band non trovata" });
        return null;
    }

    const userId = String(req.userId);
    const isOwner = String(band.owner) === userId;
    const isMember = band.members.some(
        member => String(member) === userId
    );

    if (!isOwner && !isMember) {
        res.status(403).json({ message: "Accesso negato" });
        return null;
    }

    return band;
}

// ========================================
// POST - CARICAMENTO FILE
// ========================================

export async function uploadBandFile(req, res) {
    let uploadResult;

    try {
        const band = await getAuthorizedBand(req, res);
        if (!band) return;

        const file = req.file;

        if (!file) {
            return res.status(400).json({
                message: "Seleziona un file"
            });
        }

        const detectedType = await fileTypeFromBuffer(file.buffer);
        const actualMime = normalizeMime(detectedType?.mime);
        const declaredMime = normalizeMime(file.mimetype);

        if (!ALLOWED_MIME_TYPES.has(actualMime)) {
            return res.status(400).json({
                message: "Formato file non supportato"
            });
        }

        if (declaredMime !== actualMime) {
            return res.status(400).json({
                message: "Il formato del file non corrisponde al contenuto"
            });
        }

        const resourceType = actualMime.startsWith("audio/")
            ? "video"
            : actualMime.startsWith("image/")
                ? "image"
                : "raw";

        // Upload su Cloudinary
        uploadResult = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                {
                    folder: `stagemate/bands/${req.params.id}`,
                    resource_type: resourceType
                },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );

            stream.end(file.buffer);
        });

        // Salvataggio su MongoDB
        const savedFile = await BandFile.create({
            bandId: req.params.id,
            uploadedBy: req.userId,
            name: file.originalname,
            size: file.size,
            mimeType: actualMime,
            url: uploadResult.secure_url,
            publicId: uploadResult.public_id,
            resourceType: resourceType
        });

        await savedFile.populate("uploadedBy", "name surname");

        return res.status(201).json({
            message: "File caricato correttamente",
            file: savedFile
        });

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

        return res.status(500).json({
            message: "Internal server error"
        });
    }
}

// ========================================
// GET - ELENCO FILE
// ========================================

export async function getBandFiles(req, res) {
    try {
        const band = await getAuthorizedBand(req, res);
        if (!band) return;

        const files = await BandFile.find({
            bandId: req.params.id
        })
            .populate("uploadedBy", "name surname")
            .sort({ created_at: -1 });

        return res.status(200).json({ files });

    } catch (error) {
        console.error("Get band files error:", error);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
}

// ========================================
// DELETE - ELIMINAZIONE FILE
// ========================================

export async function deleteBandFile(req, res) {
    try {
        const band = await getAuthorizedBand(req, res);
        if (!band) return;

        const { id, fileId } = req.params;

        if (!mongoose.isValidObjectId(fileId)) {
            return res.status(400).json({
                message: "ID file non valido"
            });
        }

        const file = await BandFile.findOne({
            _id: fileId,
            bandId: id
        });

        if (!file) {
            return res.status(404).json({
                message: "File non trovato"
            });
        }

        const userId = String(req.userId);

        const isAuthor = String(file.uploadedBy) === userId;
        const isOwner = String(band.owner) === userId;

        if (!isAuthor && !isOwner) {
            return res.status(403).json({
                message: "Non autorizzato"
            });
        }

        // Eliminazione da Cloudinary
        const result = await cloudinary.uploader.destroy(
            file.publicId,
            {
                resource_type: file.resourceType,
                invalidate: true
            }
        );

        if (
            result.result !== "ok" &&
            result.result !== "not found"
        ) {
            return res.status(502).json({
                message: "Impossibile eliminare il file da Cloudinary"
            });
        }

        // Eliminazione da MongoDB
        await file.deleteOne();

        return res.status(200).json({
            message: "File eliminato"
        });

    } catch (error) {
        console.error("Delete band file error:", error);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
}
