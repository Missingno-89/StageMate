
import BandInvitation from "../models/BandInvitation.js";
import Band from "../models/Band.js";
import User from "../models/User.js";
import mongoose from "mongoose";

// CREA UN INVITO
export async function createInvitation(req, res) {
    try {
        const { email } = req.body;
        const id = req.params.id;

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

        if (band.owner.toString() !== req.userId.toString()) {
            return res.status(403).json({
                message: "Only the band owner can send invitations"
            });
        }

        if (typeof email !== "string" || !email.trim()) {
            return res.status(400).json({
                message: "Valid email required"
            });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(normalizedEmail)) {
            return res.status(400).json({
                message: "Invalid email format"
            });
        }

        const invitedUser = await User.findOne({
            email: normalizedEmail
        });

        if (
            invitedUser &&
            band.members.some(
                member => member.toString() === invitedUser._id.toString()
            )
        ) {
            return res.status(409).json({
                message: "User is already a band member"
            });
        }

        const existingInvitation = await BandInvitation.findOne({
            band: id,
            email: normalizedEmail,
            status: "pending",
            expiresAt: { $gt: new Date() }
        });

        if (existingInvitation) {
            return res.status(409).json({
                message: "Invitation already pending"
            });
        }

        const expiresAt = new Date(
            Date.now() + 7 * 24 * 60 * 60 * 1000
        );

        const newInvitation = await BandInvitation.create({
            band: band._id,
            email: normalizedEmail,
            invitedBy: req.userId,
            expiresAt
        });

        return res.status(201).json({
            message: "Invitation created successfully",
            invitation: newInvitation
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
}

// RECUPERA GLI INVITI DELL'UTENTE
export async function getMyInvitations(req, res) {
    try {
        const user = await User.findById(req.userId);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        const invitations = await BandInvitation.find({
            email: user.email,
            status: "pending",
            expiresAt: { $gt: new Date() }
        });

        return res.status(200).json({
            invitations
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
}

// ACCETTA UN INVITO
export async function acceptInvitation(req, res) {
    try {
        const inviteId = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(inviteId)) {
            return res.status(400).json({
                message: "Invalid invitation id"
            });
        }

        const invitation = await BandInvitation.findById(inviteId);

        if (!invitation) {
            return res.status(404).json({
                message: "Invitation not found"
            });
        }

        const user = await User.findById(req.userId);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        if (user.email !== invitation.email) {
            return res.status(403).json({
                message: "Forbidden"
            });
        }

        // Prima di andare in produzione, verificare
        // anche che l'email dell'utente sia confermata.

        if (invitation.status !== "pending") {
            return res.status(409).json({
                message: "Invitation is no longer pending"
            });
        }

        if (invitation.expiresAt <= new Date()) {
            return res.status(410).json({
                message: "Invitation expired"
            });
        }

        const band = await Band.findById(invitation.band);

        if (!band) {
            return res.status(404).json({
                message: "Band not found"
            });
        }

        const alreadyMember = band.members.some(
            member => member.toString() === user._id.toString()
        );

        if (alreadyMember) {
            return res.status(409).json({
                message: "User already a member"
            });
        }

        let updatedBand;

        // TRANSAZIONE MONGODB
        await mongoose.connection.transaction(async (session) => {

            // Aggiorna l'invito solo se è ancora valido
            const updatedInvitation =
                await BandInvitation.findOneAndUpdate(
                    {
                        _id: invitation._id,
                        status: "pending",
                        expiresAt: { $gt: new Date() }
                    },
                    {
                        $set: {
                            status: "accepted"
                        }
                    },
                    {
                        session,
                        returnDocument: "after"
                    }
                );

            if (!updatedInvitation) {
                const error = new Error(
                    "Invitation is no longer valid"
                );
                error.statusCode = 409;
                throw error;
            }

            // Aggiunge l'utente alla band senza duplicati
            updatedBand = await Band.findByIdAndUpdate(
                band._id,
                {
                    $addToSet: {
                        members: user._id
                    }
                },
                {
                    session,
                    returnDocument: "after"
                }
            );

            if (!updatedBand) {
                const error = new Error("Band not found");
                error.statusCode = 404;
                throw error;
            }
        });

        // Risposta solo dopo il completamento della transazione
        return res.status(200).json({
            message: "Invitation accepted successfully",
            band: updatedBand
        });

    } catch (error) {
        return res.status(error.statusCode || 500).json({
            message: error.message
        });
    }
}

export async function declineInvitation(req, res) {
    try {
        const id = req.params.id
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "Invalid invitation id"
            });
        }
        const invitation = await BandInvitation.findById(id);
        if (!invitation) {
            return res.status(404).json({ message: "invitation not found" })
        }
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({ message: "user not found " })
        }
        if (user.email !== invitation.email) {
            return res.status(403).json({
                message: "Forbidden"
            });
        }
        if (invitation.status !== "pending") {
            return res.status(409).json({ message: "invitation is no longer pending" })
        }
        if (invitation.expiresAt <= new Date()) {
            return res.status(410).json({ message: "invitation expired" })
        }
        const updatedInvite =
            await BandInvitation.findOneAndUpdate(
                {
                    _id: invitation._id,
                    status: "pending",
                    expiresAt: { $gt: new Date() }
                },
                {
                    $set: {
                        status: "declined"
                    }
                },
                {

                    returnDocument: "after"
                }
            );
        if (!updatedInvite) {
            return res.status(409).json({
                message: "Invitation is no longer valid"
            });
        }
        return res.status(200).json({
            message: "Invitation declined successfully",
            invitation: updatedInvite
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
}