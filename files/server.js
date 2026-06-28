require("dotenv").config();
const express    = require("express");
const mongoose   = require("mongoose");
const cors       = require("cors");
const rateLimit  = require("express-rate-limit");

const app  = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (
      /^https:\/\/ykbi.*\.vercel\.app$/.test(origin) ||
      origin === "http://localhost:5173"
    ) return callback(null, true);
    callback(new Error("CORS blocked: " + origin));
  },
  credentials: true,
}));

app.use(express.json({ limit: "10kb" }));

app.use("/api/auth", rateLimit({
  windowMs: 15 * 60 * 1000, max: 20,
  message: { success: false, message: "Too many requests." },
}));

app.use("/api/auth", require("./routes/auth"));

app.get("/health", (_req, res) =>
  res.json({ status: "ok", time: new Date().toISOString() })
);

app.use((_req, res) =>
  res.status(404).json({ success: false, message: "Route not found." })
);

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅  MongoDB connected");
    app.listen(PORT, () => console.log(`🚀  Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("❌  MongoDB connection error:", err.message);
    process.exit(1);
  });
