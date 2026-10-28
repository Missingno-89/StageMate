import mongoose from "mongoose";
import Notification from "../models/Notification.js";

export async function getMyNotifications(req, res) {

    try {
        const notifications = await Notification.find({
            userId: req.userId
        }).sort({ created_at: -1 });
        return res.status(200).json({ notifications })
    } catch (error) {
        return res.status(500).json({ message: "Internal server error" })

    }
};

export async function markMyNotifications(req, res) {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                message: "Invalid notification ID"
            });
        }
        const markedNotification = await Notification.findOneAndUpdate(
            { _id: req.params.id, userId: req.userId },
            { $set: { isRead: true } },
            { returnDocument: "after" }
        );
        if (!markedNotification) {
            return res.status(404).json({
                message: "Notification not found"
            });
        }
        return res.status(200).json({ markedNotification })
    } catch (error) {
        return res.status(500).json({ message: "Internal server error" })
    }

};

export async function getUnreadCount(req, res) {
    try {
        const total = await Notification.countDocuments({
            userId: req.userId,
            isRead: false
        });
        return res.status(200).json({unreadCount: total })
    } catch (error) {
        return res.status(500).json({ message: "Internal server error" })
    }
};
export async function markAllNotificationsAsRead(req, res) {
    try {

       const clearNotification = await Notification.updateMany(
        {
            userId: req.userId,
            isRead: false
        },
        {
            $set:{isRead:true}
        }
       );
     return res.status(200).json ({clearNotification})

    } catch (error) {
        return res.status(500).json({
            message: "Internal server error"
        });
    }
}