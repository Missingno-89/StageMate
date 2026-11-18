
import { Router } from "express";
import mongoose from "mongoose";
import { Readable } from "node:stream";

import Band from "../models/Band.js";
import BandFile from "../models/BandFile.js";

import cloudinary from "../config/cloudinary.js";
import upload from "../middlewares/upload.js";

const router = Router();

// ========================================
// FORMATI SUPPORTATI
// ========================================

const allowed = new Set([
    "audio/mpeg",
    "audio/wav",
    "audio/x-wav",
    "application/pdf",
    "image/jpeg",
    "image/png"
]);

// ========================================
// MIDDLEWARE - ACCESSO ALLA BAND
// ========================================

async function access(req, res, next) {
    try {
        const { bandId } = req.params;

        if (!mongoose.isValidObjectId(bandId)) {
            return res.status(400).json({
                message: "ID band non valido"
            });
        }

        const band = await Band.findById(bandId);

        if (!band) {
            return res.status(404).json({
                message: "Band non trovata"
            });
        }

        const uid = String(req.userId);

        const isOwner = String(band.owner) === uid;

        const isMember = band.members.some(
            id => String(id) === uid
        );

        if (!isOwner && !isMember) {
            return res.status(403).json({
                message: "Accesso negato"
            });
        }

        req.archiveBand = band;

        next();

    } catch (error) {
        next(error);
    }
}

// ========================================
// GET - ELENCO FILE DELLA BAND
// ========================================

router.get(
    "/bands/:bandId/files",
    access,
    async (req, res, next) => {
        try {
            const files = await BandFile.find({
                bandId: req.params.bandId
            })
                .populate("uploadedBy", "name surname")
                .sort({ created_at: -1 });

            res.json({ files });

        } catch (error) {
            next(error);
        }
    }
);

// ========================================
// POST - CARICAMENTO FILE
// ========================================

router.post(
    "/bands/:bandId/files",
    access,

    // Middleware Multer
    (req, res, next) => {
        upload.single("file")(req, res, error => {
            if (error) {
                return res.status(400).json({
                    message: error.message
                });
            }

            next();
        });
    },

    async (req, res, next) => {
        try {
            // Verifica presenza file
            if (!req.file) {
                return res.status(400).json({
                    message: "Seleziona un file"
                });
            }

            // Verifica formato
            if (!allowed.has(req.file.mimetype)) {
                return res.status(400).json({
                    message: "Formato non supportato"
                });
            }

            // Determina il tipo di risorsa Cloudinary
            const resourceType = req.file.mimetype.startsWith("image/")
                ? "image"
                : req.file.mimetype.startsWith("audio/")
                    ? "video"
                    : "raw";

            // ========================================
            // UPLOAD SU CLOUDINARY
            // ========================================

            const result = await new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    {
                        folder: `stagemate/band-files/${req.params.bandId}`,
                        resource_type: resourceType,
                        access_mode: "public"
                    },
                    (error, data) => {
                        if (error) {
                            reject(error);
                        } else {
                            resolve(data);
                        }
                    }
                );

                Readable.from(req.file.buffer).pipe(stream);
            });

            // ========================================
            // SALVATAGGIO SU MONGODB
            // ========================================

            try {
                const file = await BandFile.create({
                    bandId: req.params.bandId,
                    uploadedBy: req.userId,
                    name: req.file.originalname,
                    size: req.file.size,
                    mimeType: req.file.mimetype,
                    url: result.secure_url,
                    publicId: result.public_id,
                    resourceType: resourceType
                });

                await file.populate(
                    "uploadedBy",
                    "name surname"
                );

                return res.status(201).json({ file });

            } catch (error) {
                // Mostra il campo che non supera
                // la validazione di Mongoose
                console.error(
                    "ERRORE VALIDAZIONE BAND FILE:",
                    error.errors
                );

                // Se MongoDB fallisce, elimina
                // il file appena caricato su Cloudinary
                await cloudinary.uploader.destroy(
                    result.public_id,
                    {
                        resource_type: resourceType
                    }
                ).catch(() => {});

                throw error;
            }

        } catch (error) {
            next(error);
        }
    }
);

// ========================================
// DELETE - ELIMINAZIONE FILE
// ========================================

router.delete(
    "/bands/:bandId/files/:fileId",
    access,
    async (req, res, next) => {
        try {
            const { bandId, fileId } = req.params;

            // Verifica ID file
            if (!mongoose.isValidObjectId(fileId)) {
                return res.status(400).json({
                    message: "ID file non valido"
                });
            }

            // Cerca il file nella band
            const file = await BandFile.findOne({
                _id: fileId,
                bandId: bandId
            });

            if (!file) {
                return res.status(404).json({
                    message: "File non trovato"
                });
            }

            // Verifica autorizzazioni
            const uid = String(req.userId);

            const isAuthor = String(file.uploadedBy) === uid;

            const isOwner = String(req.archiveBand.owner) === uid;

            if (!isAuthor && !isOwner) {
                return res.status(403).json({
                    message: "Non autorizzato"
                });
            }

            // ========================================
            // ELIMINAZIONE DA CLOUDINARY
            // ========================================

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

            // ========================================
            // ELIMINAZIONE DA MONGODB
            // ========================================

            await file.deleteOne();

            return res.json({
                message: "File eliminato"
            });

        } catch (error) {
            next(error);
        }
    }
);

export default router;
