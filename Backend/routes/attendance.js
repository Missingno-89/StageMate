import express from "express";
import { authenticate } from "../middlewares/authenticate.js";
import { deleteAttendance, getAttendance, setAttendance } from "../controllers/eventAttendance.js";

const attendanceRouter = express.Router();

attendanceRouter.put("/bands/:bandId/events/:eventId/attendance",authenticate,setAttendance)
attendanceRouter.get("/bands/:bandId/events/:eventId/attendance",authenticate,getAttendance)
attendanceRouter.delete("/bands/:bandId/events/:eventId/attendance",authenticate,deleteAttendance)
export default attendanceRouter