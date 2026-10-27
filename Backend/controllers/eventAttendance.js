import mongoose from "mongoose";
import Band from "../models/Band.js";
import Event from "../models/Event.js";
import EventAttendance from "../models/EventAttendance.js";

export async function setAttendance(req, res) {
    try {
        const bandId = req.params.bandId;
        if (!mongoose.Types.ObjectId.isValid(bandId)) {
            return res.status(400).json({
                message: "Invalid band id"
            });
        }
        const band = await Band.findById(bandId);
        if (!band) {
            return res.status(404).json({
                message: "Band not found"
            });
        }
        const authenticatedMember = req.userId;

        const isMember = band.members.some(
            member => member.toString() === authenticatedMember
        );

        if (!isMember) {
            return res.status(403).json({
                message: "Forbidden"
            });
        }
        const eventId = req.params.eventId;

        if (!mongoose.Types.ObjectId.isValid(eventId)) {
            return res.status(400).json({
                message: "Invalid event id"
            });
        }

        const event = await Event.findOne({
            _id: eventId,
            bandId: bandId
        });

        if (!event) {
            return res.status(404).json({
                message: "Event not found"
            });
        }

        const status = req.body.status
        const allowedStatuses = ["confirmed", "declined", "maybe"];
        if (
            typeof status !== "string" ||
            !allowedStatuses.includes(status)
        ) {
            return res.status(400).json({
                message: "Invalid status"
            });
        };
        const result = await EventAttendance.findOneAndUpdate(
            {
                eventId: eventId,
                userId: req.userId
            },
            {
                $set: {
                    status: status
                }
            },
            {
                upsert: true,
                new: true,
                runValidators: true,
                includeResultMetadata: true
            },


        );
        if (result.lastErrorObject.updatedExisting) {
            return res.status(200).json({
                message: "Attendance updated",
                attendance: result.value
            });
        } else {
            return res.status(201).json({
                message: "Attendance created",
                attendance: result.value
            });
        }




    } catch (error) {
        console.error("Set attendance error:", error);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
};

export async function getAttendance(req, res) {
    try {
        const bandId = req.params.bandId;
        if (!mongoose.Types.ObjectId.isValid(bandId)) {
            return res.status(400).json({
                message: "Invalid band id"
            });
        }
        const band = await Band.findById(bandId);
        if (!band) {
            return res.status(404).json({
                message: "Band not found"
            });
        }
        const authenticatedMember = req.userId;

        const isMember = band.members.some(
            member => member.toString() === authenticatedMember
        );

        if (!isMember) {
            return res.status(403).json({
                message: "Forbidden"
            });
        }
        const eventId = req.params.eventId;

        if (!mongoose.Types.ObjectId.isValid(eventId)) {
            return res.status(400).json({
                message: "Invalid event id"
            });
        }

        const event = await Event.findOne({
            _id: eventId,
            bandId: bandId
        });

        if (!event) {
            return res.status(404).json({
                message: "Event not found"
            });
        }
        const attendances = await EventAttendance.find({
            eventId
        }).populate("userId", "name surname avatar")
        const confirmedCount = attendances.filter(
            attendance => attendance.status === "confirmed"
        ).length;
        const declinedCount = attendances.filter(
            attendance => attendance.status === "declined"
        ).length;
        const maybeCount = attendances.filter(
            attendance => attendance.status === "maybe"
        ).length;
        const totalMembers = band.members.length;
        const totalResponses = attendances.length;
        const unansweredCount = totalMembers - totalResponses;
        return res.status(200).json({
            attendances: attendances,
            summary: {
                confirmed: confirmedCount,
                declined: declinedCount,
                maybe: maybeCount,
                unanswered: unansweredCount
            }
        });

    } catch (error) {
        console.error("get attendance error:", error);

        return res.status(500).json({
            message: "Internal server error"
        });
    }

};

export async function deleteAttendance(req, res) {
    try {
        const bandId = req.params.bandId;
        if (!mongoose.Types.ObjectId.isValid(bandId)) {
            return res.status(400).json({
                message: "Invalid band id"
            });
        }
        const band = await Band.findById(bandId);
        if (!band) {
            return res.status(404).json({
                message: "Band not found"
            });
        }
        const authenticatedMember = req.userId;

        const isMember = band.members.some(
            member => member.toString() === authenticatedMember
        );

        if (!isMember) {
            return res.status(403).json({
                message: "Forbidden"
            });
        }
        const eventId = req.params.eventId;

        if (!mongoose.Types.ObjectId.isValid(eventId)) {
            return res.status(400).json({
                message: "Invalid event id"
            });
        }

        const event = await Event.findOne({
            _id: eventId,
            bandId: bandId
        });

        if (!event) {
            return res.status(404).json({
                message: "Event not found"
            });
        }
        const deletedAttendance = await EventAttendance.findOneAndDelete({
            eventId: eventId,
            userId: authenticatedMember
        });
        if (!deletedAttendance) {
            return res.status(404).json({ message: "attendance not found" })
        }
        return res.status(200).json({message :"attendance deleted successfully",attendance: deletedAttendance })

    } catch (error) {
        console.error("Delete attendance error:", error);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
}