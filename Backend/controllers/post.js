import Band from "../models/Band.js";
import Post from "../models/Post.js";
import mongoose from "mongoose";


export async function createPost(req, res) {
    try {
        const bandId = req.params.bandId;
        if (!mongoose.Types.ObjectId.isValid(bandId)) {
            return res.status(400).json({
                message: "Invalid band id"
            });
        }
        const band = await Band.findById(bandId);
        if (!band) {
            return res.status(404).json({
                message: "Band not found"
            });
        }
        const authenticatedMember = req.userId;
        const isMember = band.members.some(
            member => member.toString() === authenticatedMember);
        if (!isMember) {
            return res.status(403).json({
                message: "Forbidden"
            });
        }
        const { title, content } = req.body
        if (
            typeof title !== "string" ||
            title.trim().length === 0 ||
            title.trim().length > 255
        ) {
            return res.status(400).json({
                message: "Invalid title"
            });
        }
        if (
            typeof content !== "string" ||
            content.trim().length === 0 ||
            content.trim().length > 5000
        ) {
            return res.status(400).json({
                message: "Invalid content"
            });
        }
        const newPost = await Post.create({
            title: title.trim(),
            content: content.trim(),
            bandId: bandId,
            createdBy: req.userId
        });
        return res.status(201).json({
            message: "Post created successfully",
            post: newPost
        });
    } catch (error) {
        if (
            error.name === "ValidationError" ||
            error.name === "CastError"
        ) {
            return res.status(400).json({
                message: error.message
            });
        }
        console.error("Create post error:", error);
        return res.status(500).json({
            message: "Internal server error"
        });
    }
}

export async function getPosts(req, res) {
    try {
        const bandId = req.params.bandId;
        if (!mongoose.Types.ObjectId.isValid(bandId)) {
            return res.status(400).json({
                message: "Invalid band id"
            });
        }
        const band = await Band.findById(bandId);
        if (!band) {
            return res.status(404).json({
                message: "Band not found"
            });
        }
        const authenticatedMember = req.userId;
        const isMember = band.members.some(
            member => member.toString() === authenticatedMember);
        if (!isMember) {
            return res.status(403).json({
                message: "Forbidden"
            });
        }
        const posts = await Post.find({ bandId })
            .populate("createdBy", "name surname avatar")
            .sort({ created_at: -1 });
        return res.status(200).json({ message: "Post retrieved successfully", posts })
    } catch (error) {
        if (
            error.name === "ValidationError" ||
            error.name === "CastError"
        ) {
            return res.status(400).json({
                message: error.message
            });
        }
        console.error("Get posts error:", error);
        return res.status(500).json({
            message: "Internal server error"
        });

    }
};

export async function updatePosts(req, res) {
    try {
        const bandId = req.params.bandId;
        if (!mongoose.Types.ObjectId.isValid(bandId)) {
            return res.status(400).json({
                message: "Invalid band id"
            });
        }
        const band = await Band.findById(bandId);
        if (!band) {
            return res.status(404).json({
                message: "Band not found"
            });
        }
        const authenticatedMember = req.userId;
        const isMember = band.members.some(
            member => member.toString() === authenticatedMember);
        if (!isMember) {
            return res.status(403).json({
                message: "Forbidden"
            });
        }
        const postId = req.params.postId;
        if (!mongoose.Types.ObjectId.isValid(postId)) {
            return res.status(400).json({
                message: "Invalid post id"
            });
        }
        const post = await Post.findOne({
            _id: postId,
            bandId: req.params.bandId
        })
        if (!post) {
            return res.status(404).json({ message: "post not found" })
        }
        if (post.createdBy.toString() !== req.userId) {
            return res.status(403).json({ message: "Forbidden" })
        }
        const { title, content } = req.body;
        if (
            typeof title !== "string" ||
            title.trim().length === 0 ||
            title.trim().length > 255
        ) {
            return res.status(400).json({
                message: "Invalid title"
            });
        }
        if (
            typeof content !== "string" ||
            content.trim().length === 0 ||
            content.trim().length > 5000
        ) {
            return res.status(400).json({
                message: "Invalid content"
            });
        }
        post.title = title.trim();
        post.content = content.trim();

        await post.save();
        return res.status(200).json({
            message: "Post updated successfully",
            post
        });
    } catch (error) {
        console.error("Update post error:", error);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
};
export async function deletePost(req, res) {
    try {
        const bandId = req.params.bandId;
        if (!mongoose.Types.ObjectId.isValid(bandId)) {
            return res.status(400).json({
                message: "Invalid band id"
            });
        }
        const band = await Band.findById(bandId);
        if (!band) {
            return res.status(404).json({
                message: "Band not found"
            });
        }
        const authenticatedMember = req.userId;
        const isMember = band.members.some(
            member => member.toString() === authenticatedMember);
        if (!isMember) {
            return res.status(403).json({
                message: "Forbidden"
            });
        }
        const postId = req.params.postId;
        if (!mongoose.Types.ObjectId.isValid(postId)) {
            return res.status(400).json({
                message: "Invalid post id"
            });
        }
        const post = await Post.findOne({
            _id: postId,
            bandId: req.params.bandId
        })
        if (!post) {
            return res.status(404).json({ message: "post not found" })
        }
        const isAuthor = post.createdBy.toString() === req.userId;
        const isOwner = band.owner.toString() === req.userId;
        if (!isAuthor && !isOwner) {
            return res.status(403).json({
                message: "Forbidden"
            });
        }
        await post.deleteOne();
        return res.status(200).json({
            message: "Post deleted successfully",
            post
        });
    } catch (error) {
        console.error("Delete post error:", error);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
}
