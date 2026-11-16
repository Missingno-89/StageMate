
import mongoose from "mongoose";
import Notification from "../models/Notification.js";
import Band from "../models/Band.js";

const DASHBOARD_NOTIFICATION_TYPES = [
    "event_created",
    "event_updated",
    "event_deleted",
    "cash_updated",
    "post_created",
    "file_uploaded"
];

// Verifica che l'utente appartenga alla band
async function checkBandAccess(bandId, userId) {
    if (!mongoose.Types.ObjectId.isValid(bandId)) {
        return {
            allowed: false,
            status: 400,
            message: "Invalid band ID"
        };
    }

    const band = await Band.findById(bandId);

    if (!band) {
        return {
            allowed: false,
            status: 404,
            message: "Band not found"
        };
    }

    const authenticatedUserId = userId.toString();

    const isOwner =
        band.owner.toString() === authenticatedUserId;

    const isMember = band.members.some(
        member => member.toString() === authenticatedUserId
    );

    if (!isOwner && !isMember) {
        return {
            allowed: false,
            status: 403,
            message: "Forbidden"
        };
    }

    return { allowed: true };
}

// Recupera le notifiche della band
export async function getMyNotifications(req, res) {
    try {
        const access = await checkBandAccess(
            req.params.bandId,
            req.userId
        );

        if (!access.allowed) {
            return res.status(access.status).json({
                message: access.message
            });
        }

        const notifications = await Notification.find({
            userId: req.userId,
            bandId: req.params.bandId,
            type: { $in: DASHBOARD_NOTIFICATION_TYPES }
        }).sort({ created_at: -1 });

        return res.status(200).json({ notifications });

    } catch (error) {
        console.error("Get notifications error:", error);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
}

// Segna una notifica come letta
export async function markMyNotifications(req, res) {
    try {
        const access = await checkBandAccess(
            req.params.bandId,
            req.userId
        );

        if (!access.allowed) {
            return res.status(access.status).json({
                message: access.message
            });
        }

        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                message: "Invalid notification ID"
            });
        }

        const markedNotification =
            await Notification.findOneAndUpdate(
                {
                    _id: req.params.id,
                    userId: req.userId,
                    bandId: req.params.bandId,
                    type: {
                        $in: DASHBOARD_NOTIFICATION_TYPES
                    }
                },
                {
                    $set: { isRead: true }
                },
                {
                    returnDocument: "after"
                }
            );

        if (!markedNotification) {
            return res.status(404).json({
                message: "Notification not found"
            });
        }

        return res.status(200).json({
            markedNotification
        });

    } catch (error) {
        console.error("Mark notification error:", error);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
}

// Conta le notifiche non lette
export async function getUnreadCount(req, res) {
    try {
        const access = await checkBandAccess(
            req.params.bandId,
            req.userId
        );

        if (!access.allowed) {
            return res.status(access.status).json({
                message: access.message
            });
        }

        const total = await Notification.countDocuments({
            userId: req.userId,
            bandId: req.params.bandId,
            type: { $in: DASHBOARD_NOTIFICATION_TYPES },
            isRead: false
        });

        return res.status(200).json({
            unreadCount: total
        });

    } catch (error) {
        console.error("Unread count error:", error);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
}

// Segna tutte le notifiche della band come lette
export async function markAllNotificationsAsRead(req, res) {
    try {
        const access = await checkBandAccess(
            req.params.bandId,
            req.userId
        );

        if (!access.allowed) {
            return res.status(access.status).json({
                message: access.message
            });
        }

        const clearNotification =
            await Notification.updateMany(
                {
                    userId: req.userId,
                    bandId: req.params.bandId,
                    type: {
                        $in: DASHBOARD_NOTIFICATION_TYPES
                    },
                    isRead: false
                },
                {
                    $set: { isRead: true }
                }
            );

        return res.status(200).json({
            clearNotification
        });

    } catch (error) {
        console.error("Mark all notifications error:", error);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
}


 // Elimina lo storico delle notifiche della band
export async function deleteMyNotifications(req, res) {
    try {
        const access = await checkBandAccess(
            req.params.bandId,
            req.userId
        );

        if (!access.allowed) {
            return res.status(access.status).json({
                message: access.message
            });
        }

        const result = await Notification.deleteMany({
            userId: req.userId,
            bandId: req.params.bandId,
            type: {
                $in: DASHBOARD_NOTIFICATION_TYPES
            }
        });

        return res.status(200).json({
            message: "Notification history deleted successfully",
            deletedCount: result.deletedCount
        });

    } catch (error) {
        console.error("Delete notifications error:", error);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
}
