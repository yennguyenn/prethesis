import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import db from '../models/index.js';

dotenv.config();

function authMiddleware(role) {
  return async (req, res, next) => {
    const auth = req.headers.authorization;
    if (!auth) return res.status(401).json({ message: 'No token' });
    const token = auth.split(' ')[1];
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      const user = await db.User.findByPk(payload.id);
      if (!user) return res.status(401).json({message:'Invalid user'});
      if (role && user.role !== role) return res.status(403).json({message:'Forbidden'});
      req.user = user;
      next();
    } catch (err) {
      return res.status(401).json({ message: 'Invalid token' });
    }
  };
}

export default authMiddleware;
