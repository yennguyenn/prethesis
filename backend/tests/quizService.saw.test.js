/**
 * Integration test: SAW Level 1 – CIT wins scenario
 *
 * Answers are pre-selected to maximise CIT's score across all 5 weighted criteria,
 * reproducing the scenario captured in Submission #14 of the live DB (SAW = 0.8661).
 *
 * Expected raw accumulation in the decision matrix (critWeight = 1 for all):
 *   C1 (Academic Strength  w=0.25) – Q2,Q4,Q13,Q14,Q20,Q21,Q26 → CIT: 2+2+2+1+2+2+2 = 13
 *   C2 (Interest           w=0.30) – Q1,Q7,Q15,Q19,Q28,Q29     → CIT: 2+0+4+2+4+0   = 12
 *   C3 (Skill              w=0.20) – Q6,Q9,Q17,Q22,Q24,Q27     → CIT: 4+3+1+4+3+0   = 15
 *   C4 (Work Environment   w=0.15) – Q3,Q5,Q10,Q11,Q12,Q30     → CIT: 4+0+0+4+1+0   = 9
 *   C5 (Social Value       w=0.10) – Q8,Q16,Q18,Q23,Q25        → CIT: 0+0+4+4+0      = 8
 *
 * Run: npm test  (requires a running PostgreSQL instance with the seeded DB)
 */

import { submitMajorQuizService } from '../src/services/quizService.js';
import db from '../src/models/index.js';

// ---------------------------------------------------------------------------
// Pre-selected answers: best available option for CIT per criterion question.
// For questions where no option scores CIT, the first valid option is used.
// ---------------------------------------------------------------------------
const CIT_SCENARIO_ANSWERS = [
  { questionId: 1,  optionId: 4   }, // C2 | CIT:2, MAT:3
  { questionId: 2,  optionId: 6   }, // C1 | CIT:2, MAT:4
  { questionId: 3,  optionId: 12  }, // C4 | BUS:2, CIT:4  ← best CIT
  { questionId: 4,  optionId: 15  }, // C1 | CIT:2, MAT:4
  { questionId: 5,  optionId: 17  }, // C4 | ARC:4  (no CIT – first option)
  { questionId: 6,  optionId: 23  }, // C3 | CIT:4, ENG:2  ← best CIT
  { questionId: 7,  optionId: 25  }, // C2 | no CIT – first option
  { questionId: 8,  optionId: 29  }, // C5 | no CIT – first option
  { questionId: 9,  optionId: 36  }, // C3 | CIT:3, MAT:3
  { questionId: 10, optionId: 37  }, // C4 | BUS:4  (no CIT – first option)
  { questionId: 11, optionId: 44  }, // C4 | CIT:4, TEC:1  ← best CIT
  { questionId: 12, optionId: 48  }, // C4 | CIT:1, MAT:3
  { questionId: 13, optionId: 51  }, // C1 | CIT:2, MAT:4
  { questionId: 14, optionId: 55  }, // C1 | CIT:1, MAT:4
  { questionId: 15, optionId: 60  }, // C2 | CIT:4           ← best CIT
  { questionId: 16, optionId: 61  }, // C5 | no CIT – first option
  { questionId: 17, optionId: 66  }, // C3 | CIT:1, ENG:2, TEC:4
  { questionId: 18, optionId: 71  }, // C5 | CIT:4           ← best CIT
  { questionId: 19, optionId: 76  }, // C2 | CIT:2, ENG:4
  { questionId: 20, optionId: 78  }, // C1 | CIT:2, MAT:4
  { questionId: 21, optionId: 82  }, // C1 | CIT:2, MAT:4
  { questionId: 22, optionId: 86  }, // C3 | CIT:4           ← best CIT
  { questionId: 23, optionId: 90  }, // C5 | CIT:4, TEC:2   ← best CIT
  { questionId: 24, optionId: 94  }, // C3 | CIT:3, MAT:3
  { questionId: 25, optionId: 97  }, // C5 | no CIT – first option
  { questionId: 26, optionId: 102 }, // C1 | CIT:2, MAT:4
  { questionId: 27, optionId: 105 }, // C3 | no CIT – first option
  { questionId: 28, optionId: 110 }, // C2 | CIT:4, TEC:2   ← best CIT
  { questionId: 29, optionId: 113 }, // C2 | no CIT – first option
  { questionId: 30, optionId: 117 }, // C4 | no CIT – first option
];

describe('SAW Algorithm – Level 1 CIT Scenario', () => {
  let result;

  beforeAll(async () => {
    result = await submitMajorQuizService(CIT_SCENARIO_ANSWERS, null);
  });

  afterAll(async () => {
    await db.sequelize.close();
  });

  // --- Basic shape ---

  test('service returns a well-formed result object', () => {
    expect(result).toBeDefined();
    expect(result.allScores).toBeInstanceOf(Array);
    expect(result.allScores.length).toBeGreaterThan(0);
    expect(result.totalAnswered).toBe(30);
    expect(result.weights).toBeDefined();
    expect(result.criteria).toBeInstanceOf(Array);
  });

  // --- CIT ranking ---

  test('CIT should be ranked #1 in allScores', () => {
    expect(result.allScores[0].code).toBe('CIT');
  });

  test('recommendedMajor should be CIT', () => {
    expect(result.recommendedMajor).not.toBeNull();
    expect(result.recommendedMajor.code).toBe('CIT');
  });

  // --- Threshold / proceedToLevel2 ---

  test('proceedToLevel2 should be true (margin ≥ 0.03 over 2nd place)', () => {
    expect(result.proceedToLevel2).toBe(true);
    const [first, second] = result.allScores;
    expect(first.code).toBe('CIT');
    expect(second).toBeDefined();
    expect(first.score - second.score).toBeGreaterThanOrEqual(0.03);
  });

  // --- Normalisation ---

  test('CIT normalised score is 1.0 on Interest (C2) – it monopolises that criterion', () => {
    const cit = result.allScores.find(s => s.code === 'CIT');
    expect(cit.normalized.C2).toBe(1);
  });

  test('CIT normalised score is 1.0 on Skill (C3) – it has the highest raw Skill score', () => {
    const cit = result.allScores.find(s => s.code === 'CIT');
    expect(cit.normalized.C3).toBe(1);
  });

  test('CIT normalised score is 1.0 on Work Environment (C4)', () => {
    const cit = result.allScores.find(s => s.code === 'CIT');
    expect(cit.normalized.C4).toBe(1);
  });

  test('CIT normalised score is 1.0 on Social Value (C5)', () => {
    const cit = result.allScores.find(s => s.code === 'CIT');
    expect(cit.normalized.C5).toBe(1);
  });

  // --- Raw decision matrix (verifies correct option→scoring mapping) ---

  test('CIT raw C1 (Academic Strength) should equal 13', () => {
    const cit = result.allScores.find(s => s.code === 'CIT');
    // Q2(2) + Q4(2) + Q13(2) + Q14(1) + Q20(2) + Q21(2) + Q26(2)
    expect(cit.raw.C1).toBe(13);
  });

  test('CIT raw C2 (Interest) should equal 12', () => {
    const cit = result.allScores.find(s => s.code === 'CIT');
    // Q1(2) + Q7(0) + Q15(4) + Q19(2) + Q28(4) + Q29(0)
    expect(cit.raw.C2).toBe(12);
  });

  test('CIT raw C4 (Work Environment) should equal 9', () => {
    const cit = result.allScores.find(s => s.code === 'CIT');
    // Q3(4) + Q5(0) + Q10(0) + Q11(4) + Q12(1) + Q30(0)
    expect(cit.raw.C4).toBe(9);
  });

  test('CIT raw C5 (Social Value) should equal 8', () => {
    const cit = result.allScores.find(s => s.code === 'CIT');
    // Q8(0) + Q16(0) + Q18(4) + Q23(4) + Q25(0)
    expect(cit.raw.C5).toBe(8);
  });
});
