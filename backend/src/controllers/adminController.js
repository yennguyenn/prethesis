
import db from '../models/index.js';
import {
  createMajorService,
  listMajorsService,
  updateMajorService,
  deleteMajorService,
  createQuestionService,
  listQuestionsService,
  getQuestionByIdService
} from '../services/adminService.js';

async function createMajor(req, res) {
  try {
    const { code, name, description } = req.body;
    const m = await createMajorService({ code, name, description });
    res.json(m);
  } catch (err) {
    throw err;
  }
}

async function listMajors(req, res) {
  try {
    const majors = await listMajorsService();
    res.json(majors);
  } catch (err) {
    throw err;
  }
}

async function updateMajor(req, res) {
  try {
    const { id } = req.params;
    const { code, name, description } = req.body;
    const major = await updateMajorService(id, { code, name, description });
    res.json(major);
  } catch (err) {
    if (err.message === 'Major not found') {
      err.status = 404;
    }
    throw err;
  }
}

async function deleteMajor(req, res) {
  try {
    const { id } = req.params;
    const result = await deleteMajorService(id);
    res.json(result);
  } catch (err) {
    if (err.message === 'Major not found') {
      err.status = 404;
    }
    throw err;
  }
}

async function createQuestion(req, res) {
  try {
    const { text, level, options } = req.body;
    const qFull = await createQuestionService({ text, level, options });
    res.json(qFull);
  } catch (err) {
    if (err.message && err.message.startsWith('Missing required fields')) {
      err.status = 400;
    }
    throw err;
  }
}

async function listQuestions(req, res) {
  try {
    const { page = 1, pageSize = 20, levelId } = req.query;
    const result = await listQuestionsService({ page, pageSize, levelId });
    res.json(result);
  } catch (err) {
    throw err;
  }
}

async function getQuestionById(req, res) {
  try {
    const { id } = req.params;
    const q = await getQuestionByIdService(id);
    res.json(q);
  } catch (err) {
    if (err.message === 'Question not found') {
      err.status = 404;
    }
    throw err;
  }
}

async function updateQuestion(req, res) {
  try {
    const { id } = req.params;
    const { text, levelId, options } = req.body;
    const q = await db.Question.findByPk(id);
    if (!q) return res.status(404).json({ message: 'Question not found' });
    if (text !== undefined) q.text = text;
    if (levelId !== undefined) q.levelId = levelId;
    await q.save();
    if (Array.isArray(options)) {
      for (const opt of options) {
        if (opt.id) {
          const existing = await db.Option.findByPk(opt.id);
          if (existing && existing.questionId === q.id) {
            if (opt.text !== undefined) existing.text = opt.text;
            if (opt.scoring !== undefined) existing.scoring = opt.scoring;
            await existing.save();
          }
        } else {
          await db.Option.create({ text: opt.text, scoring: opt.scoring || {}, questionId: q.id });
        }
      }
    }
    const qFull = await db.Question.findByPk(q.id, { include: db.Option });
    res.json(qFull);
  } catch (err) { res.status(500).json({ error: err.message }); }
}

async function deleteQuestion(req, res) {
  try {
    const { id } = req.params;
    const q = await db.Question.findByPk(id);
    if (!q) return res.status(404).json({ message: 'Question not found' });
    await db.Option.destroy({ where: { questionId: id } });
    await q.destroy();
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
}

// Create a new option under a question
async function createOption(req, res) {
  try {
    const { questionId } = req.params;
    const { text, scoring } = req.body;
    const q = await db.Question.findByPk(questionId);
    if (!q) return res.status(404).json({ message: 'Question not found' });
    const opt = await db.Option.create({ text: text || '', scoring: scoring || {}, questionId: q.id });
    res.status(201).json({ id: opt.id, text: opt.text, scoring: opt.scoring, questionId: q.id });
  } catch (err) { res.status(500).json({ error: err.message }); }
}

// Delete an option
async function deleteOption(req, res) {
  try {
    const { optionId } = req.params;
    const opt = await db.Option.findByPk(optionId);
    if (!opt) return res.status(404).json({ message: 'Option not found' });
    await opt.destroy();
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
}

async function importQuestionsFromJson(req,res) {
  // accept { questions: [...] } JSON for bulk import
  try {
    const { questions } = req.body;
    for (const qq of questions) {
      const lvl = Number(qq.level) || 1;
      const [levelRow] = await db.Level.findOrCreate({ where: { name: `Level ${lvl}` }, defaults: { name: `Level ${lvl}` } });
      const q = await db.Question.create({ text: qq.text, levelId: levelRow.id });
      if (!Array.isArray(qq.options)) continue;
      for (const op of qq.options) {
        const scoring = op.scoring || {};
        await db.Option.create({ text: op.text, scoring, questionId: q.id });
      }
    }
    res.json({ message: 'imported', count: questions.length });
  } catch (err){ res.status(500).json({ error: err.message }); }
};

// Admin user management
async function createAdminUser(req, res) {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    const exists = await db.User.findOne({ where: { email } });
    if (exists) return res.status(409).json({ message: 'Email already exists' });
    // Hash via model hook or manually
    const created = await db.User.create({ name, email, passwordHash: password, role: 'admin' });
    return res.status(201).json({ id: created.id, name: created.name, email: created.email, role: created.role });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

// Bootstrap: allow creating the very first admin without auth if no admins exist
async function bootstrapFirstAdmin(req, res) {
  try {
    const adminCount = await db.User.count({ where: { role: 'admin' } });
    if (adminCount > 0) return res.status(403).json({ message: 'Bootstrap disabled: admin already exists' });
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'Missing required fields' });
    const exists = await db.User.findOne({ where: { email } });
    if (exists) return res.status(409).json({ message: 'Email already exists' });
    const created = await db.User.create({ name, email, passwordHash: password, role: 'admin' });
    return res.status(201).json({ id: created.id, name: created.name, email: created.email, role: created.role });
  } catch (err) { return res.status(500).json({ error: err.message }); }
}

async function setUserRole(req, res) {
  try {
    const { userId, role } = req.body;
    if (!userId || !role) return res.status(400).json({ message: 'userId and role are required' });
    if (!['admin','user'].includes(role)) return res.status(400).json({ message: 'Invalid role' });
    const user = await db.User.findByPk(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.role = role;
    await user.save();
    return res.json({ id: user.id, name: user.name, email: user.email, role: user.role });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

// Update Option scoring (JSONB) for a given optionId
async function updateOptionScoring(req, res) {
  try {
    const { optionId } = req.params;
    const { scoring } = req.body;
    if (!optionId) return res.status(400).json({ message: 'optionId is required' });
    if (typeof scoring !== 'object' || scoring === null) {
      return res.status(400).json({ message: 'scoring must be an object' });
    }
    const opt = await db.Option.findByPk(optionId);
    if (!opt) return res.status(404).json({ message: 'Option not found' });
    opt.scoring = scoring;
    await opt.save();
    return res.json({ id: opt.id, text: opt.text, scoring: opt.scoring });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

// Update a saved Result score (admin override)
async function updateResultScore(req, res) {
  try {
    const { resultId } = req.params;
    const { score, details } = req.body; // optional: allow updating details JSON
    if (!resultId) return res.status(400).json({ message: 'resultId is required' });
    const result = await db.Result.findByPk(resultId);
    if (!result) return res.status(404).json({ message: 'Result not found' });
    if (score !== undefined) {
      const ns = Number(score);
      if (Number.isNaN(ns)) return res.status(400).json({ message: 'score must be a number' });
      result.score = ns;
    }
    if (details !== undefined) {
      if (typeof details !== 'object' || details === null) {
        return res.status(400).json({ message: 'details must be an object when provided' });
      }
      result.details = details;
    }
    await result.save();
    return res.json({ id: result.id, user_id: result.user_id, score: result.score, details: result.details });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

export default { createMajor, listMajors, createQuestion, importQuestionsFromJson, createAdminUser, setUserRole, updateOptionScoring, updateResultScore };
export { updateMajor, deleteMajor, listQuestions, updateQuestion, deleteQuestion, getQuestionById };
export { bootstrapFirstAdmin };
export { createOption, deleteOption };
// List all submissions (aggregated results) for admin oversight
export async function listSubmissions(req, res) {
  try {
    const { page = 1, pageSize = 20, userId } = req.query;
    const where = {};
    if (userId) where.userId = userId;
    const limit = Math.min(Number(pageSize) || 20, 100);
    const offset = (Math.max(Number(page) || 1, 1) - 1) * limit;
    const { rows, count } = await db.Submission.findAndCountAll({
      where,
      include: [{ model: db.User, attributes: ['id','name','email','role'] }],
      order: [['createdAt','DESC']],
      limit,
      offset
    });
    const payload = rows.map(s => ({
      id: s.id,
      createdAt: s.createdAt,
      score: s.score,
      user: s.User ? { id: s.User.id, name: s.User.name, email: s.User.email, role: s.User.role } : null,
      majorCode: s.majorCode,
      majorName: s.majorName,
      subMajorCode: s.subMajorCode,
      subMajorName: s.subMajorName,
      details: s.details
    }));
    res.json({ items: payload, total: count, page: Number(page) || 1, pageSize: limit });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
