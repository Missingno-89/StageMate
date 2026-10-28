import express from "express";
import { forgotPassword, getMe, login, register, resetPassword } from "../controllers/auth.js";
import { authenticate } from "../middlewares/authenticate.js";


const AuthRouther = express.Router();

AuthRouther.post("/register", register)
AuthRouther.post("/login",login)
AuthRouther.get("/me",authenticate,getMe )
AuthRouther.post("/forgot-password", forgotPassword);
AuthRouther.post("/reset-password", resetPassword);
export default AuthRouther