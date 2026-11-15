-- Add the five business entities from the Scentify ERD.
-- Existing orders are preserved: new order_items references are nullable for legacy rows.

CREATE TABLE bottles (
  bottle_id BIGINT PRIMARY KEY AUTO_INCREMENT,
  size INT NOT NULL,
  bottle_type VARCHAR(100) NOT NULL,
  price DECIMAL(12,2) NOT NULL,
  is_available BOOLEAN NOT NULL DEFAULT TRUE,
  description VARCHAR(1000),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE formulas (
  formula_id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id VARCHAR(128) NULL,
  formula_name VARCHAR(255) NOT NULL,
  description VARCHAR(1000),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_formulas_profile FOREIGN KEY (user_id) REFERENCES profiles(id)
);

CREATE TABLE formula_details (
  formula_detail_id BIGINT PRIMARY KEY AUTO_INCREMENT,
  formula_id BIGINT NOT NULL,
  ingredient_id BIGINT NOT NULL,
  note_type VARCHAR(20) NOT NULL,
  percentage DECIMAL(5,2) NULL,
  CONSTRAINT fk_formula_details_formula FOREIGN KEY (formula_id) REFERENCES formulas(formula_id) ON DELETE CASCADE,
  CONSTRAINT fk_formula_details_ingredient FOREIGN KEY (ingredient_id) REFERENCES ingredients(ingredient_id),
  CONSTRAINT chk_formula_note_type CHECK (note_type IN ('top','heart','base'))
);

CREATE TABLE payments (
  payment_id BIGINT PRIMARY KEY AUTO_INCREMENT,
  order_id BIGINT NOT NULL,
  payment_method VARCHAR(50) NOT NULL,
  qr_receipt_url TEXT,
  transaction_reference VARCHAR(150),
  status VARCHAR(30) NOT NULL DEFAULT 'pending',
  verified_at TIMESTAMP NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_payments_order FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
  CONSTRAINT uq_payments_order UNIQUE (order_id)
);

CREATE TABLE shippings (
  shipping_id BIGINT PRIMARY KEY AUTO_INCREMENT,
  order_id BIGINT NOT NULL,
  shipping_fee DECIMAL(12,2) NOT NULL DEFAULT 0,
  tracking_number VARCHAR(150),
  courier_name VARCHAR(100),
  shipping_address TEXT NOT NULL,
  shipping_status VARCHAR(30) NOT NULL DEFAULT 'pending',
  shipped_at TIMESTAMP NULL,
  delivered_at TIMESTAMP NULL,
  CONSTRAINT fk_shippings_order FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
  CONSTRAINT uq_shippings_order UNIQUE (order_id)
);

ALTER TABLE order_items
  ADD COLUMN formula_id BIGINT NULL,
  ADD COLUMN bottle_id BIGINT NULL,
  ADD CONSTRAINT fk_order_items_formula FOREIGN KEY (formula_id) REFERENCES formulas(formula_id),
  ADD CONSTRAINT fk_order_items_bottle FOREIGN KEY (bottle_id) REFERENCES bottles(bottle_id);

CREATE INDEX formula_details_formula_id_idx ON formula_details(formula_id);
CREATE INDEX formulas_user_id_idx ON formulas(user_id);
CREATE INDEX payments_status_idx ON payments(status);
CREATE INDEX shippings_status_idx ON shippings(shipping_status);
