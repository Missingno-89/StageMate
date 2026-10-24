import mongoose from "mongoose";


const bandInvitationSchema = new mongoose.Schema({
    band: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Band",
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    invitedBy: {
         type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    status: {
        type: String,
        enum: ["pending","accepted","declined"],
        default: "pending"
        
    },
    expiresAt: {
        type: Date,
    },

},
    {
        timestamps: {
            createdAt: 'created_at',
            updatedAt: 'updated_at'
        }
    }
);

const BandInvitation = mongoose.model("BandInvitation", bandInvitationSchema);

export default BandInvitation;