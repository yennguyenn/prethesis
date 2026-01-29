import db from '../models/index.js';

export async function createMajorService({ code, name, description }) {
  return await db.Major.create({ code, name, description });
}

export async function listMajorsService() {
  return await db.Major.findAll();
}

export async function updateMajorService(id, { code, name, description }) {
  const major = await db.Major.findByPk(id);
  if (!major) throw new Error('Major not found');
  if (code !== undefined) major.code = code;
  if (name !== undefined) major.name = name;
  if (description !== undefined) major.description = description;
  await major.save();
  return major;
}

export async function deleteMajorService(id) {
  const major = await db.Major.findByPk(id);
  if (!major) throw new Error('Major not found');
  await major.destroy();
  return { message: 'Deleted' };
}

export async function createQuestionService({ text, level, options }) {
  if (!text || !level || !Array.isArray(options) || options.length === 0) {
    throw new Error('Missing required fields: text, level, options[]');
  }
  const lvl = Number(level) || 1;
  const [levelRow] = await db.Level.findOrCreate({ where: { name: `Level ${lvl}` }, defaults: { name: `Level ${lvl}` } });
  const q = await db.Question.create({ text, levelId: levelRow.id });
  for (const opt of options) {
    const scoring = opt.scoring || {};
    await db.Option.create({ text: opt.text, scoring, questionId: q.id });
  }
  return await db.Question.findByPk(q.id, { include: db.Option });
}

export async function listQuestionsService({ page = 1, pageSize = 20, levelId }) {
  const where = {};
  if (levelId) where.levelId = levelId;
  const limit = Math.min(Number(pageSize) || 20, 100);
  const offset = (Math.max(Number(page) || 1, 1) - 1) * limit;
  const { rows, count } = await db.Question.findAndCountAll({
    where,
    include: [{ model: db.Option }],
    limit,
    offset,
    order: [['createdAt', 'DESC']]
  });
  return { items: rows, total: count, page: Number(page) || 1, pageSize: limit };
}

export async function getQuestionByIdService(id) {
  const q = await db.Question.findByPk(id, { include: [{ model: db.Option }] });
  if (!q) throw new Error('Question not found');
  return q;
}
