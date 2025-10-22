import express from "express";
import pool from "../db.js";
import { authMiddleware, adminOnly } from "../middleware/auth.js";

const router = express.Router();

// submit result: compute scores per major and store
router.post("/submit", authMiddleware, async (req, res) => {
  const { answers } = req.body; // answers: [{question_id, answer_id}]
  try {
    // accumulate points per major
    const majorScores = {};
    for (let a of answers) {
      const r = await pool.query("SELECT major_id, points FROM answers WHERE id=$1", [a.answer_id]);
      if (r.rowCount === 0) continue;
      const { major_id, points } = r.rows[0];
      majorScores[major_id] = (majorScores[major_id] || 0) + (points || 0);
    }
    // find top major
    let topMajorId = null;
    let topScore = -Infinity;
    for (const [mid, score] of Object.entries(majorScores)) {
      if (score > topScore) { topScore = score; topMajorId = mid; }
    }
    const userId = req.user.id;
    const insert = await pool.query(
      "INSERT INTO results (user_id, score, details, suggested_major_id) VALUES ($1,$2,$3,$4) RETURNING *",
      [userId, topScore || 0, JSON.stringify({ answers, majorScores }), topMajorId]
    );
    res.json({ result: insert.rows[0], majorScores });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Submit failed" });
  }
});

// get user results
router.get("/me", authMiddleware, async (req, res) => {
  const r = await pool.query("SELECT r.*, m.name as major_name FROM results r LEFT JOIN majors m ON r.suggested_major_id = m.id WHERE r.user_id=$1 ORDER BY r.created_at DESC", [req.user.id]);
  res.json(r.rows);
});

// admin: stats (count per major)
router.get("/stats", authMiddleware, adminOnly, async (req, res) => {
  const r = await pool.query(
    `SELECT m.id, m.name, COUNT(r.id) as result_count, COALESCE(SUM(r.score),0) as total_score
     FROM majors m
     LEFT JOIN results r ON r.suggested_major_id = m.id
     GROUP BY m.id, m.name ORDER BY result_count DESC`
  );
  res.json(r.rows);
});

export default router;
