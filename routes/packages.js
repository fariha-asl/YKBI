// routes/packages.js
const express = require("express");
const router = express.Router();
const { Op } = require("sequelize");
const Package = require("../models/Package");
const auth = require("../middleware/auth");

router.use(auth);

// GET /api/packages -> list + search + pagination
router.get("/", async (req, res) => {
  try {
    const { search = "", page = 1, limit = 10 } = req.query;
    const where = {};

    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { category: { [Op.like]: `%${search}%` } },
      ];
    }

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.max(parseInt(limit, 10) || 10, 1);

    const { count: total, rows: packages } = await Package.findAndCountAll({
      where,
      order: [["createdAt", "DESC"]],
      offset: (pageNum - 1) * limitNum,
      limit: limitNum,
    });

    res.json({
      success: true,
      data: packages,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum) || 1,
      },
    });
  } catch (err) {
    console.error("packages list error:", err.message);
    res.status(500).json({ success: false, message: "Failed to fetch packages." });
  }
});

// GET /api/packages/:id
router.get("/:id", async (req, res) => {
  try {
    const pkg = await Package.findByPk(req.params.id);
    if (!pkg) return res.status(404).json({ success: false, message: "Package not found." });
    res.json({ success: true, package: pkg });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch package." });
  }
});

// POST /api/packages
router.post("/", async (req, res) => {
  try {
    if (!req.body.name || !req.body.price) {
      return res.status(400).json({ success: false, message: "Name and price are required." });
    }
    const pkg = await Package.create(req.body);
    res.status(201).json({ success: true, package: pkg });
  } catch (err) {
    if (err.name === "SequelizeValidationError") {
      const msg = err.errors.map((e) => e.message).join(" ");
      return res.status(400).json({ success: false, message: msg });
    }
    console.error("packages create error:", err.message);
    res.status(500).json({ success: false, message: "Failed to create package." });
  }
});

// PUT /api/packages/:id
router.put("/:id", async (req, res) => {
  try {
    const pkg = await Package.findByPk(req.params.id);
    if (!pkg) return res.status(404).json({ success: false, message: "Package not found." });
    await pkg.update(req.body);
    res.json({ success: true, package: pkg });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to update package." });
  }
});

// DELETE /api/packages/:id
router.delete("/:id", async (req, res) => {
  try {
    const pkg = await Package.findByPk(req.params.id);
    if (!pkg) return res.status(404).json({ success: false, message: "Package not found." });
    await pkg.destroy();
    res.json({ success: true, message: "Package deleted." });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to delete package." });
  }
});

module.exports = router;
