-- Version 4 is already used by the order ID sequence migration.
ALTER TABLE formulas
  ADD COLUMN recommended_bottle_id BIGINT NULL,
  ADD CONSTRAINT fk_formulas_recommended_bottle
    FOREIGN KEY (recommended_bottle_id) REFERENCES bottles(bottle_id);

INSERT INTO ingredients (name, scent_family, description, available)
SELECT seed.name, seed.scent_family, CONCAT(seed.name, ' botanical note.'), TRUE
FROM (
  SELECT 'Bergamot' AS name, 'Citrus' AS scent_family
  UNION ALL SELECT 'Lemon', 'Citrus'
  UNION ALL SELECT 'Grapefruit', 'Citrus'
  UNION ALL SELECT 'Orange', 'Citrus'
  UNION ALL SELECT 'Rose', 'Floral'
  UNION ALL SELECT 'Jasmine', 'Floral'
  UNION ALL SELECT 'Ylang Ylang', 'Floral'
  UNION ALL SELECT 'Lavender', 'Floral'
  UNION ALL SELECT 'Sandalwood', 'Woody'
  UNION ALL SELECT 'Cedarwood', 'Woody'
  UNION ALL SELECT 'Vetiver', 'Woody'
  UNION ALL SELECT 'Oud (Agarwood)', 'Woody'
  UNION ALL SELECT 'Peach', 'Fruity'
  UNION ALL SELECT 'Raspberry', 'Fruity'
  UNION ALL SELECT 'Green Tea', 'Fresh'
  UNION ALL SELECT 'Mint', 'Fresh'
  UNION ALL SELECT 'Vanilla', 'Sweet'
  UNION ALL SELECT 'Amber', 'Sweet'
) AS seed
WHERE NOT EXISTS (
  SELECT 1 FROM ingredients existing WHERE existing.name = seed.name
);

INSERT INTO bottles (size, bottle_type, price, is_available, description)
SELECT seed.size, seed.bottle_type, seed.price, TRUE, seed.description
FROM (
  SELECT 50 AS size, 'Classic Flacon' AS bottle_type, 1680.00 AS price,
         'Signature cylindrical flacon with brushed gold collar and natural atomiser pump.' AS description
  UNION ALL
  SELECT 100, 'Grand Flacon', 2580.00,
         'Generous heavy-base crystal glass flacon for the dedicated signature scent collector.'
  UNION ALL
  SELECT 30, 'Travel Atomizer', 522.00,
         'Compact hand-finished pocket vial for journeys and bespoke layering.'
) AS seed
WHERE NOT EXISTS (
  SELECT 1 FROM bottles existing
  WHERE existing.size = seed.size AND existing.bottle_type = seed.bottle_type
);

INSERT INTO formulas (user_id, formula_name, description, is_active, recommended_bottle_id)
SELECT NULL, seed.formula_name, seed.description, TRUE,
       (SELECT bottle_id FROM bottles WHERE size = seed.bottle_size ORDER BY bottle_id LIMIT 1)
FROM (
  SELECT 'Golden Dawn' AS formula_name,
         'Luminous Italian bergamot meeting twilight-harvested Thai Sambac jasmine and smooth Mysore sandalwood.' AS description,
         50 AS bottle_size
  UNION ALL
  SELECT 'Imperial Oud',
         'Regal Damascena rose enveloped in rare smoky Trat agarwood with a sparkling Amalfi lemon facet.',
         100
  UNION ALL
  SELECT 'Botanical Solitude',
         'High-altitude French lavender with crisp ruby grapefruit over grounding Himalayan cedar.',
         50
  UNION ALL
  SELECT 'Siam Bloom',
         'Sun-drenched tropical ylang-ylang warmed with honeyed amber and sweet Mediterranean orange.',
         50
  UNION ALL
  SELECT 'Highland Serenity',
         'Crisp spearmint and steeped sencha green tea anchored in earthy Javanese vetiver root.',
         50
) AS seed
WHERE NOT EXISTS (
  SELECT 1 FROM formulas existing
  WHERE existing.user_id IS NULL AND existing.formula_name = seed.formula_name
);

INSERT INTO formula_details (formula_id, ingredient_id, note_type)
SELECT formula.formula_id, ingredient.ingredient_id, seed.note_type
FROM (
  SELECT 'Golden Dawn' AS formula_name, 'Bergamot' AS ingredient_name, 'top' AS note_type
  UNION ALL SELECT 'Golden Dawn', 'Jasmine', 'heart'
  UNION ALL SELECT 'Golden Dawn', 'Sandalwood', 'base'
  UNION ALL SELECT 'Imperial Oud', 'Lemon', 'top'
  UNION ALL SELECT 'Imperial Oud', 'Rose', 'heart'
  UNION ALL SELECT 'Imperial Oud', 'Oud (Agarwood)', 'base'
  UNION ALL SELECT 'Botanical Solitude', 'Grapefruit', 'top'
  UNION ALL SELECT 'Botanical Solitude', 'Lavender', 'heart'
  UNION ALL SELECT 'Botanical Solitude', 'Cedarwood', 'base'
  UNION ALL SELECT 'Siam Bloom', 'Orange', 'top'
  UNION ALL SELECT 'Siam Bloom', 'Ylang Ylang', 'heart'
  UNION ALL SELECT 'Siam Bloom', 'Amber', 'base'
  UNION ALL SELECT 'Highland Serenity', 'Mint', 'top'
  UNION ALL SELECT 'Highland Serenity', 'Green Tea', 'heart'
  UNION ALL SELECT 'Highland Serenity', 'Vetiver', 'base'
) AS seed
JOIN formulas formula
  ON formula.formula_name = seed.formula_name AND formula.user_id IS NULL
JOIN ingredients ingredient
  ON ingredient.name = seed.ingredient_name
WHERE NOT EXISTS (
  SELECT 1 FROM formula_details existing
  WHERE existing.formula_id = formula.formula_id
    AND existing.ingredient_id = ingredient.ingredient_id
);

CREATE INDEX formulas_recommended_bottle_id_idx ON formulas (recommended_bottle_id);
