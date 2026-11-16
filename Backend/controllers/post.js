import Band from "../models/Band.js";
import Post from "../models/Post.js";
import mongoose from "mongoose";
import { notifyBandMembers } from "../utils/notifyBandMembers.js";
import cloudinary from "../config/cloudinary.js";


function uploadImageToCloudinary(fileBuffer) {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                folder: "stagemate/posts",
                resource_type: "image"
            },
            (error, result) => {
                if (error) {
                    return reject(error);
                }

                resolve(result.secure_url);
            }
        );

        stream.end(fileBuffer);
    });
}


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
        const authenticatedMember = req.userId.toString();

        const isOwner = band.owner.toString() === authenticatedMember;

        const isMember = band.members.some(
            member => member.toString() === authenticatedMember
        );

        if (!isOwner && !isMember) {
            return res.status(403).json({
                message: "Forbidden"
            });
        }

        const { title, content, image } = req.body;

        if (
            (title !== undefined && typeof title !== "string") ||
            (content !== undefined && typeof content !== "string") ||
            (image != null && typeof image !== "string")
        ) {
            return res.status(400).json({
                message: "Invalid post data"
            });
        }

        const cleanTitle = title?.trim() || "";
        const cleanContent = content?.trim() || "";
        let cleanImage = null;

        if (req.file) {
            cleanImage = await uploadImageToCloudinary(req.file.buffer);
        }

        if (cleanTitle.length > 255 || cleanContent.length > 5000) {
            return res.status(400).json({
                message: "Post content exceeds maximum length"
            });
        }

        if (!cleanTitle && !cleanContent && !cleanImage) {
            return res.status(400).json({
                message: "Il post deve contenere testo o un'immagine"
            });
        }

        const newPost = await Post.create({
            title: cleanTitle,
            content: cleanContent,
            image: cleanImage,
            bandId,
            createdBy: req.userId
        });
        await newPost.populate(
            "createdBy",
            "name surname avatar"
        );


        try {
            await notifyBandMembers({
                band,
                actorId: req.userId,
                type: "post_created",
                referenceId: newPost._id,
                message: `Nuovo post in bacheca${newPost.title ? `: ${newPost.title}` : ""}`
            });
        } catch (notificationError) {
            console.error(
                "Create post notification error:",
                notificationError
            );
        }
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
        const authenticatedMember = req.userId.toString();

        const isOwner = band.owner.toString() === authenticatedMember;

        const isMember = band.members.some(
            member => member.toString() === authenticatedMember
        );

        if (!isOwner && !isMember) {
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
        const { bandId, postId } = req.params;

        if (
            !mongoose.Types.ObjectId.isValid(bandId) ||
            !mongoose.Types.ObjectId.isValid(postId)
        ) {
            return res.status(400).json({
                message: "Invalid band or post id"
            });
        }

        const band = await Band.findById(bandId);

        if (!band) {
            return res.status(404).json({
                message: "Band not found"
            });
        }

        const userId = req.userId.toString();

        const isOwner = band.owner.toString() === userId;
        const isMember = band.members.some(
            (member) => member.toString() === userId
        );

        if (!isOwner && !isMember) {
            return res.status(403).json({
                message: "Forbidden"
            });
        }

        const post = await Post.findOne({
            _id: postId,
            bandId
        });

        if (!post) {
            return res.status(404).json({
                message: "Post not found"
            });
        }

        if (post.createdBy.toString() !== userId) {
            return res.status(403).json({
                message: "Only the author can edit this post"
            });
        }

        const { title, content } = req.body ?? {};

        if (
            (title !== undefined && typeof title !== "string") ||
            (content !== undefined && typeof content !== "string")
        ) {
            return res.status(400).json({
                message: "Invalid post data"
            });
        }

        const cleanTitle =
            title === undefined ? post.title : title.trim();

        const cleanContent =
            content === undefined ? post.content : content.trim();

        if (
            cleanTitle.length > 255 ||
            cleanContent.length > 5000
        ) {
            return res.status(400).json({
                message: "Post content exceeds maximum length"
            });
        }

        if (!cleanTitle && !cleanContent && !post.image) {
            return res.status(400).json({
                message: "Il post deve contenere testo o un'immagine"
            });
        }

        post.title = cleanTitle;
        post.content = cleanContent;

        await post.save();

        await post.populate(
            "createdBy",
            "name surname avatar"
        );

        return res.status(200).json({
            message: "Post updated successfully",
            post
        });

    } catch (error) {
        console.error("Update post error:", error);

        if (error.name === "ValidationError") {
            return res.status(400).json({
                message: error.message
            });
        }

        return res.status(500).json({
            message: "Internal server error"
        });
    }
}

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

        const authenticatedMember = req.userId.toString();

        const isOwner = band.owner.toString() === authenticatedMember;

        const isMember = band.members.some(
            member => member.toString() === authenticatedMember
        );

        if (!isOwner && !isMember) {
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

        const isAuthor =
            post.createdBy.toString() === req.userId.toString();

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
