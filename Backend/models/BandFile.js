import mongoose from "mongoose";

const bandFileSchema = new mongoose.Schema({
    band: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Band",
        required: true
    },
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true,
        minlength: 1,
        maxlength: 255
    },
    publicId: {
        type: String,
        required: true,
    },
    fileType: {
        type: String,
        enum: ["audio", "document", "image"],
        required: true
    },
    url: {
        type: String,
        required: true
    },
    size: {
        type: Number,
        required: true,
        min: 1,
        validate: {
            validator: Number.isSafeInteger,
            message: "File size must be a positive integer"
        }
    },
    resourceType: {
    type: String,
    enum: ["image", "video", "raw"],
    required: true
}
},
    {
        timestamps: {
            createdAt: 'created_at',
            updatedAt: 'updated_at'
        }
    }
);

const BandFile = mongoose.model("BandFile", bandFileSchema);

export default BandFile;