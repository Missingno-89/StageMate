import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
    postId: { type: mongoose.Schema.Types.ObjectId, ref: "Post", required: true, index: true },
    bandId: { type: mongoose.Schema.Types.ObjectId, ref: "Band", required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true, trim: true, maxlength: 1000 }
}, { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } });

export default mongoose.model("Comment", commentSchema);
