import mongoose from "mongoose";


const transactionSchema = new mongoose.Schema({
    band: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Band",
        required: true,
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    type: {
        type: String,
        required: true,
        enum: ["income", "expense"],


    },
    amount: {
        type: Number,
        required: true,
        min: 1,
        validate: {
            validator: Number.isInteger,
            message: "L'importo deve essere un numero intero"
        }
    },
    description: {
        type: String,
        required: true,
        trim: true,
        maxlength: 500

    },
    date: {
        type: Date,
        required: true,
        default: Date.now
    }


},
    {
        timestamps: {
            createdAt: 'created_at',
            updatedAt: 'updated_at'
        }
    }
);

const Transaction = mongoose.model("Transaction", transactionSchema);

export default Transaction;