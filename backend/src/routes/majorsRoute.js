import express from "express";
import db from "../models/index.js";
import { authMiddleware, adminOnly } from "../middleware/auth.js";

const router = express.Router();

// get majors
router.get("/", async (req, res) => {
  try {
    const majors = await db.Major.findAll({ order: [['id', 'ASC']] });
    res.json(majors);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// get single major
// get major by code (place before :id to avoid conflicts)
router.get("/code/:code", async (req, res) => {
  try {
    const { code } = req.params;
    const major = await db.Major.findOne({
      where: { code },
      include: [{
        model: db.SubMajor,
        attributes: ['id', 'code', 'name', 'description', 'studyGroup', 'exampleJobs'],
        separate: true,
        order: [['name', 'ASC']]
      }]
    });
    if (!major) return res.status(404).json({ message: "Not found" });
    res.json(major);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const major = await db.Major.findByPk(id);
    if (!major) return res.status(404).json({ message: "Not found" });
    res.json(major);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// admin: create major
router.post("/", authMiddleware, adminOnly, async (req, res) => {
  try {
    const { name, description } = req.body;
    const major = await db.Major.create({ name, description });
    res.json(major);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// admin: update
router.put("/:id", authMiddleware, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    const major = await db.Major.findByPk(id);
    if (!major) return res.status(404).json({ message: "Not found" });
    
    await major.update({ name, description });
    res.json(major);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// admin: delete
router.delete("/:id", authMiddleware, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    const major = await db.Major.findByPk(id);
    if (!major) return res.status(404).json({ message: "Not found" });
    
    await major.destroy();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

export default router;
