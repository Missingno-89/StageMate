import mongoose from "mongoose";


const bandSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 1,
        maxlength: 255
    },
    description: {
        type: String,
        required: false,
        minlength: 1,
        maxlength: 255
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    members: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    avatar: {
        type: String,
    },

},
    {
        timestamps: {
            createdAt: 'created_at',
            updatedAt: 'updated_at'
        }
    }
);

const Band = mongoose.model("Band", bandSchema);

export default Band;