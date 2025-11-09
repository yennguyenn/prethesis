import express from "express";
import db from "../models/index.js";
import { authMiddleware, adminOnly } from "../middleware/auth.js";

const router = express.Router();

// submit result: compute scores per major and store
router.post("/submit", authMiddleware, async (req, res) => {
  const { answers } = req.body; // expects [{questionId, optionId}]
  try {
    if (!answers || !Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({ message: "No answers submitted" });
    }

    // Load Major/SubMajor code sets for classification
    const majors = await db.Major.findAll({ attributes: ["id", "code", "name"] });
    const submajors = await db.SubMajor.findAll({ attributes: ["id", "code", "name", "majorId"] });
    const majorCodes = new Set(majors.map((m) => m.code));
    const subMajorCodes = new Set(submajors.map((s) => s.code));

    const majorScores = {};
    const submajorScores = {};
    const otherScores = {};
    const invalidAnswerIds = [];

    for (const a of answers) {
      const ansId = a?.optionId;
      if (!ansId) { invalidAnswerIds.push(ansId); continue; }
      const opt = await db.Option.findByPk(ansId);
      if (!opt) { invalidAnswerIds.push(ansId); continue; }
      const scoring = opt.scoring || opt.dataValues?.scoring || {};
      for (const [key, val] of Object.entries(scoring)) {
        const points = Number(val) || 0;
        if (majorCodes.has(key)) {
          majorScores[key] = (majorScores[key] || 0) + points;
        } else if (subMajorCodes.has(key)) {
          submajorScores[key] = (submajorScores[key] || 0) + points;
        } else {
          otherScores[key] = (otherScores[key] || 0) + points;
        }
      }
    }

    if (invalidAnswerIds.length > 0) {
      return res.status(400).json({ message: "Invalid answer_id(s)", invalidAnswerIds });
    }

    const topMajor = Object.entries(majorScores).sort((a, b) => b[1] - a[1])[0] || null;
    const topSubmajor = Object.entries(submajorScores).sort((a, b) => b[1] - a[1])[0] || null;

    const majorNameMap = {}; majors.forEach((m) => { if (m.code) majorNameMap[m.code] = m.name; });
    const subMajorNameMap = {}; submajors.forEach((s) => { if (s.code) subMajorNameMap[s.code] = s.name; });

    // Persist a compact submission per user
    const recommendedMajorPayload = topMajor ? { code: topMajor[0], name: majorNameMap[topMajor[0]] || null, score: topMajor[1] } : null;
    const recommendedSubmajorPayload = topSubmajor ? { code: topSubmajor[0], name: subMajorNameMap[topSubmajor[0]] || null, score: topSubmajor[1] } : null;

    const submission = await db.Submission.create({
      userId: req.user.id,
      majorCode: topMajor ? topMajor[0] : null,
      majorName: topMajor ? (majorNameMap[topMajor[0]] || null) : null,
      subMajorCode: topSubmajor ? topSubmajor[0] : null,
      subMajorName: topSubmajor ? (subMajorNameMap[topSubmajor[0]] || null) : null,
      score: topMajor ? topMajor[1] : 0,
      details: {
        majorScores,
        submajorScores,
        otherScores,
        majorNames: majorNameMap,
        subMajorNames: subMajorNameMap,
        // Store recommendations in the snapshot for frontend convenience
        recommendedMajor: recommendedMajorPayload,
        recommendedSubmajor: recommendedSubmajorPayload,
      },
    });

    res.json({
      id: submission.id,
      majorScores,
      submajorScores,
      otherScores,
      majorNames: majorNameMap,
      subMajorNames: subMajorNameMap,
      recommendedMajor: recommendedMajorPayload,
      recommendedSubmajor: recommendedSubmajorPayload,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Submit failed" });
  }
});

// get user results
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const list = await db.Submission.findAll({
      where: { userId: req.user.id },
      order: [["createdAt", "DESC"]],
    });
    const payload = list.map((s) => ({
      id: s.id,
      created_at: s.createdAt,
      score: s.score,
      major_name: s.majorName,
      details: s.details,
    }));
    res.json(payload);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch results" });
  }
});

// admin: stats (count per major)
router.get("/stats", authMiddleware, adminOnly, async (req, res) => {
  // Placeholder stats using Sequelize counts on Options as proxy
  try {
    const majors = await db.Major.findAll({ attributes: ["id", "code", "name"] });
    const stats = majors.map((m) => ({ id: m.id, name: m.name, result_count: 0, total_score: 0 }));
    res.json(stats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch stats" });
  }
});

export default router;
