import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const execP = promisify(exec);

export async function initializeDatabase() {
  // If there's no init.sql in the backend root, skip initialization
  const initFile = path.resolve(process.cwd(), 'init.sql');
  if (!fs.existsSync(initFile)) {
    // nothing to do
    return;
  }

  // Build psql command. If DATABASE_URL is provided, pass it to psql.
  const dbUrl = process.env.DATABASE_URL;
  const cmd = dbUrl ? `psql "${dbUrl}" -f "${initFile}"` : `psql -f "${initFile}"`;

  try {
    const { stdout, stderr } = await execP(cmd);
    if (stdout) console.log(stdout);
    if (stderr) console.warn(stderr);
  } catch (err) {
    // Rethrow so caller can detect ENOENT (psql missing) or other failures
    throw err;
  }
}

export default { initializeDatabase };
