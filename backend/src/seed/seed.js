const db = require('../models');
const fs = require('fs');
const path = require('path');

async function seed() {
  await db.sequelize.sync({ alter: true });

  // create levels
  await db.Level.findOrCreate({ where: { id: 1 }, defaults: { name: 'Level 1' }});
  await db.Level.findOrCreate({ where: { id: 2 }, defaults: { name: 'Level 2' }});

  // majors sample
  const majors = [
    { code: 'CS', name: 'Computer Science', description: '...' },
    { code: 'SE', name: 'Software Engineering', description: '...' },
    { code: 'AI', name: 'Artificial Intelligence & ML', description: '...' },
    { code: 'DS', name: 'Data Science & Analytics', description: '...' },
    { code: 'CY', name: 'Cyber Security', description: '...' }
  ];

  for (const m of majors) {
    await db.Major.findOrCreate({ where: { code: m.code }, defaults: m });
  }

  console.log('Seed done');
  process.exit(0);
}

seed();
