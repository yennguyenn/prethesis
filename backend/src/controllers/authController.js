
import { registerService, loginService } from '../services/authService.js';

export async function register(req, res) {
  try {
    const { name, email, password } = req.body;
    const result = await registerService({ name, email, password });
    return res.status(204).json(result);
  } catch (err) {
    if (err.status === 409) {
      return res.status(409).json({ message: err.message });
    }
    if (err.message === 'Missing required fields') {
      return res.status(400).json({ message: err.message });
    }
    return res.status(500).json({ message: 'Server error' });
  }
}

export async function login(req, res) {
  const { email, password } = req.body;
  try {
    const result = await loginService({ email, password, jwtSecret: process.env.JWT_SECRET });
    res.json(result);
  } catch (err) {
    if (err.message === 'Invalid') {
      return res.status(400).json({ message: 'Invalid' });
    }
    res.status(500).json({ error: err.message });
  }
}

export default { register, login };
