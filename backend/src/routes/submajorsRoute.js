import express from "express";
import db from "../models/index.js";

const router = express.Router();

// List all submajors (code, name, major)
router.get('/', async (req, res) => {
  try {
    const subs = await db.SubMajor.findAll({
      attributes: ['id','code','name','description','majorId'],
      include: [{ model: db.Major, attributes: ['id','code','name'] }],
      order: [['id','ASC']]
    });
    const items = subs.map(s => ({
      id: s.id,
      code: s.code,
      name: s.name,
      description: s.description,
      majorId: s.majorId,
      major: s.Major ? { id: s.Major.id, code: s.Major.code, name: s.Major.name } : null
    }));
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get submajor by code, include parent Major basic info
router.get('/code/:code', async (req, res) => {
  try {
    const { code } = req.params;
    const sub = await db.SubMajor.findOne({
      where: { code },
      include: [{ model: db.Major, attributes: ['id','code','name'] }]
    });
    if (!sub) return res.status(404).json({ message: 'Not found' });
    res.json(sub);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Optional: get by id
router.get('/:id', async (req, res) => {
  try {
    const sub = await db.SubMajor.findByPk(req.params.id, {
      include: [{ model: db.Major, attributes: ['id','code','name'] }]
    });
    if (!sub) return res.status(404).json({ message: 'Not found' });
    res.json(sub);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
