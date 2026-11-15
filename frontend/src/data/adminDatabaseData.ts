/*
 * Team member: Ei Thandar Kyaw (6831502020)
 * Frontend tasks: remaining admin ingredient inventory and customization defaults.
 */
import {
  DbUser,
  DbOrder,
  DbShipping,
  DbPayment,
  DbFormula,
  DbFormulaDetail,
  DbIngredient,
  DbBottle,
  DbOrderItem,
  EnrichedOrder,
  CustomizationRule,
  AdminStaffUser,
} from '../types';

export const INITIAL_DB_USERS: DbUser[] = [
  
];

export const INITIAL_DB_INGREDIENTS: DbIngredient[] = [
  { ingredient_id: 1, name: 'Bergamot', category: 'Citrus', stock_qty: 142 },
  { ingredient_id: 2, name: 'Lemon', category: 'Citrus', stock_qty: 85 },
  { ingredient_id: 3, name: 'Grapefruit', category: 'Citrus', stock_qty: 60 },
  { ingredient_id: 4, name: 'Orange', category: 'Citrus', stock_qty: 94 },
  { ingredient_id: 5, name: 'Rose', category: 'Floral', stock_qty: 48 },
  { ingredient_id: 6, name: 'Jasmine', category: 'Floral', stock_qty: 18 }, // Low stock
  { ingredient_id: 7, name: 'Ylang Ylang', category: 'Floral', stock_qty: 73 },
  { ingredient_id: 8, name: 'Lavender', category: 'Floral', stock_qty: 110 },
  { ingredient_id: 9, name: 'Sandalwood', category: 'Woody', stock_qty: 64 },
  { ingredient_id: 10, name: 'Cedarwood', category: 'Woody', stock_qty: 92 },
  { ingredient_id: 11, name: 'Vetiver', category: 'Woody', stock_qty: 55 },
  { ingredient_id: 12, name: 'Oud (Agarwood)', category: 'Woody', stock_qty: 12 }, // Critical low stock
  { ingredient_id: 13, name: 'Peach', category: 'Fruity', stock_qty: 88 },
  { ingredient_id: 14, name: 'Raspberry', category: 'Fruity', stock_qty: 67 },
  { ingredient_id: 15, name: 'Vanilla', category: 'Sweet', stock_qty: 130 },
  { ingredient_id: 16, name: 'Amber', category: 'Sweet', stock_qty: 42 },
  { ingredient_id: 17, name: 'Green Tea', category: 'Fresh', stock_qty: 95 },
  { ingredient_id: 18, name: 'Mint', category: 'Fresh', stock_qty: 76 },
];

// Helper to assemble full relational order graphs
export function buildEnrichedOrders(
  orders: DbOrder[] = [],
  users: DbUser[] = INITIAL_DB_USERS,
  shippings: DbShipping[] = [],
  payments: DbPayment[] = [],
  orderItems: DbOrderItem[] = [],
  formulas: DbFormula[] = [],
  formulaDetails: DbFormulaDetail[] = [],
  ingredients: DbIngredient[] = INITIAL_DB_INGREDIENTS,
  bottles: DbBottle[] = []
): EnrichedOrder[] {
  return orders.map((order) => {
    const user = users.find((u) => u.id === order.user_id) || {
      id: order.user_id,
      name: `Customer #${order.user_id}`,
      email: 'customer@studio.com',
      phone: '-',
      address: 'Studio Delivery Address',
      role: 'customer',
    };

    const shipping = shippings.find(
      (s) => s.order_id === order.order_id || s.shipping_id === order.shipping_id
    ) || {
      shipping_id: order.shipping_id || 0,
      order_id: order.order_id,
      shipping_fee: 0,
      tracking_number: 'UNASSIGNED',
      courier_name: 'DHL Express',
      shipping_address: user.address,
    };

    const payment = payments.find((p) => p.order_id === order.order_id) || {
      payment_id: 0,
      order_id: order.order_id,
      qr_receipt_url: '',
      status: 'pending',
    };

    // Filter order items for this order
    const matchedItems = orderItems.filter((oi) => oi.order_id === order.order_id);
    const savedItems = order.items?.map((item, index) => {
      const size = Number.parseInt(item.details?.size || '', 10) || 50;
      return {
        order_item_id: index + 1,
        formula_name: item.title,
        ingredients: (item.details?.notes || []).map((name, noteIndex) => ({
          ingredient_id: -(noteIndex + 1),
          name,
          category: 'Custom',
          stock_qty: 0,
        })),
        bottle: {
          bottle_id: -(index + 1),
          size,
          price: item.price,
        },
        qty: item.quantity,
        price: item.price,
      };
    });
    const enrichedItems = savedItems?.length
      ? savedItems
      : matchedItems.map((oi) => {
          const bottle = bottles.find((b) => b.bottle_id === oi.bottle_id) || {
            bottle_id: oi.bottle_id,
            size: 50,
            price: 1680,
          };

          const detail = formulaDetails.find((fd) => fd.formula_detail_id === oi.formula_detail_id);
          const formula = formulas.find((f) => f.formula_id === detail?.formula_id) || {
            formula_id: 1,
            formula_name: 'Artisanal Perfume Formulation',
            created_at: order.order_date,
          };

          // Gather ingredients associated with this formula
          const allFormulaDetails = formulaDetails.filter((fd) => fd.formula_id === formula.formula_id);
          const ingList = allFormulaDetails
            .map((fd) => ingredients.find((ing) => ing.ingredient_id === fd.ingredient_id))
            .filter((ing): ing is DbIngredient => Boolean(ing));

          return {
            order_item_id: oi.order_item_id,
            formula_name: formula.formula_name,
            ingredients: ingList,
            bottle,
            qty: oi.qty,
            price: bottle.price,
          };
      });

    return {
      order,
      user,
      shipping,
      payment,
      items: enrichedItems,
    };
  });
}

export const INITIAL_CUSTOMIZATION_RULES: CustomizationRule[] = [
  {
    id: 'rule-max-notes',
    name: 'Maximum 3 Harmonic Notes',
    description: 'Restricts the perfume blend to a maximum of 3 harmonic notes for optimal olfactory balance (Top, Heart, Base).',
    type: 'max_notes',
    active: true,
    params: { maxNotes: 3 },
  },
  {
    id: 'rule-pairing-woody-citrus',
    name: 'Citrus & Woody Harmonious Bridge',
    description: 'Recommends bridging Citrus and Woody families with a Floral or Fresh heart note to prevent olfactory clash.',
    type: 'recommended_pairing',
    active: true,
    params: {
      familyA: 'Citrus',
      familyB: 'Woody',
      requiredFamily: 'Floral',
      reason: 'Bridging with a Floral or Fresh note creates a seamless, luminous progression.',
    },
  },
  {
    id: 'rule-base-depth',
    name: 'Artisanal Base Longevity Anchor',
    description: 'Encourages selecting at least one Woody or Sweet note to ensure 8+ hours of fragrance sillage.',
    type: 'required_family',
    active: true,
    params: {
      requiredFamily: 'Woody',
      reason: 'Anchors the delicate top citrus notes with deep natural resins.',
    },
  },
  {
    id: 'rule-single-heavy-oud',
    name: 'Oud Concentration Guard',
    description: 'Restricts pairing heavy Oud with dark Amber to prevent overpowering delicate botanical top notes.',
    type: 'forbidden_pairing',
    active: false,
    params: {
      familyA: 'Oud',
      familyB: 'Amber',
      reason: 'Dual resin density may overpower top notes.',
    },
  },
];

export const INITIAL_ADMIN_USERS: AdminStaffUser[] = [
  
];
