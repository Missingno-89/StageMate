import express from "express";
import { authenticate } from "../middlewares/authenticate.js";
import { acceptInvitation, getMyInvitations } from "../controllers/invitations.js";

const invitationRouter = express.Router();

invitationRouter.get("/my", authenticate, getMyInvitations)
invitationRouter.patch("/:id/accept", authenticate, acceptInvitation)
invitationRouter.patch("/:id/decline", authenticate, declineInvitation);

export default invitationRouter