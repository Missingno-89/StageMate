import express from "express";
import { authenticate } from "../middlewares/authenticate.js";
import { createPost, deletePost, getPosts, updatePosts } from "../controllers/post.js";
import { handlePostImageUpload } from "../middlewares/handleUpload.js";

const postRouter = express.Router();

postRouter.post(
    "/bands/:bandId/posts",
    authenticate,
    handlePostImageUpload,
    createPost
);

postRouter.get(
    "/bands/:bandId/posts",
    authenticate,
    getPosts
);

postRouter.patch(
    "/bands/:bandId/posts/:postId",
    authenticate,
    updatePosts
);

postRouter.delete(
    "/bands/:bandId/posts/:postId",
    authenticate,
    deletePost
);

export default postRouter;
