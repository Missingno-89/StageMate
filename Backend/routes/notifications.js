import express from "express";
import { authenticate } from "../middlewares/authenticate.js";
import { getMyNotifications, getUnreadCount, markAllNotificationsAsRead, markMyNotifications } from "../controllers/notifications.js";


const notificationsRouter = express.Router()

notificationsRouter.get("/my",authenticate,getMyNotifications)
notificationsRouter.get("/unread-count",authenticate,getUnreadCount)
notificationsRouter.patch("/:id/read",authenticate,markMyNotifications)
notificationsRouter.patch("/read-all",authenticate,markAllNotificationsAsRead)
export default notificationsRouter