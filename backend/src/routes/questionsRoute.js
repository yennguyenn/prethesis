import express from "express";
import db from "../models/index.js";
import { authMiddleware, adminOnly } from "../middleware/auth.js";

const router = express.Router();

// get questions (optionally by level)
router.get("/", async (req, res) => {
  try {
    const { level } = req.query;
    const where = {};
    if (level) where.levelId = level;

    const questions = await db.Question.findAll({
      where,
      include: [{ model: db.Option }],
      order: [["id", "ASC"]],
    });

    // Return a normalized shape for frontend: { id, text, answers: [{id,text}] }
    const payload = questions.map((q) => ({
      id: q.id,
      text: q.text,
      answers: (q.Options || []).map((o) => ({ id: o.id, text: o.text })),
    }));

    res.json(payload);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch questions" });
  }
});

// admin: create question + answers
router.post("/", authMiddleware, adminOnly, async (req, res) => {
  try {
    const { text, level, options } = req.body; // options: [{text, scoring}]
    const lvl = level || 1;
    // ensure Level exists (optional)
    const [levelRow] = await db.Level.findOrCreate({ where: { name: `Level ${lvl}` }, defaults: { name: `Level ${lvl}` } });
    const question = await db.Question.create({ text, levelId: levelRow.id });
    if (Array.isArray(options)) {
      for (const a of options) {
        const scoring = a.scoring || {};
        await db.Option.create({ questionId: question.id, text: a.text, scoring });
      }
    }
    const full = await db.Question.findByPk(question.id, { include: [{ model: db.Option }] });
    res.json(full);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create question" });
  }
});

// admin: update question (simple)
router.put("/:id", authMiddleware, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    const { text, level } = req.body;
    const updates = {};
    if (text !== undefined) updates.text = text;
    if (level !== undefined) {
      const [lvlRow] = await db.Level.findOrCreate({ where: { name: `Level ${level}` }, defaults: { name: `Level ${level}` } });
      updates.levelId = lvlRow.id;
    }
    await db.Question.update(updates, { where: { id } });
    const full = await db.Question.findByPk(id, { include: [{ model: db.Option }] });
    res.json(full);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update question" });
  }
});

// admin: delete question (also deletes answers via FK cascade)
router.delete("/:id", authMiddleware, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    // delete options then question to be safe
    await db.Option.destroy({ where: { questionId: id } });
    await db.Question.destroy({ where: { id } });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete question" });
  }
});

export default router;
