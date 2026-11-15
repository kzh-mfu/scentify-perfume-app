ALTER TABLE ingredients
  ADD COLUMN stock_ml DECIMAL(12, 3) NOT NULL DEFAULT 100.000;

UPDATE ingredients
SET stock_ml = CASE name
  WHEN 'Bergamot' THEN 142.000
  WHEN 'Lemon' THEN 85.000
  WHEN 'Grapefruit' THEN 60.000
  WHEN 'Orange' THEN 94.000
  WHEN 'Rose' THEN 48.000
  WHEN 'Jasmine' THEN 18.000
  WHEN 'Ylang Ylang' THEN 73.000
  WHEN 'Lavender' THEN 110.000
  WHEN 'Sandalwood' THEN 64.000
  WHEN 'Cedarwood' THEN 92.000
  WHEN 'Vetiver' THEN 55.000
  WHEN 'Oud (Agarwood)' THEN 12.000
  WHEN 'Peach' THEN 88.000
  WHEN 'Raspberry' THEN 67.000
  WHEN 'Vanilla' THEN 130.000
  WHEN 'Amber' THEN 42.000
  WHEN 'Green Tea' THEN 95.000
  WHEN 'Mint' THEN 76.000
  ELSE stock_ml
END;
