import express from "express";
import { authenticate } from "../middlewares/authenticate.js";
import { createBand,getBandById,getBandMembers,getMyBands, removeBandMember, updateBand,updateBandAvatar,  updateBandCover } from "../controllers/bands.js";
import { createInvitation } from "../controllers/invitations.js";
import { createTransaction, getBalance, getTransactions, updateTransaction, deleteTransaction } from "../controllers/transactionController.js";

import { deleteBandFile, getBandFiles, uploadBandFile } from "../controllers/bandFileController.js";
import { handleUpload } from "../middlewares/handleUpload.js";
import { requireBandMembers } from "../middlewares/requireBandMember.js";
import { handleBandAvatarUpload } from "../middlewares/uploadBandAvatar.js";
import { handleBandCoverUpload } from "../middlewares/uploadBandCover.js";



const BandRouther = express.Router();

BandRouther.post("/", authenticate,createBand)
BandRouther.get("/my",authenticate,getMyBands)
BandRouther.get("/:id",authenticate,getBandById)
BandRouther.patch("/:id",authenticate,updateBand)
BandRouther.post("/:id/invitations",authenticate, createInvitation)
BandRouther.get("/:id/members", authenticate, getBandMembers)
BandRouther.delete("/:id/members/:userId",authenticate,removeBandMember)

BandRouther.post("/:id/transactions",authenticate, createTransaction)
BandRouther.get("/:id/transactions",authenticate, getTransactions)
BandRouther.get("/:id/transactions/balance", authenticate, getBalance);
BandRouther.delete("/:id/transactions/:transactionId", authenticate, deleteTransaction);
BandRouther.patch("/:id/transactions/:transactionId", authenticate, updateTransaction);



BandRouther.post("/:id/files" ,authenticate,requireBandMembers,handleUpload, uploadBandFile)
BandRouther.get("/:id/files" ,authenticate,requireBandMembers, getBandFiles)
BandRouther.delete("/:id/files/:fileId" ,authenticate,requireBandMembers, deleteBandFile)
BandRouther.patch("/:id/avatar",authenticate,handleBandAvatarUpload,updateBandAvatar);
BandRouther.patch("/:id/cover", authenticate,handleBandCoverUpload,updateBandCover);

export default BandRouther