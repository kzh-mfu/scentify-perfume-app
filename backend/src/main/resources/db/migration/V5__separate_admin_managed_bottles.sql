ALTER TABLE bottles
  ADD COLUMN admin_managed BOOLEAN NOT NULL DEFAULT TRUE;

UPDATE bottles bottle
JOIN (
  SELECT MIN(bottle_id) AS bottle_id
  FROM bottles
  WHERE
    (size = 50 AND bottle_type = 'Classic Flacon' AND price = 1680.00
      AND description = 'Signature cylindrical flacon with brushed gold collar and natural atomiser pump.')
    OR
    (size = 100 AND bottle_type = 'Grand Flacon' AND price = 2580.00
      AND description = 'Generous heavy-base crystal glass flacon for the dedicated signature scent collector.')
    OR
    (size = 30 AND bottle_type = 'Travel Atomizer' AND price = 522.00
      AND description = 'Compact hand-finished pocket vial for journeys and bespoke layering.')
  GROUP BY size, bottle_type
) seeded ON seeded.bottle_id = bottle.bottle_id
SET bottle.admin_managed = FALSE;

CREATE TEMPORARY TABLE bottle_duplicate_map AS
SELECT bottle.bottle_id AS duplicate_id, keeper.keeper_id
FROM bottles bottle
JOIN (
  SELECT size, bottle_type, MAX(bottle_id) AS keeper_id
  FROM bottles
  WHERE admin_managed = TRUE
  GROUP BY size, bottle_type
  HAVING COUNT(*) > 1
) keeper
  ON keeper.size = bottle.size AND keeper.bottle_type = bottle.bottle_type
WHERE bottle.admin_managed = TRUE AND bottle.bottle_id <> keeper.keeper_id;

UPDATE order_items item
JOIN bottle_duplicate_map duplicate ON duplicate.duplicate_id = item.bottle_id
SET item.bottle_id = duplicate.keeper_id;

UPDATE formulas formula
JOIN bottle_duplicate_map duplicate ON duplicate.duplicate_id = formula.recommended_bottle_id
SET formula.recommended_bottle_id = duplicate.keeper_id;

DELETE bottle
FROM bottles bottle
JOIN bottle_duplicate_map duplicate ON duplicate.duplicate_id = bottle.bottle_id;

DROP TEMPORARY TABLE bottle_duplicate_map;

CREATE UNIQUE INDEX uq_bottles_size_type_admin_managed
  ON bottles (size, bottle_type, admin_managed);
