import express from "express";
import pool from "../db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const router = express.Router();

// register
router.post("/register", async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    const hashed = await bcrypt.hash(password, 10);
    const result = await pool.query(
      "INSERT INTO users (name, email, password, role) VALUES ($1,$2,$3,$4) RETURNING id, name, email, role",
      [name, email, hashed, role || "student"]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Registration failed" });
  }
});

// login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const r = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (r.rowCount === 0) return res.status(400).json({ message: "Invalid credentials" });
    const user = r.rows[0];
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(400).json({ message: "Invalid credentials" });
    const token = jwt.sign({ id: user.id, role: user.role, name: user.name }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Login failed" });
  }
});

export default router;
