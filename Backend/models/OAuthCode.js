import mongoose from "mongoose";

const oauthCodeSchema = new mongoose.Schema({

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    codeHash: {
       type: String,
       required: true,
       unique: true
    },

    expiresAt: {
      type: Date,
       required: true
    }

});
oauthCodeSchema.index(
    { expiresAt: 1 },
    { expireAfterSeconds: 0 }
);
const OAuthCode = mongoose.model("OAuthCode", oauthCodeSchema);

export default OAuthCode;