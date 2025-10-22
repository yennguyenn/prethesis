import db from '../models/index.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

async function register(req, res) {
  const { name, email, password } = req.body;
  try {
    let existing = await db.User.findOne({ where: { email }});
    if (existing) return res.status(400).json({ message: 'Email exists' });
    const user = await db.User.create({ name, email });
    await user.setPassword(password);
    await user.save();
    res.json({ message: 'OK' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
async function login(req, res) {
  const { email, password } = req.body;
  try {
    const user = await db.User.findOne({ where: { email }});
    if (!user) return res.status(400).json({ message: 'Invalid' });
    const ok = await user.verifyPassword(password);
    if (!ok) return res.status(400).json({ message: 'Invalid' });
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, name: user.name, role: user.role }});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export default { register, login };
