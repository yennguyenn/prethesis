import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "Missing token" });

  // Expect format: "Bearer <token>"
  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return res.status(401).json({ message: "Malformed authorization header" });
  }
  const token = parts[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    // Granular error messaging (avoid leaking sensitive info)
    let message = "Invalid token";
    if (err.name === "TokenExpiredError") message = "Token expired";
    else if (err.name === "JsonWebTokenError") message = "Invalid token"; // keep generic

    if (process.env.DEBUG_AUTH === "true") {
      console.warn(
        "[authMiddleware] JWT verify failed:", {
          error: err.name,
          message: err.message,
          receivedHeader: authHeader?.slice(0, 40) + (authHeader?.length > 40 ? "..." : ""),
        }
      );
    }
    return res.status(401).json({ message });
  }
}

export function adminOnly(req, res, next) {
  if (!req.user) return res.status(401).json({ message: "Missing user" });
  if (req.user.role !== "admin") return res.status(403).json({ message: "Admin only" });
  next();
}
