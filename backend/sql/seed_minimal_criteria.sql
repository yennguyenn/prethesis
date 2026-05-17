BEGIN;

ALTER TABLE public.criteria ADD COLUMN IF NOT EXISTS weight FLOAT;
ALTER TABLE public.criteria ADD COLUMN IF NOT EXISTS level_id INTEGER;

INSERT INTO public.criteria (code, name, description, weight, level_id)
VALUES
  ('C1', 'Academic Strength', 'Academic strength', 0.25, 1),
  ('C2', 'Interest', 'Interest', 0.30, 1),
  ('C3', 'Skill', 'Skill', 0.20, 1),
  ('C4', 'Work Environment', 'Work environment', 0.15, 1),
  ('C5', 'Social Value', 'Social value', 0.10, 1),
  ('CCIT1', 'Academic Ability', 'Academic ability', 0.35, 2),
  ('CCIT2', 'Technical Interest & Skills', 'Technical interest and skills', 0.30, 2),
  ('CCIT3', 'Personal Traits', 'Personal traits', 0.20, 2),
  ('CCIT4', 'Career Orientation', 'Career orientation', 0.15, 2)
ON CONFLICT (code) DO NOTHING;

WITH ordered AS (
  SELECT q.id, q.level_id, row_number() OVER (ORDER BY q.id) AS global_rn
  FROM public.questions q
),
with_level AS (
  SELECT id,
         COALESCE(level_id, CASE WHEN global_rn <= 30 THEN 1 ELSE 2 END) AS lvl,
         global_rn
  FROM ordered
),
numbered AS (
  SELECT id, lvl, row_number() OVER (PARTITION BY lvl ORDER BY id) AS rn
  FROM with_level
)
INSERT INTO public.question_criteria_map (question_id, criteria_code, weight)
SELECT n.id,
       CASE
         WHEN n.lvl = 1 THEN CASE ((n.rn - 1) % 5)
           WHEN 0 THEN 'C1'
           WHEN 1 THEN 'C2'
           WHEN 2 THEN 'C3'
           WHEN 3 THEN 'C4'
           ELSE 'C5'
         END
         WHEN n.lvl = 2 THEN CASE ((n.rn - 1) % 4)
           WHEN 0 THEN 'CCIT1'
           WHEN 1 THEN 'CCIT2'
           WHEN 2 THEN 'CCIT3'
           ELSE 'CCIT4'
         END
         ELSE 'C1'
       END AS criteria_code,
       1 AS weight
FROM numbered n
WHERE NOT EXISTS (
  SELECT 1 FROM public.question_criteria_map m WHERE m.question_id = n.id
);

COMMIT;
