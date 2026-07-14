require("dotenv").config();
// Hardcoded backup token key to prevent JWT crashes if the environment file is missed
process.env.JWT_SECRET = process.env.JWT_SECRET || "my_super_secret_fitness_key_2026";
const dns = require('node:dns');
dns.setServers(['8.8.8.8', '8.8.4.4']); // Forces Google DNS to fix the network block
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

// Force alternative long connection structure to bypass local router firewalls
mongoose.connect("mongodb+srv://fariha-asl:Asl12345@cluster1.9nr9fio.mongodb.net/YKBI-DB?retryWrites=true&w=majority")
  .then(() => {
      console.log("✅ MongoDB cloud connected successfully!");
      app.listen(PORT, () => {
          console.log(`🚀 Server running on port ${PORT}`);
      });
  })
  .catch(err => {
      console.error("❌ Database connection error:", err.message);
  });
