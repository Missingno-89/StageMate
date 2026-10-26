import Event from "../models/Event.js";
import Band from "../models/Band.js";
import mongoose from "mongoose";

export async function createEvent(req, res) {
    try {
        const { title, description, type, startDate, endDate, location } = req.body
        const bandId = req.params.bandId
        if (!mongoose.Types.ObjectId.isValid(bandId)) {
            return res.status(400).json({ message: "Invalid id" })
        }
        const band = await Band.findById(bandId)
        if (!band) {
            return res.status(404).json({ message: "band not found" })
        }
        const authenticateMember = req.userId
        const isMember = band.members.some(
            member => member.toString() === authenticateMember)
        if (!isMember) {
            return res.status(403).json({ message: "forbidden" })
        }
        if (!title || !type || !startDate) {
            return res.status(400).json({ message: "Missing required field" })
        }
        const start = new Date(startDate)
        const end = endDate ? new Date(endDate) : null
        if (Number.isNaN(start.getTime())) {
            return res.status(400).json({ message: "invalid start date" })
        }
        if (end && Number.isNaN(end.getTime())) {
            return res.status(400).json({ message: "invalid end date" })
        }
        if (end && end < start) {
            return res.status(400).json({ message: "end date cannot be before start date" })
        }
        const event = await Event.create(
            {
                "title": req.body.title,
                "description": req.body.description,
                "type": req.body.type,
                "startDate": start,
                "endDate": end,
                "location": req.body.location,
                "bandId": req.params.bandId,
                "createdBy": req.userId
            }
        )
        return res.status(201).json({ message: "event created successfully", event })



    } catch (error) {
        return res.status(500).json({
            message: "Internal server error"
        })
    }
};
export async function getEvents(req, res) {
    try {

        const bandId = req.params.bandId
        if (!mongoose.Types.ObjectId.isValid(bandId)) {
            return res.status(400).json({ message: "Invalid id" })
        }
        const band = await Band.findById(bandId)
        if (!band) {
            return res.status(404).json({ message: "band not found" })
        }
        const authenticateMember = req.userId
        const isMember = band.members.some(
            member => member.toString() === authenticateMember)
        if (!isMember) {
            return res.status(403).json({ message: "forbidden" })
        }
        const events = await Event.find({ bandId })
            .sort({ startDate: 1 });
        return res.status(200).json({ message: "operation complete", events })

    } catch (error) {
        return res.status(500).json({
            message: "Internal server error"
        })
    }
};

export async function updateEvent(req, res) {
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


        const {
            title,
            description,
            type,
            startDate,
            endDate,
            location
        } = req.body;


        if (
            title !== undefined &&
            (
                typeof title !== "string" ||
                title.trim().length === 0 ||
                title.length > 255
            )
        ) {
            return res.status(400).json({
                message: "Invalid title"
            });
        }


        if (
            description !== undefined &&
            description !== null &&
            (
                typeof description !== "string" ||
                description.length > 255
            )
        ) {
            return res.status(400).json({
                message: "Invalid description"
            });
        }
        const allowedTypes = [
            "rehearsal",
            "live",
            "recording",
            "deadline",
            "other"
        ];

        if (
            type !== undefined &&
            (
                typeof type !== "string" ||
                !allowedTypes.includes(type)
            )
        ) {
            return res.status(400).json({
                message: "Invalid event type"
            });
        }

        if (
            location !== undefined &&
            location !== null &&
            (
                typeof location !== "string" ||
                location.length > 255
            )
        ) {
            return res.status(400).json({
                message: "Invalid location"
            });
        }

        if (
            startDate !== undefined &&
            (
                typeof startDate !== "string" ||
                startDate.trim() === ""
            )
        ) {
            return res.status(400).json({
                message: "startDate must be a non-empty string"
            });
        }

        if (
            endDate !== undefined &&
            endDate !== null &&
            (
                typeof endDate !== "string" ||
                endDate.trim() === ""
            )
        ) {
            return res.status(400).json({
                message: "endDate must be a non-empty string or null"
            });
        }
        const start = startDate !== undefined
            ? new Date(startDate)
            : event.startDate;


        let end;

        if (endDate === undefined) {
            end = event.endDate ?? null;

        } else if (endDate === null) {
            end = null;

        } else {

            end = new Date(endDate);
        }


        if (Number.isNaN(start.getTime())) {
            return res.status(400).json({
                message: "Invalid start date"
            });
        }

        if (end && Number.isNaN(end.getTime())) {
            return res.status(400).json({
                message: "Invalid end date"
            });
        }


        if (end && end < start) {
            return res.status(400).json({
                message: "End date cannot be before start date"
            });
        }


        const updates = {};

        if (title !== undefined) {
            updates.title = title.trim();
        }

        if (description !== undefined) {
            updates.description = description;
        }

        if (type !== undefined) {
            updates.type = type;
        }

        if (location !== undefined) {
            updates.location = location;
        }

        if (startDate !== undefined) {
            updates.startDate = start;
        }

        if (endDate !== undefined) {
            updates.endDate = end;
        }


        if (Object.keys(updates).length === 0) {
            return res.status(400).json({
                message: "No fields to update"
            });
        }


        const updatedEvent = await Event.findOneAndUpdate(
            {
                _id: eventId,
                bandId: bandId
            },
            updates,
            {
                new: true,
                runValidators: true
            }
        );


        return res.status(200).json({
            message: "Event updated successfully",
            event: updatedEvent
        });

    } catch (error) {


        if (
            error.name === "ValidationError" ||
            error.name === "CastError"
        ) {
            return res.status(400).json({
                message: error.message
            });
        }


        console.error("Update event error:", error);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
};

export async function deleteEvent(req, res) {
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

        const updatedEvent = await Event.findOneAndDelete(
            {
                _id: eventId,
                bandId: bandId
            })
        return res.status(200).json({
            message: "Event deleted successfully"
        });
    } catch (error) {
        return res.status(500).json({
            message: "Internal server error"
        })
    }
}