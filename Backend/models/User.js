import mongoose from "mongoose";


const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 1,
    maxlength: 255
  },
  surname: {
    type: String,
    required: true,
    minlength: 1,
    maxlength: 255
  },
  email: {
    type: String,
    required: true,
    unique: true,
    minlength: 1,
    maxlength: 255,
    lowercase: true,
    trim: true
    
  },
  password: {
    type: String,
    select: false
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true
  },
  dob: {
    type: Date,
    required: false
  },
  avatar: {
    type: String,
    },
    
},
 {
    timestamps: {
      createdAt: 'created_at', 
      updatedAt: 'updated_at'  
    }
  }
); 

const User = mongoose.model("User", userSchema);

export default User;