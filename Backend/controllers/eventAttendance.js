import mongoose from "mongoose";
import Band from "../models/Band.js";
import Event from "../models/Event.js";
import EventAttendance from "../models/EventAttendance.js";

 export async function validateAccess(req, res) {
  const { bandId, eventId } = req.params;
  if (!mongoose.isValidObjectId(bandId) || !mongoose.isValidObjectId(eventId)) {
    res.status(400).json({ message: "Invalid band or event id" });
    return null;
  }
  const band = await Band.findById(bandId);
  if (!band) {
    res.status(404).json({ message: "Band not found" });
    return null;
  }
  const userId = String(req.userId);
  const isOwner = band.owner && String(band.owner) === userId;
  const isMember = band.members.some(member => String(member._id ?? member.userId ?? member) === userId);
  if (!isOwner && !isMember) {
    res.status(403).json({ message: "Forbidden" });
    return null;
  }
  const event = await Event.findOne({ _id: eventId, bandId });
  if (!event) {
    res.status(404).json({ message: "Event not found" });
    return null;
  }
  return { band, event };
}

export async function setAttendance(req, res) {
  try {
    if (!(await validateAccess(req, res))) return;
    const { action, confirmed } = req.body ?? {};
    let changes;
    if (action === "read") {
      changes = { hasRead: true };
    } else if (action === "confirm" && typeof confirmed === "boolean") {
      changes = { hasRead: true, confirmed };
    } else {
      return res.status(400).json({ message: "Use action 'read' or action 'confirm' with boolean confirmed" });
    }
    const attendance = await EventAttendance.findOneAndUpdate(
      { eventId: req.params.eventId, userId: req.userId },
      { $set: changes },
      { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
    );
    return res.status(200).json({ message: "Attendance saved", attendance });
  } catch (error) {
    console.error("Set attendance error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function getAttendance(req, res) {
  try {
    const access = await validateAccess(req, res);
    if (!access) return;
    const attendances = await EventAttendance.find({ eventId: req.params.eventId })
      .populate("userId", "name surname avatar");
    const memberIds = new Set(access.band.members.map(member => String(member._id ?? member.userId ?? member)));
    if (access.band.owner) memberIds.add(String(access.band.owner));
    const relevant = attendances.filter(a => a.userId && memberIds.has(String(a.userId._id)));
    return res.status(200).json({
      attendances: relevant,
      myAttendance: relevant.find(a => String(a.userId._id) === String(req.userId)) ?? null,
      summary: {
        totalMembers: memberIds.size,
        read: relevant.filter(a => a.hasRead).length,
        confirmed: relevant.filter(a => a.confirmed).length
      }
    });
  } catch (error) {
    console.error("Get attendance error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function deleteAttendance(req, res) {
  try {
    if (!(await validateAccess(req, res))) return;
    const deleted = await EventAttendance.findOneAndDelete({
      eventId: req.params.eventId,
      userId: req.userId
    });
    if (!deleted) return res.status(404).json({ message: "Attendance not found" });
    return res.status(200).json({ message: "Attendance deleted successfully", attendance: deleted });
  } catch (error) {
    console.error("Delete attendance error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
