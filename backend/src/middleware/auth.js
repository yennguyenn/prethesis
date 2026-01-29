import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    const err = new Error("Missing token");
    err.status = 401;
    throw err;
  }

  // Expect format: "Bearer <token>"
  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    const err = new Error("Malformed authorization header");
    err.status = 401;
    throw err;
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
    const error = new Error(message);
    error.status = 401;
    throw error;
  }
}

export function adminOnly(req, res, next) {
  if (!req.user) {
    const err = new Error("Missing user");
    err.status = 401;
    throw err;
  }
  if (req.user.role !== "admin") {
    const err = new Error("Admin only");
    err.status = 403;
    throw err;
  }
  next();
}

// Optional auth: populate req.user if a valid Bearer token is provided; otherwise continue
export function maybeAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return next();
  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") return next();
  const token = parts[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
  } catch (err) {
    // ignore invalid tokens (treat as guest)
    if (process.env.DEBUG_AUTH === "true") {
      console.warn("[maybeAuth] Ignoring invalid token:", err.name);
    }
  }
  next();
}
