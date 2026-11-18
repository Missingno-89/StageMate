import express from "express";
import { authenticate } from "../middlewares/authenticate.js";
import { getComments, createComment, deleteComment } from "../controllers/comment.js";

const commentRouter = express.Router();
const base = "/bands/:bandId/posts/:postId/comments";

commentRouter.get(base, authenticate, getComments);
commentRouter.post(base, authenticate, createComment);
commentRouter.delete(`${base}/:commentId`, authenticate, deleteComment);

export default commentRouter;
