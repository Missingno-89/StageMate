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
  hasRead: { 
    type: Boolean, 
    default: false 
},
  confirmed: { 
    type: Boolean, 
    default: false }
}, {
  timestamps: { createdAt: "created_at", updatedAt: "updated_at" }
});

eventAttendanceSchema.index({ eventId: 1, userId: 1 }, { unique: true });

export default mongoose.model("EventAttendance", eventAttendanceSchema);
