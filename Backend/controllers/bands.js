import Band from "../models/Band.js";
import cloudinary from "../config/cloudinary.js";
import { Readable } from "node:stream";
import mongoose from "mongoose";

export async function createBand(req, res) {
    try {
        const { name, description } = req.body
        const owner = req.userId

        if (typeof name !== "string" ||
            !name.trim()) {
            return res.status(400).json({
                message:
                    "Band name is required"
            })
        } if (description !== undefined && typeof description !== "string") {
            return res.status(400).json({
                message:
                    "Invalid description"
            })
        }
        const newBand = await Band.create({
            name,
            description,
            owner,
            members: [owner]
        })
        return res.status(201).json({ newBand })

    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                message: "Hai già creato una band con questo nome"
            });
        }
        console.error("Errore creazione band:", error);
        return res.status(500).json({
            message: "Internal server error"
        });
    }
};

export async function updateBandAvatar(req, res) {
    try {
        const { id } = req.params;
        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                message: "Invalid band ID"
            });
        }
        const band = await Band.findById(id);
        if (!band) {
            return res.status(404).json({
                message: "Band not found"
            });
        }
        if (band.owner.toString() !== req.userId.toString()) {
            return res.status(403).json({
                message: "Only the owner can update the band avatar"
            });
        }
        if (!req.file) {
            return res.status(400).json({
                message: "Avatar image is required"
            });
        }
        const uploadResult = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: "stagemate/band-avatars",
                    resource_type: "image"
                },
                (error, result) => {
                    if (error) return reject(error);
                    resolve(result);
                }
            );
            Readable.from(req.file.buffer).pipe(uploadStream);
        });
        band.avatar = uploadResult.secure_url;
        await band.save();
        return res.status(200).json({
            message: "Band avatar updated successfully",
            band
        });
    } catch (error) {
        console.error("Error updating band avatar:", error);
        return res.status(500).json({
            message: "Internal server error"
        });
    }
}



export async function getMyBands(req, res) {
    try {
        const bands = await Band.find({
            $or: [
                { owner: req.userId },
                { members: req.userId }
            ]
        });
        return res.status(200).json({ bands });
    } catch (error) {
        console.error("Errore recupero band:", error.message);
        return res.status(500).json({
            message: "Internal server error"
        });
    }
}


export async function getBandById(req, res) {
    try {
        const id = req.params.id
        if (!mongoose.Types.ObjectId.isValid(id))
            return res.status(400).json({ message: "Invalid band id" })
        const band = await Band.findById(id)
        if (!band) {
            return res.status(404).json({ message: "band not found" })
        }

        const isOwner =
            band.owner.toString() === req.userId.toString();

        const isMember = band.members.some(
            member => member.toString() === req.userId.toString()
        );

        if (!isOwner && !isMember) {
            return res.status(403).json({
                message: "Access denied"
            });
        }

        await band.populate("members", "name surname");
        return res.status(200).json({ band })
    } catch (error) {
        return res.status(500).json({
            message: "Internal server error"
        })
    }
};

export async function updateBand(req, res) {
    try {
        const id = req.params.id
        if (!mongoose.Types.ObjectId.isValid(id))
            return res.status(400).json({ message: "Invalid band id" })
        const band = await Band.findById(id)
        if (!band) {
            return res.status(404).json({ message: "band not found" })
        }
        if (band.owner.toString() !== req.userId) {
            return res.status(403).json({ message: "Only the band owner can edit this band" })
        }
        const { description } = req.body;
        if (typeof description !== "string" || description.length > 255) {
            return res.status(400).json({ message: "invalid description" })
        }
        band.description = description;
        await band.save()
        return res.status(200).json({ message: "Description updated", band });

    } catch (error) {
        return res.status(500).json({
            message: "Internal server error"

        })
    }
};

export async function getBandMembers(req, res) {
    try {
        const id = req.params.id
        if (!mongoose.Types.ObjectId.isValid(id))
            return res.status(400).json({ message: "Invalid band id" })
        const band = await Band.findById(id)
        if (!band) {
            return res.status(404).json({ message: "band not found" })
        }

        const isMember = band.members.some(
            member => member.toString() === req.userId
        );

        if (!isMember) {
            return res.status(403).json({ message: "forbidden" })
        }
        const populateBand = await Band.findById(id).populate("members", "name surname email")
        return res.status(200).json(populateBand.members)


    } catch (error) {
        return res.status(500).json({
            message: "Internal server error"

        })
    }
};

export async function removeBandMember(req, res) {
    try {
        const bandId = req.params.id
        const userToDelete = req.params.userId
        if (!mongoose.Types.ObjectId.isValid(bandId) || !mongoose.Types.ObjectId.isValid(userToDelete))
            return res.status(400).json({ message: "Invalid id" })
        const band = await Band.findById(bandId)
        if (!band) {
            return res.status(404).json({ message: "band not found" })
        }
        const userId = req.userId
        const userOwner = band.owner
        if (userId !== userOwner.toString()) {
            return res.status(403).json({ message: "forbidden " })
        }
        if (userToDelete === userOwner.toString()) {
            return res.status(400).json({ message: "a band need a owner " })
        }
        const isMember = band.members.some(
            member => member.toString() === userToDelete
        );

        if (!isMember) {
            return res.status(404).json({ message: "user not found" })
        }

        await Band.findByIdAndUpdate(bandId,
            {
                $pull: {
                    members: userToDelete
                }
            }
        )
        return res.status(200).json({ message: "member deleted" })

    } catch (error) {
        return res.status(500).json({
            message: "Internal server error"

            , dasdgasdgasid
        })

    };
}


export async function updateBandCover(req, res) {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                message: "Invalid band ID"
            });
        }

        const band = await Band.findById(id);

        if (!band) {
            return res.status(404).json({
                message: "Band not found"
            });
        }

        // Verifica che l'utente sia owner oppure membro
        const isOwner =
            band.owner.toString() === req.userId.toString();

        const isMember = band.members.some(
            (memberId) =>
                memberId.toString() === req.userId.toString()
        );

        if (!isOwner && !isMember) {
            return res.status(403).json({
                message: "Only band members can update the cover"
            });
        }

        if (!req.file) {
            return res.status(400).json({
                message: "Cover image is required"
            });
        }

        // Upload su Cloudinary
        const uploadResult = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: "stagemate/band-covers",
                    resource_type: "image"
                },
                (error, result) => {
                    if (error) return reject(error);
                    resolve(result);
                }
            );

            Readable.from(req.file.buffer).pipe(uploadStream);
        });

        // Salva l'URL della copertina
        band.cover = uploadResult.secure_url;

        await band.save();

        return res.status(200).json({
            message: "Band cover updated successfully",
            band
        });

    } catch (error) {
        console.error("Error updating band cover:", error);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
}
