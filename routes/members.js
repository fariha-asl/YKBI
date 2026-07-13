// routes/members.js
const express = require("express");
const router = express.Router();
const Member = require("../models/Member");
const auth = require("../middleware/auth");

// All member routes require a valid Bearer token (same auth used by /api/auth/me)
router.use(auth);

// GET /api/members  -> list + search + filter + pagination + summary stats
router.get("/", async (req, res) => {
  try {
    const { search = "", filter = "all", page = 1, limit = 10 } = req.query;
    const query = {};

    if (filter === "active") query.status = "active";
    if (filter === "ending") query.packageExpiry = { $ne: "Unlimited" };

    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { clientId: { $regex: search, $options: "i" } },
      ];
    }

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.max(parseInt(limit, 10) || 10, 1);

    const [members, total, totalMembers, activeMembers] = await Promise.all([
      Member.find(query)
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum),
      Member.countDocuments(query),
      Member.countDocuments({}),
      Member.countDocuments({ status: "active" }),
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
    const member = await Member.findById(req.params.id);
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
      const count = await Member.countDocuments({});
      payload.clientId = `CR-${String(10000 + count + 1).slice(-5)}`;
    }

    const existing = await Member.findOne({ clientId: payload.clientId });
    if (existing) {
      return res.status(409).json({ success: false, message: `Client ID ${payload.clientId} already exists.` });
    }

    const member = await Member.create(payload);
    res.status(201).json({ success: true, member });
  } catch (err) {
    if (err.name === "ValidationError") {
      const msg = Object.values(err.errors).map((e) => e.message).join(" ");
      return res.status(400).json({ success: false, message: msg });
    }
    console.error("members create error:", err.message);
    res.status(500).json({ success: false, message: "Failed to create member." });
  }
});

// PUT /api/members/:id  -> update member
router.put("/:id", async (req, res) => {
  try {
    const member = await Member.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!member) return res.status(404).json({ success: false, message: "Member not found." });
    res.json({ success: true, member });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to update member." });
  }
});

// DELETE /api/members/:id
router.delete("/:id", async (req, res) => {
  try {
    const member = await Member.findByIdAndDelete(req.params.id);
    if (!member) return res.status(404).json({ success: false, message: "Member not found." });
    res.json({ success: true, message: "Member deleted." });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to delete member." });
  }
});

module.exports = router;
