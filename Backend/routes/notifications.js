import express from "express";
import { authenticate } from "../middlewares/authenticate.js";
import { deleteMyNotifications, getMyNotifications, getUnreadCount, markAllNotificationsAsRead, markMyNotifications } from "../controllers/notifications.js";


const notificationsRouter = express.Router()

notificationsRouter.get("/bands/:bandId/my",authenticate,getMyNotifications);
notificationsRouter.get("/bands/:bandId/unread-count",authenticate,getUnreadCount);
notificationsRouter.patch("/bands/:bandId/:id/read",authenticate,markMyNotifications);
notificationsRouter.patch("/bands/:bandId/read-all",authenticate,markAllNotificationsAsRead);
notificationsRouter.delete("/bands/:bandId/my",authenticate,deleteMyNotifications);

export default notificationsRouter