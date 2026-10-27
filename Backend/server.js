
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import "dotenv/config";
import AuthRouther from "./routes/auth.js";
import BandRouther from "./routes/Band.js";
import invitationRouter from "./routes/invitations.js";
import eventRouter from "./routes/events.js";
import postRouter from "./routes/post.js";
import attendanceRouter from "./routes/attendance.js";
const app = express();

app.use(cors());
app.use(express.json());
app.use("/auth",AuthRouther)
app.use("/bands",BandRouther)
app.use("/invitations",invitationRouter)
app.use("/",eventRouter)
app.use("/",postRouter)
app.use("/",attendanceRouter)
app.get("/", (req, res) => {
  res.json({
    message: "Benvenuto nelle API di StageMate!"
  });
});

const PORT = process.env.PORT || 9097;

async function startServer() {
  try {
    await mongoose.connect(process.env.MONGO_URL);

    console.log("MongoDB connesso correttamente!");

    app.listen(PORT, () => {
      console.log(`StageMate backend avviato sulla porta ${PORT}`);
    });

  } catch (error) {
    console.error("Errore connessione MongoDB:", error.message);
    process.exit(1);
  }
}

startServer();
