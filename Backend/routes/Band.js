import express from "express";
import { authenticate } from "../middlewares/authenticate.js";
import { createBand,getBandById,getBandMembers,getMyBands, removeBandMember, updateBand } from "../controllers/bands.js";
import { createInvitation } from "../controllers/invitations.js";
import { createTransaction, getBalance, getTransactions } from "../controllers/transactionController.js";




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
export default BandRouther