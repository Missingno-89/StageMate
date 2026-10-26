import mongoose from "mongoose";


const postSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        minlength: 1,
        maxlength: 255
    },
    content: {
        type: String,
        required: true,
        minlength: 1,
        maxlength: 5000
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
    },
    

},
    {
        timestamps: {
            createdAt: 'created_at',
            updatedAt: 'updated_at'
        }
    }
);

const Post = mongoose.model("Post", postSchema);

export default Post;