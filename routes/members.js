// routes/members.js
const express = require("express");
const router = express.Router();
const { Op } = require("sequelize");
const Member = require("../models/Member");
const auth = require("../middleware/auth");

// All member routes require a valid Bearer token (same auth used by /api/auth/me)
router.use(auth);

// GET /api/members  -> list + search + filter + pagination + summary stats
router.get("/", async (req, res) => {
  try {
    const { search = "", filter = "all", page = 1, limit = 10 } = req.query;
    const where = {};

    if (filter === "active") where.status = "active";
    if (filter === "ending") where.packageExpiry = { [Op.ne]: "Unlimited" };

    if (search) {
      where[Op.or] = [
        { firstName: { [Op.like]: `%${search}%` } },
        { lastName: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { clientId: { [Op.like]: `%${search}%` } },
      ];
    }

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.max(parseInt(limit, 10) || 10, 1);

    const [{ count: total, rows: members }, totalMembers, activeMembers] = await Promise.all([
      Member.findAndCountAll({
        where,
        order: [["createdAt", "DESC"]],
        offset: (pageNum - 1) * limitNum,
        limit: limitNum,
      }),
      Member.count(),
      Member.count({ where: { status: "active" } }),
    ]);

    res.json({
      success: true,
      data: members,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum) || 1,
      },
      stats: { totalMembers, activeMembers },
    });
  } catch (err) {
    console.error("members list error:", err.message);
    res.status(500).json({ success: false, message: "Failed to fetch members." });
  }
});

// GET /api/members/:id
router.get("/:id", async (req, res) => {
  try {
    const member = await Member.findByPk(req.params.id);
    if (!member) return res.status(404).json({ success: false, message: "Member not found." });
    res.json({ success: true, member });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch member." });
  }
});

// POST /api/members  -> create member
router.post("/", async (req, res) => {
  try {
    const payload = { ...req.body, createdBy: req.userId };

    if (!payload.firstName || !payload.lastName) {
      return res.status(400).json({ success: false, message: "First name and last name are required." });
    }

    if (!payload.clientId) {
      const count = await Member.count();
      payload.clientId = `CR-${String(10000 + count + 1).slice(-5)}`;
    }

    const existing = await Member.findOne({ where: { clientId: payload.clientId } });
    if (existing) {
      return res.status(409).json({ success: false, message: `Client ID ${payload.clientId} already exists.` });
    }

    const member = await Member.create(payload);
    res.status(201).json({ success: true, member });
  } catch (err) {
    if (err.name === "SequelizeValidationError") {
      const msg = err.errors.map((e) => e.message).join(" ");
      return res.status(400).json({ success: false, message: msg });
    }
    console.error("members create error:", err.message);
    res.status(500).json({ success: false, message: "Failed to create member." });
  }
});

// PUT /api/members/:id  -> update member
router.put("/:id", async (req, res) => {
  try {
    const member = await Member.findByPk(req.params.id);
    if (!member) return res.status(404).json({ success: false, message: "Member not found." });
    await member.update(req.body);
    res.json({ success: true, member });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to update member." });
  }
});

// DELETE /api/members/:id
router.delete("/:id", async (req, res) => {
  try {
    const member = await Member.findByPk(req.params.id);
    if (!member) return res.status(404).json({ success: false, message: "Member not found." });
    await member.destroy();
    res.json({ success: true, message: "Member deleted." });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to delete member." });
  }
});

module.exports = router;
