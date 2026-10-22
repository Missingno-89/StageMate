import express from "express";
import { authenticate } from "../middlewares/authenticate.js";
import { createBand,getBandById,getMyBands, updateBand } from "../controllers/bands.js";



const BandRouther = express.Router();

BandRouther.post("/", authenticate,createBand)
BandRouther.get("/my",authenticate,getMyBands)
BandRouther.get("/:id",authenticate,getBandById)
BandRouther.patch("/:id",authenticate,updateBand)
export default BandRouther