import mongoose from "mongoose";
import Band from "../models/Band.js";

export async function requireBandMembers (req,res,next){
    try {
        const { id } = req.params;
        const userId = req.userId;
         if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "Invalid band id"
            });
        }
        const band = await Band.findById(id);
        if (!band) {
            return res.status(404).json({
                message: "Band not found"
            });
        }

        const isOwner = band.owner.toString() === userId.toString();
        const isMember = band.members.some(
            member => member.toString() === userId.toString());

        if (!isOwner && !isMember) {
            return res.status(403).json({
                message: "Forbidden"
            });
        }
        next()

    } catch (error) {
        return res.status(500).json ({message :"internal server error"})
    }
}