import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const execP = promisify(exec);

export async function initializeDatabase() {
  // Skip psql-based initialization - database should be seeded manually or via migrations
  // To manually seed: psql -U postgres -d dss_db -f init.sql
  // console.log('Database initialization via init.sql is disabled. Use manual seeding if needed.');
  return;
  
  /* Original psql-based code (commented out):
  const initFile = path.resolve(process.cwd(), 'init.sql');
  if (!fs.existsSync(initFile)) {
    return;
  }

  const dbUrl = process.env.DATABASE_URL;
  const cmd = dbUrl ? `psql "${dbUrl}" -f "${initFile}"` : `psql -f "${initFile}"`;

  try {
    const { stdout, stderr } = await execP(cmd);
    if (stdout) console.log(stdout);
    if (stderr) console.warn(stderr);
  } catch (err) {
    throw err;
  }
  */
}

export default { initializeDatabase };
