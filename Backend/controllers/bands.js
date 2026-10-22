import Band from "../models/Band.js"
import mongoose from "mongoose"

export async function createBand(req, res) {
    try {
        const { name, description } = req.body
        const owner = req.userId

        if (typeof name !== "string" ||
            !name.trim()) {
            return res.status(400).json({
                message:
                    "Band name is required"
            })
        } if (description !== undefined && typeof description !== "string") {
            return res.status(400).json({
                message:
                    "Invalid description"
            })
        }
        const newBand = await Band.create({
            name,
            description,
            owner,
            members: [owner]
        })
        return res.status(201).json({ newBand })

    } catch (error) {
        return res.status(500).json({
            message: "Internal server error"
        })
    }



};

export async function getMyBands(req, res) {
    try {
        const bands = await Band.find({ members: req.userId })
        return res.status(200).json({ bands })
    } catch (error) {
        return res.status(500).json({
            message: "Internal server error"
        })
    }
};

export async function getBandById(req, res) {
    try {
        const id = req.params.id
        if (!mongoose.Types.ObjectId.isValid(id))
            return res.status(400).json({ message: "Invalid band id" })
        const band = await Band.findById(id)
        if (!band) {
            return res.status(404).json({ message: "band not found" })
        }
        const isMember = band.members.some(
            member => member.toString() === req.userId
        );
        if (!isMember) {
            return res.status(403).json({ message: "access denied" })

        }
        await band.populate("members", "name surname");
        return res.status(200).json({ band })
    } catch (error) {
        return res.status(500).json({
            message: "Internal server error"
        })
    }
};

export async function updateBand(req, res) {
    try {
        const id = req.params.id
        if (!mongoose.Types.ObjectId.isValid(id))
            return res.status(400).json({ message: "Invalid band id" })
        const band = await Band.findById(id)
        if (!band) {
            return res.status(404).json({ message: "band not found" })
        }
        if(band.owner.toString()!==req.userId){
              return res.status(403).json({ message: "Only the band owner can edit this band" })
        }
        const { description } = req.body;
        if(typeof description !== "string" || description.length > 255){
            return res.status(400).json ({message:"invalid description"})
        }
        band.description = description;
        await band.save()
        return res.status(200).json ({message:"Description updated",band});

    } catch (error) {
         return res.status(500).json({
            message: "Internal server error"

    })
}
}