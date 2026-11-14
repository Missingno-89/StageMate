import mongoose from "mongoose";
import Transaction from "../models/Transaction.js";
import Band from "../models/Band.js"



export async function createTransaction(req, res) {

    try {
        const { id } = req.params
        const { type, amount, description } = req.body
        const userId = req.userId


        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({ message: "Band Id not valid" })

        }
        const band = await Band.findById(id)
        if (!band) {
            return res.status(404).json({ message: "Band not found" })
        }

        const isOwner = band.owner.toString() === userId.toString();

        const isMember = band.members.some(
            member => member.toString() === userId.toString()
        );

        if (!isOwner && !isMember) {
            return res.status(403).json({
                message: "You are not authorized to manage this band's transactions"
            });
        }

        const allowedTypes = ["income", "expense"];
        if (!allowedTypes.includes(type)) {
            return res.status(400).json({
                message: "Invalid transaction type"
            });
        }
        if (!Number.isSafeInteger(amount) || amount <= 0) {
            return res.status(400).json({
                message: "Amount must be a positive integer"
            });
        }
        if (
            typeof description !== "string" ||
            description.trim().length === 0 ||
            description.trim().length > 500
        ) {
            return res.status(400).json({
                message: "Description must contain between 1 and 500 characters"
            });
        }
        const newTransaction = await Transaction.create({
            band: id,
            createdBy: userId,
            type: type,
            amount: amount,
            description: description.trim()


        });
        return res.status(201).json({
            message: "Transaction created successfully",
            transaction: newTransaction
        });
    } catch (error) {
        console.error("Create transaction error:", error);
        return res.status(500).json({ message: "Internal server error" })
    }
}

export async function getTransactions(req, res) {
    try {
        const { id } = req.params
        const userId = req.userId


        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({ message: "Band Id not valid" })

        }
        const band = await Band.findById(id)
        if (!band) {
            return res.status(404).json({ message: "Band not found" })
        }

        const isOwner = band.owner.toString() === userId.toString();

        const isMember = band.members.some(
            member => member.toString() === userId.toString()
        );

        if (!isOwner && !isMember) {
            return res.status(403).json({
                message: "You are not authorized to manage this band's transactions"
            });

        }
        const transactions = await Transaction.find({ band: id })
            .populate("createdBy", "name surname")
            .sort({ date: -1 });
        return res.status(200).json({
            transactions
        });
    } catch (error) {
        console.error("Get transactions error:", error);

        return res.status(500).json({
            message: "Internal server error"
        });
    }

}

export async function getBalance(req, res) {
    try {
        const { id } = req.params
        const userId = req.userId


        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({ message: "Band Id not valid" })

        }
        const band = await Band.findById(id)
        if (!band) {
            return res.status(404).json({ message: "Band not found" })
        }

        const isOwner = band.owner.toString() === userId.toString();

        const isMember = band.members.some(
            member => member.toString() === userId.toString()
        );

        if (!isOwner && !isMember) {
            return res.status(403).json({
                message: "You are not authorized to manage this band's transactions"
            });

        }

        const result = await Transaction.aggregate([
            {
                $match: {
                    band: new mongoose.Types.ObjectId(id)
                }
            },
            {
                $group: {
                    _id: "$type",
                    total: { $sum: "$amount" }
                }
            }
        ]);
        const income = result.find(item => item._id === "income");
        const expense = result.find(item => item._id === "expense");

        const totalIncome = income?.total ?? 0;
        const totalExpense = expense?.total ?? 0;
        const balance = totalIncome - totalExpense

        return res.status(200).json({
            totalIncome,
            totalExpense,
            balance
        })

    } catch (error) {
        console.error("Get balance error:", error);

        return res.status(500).json({ message: "Internal server error" });
    }
}

export async function updateTransaction(req, res) {
    try {
        const { id, transactionId } = req.params;
        const { amount, description } = req.body;
        const userId = req.userId;

        
        if (
            !mongoose.isValidObjectId(id) ||
            !mongoose.isValidObjectId(transactionId)
        ) {
            return res.status(400).json({
                message: "Invalid ID"
            });
        }

     
        const band = await Band.findById(id);

        if (!band) {
            return res.status(404).json({
                message: "Band not found"
            });
        }

        
        const isOwner =
            band.owner.toString() === userId.toString();

        const isMember = band.members.some(
            member => member.toString() === userId.toString()
        );

        if (!isOwner && !isMember) {
            return res.status(403).json({
                message: "Not authorized"
            });
        }

        
        const transaction = await Transaction.findOne({
            _id: transactionId,
            band: id
        });

        if (!transaction) {
            return res.status(404).json({
                message: "Transaction not found"
            });
        }

        
        const isCreator =
            transaction.createdBy.toString() === userId.toString();

        if (!isOwner && !isCreator) {
            return res.status(403).json({
                message: "You cannot edit this transaction"
            });
        }

        
        if (
            !Number.isSafeInteger(amount) ||
            amount <= 0
        ) {
            return res.status(400).json({
                message: "Amount must be a positive integer"
            });
        }

      
        if (
            typeof description !== "string" ||
            description.trim().length === 0 ||
            description.trim().length > 500
        ) {
            return res.status(400).json({
                message: "Invalid description"
            });
        }

        
        transaction.amount = amount;
        transaction.description = description.trim();

        await transaction.save();

        return res.status(200).json({
            message: "Transaction updated successfully",
            transaction
        });

    } catch (error) {
        console.error("Update transaction error:", error);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
}


export async function deleteTransaction(req, res) {
    try {
        const { id, transactionId } = req.params;
        const userId = req.userId;

      
        if (
            !mongoose.isValidObjectId(id) ||
            !mongoose.isValidObjectId(transactionId)
        ) {
            return res.status(400).json({
                message: "Invalid ID"
            });
        }

        
        const band = await Band.findById(id);

        if (!band) {
            return res.status(404).json({
                message: "Band not found"
            });
        }

        
        const isOwner =
            band.owner.toString() === userId.toString();

        const isMember = band.members.some(
            member => member.toString() === userId.toString()
        );

        if (!isOwner && !isMember) {
            return res.status(403).json({
                message: "Not authorized"
            });
        }

        
        const transaction = await Transaction.findOne({
            _id: transactionId,
            band: id
        });

        if (!transaction) {
            return res.status(404).json({
                message: "Transaction not found"
            });
        }

        
        const isCreator =
            transaction.createdBy.toString() === userId.toString();

        if (!isOwner && !isCreator) {
            return res.status(403).json({
                message: "You cannot delete this transaction"
            });
        }

       
        await transaction.deleteOne();

        return res.status(200).json({
            message: "Transaction deleted successfully"
        });

    } catch (error) {
        console.error("Delete transaction error:", error);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
}
