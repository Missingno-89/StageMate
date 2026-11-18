import mongoose from "mongoose";
import Band from "../models/Band.js";
import Post from "../models/Post.js";
import Comment from "../models/Comment.js";

async function getContext(req, res) {
    const { bandId, postId } = req.params;
    if (!mongoose.isValidObjectId(bandId) || !mongoose.isValidObjectId(postId)) {
        res.status(400).json({ message: "Invalid band or post id" });
        return null;
    }
    const band = await Band.findById(bandId);
    if (!band) {
        res.status(404).json({ message: "Band not found" });
        return null;
    }
    const userId = req.userId.toString();
    const isOwner = band.owner.toString() === userId;
    const isMember = band.members.some(member => member.toString() === userId);
    if (!isOwner && !isMember) {
        res.status(403).json({ message: "Forbidden" });
        return null;
    }
    const post = await Post.findOne({ _id: postId, bandId });
    if (!post) {
        res.status(404).json({ message: "Post not found" });
        return null;
    }
    return { band, post, isOwner, userId };
}

export async function getComments(req, res) {
    try {
        if (!await getContext(req, res)) return;
        const comments = await Comment.find({ postId: req.params.postId, bandId: req.params.bandId })
            .populate("createdBy", "name surname avatar")
            .sort({ created_at: 1 });
        return res.status(200).json({ comments });
    } catch (error) {
        console.error("Get comments error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export async function createComment(req, res) {
    try {
        if (!await getContext(req, res)) return;
        const { content } = req.body ?? {};
        if (typeof content !== "string" || !content.trim() || content.trim().length > 1000) {
            return res.status(400).json({ message: "Il commento deve contenere da 1 a 1000 caratteri" });
        }
        const comment = await Comment.create({
            postId: req.params.postId,
            bandId: req.params.bandId,
            createdBy: req.userId,
            content: content.trim()
        });
        await comment.populate("createdBy", "name surname avatar");
        return res.status(201).json({ message: "Comment created successfully", comment });
    } catch (error) {
        console.error("Create comment error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export async function deleteComment(req, res) {
    try {
        const context = await getContext(req, res);
        if (!context) return;
        if (!mongoose.isValidObjectId(req.params.commentId)) {
            return res.status(400).json({ message: "Invalid comment id" });
        }
        const comment = await Comment.findOne({
            _id: req.params.commentId,
            postId: req.params.postId,
            bandId: req.params.bandId
        });
        if (!comment) return res.status(404).json({ message: "Comment not found" });
        if (!context.isOwner && comment.createdBy.toString() !== context.userId) {
            return res.status(403).json({ message: "Forbidden" });
        }
        await comment.deleteOne();
        return res.status(200).json({ message: "Comment deleted successfully" });
    } catch (error) {
        console.error("Delete comment error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}
