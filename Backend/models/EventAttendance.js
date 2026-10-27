import mongoose from "mongoose";


const eventAttendanceSchema = new mongoose.Schema({
    eventId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Event",
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    status: {
          type: String,
       enum: ["confirmed","declined","maybe"],
       required: true
    },
    

},

    {
        timestamps: {
            createdAt: 'created_at',
            updatedAt: 'updated_at'
        }
    }
);

    eventAttendanceSchema.index(
        { eventId: 1, userId: 1 },
        { unique: true }
    );


const EventAttendance = mongoose.model("EventAttendance", eventAttendanceSchema);

export default EventAttendance;