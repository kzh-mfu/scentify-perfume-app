export interface Ingredient {
  id: string;
  name: string;
  description: string;
  familyId: string;
  familyName: string;
  isPopular?: boolean;
}

export interface ScentFamily {
  id: string;
  number: string;
  name: string;
  subtitle: string;
  description: string;
  notes: string[];
  image: string;
  ingredients: Ingredient[];
}

export interface Composition {
  topNote: string;
  heartNote: string;
  baseNote: string;
  bottleSize: string;
  bottleType: string;
  name?: string;
}

export interface CartItem {
  id: string;
  title: string;
  subtitle: string;
  description?: string;
  price: number;
  quantity: number;
  image: string;
  details?: {
    notes?: string[];
    size?: string;
  };
}

export interface OrderDetails {
  orderId: string;
  customerName: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
  phone: string;
  items: CartItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  discount: number;
  total: number;
  status: 'awaiting_confirmation' | 'pending_payment' | 'slip_uploaded' | 'verified' | 'shipping' | 'cancelled';
  paymentSlipUrl?: string;
  perfumerNote?: string;
}

export interface PurchaseHistoryOrder {
  orderId: string;
  date: string;
  status: string;
  total: number;
  items: CartItem[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'studio';
  text: string;
  timestamp: string;
}

export type ViewMode = 
  | 'home'
  | 'collection'
  | 'scentify'
  | 'review-fragrance'
  | 'cart'
  | 'review-order'
  | 'payment'
  | 'chat'
  | 'auth'
  | 'about'
  | 'journal'
  | 'profile'
  | 'admin';

// Relational Database Diagram Entities
export interface DbUser {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  role: 'customer' | 'admin';
}

export interface DbOrder {
  order_id: number;
  shipping_id: number;
  user_id: number;
  order_date: string;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  total_price: number;
  prep_photo_url?: string;
  items?: CartItem[];
}

export interface DbShipping {
  shipping_id: number;
  shipping_fee: number;
  tracking_number: string;
  courier_name: string;
  shipping_address: string;
}

export interface DbPayment {
  payment_id: number;
  order_id: number;
  qr_receipt_url: string;
  status: 'pending' | 'verified' | 'failed';
  verified_at?: string;
}

export interface DbFormula {
  formula_id: number;
  formula_name: string;
  created_at: string;
}

export interface DbFormulaDetail {
  formula_detail_id: number;
  formula_id: number;
  ingredient_id: number;
}

export interface DbIngredient {
  ingredient_id: number;
  name: string;
  category: string;
  stock_qty: number;
}

export interface DbBottle {
  bottle_id: number;
  size: number; // in ml: 50, 100
  price: number;
}

export interface DbOrderItem {
  order_item_id: number;
  formula_detail_id: number;
  order_id: number;
  bottle_id: number;
  qty: number;
}

// Joined representation for Admin views
export interface EnrichedOrderItem {
  order_item_id: number;
  formula_name: string;
  ingredients: DbIngredient[];
  bottle: DbBottle;
  qty: number;
  price: number;
}

export interface EnrichedOrder {
  order: DbOrder;
  user: DbUser;
  shipping: DbShipping;
  payment: DbPayment;
  items: EnrichedOrderItem[];
}

// Aliases for relational database entities
export type UserRecord = DbUser;
export type OrderRecord = DbOrder;
export type PaymentRecord = DbPayment;
export type ShippingRecord = DbShipping;
export type OrderItemRecord = DbOrderItem;
export type BottleRecord = DbBottle;
export type FormulaRecord = DbFormula;
export type FormulaDetailRecord = DbFormulaDetail;
export type IngredientRecord = DbIngredient;
export type AdminOrderFull = EnrichedOrder;

export interface BottleOption {
  bottle_id: number;
  size: string; // e.g. "50 ml", "100 ml", "30 ml"
  volume: number; // numeric volume in ml
  price: number; // in THB
  bottleType: string; // e.g. "Classic Flacon", "Grand Flacon", "Travel Atomizer"
  inStock: boolean;
  description?: string;
}

export interface CustomizationRule {
  id: string;
  name: string;
  description: string;
  type: 'max_notes' | 'required_family' | 'forbidden_pairing' | 'recommended_pairing';
  active: boolean;
  params?: {
    maxNotes?: number;
    familyA?: string;
    familyB?: string;
    requiredFamily?: string;
    reason?: string;
  };
}

export interface MasterFormula {
  id: number;
  name: string;
  topNote: string;
  heartNote: string;
  baseNote: string;
  recommendedBottle?: string;
  active: boolean;
  description: string;
  created_at?: string;
}

export interface AdminStaffUser {
  id: number;
  authUserId?: string;
  name: string;
  email: string;
  role: 'admin' | 'staff' | 'perfumer';
  title: string;
  phone?: string;
  active: boolean;
  createdAt: string;
}