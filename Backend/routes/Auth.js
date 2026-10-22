import express from "express";
import { getMe, login, register } from "../controllers/auth.js";
import { authenticate } from "../middlewares/authenticate.js";


const AuthRouther = express.Router();

AuthRouther.post("/register", register)
AuthRouther.post("/login",login)
AuthRouther.get("/me",authenticate,getMe )

export default AuthRouther