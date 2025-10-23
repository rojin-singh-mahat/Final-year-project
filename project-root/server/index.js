const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./connectDB.js");
const cors = require("cors");

dotenv.config();
connectDB();

const app = express();

// Allow requests from your frontend
app.use(cors({
  origin: (origin, callback) => {
    const whitelist = ["http://localhost:5173"];
    if (!origin || whitelist.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  }
}));

app.use(express.json());

app.use("/api/auth", require("./routes/auth"));
app.use("/api/quests", require("./routes/quest"));
app.use("/api/user", require("./routes/user.js"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
