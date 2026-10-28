import mongoose from "mongoose";
import BandInvitation from "./BandInvitation.js";


const notificationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
               ref: "User",
               required: true
    },
    bandId:{
    type: mongoose.Schema.Types.ObjectId,
               ref: "Band",
               required: true
    },
    type: {
          type: String,
       enum: ["band_invitation","invitation_accepted","invitation_declined"],
       required: true
    },
    referenceId: {
          type:mongoose.Schema.Types.ObjectId,
          ref: BandInvitation,
          required: true
        
    },
      message: {
          type: String,
          required: true,
          trim:true
    },
    
    isRead: {
        type: Boolean,
        default: false
    },
},
    {
        timestamps: {
            createdAt: 'created_at',
            updatedAt: 'updated_at'
        }
    }
);

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;