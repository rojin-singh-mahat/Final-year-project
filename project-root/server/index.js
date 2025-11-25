const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./connectDB.js");
const cors = require("cors");

dotenv.config();
connectDB();

const app = express();

// CORS configuration: allow local dev origins and reflect origin in development
const FRONTEND_URL = process.env.FRONTEND_URL; // optional
const allowed = new Set([
  FRONTEND_URL,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
].filter(Boolean));

app.use(cors({
  origin: function(origin, callback) {
    // allow non-browser tools (no origin) and allowed origins
    if (!origin) return callback(null, true);
    if (allowed.has(origin)) return callback(null, true);
    // in development, allow any origin (useful when testing via different hosts)
    if (process.env.NODE_ENV !== 'production') return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

app.use(express.json());

app.use("/api/auth", require("./routes/auth"));
app.use("/api/quests", require("./routes/quest"));
app.use("/api/user", require("./routes/user.js"));

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';
app.listen(PORT, HOST, () => console.log(`🚀 Server running on ${HOST}:${PORT}`));
