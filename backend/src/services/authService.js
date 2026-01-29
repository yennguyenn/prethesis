import db from '../models/index.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

export async function registerService({ name, email, password }) {
  if (!name || !email || !password) {
    throw new Error('Missing required fields');
  }
  const duplicate = await db.User.findOne({ where: { name } });
  if (duplicate) {
    const err = new Error('Name exists');
    err.status = 409;
    throw err;
  }
  const passwordHash = await bcrypt.hash(password, 10);
  await db.User.create({ name, email, passwordHash });
  return { message: 'User registered successfully' };
}

export async function loginService({ email, password, jwtSecret }) {
  const user = await db.User.findOne({ where: { email } });
  if (!user) throw new Error('Invalid');
  const ok = await user.verifyPassword(password);
  if (!ok) throw new Error('Invalid');
  const token = jwt.sign({ id: user.id }, jwtSecret, { expiresIn: '7d' });
  return { token, user: { id: user.id, name: user.name, role: user.role } };
}
