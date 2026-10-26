import express from "express";
import { authenticate } from "../middlewares/authenticate.js";
import { createEvent, deleteEvent, getEvents, updateEvent } from "../controllers/event.js";


const eventRouter = express.Router();

eventRouter.post("/bands/:bandId/events", authenticate, createEvent)
eventRouter.get("/bands/:bandId/events", authenticate, getEvents);
eventRouter.patch("/bands/:bandId/events/:eventId", authenticate, updateEvent)
eventRouter.delete("/bands/:bandId/events/:eventId", authenticate, deleteEvent)
export default eventRouter