import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "Missing token" });
  const token = authHeader.split(" ")[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
}

export function adminOnly(req, res, next) {
  if (!req.user) return res.status(401).json({ message: "Missing user" });
  if (req.user.role !== "admin") return res.status(403).json({ message: "Admin only" });
  next();
}
