
import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            trim: true,
            maxlength: 255
        },

        content: {
            type: String,
            trim: true,
            maxlength: 5000
        },

        image: {
            type: String,
            default: null
        },

        bandId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Band",
            required: true
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        }
    },
    {
        timestamps: {
            createdAt: "created_at",
            updatedAt: "updated_at"
        }
    }
);


postSchema.pre("validate", function () {
    const hasTitle = Boolean(this.title?.trim());
    const hasContent = Boolean(this.content?.trim());
    const hasImage = Boolean(this.image);

    if (!hasTitle && !hasContent && !hasImage) {
        this.invalidate(
            "content",
            "Il post deve contenere almeno un testo o un'immagine"
        );
    }
});

const Post = mongoose.model("Post", postSchema);

export default Post;
