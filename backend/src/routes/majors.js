import express from "express";
import pool from "../db.js";
import { authMiddleware, adminOnly } from "../middleware/auth.js";

const router = express.Router();

// get majors
router.get("/", async (req, res) => {
  const r = await pool.query("SELECT * FROM majors ORDER BY id");
  res.json(r.rows);
});

// get single major
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  const r = await pool.query("SELECT * FROM majors WHERE id = $1", [id]);
  if (r.rowCount === 0) return res.status(404).json({ message: "Not found" });
  res.json(r.rows[0]);
});

// admin: create major
router.post("/", authMiddleware, adminOnly, async (req, res) => {
  const { name, description } = req.body;
  const r = await pool.query("INSERT INTO majors (name, description) VALUES ($1,$2) RETURNING *", [name, description]);
  res.json(r.rows[0]);
});

// admin: update
router.put("/:id", authMiddleware, adminOnly, async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;
  const r = await pool.query("UPDATE majors SET name=$1, description=$2 WHERE id=$3 RETURNING *", [name, description, id]);
  res.json(r.rows[0]);
});

// admin: delete
router.delete("/:id", authMiddleware, adminOnly, async (req, res) => {
  const { id } = req.params;
  await pool.query("DELETE FROM majors WHERE id=$1", [id]);
  res.json({ success: true });
});

export default router;
