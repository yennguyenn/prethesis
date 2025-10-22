import express from "express";
import pool from "../db.js";
import { authMiddleware, adminOnly } from "../middleware/auth.js";

const router = express.Router();

// get questions (optionally by level)
router.get("/", async (req, res) => {
  const { level } = req.query;
  let r;
  if (level) r = await pool.query("SELECT * FROM questions WHERE level = $1 ORDER BY id", [level]);
  else r = await pool.query("SELECT * FROM questions ORDER BY id");
  // include answers per question
  const questions = r.rows;
  for (let q of questions) {
    const a = await pool.query("SELECT id, text, major_id, points FROM answers WHERE question_id=$1 ORDER BY id", [q.id]);
    q.answers = a.rows;
  }
  res.json(questions);
});

// admin: create question + answers
router.post("/", authMiddleware, adminOnly, async (req, res) => {
  const { text, level, answers } = req.body; // answers: [{text, major_id, points}]
  const r = await pool.query("INSERT INTO questions (text, level) VALUES ($1,$2) RETURNING *", [text, level || 1]);
  const q = r.rows[0];
  for (let ans of answers) {
    await pool.query("INSERT INTO answers (question_id, text, major_id, points) VALUES ($1,$2,$3,$4)",
      [q.id, ans.text, ans.major_id, ans.points || 0]);
  }
  res.json({ success: true, questionId: q.id });
});

// admin: update question (simple)
router.put("/:id", authMiddleware, adminOnly, async (req, res) => {
  const { id } = req.params;
  const { text, level } = req.body;
  await pool.query("UPDATE questions SET text=$1, level=$2 WHERE id=$3", [text, level, id]);
  res.json({ success: true });
});

// admin: delete question (also deletes answers via FK cascade)
router.delete("/:id", authMiddleware, adminOnly, async (req, res) => {
  const { id } = req.params;
  await pool.query("DELETE FROM questions WHERE id=$1", [id]);
  res.json({ success: true });
});

export default router;
