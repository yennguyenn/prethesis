import pg from "pg";
import dotenv from "dotenv";
dotenv.config();

const { Pool } = pg;

let pool;
try {
  if (!process.env.DATABASE_URL) {
    console.warn("DATABASE_URL is not set. PG pool will attempt default client configuration.");
  }
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    // Optional SSL for hosted Postgres providers; adjust as needed
    ssl: process.env.PGSSL === "true" ? { rejectUnauthorized: false } : undefined,
  });

  // Global listener to avoid unhandled client errors (e.g., network hiccups)
  pool.on("error", (err) => {
    console.error("Unexpected PG client error:", err);
  });

  // Lightweight readiness probe (non-blocking)
  (async () => {
    try {
      await pool.query("SELECT 1");
    } catch (err) {
      console.error("PostgreSQL connection test failed:", err.message);
    }
  })();
} catch (err) {
  console.error("Failed to initialize PostgreSQL pool:", err.message);
  // Provide a safe fallback that surfaces initialization failure on use
  pool = {
    query: async () => {
      throw new Error("PG pool not initialized: " + err.message);
    },
    end: async () => {},
  };
}

export default pool;
