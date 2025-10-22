import pool from "../db.js";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
dotenv.config();

async function run() {
  try {
    // create admin user
    // const hashed = await bcrypt.hash("adminpass", 10);
    // await pool.query("INSERT INTO users (name,email,password,role) VALUES ($1,$2,$3,$4) ON CONFLICT (email) DO NOTHING",
    //   ["Admin", "admin@example.com", hashed, "admin"]);

    // seed majors
    const majors = [
      { name: "Computer Science", description: "Software, programming, systems" },
      { name: "Medicine", description: "Healthcare and medical professions" },
      { name: "Education", description: "Teaching and pedagogy" },
      { name: "Law", description: "Legal studies and practice" },
      { name: "Business", description: "Management, marketing, finance" }
    ];
    for (let m of majors) {
      await pool.query("INSERT INTO majors (name, description) VALUES ($1,$2) ON CONFLICT (name) DO NOTHING", [m.name, m.description]);
    }

    console.log("Seed complete");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
