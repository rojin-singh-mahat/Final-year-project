const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./connectDB.js");

dotenv.config();
connectDB();

const app = express();
app.use(express.json());

app.use("/api/auth", require("./routes/auth"));
app.use("/api/quests", require("./routes/quest"));
app.use("/api/user", require("./routes/user.js"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
