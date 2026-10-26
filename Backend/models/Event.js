import mongoose from "mongoose";


const eventSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        minlength: 1,
        maxlength: 255
    },
    description: {
        type: String,
        required: false,
        minlength: 1,
        maxlength: 255
    },
    type: {
          type: String,
       enum: ["rehearsal","live","recording","deadline","other"],
       required: true
    },
    startDate: {
          type: Date,
        required: true,
        
    },
      endDate: {
          type: Date,
        required: false,
        
    },
    
    location: {
        type: String,
        required: false,
        minlength: 1,
        maxlength: 255
    },
     bandId: {
       type: mongoose.Schema.Types.ObjectId,
               ref: "Band",
               required: true
    },
     createdBy: {
       type: mongoose.Schema.Types.ObjectId,
               ref: "User",
               required: true
    },

},
    {
        timestamps: {
            createdAt: 'created_at',
            updatedAt: 'updated_at'
        }
    }
);

const Event = mongoose.model("Event", eventSchema);

export default Event;