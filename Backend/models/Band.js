import mongoose from "mongoose";


const bandSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
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
bandSchema.index(
    { owner: 1, name: 1 },
    {
        unique: true,
        collation: { locale: "en", strength: 2 }
    }
);

const Band = mongoose.model("Band", bandSchema);

export default Band;