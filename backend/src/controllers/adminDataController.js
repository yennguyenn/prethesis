import db from '../models/index.js';

export async function listCriteria(req, res) {
  try {
    const items = await db.Criteria.findAll({ order: [['id','ASC']] });
    res.json(items);
  } catch (err) { res.status(500).json({ error: err.message }); }
}

export async function getCriteria(req, res) {
  try {
    const { id } = req.params;
    const c = await db.Criteria.findByPk(id, { include: [{ model: db.Question, through: { attributes: [] } }] });
    if (!c) return res.status(404).json({ message: 'Criteria not found' });
    res.json(c);
  } catch (err) { res.status(500).json({ error: err.message }); }
}

// List responses (admin view) with optional filters
export async function listResponses(req, res) {
  try {
    const { page = 1, pageSize = 50, userId } = req.query;
    const limit = Math.min(Number(pageSize) || 50, 500);
    const offset = (Math.max(Number(page) || 1, 1) - 1) * limit;
    const where = {};
    if (userId) where.userId = userId;
    const { rows, count } = await db.Response.findAndCountAll({ where, include: [{ model: db.User, attributes: ['id','name','email'] }, { model: db.Question, attributes: ['id','text'] }, { model: db.Option, attributes: ['id','text'] }], limit, offset, order: [['createdAt','DESC']] });
    res.json({ items: rows, total: count, page: Number(page) || 1, pageSize: limit });
  } catch (err) { res.status(500).json({ error: err.message }); }
}

export default { listCriteria, getCriteria, listResponses };
