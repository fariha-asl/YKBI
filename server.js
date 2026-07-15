require("dotenv").config();
const express    = require("express");
const sequelize  = require("./config/db");
const cors       = require("cors");
const rateLimit  = require("express-rate-limit");

const app  = express();
const PORT = process.env.PORT || 5000;

if (!process.env.DB_NAME) {
  console.error("DB_NAME is not set. Add it to your .env file (see .env.example).");
  process.exit(1);
}
if (!process.env.JWT_SECRET) {
  console.error("JWT_SECRET is not set. Add a strong random value to your .env file (see .env.example).");
  process.exit(1);
}

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
app.use("/api/members", require("./routes/members"));
app.use("/api/packages", require("./routes/packages"));
app.use("/api/trainers", require("./routes/trainers"));

app.get("/health", (_req, res) =>
  res.json({ status: "ok", time: new Date().toISOString() })
);

app.use((_req, res) =>
  res.status(404).json({ success: false, message: "Route not found." })
);

sequelize.authenticate()
  .then(() => sequelize.sync())
  .then(() => {
      console.log("MySQL connected successfully!");
      app.listen(PORT, () => {
          console.log(`Server running on port ${PORT}`);
      });
  })
  .catch(err => {
      console.error("Database connection error:", err.message);
      process.exit(1);
  });
