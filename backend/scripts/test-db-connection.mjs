import 'dotenv/config';
import { Sequelize } from 'sequelize';
import configFile from '../src/config/config.js';

async function testSequelize() {
  const cfg = configFile.development;
  const sequelize = new Sequelize(cfg.database, cfg.username, cfg.password, {
    host: cfg.host,
    port: cfg.port,
    dialect: cfg.dialect,  
    logging: false,
  });
  try {
    await sequelize.authenticate();
    console.log('✅ [Sequelize] Database connection successful');
    console.log(`   Database: ${cfg.database}`);
    console.log(`   Host: ${cfg.host}:${cfg.port}`);
  } catch (e) {
    console.error('❌ [Sequelize] Database connection failed:', e.message);
    process.exitCode = 1;
  } finally {
    await sequelize.close().catch(() => {});
  }
}

await testSequelize();
