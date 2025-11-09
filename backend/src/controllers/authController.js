import db from '../models/index.js';
import User from '../models/user.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
dotenv.config();

export async function register(req, res) {
  try {
    const { name, email, password } = req.body;

    if(!name || !email || !password) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    // check name exists
    const duplicate = await db.User.findOne({ where: { name } });
    if (duplicate) {
      return res.status(409).json({ message: 'Name exists' });
    }
    // password encryption
    const passwordHash = await bcrypt.hash(password, 10); // salt = 10
    // create user
    await db.User.create({ name, email, passwordHash });
    // return
    return res.status(204).json({ message: 'User registered successfully' }); 
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
}
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
