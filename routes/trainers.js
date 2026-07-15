// routes/trainers.js
const express = require("express");
const router = express.Router();
const { Op } = require("sequelize");
const Trainer = require("../models/Trainer");
const auth = require("../middleware/auth");

router.use(auth);

// GET /api/trainers -> list + search + pagination
router.get("/", async (req, res) => {
  try {
    const { search = "", page = 1, limit = 10 } = req.query;
    const where = {};

    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { role: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
      ];
    }

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.max(parseInt(limit, 10) || 10, 1);

    const { count: total, rows: trainers } = await Trainer.findAndCountAll({
      where,
      order: [["createdAt", "DESC"]],
      offset: (pageNum - 1) * limitNum,
      limit: limitNum,
    });

    res.json({
      success: true,
      data: trainers,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum) || 1,
      },
    });
  } catch (err) {
    console.error("trainers list error:", err.message);
    res.status(500).json({ success: false, message: "Failed to fetch trainers." });
  }
});

// GET /api/trainers/:id
router.get("/:id", async (req, res) => {
  try {
    const trainer = await Trainer.findByPk(req.params.id);
    if (!trainer) return res.status(404).json({ success: false, message: "Trainer not found." });
    res.json({ success: true, trainer });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch trainer." });
  }
});

// POST /api/trainers
router.post("/", async (req, res) => {
  try {
    if (!req.body.name || !req.body.role || !req.body.email) {
      return res.status(400).json({ success: false, message: "Name, role and email are required." });
    }
    const trainer = await Trainer.create(req.body);
    res.status(201).json({ success: true, trainer });
  } catch (err) {
    if (err.name === "SequelizeValidationError") {
      const msg = err.errors.map((e) => e.message).join(" ");
      return res.status(400).json({ success: false, message: msg });
    }
    console.error("trainers create error:", err.message);
    res.status(500).json({ success: false, message: "Failed to create trainer." });
  }
});

// PUT /api/trainers/:id
router.put("/:id", async (req, res) => {
  try {
    const trainer = await Trainer.findByPk(req.params.id);
    if (!trainer) return res.status(404).json({ success: false, message: "Trainer not found." });
    await trainer.update(req.body);
    res.json({ success: true, trainer });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to update trainer." });
  }
});

// DELETE /api/trainers/:id
router.delete("/:id", async (req, res) => {
  try {
    const trainer = await Trainer.findByPk(req.params.id);
    if (!trainer) return res.status(404).json({ success: false, message: "Trainer not found." });
    await trainer.destroy();
    res.json({ success: true, message: "Trainer deleted." });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to delete trainer." });
  }
});

module.exports = router;
