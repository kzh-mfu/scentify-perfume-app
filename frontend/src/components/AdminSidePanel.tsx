import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  DollarSign,
  CheckCircle2,
  Download,
  Calendar,
  BarChart3,
  ArrowUpRight,
  ExternalLink,
  ChevronRight,
  Database,
  ArrowRight,
  ShieldAlert,
  Package,
  ShoppingBag,
  Clock,
  AlertTriangle,
  Search,
  Filter,
  Eye,
  EyeOff,
  Edit,
  Truck,
  FileText,
  Camera,
  RefreshCw,
  Check,
  X,
  Plus,
  Trash2,
  FlaskConical,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  Tag,
  Sliders,
  Layers,
} from 'lucide-react';

import {
  DbOrder,
  DbShipping,
  DbPayment,
  DbIngredient,
  DbUser,
  DbFormula,
  DbFormulaDetail,
  DbOrderItem,
  EnrichedOrder,
  BottleOption,
  MasterFormula,
  ScentFamily,
  Ingredient,
  CustomizationRule,
} from '../types';

import {
  INITIAL_DB_ORDERS,
  INITIAL_DB_USERS,
  INITIAL_DB_SHIPPINGS,
  INITIAL_DB_PAYMENTS,
  INITIAL_DB_INGREDIENTS,
  INITIAL_DB_FORMULAS,
  INITIAL_DB_FORMULA_DETAILS,
  INITIAL_DB_ORDER_ITEMS,
  INITIAL_BOTTLE_OPTIONS,
  INITIAL_MASTER_FORMULAS,
  INITIAL_CUSTOMIZATION_RULES,
  buildEnrichedOrders,
} from '../data/adminDatabaseData';

interface AdminSidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  adminUser?: string | null;
  orders?: DbOrder[];
  users?: DbUser[];
  shippings?: DbShipping[];
  payments?: DbPayment[];
  ingredients?: DbIngredient[];
  formulas?: DbFormula[];
  formulaDetails?: DbFormulaDetail[];
  orderItems?: DbOrderItem[];
  bottles?: BottleOption[];
  masterFormulas?: MasterFormula[];
  onSwitchToStorefront?: () => void;
  onConfirmOrder?: (orderId: number) => void | Promise<void>;
  onCancelOrder?: (orderId: number) => void | Promise<void>;
  onUpdateOrderStatus?: (orderId: number, status: DbOrder['status']) => void | Promise<void>;
  onVerifyPayment?: (paymentId: number, orderId: number) => void | Promise<void>;
  onUpdateBottles?: (bottles: BottleOption[]) => void;
  scentFamilies?: ScentFamily[];
  onUpdateScentFamilies?: (families: ScentFamily[]) => void;
  rules?: CustomizationRule[];
  onUpdateRules?: (rules: CustomizationRule[]) => void;
  onUpdateMasterFormulas?: (formulas: MasterFormula[]) => void;
}

export const AdminSidePanel: React.FC<AdminSidePanelProps> = ({
  isOpen,
  onClose,
  adminUser = 'Scentify Studio Master Perfumer',
  orders: propOrders,
  users: propUsers,
  shippings: propShippings,
  payments: propPayments,
  ingredients: propIngredients,
  formulas: propFormulas,
  formulaDetails: propFormulaDetails,
  orderItems: propOrderItems,
  bottles: propBottles,
  masterFormulas: propMasterFormulas,
  onConfirmOrder,
  onCancelOrder,
  onUpdateOrderStatus,
  onVerifyPayment,
  onSwitchToStorefront,
  onUpdateBottles,
  scentFamilies: propScentFamilies,
  onUpdateScentFamilies,
  rules: propRules,
  onUpdateRules,
  onUpdateMasterFormulas,
}) => {
  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<
    'sales' | 'orders' | 'messages' | 'bottles' | 'rules' | 'inventory' | 'admins' | 'users'
  >('sales');

  // Relational Database State
  const [orders, setOrders] = useState<DbOrder[]>(propOrders || INITIAL_DB_ORDERS);
  const [users, setUsers] = useState<DbUser[]>(propUsers || INITIAL_DB_USERS);
  const [shippings, setShippings] = useState<DbShipping[]>(propShippings || INITIAL_DB_SHIPPINGS);
  const [payments, setPayments] = useState<DbPayment[]>(propPayments || INITIAL_DB_PAYMENTS);
  const [ingredients, setIngredients] = useState<DbIngredient[]>(
    propIngredients || INITIAL_DB_INGREDIENTS
  );
  const [formulas, setFormulas] = useState<DbFormula[]>(propFormulas || INITIAL_DB_FORMULAS);
  const [formulaDetails, setFormulaDetails] = useState<DbFormulaDetail[]>(
    propFormulaDetails || INITIAL_DB_FORMULA_DETAILS
  );
  const [orderItems, setOrderItems] = useState<DbOrderItem[]>(
    propOrderItems || INITIAL_DB_ORDER_ITEMS
  );
  const [bottles, setBottles] = useState<BottleOption[]>(propBottles || INITIAL_BOTTLE_OPTIONS);
  const [masterFormulas, setMasterFormulas] = useState<MasterFormula[]>(
    propMasterFormulas || INITIAL_MASTER_FORMULAS
  );
  const [rules, setRules] = useState<CustomizationRule[]>(propRules || INITIAL_CUSTOMIZATION_RULES);

  // Sync state whenever props update
  React.useEffect(() => {
    if (propOrders) setOrders(propOrders);
  }, [propOrders]);

  React.useEffect(() => {
    if (propUsers) setUsers(propUsers);
  }, [propUsers]);

  React.useEffect(() => {
    if (propShippings) setShippings(propShippings);
  }, [propShippings]);

  React.useEffect(() => {
    if (propPayments) setPayments(propPayments);
  }, [propPayments]);

  React.useEffect(() => {
    if (propIngredients) setIngredients(propIngredients);
  }, [propIngredients]);

  React.useEffect(() => {
    if (propBottles) setBottles(propBottles);
  }, [propBottles]);

  React.useEffect(() => {
    if (propMasterFormulas) setMasterFormulas(propMasterFormulas);
  }, [propMasterFormulas]);

  React.useEffect(() => {
    if (propRules) setRules(propRules);
  }, [propRules]);

  // Toast Notification
  const [notification, setNotification] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  // -------------------------------------------------------------
  // ENRICHED ORDERS BUILDER
  // -------------------------------------------------------------
  const enrichedOrders = useMemo(() => {
    const rawBottles = bottles.map((b) => ({
      bottle_id: b.bottle_id,
      size: b.volume,
      price: b.price,
    }));

    return buildEnrichedOrders(
      orders,
      users,
      shippings,
      payments,
      orderItems,
      formulas,
      formulaDetails,
      ingredients,
      rawBottles
    );
  }, [orders, users, shippings, payments, orderItems, formulas, formulaDetails, ingredients, bottles]);

  // -------------------------------------------------------------
  // REPORTS DASHBOARD STATE
  // -------------------------------------------------------------
  const [reportPeriod, setReportPeriod] = useState<
    'all' | 'today' | '7days' | '30days' | 'month' | 'custom'
  >('all');

  const [reportType, setReportType] = useState<
    'orders' | 'scents' | 'ingredients' | 'bottles'
  >('orders');

  const [reportStatusFilter, setReportStatusFilter] = useState<string>('all');
  const [customStartDate, setCustomStartDate] = useState<string>('2026-10-01');
  const [customEndDate, setCustomEndDate] = useState<string>('2026-10-31');

  // -------------------------------------------------------------
  // REPORT FILTERED ORDERS FOR SALES TAB
  // -------------------------------------------------------------
  const reportFilteredOrders = useMemo(() => {
    const now = new Date('2026-10-30T00:00:00Z');

    return enrichedOrders.filter((eo) => {
      const orderDate = new Date(eo.order.order_date);

      // Period filter
      if (reportPeriod === 'today') {
        if (orderDate.toDateString() !== now.toDateString()) return false;
      } else if (reportPeriod === '7days') {
        const diffDays = (now.getTime() - orderDate.getTime()) / (1000 * 3600 * 24);
        if (diffDays > 7 || diffDays < 0) return false;
      } else if (reportPeriod === '30days') {
        const diffDays = (now.getTime() - orderDate.getTime()) / (1000 * 3600 * 24);
        if (diffDays > 30 || diffDays < 0) return false;
      } else if (reportPeriod === 'month') {
        if (
          orderDate.getUTCMonth() !== now.getUTCMonth() ||
          orderDate.getUTCFullYear() !== now.getUTCFullYear()
        )
          return false;
      } else if (reportPeriod === 'custom') {
        const start = new Date(customStartDate);
        const end = new Date(customEndDate);
        end.setHours(23, 59, 59, 999);

        if (orderDate < start || orderDate > end) return false;
      }

      // Status filter
      if (reportStatusFilter !== 'all') {
        if (reportStatusFilter === 'verified' && eo.payment.status !== 'verified') return false;
        if (reportStatusFilter === 'pending' && eo.payment.status !== 'pending') return false;
        if (reportStatusFilter === 'completed' && eo.order.status !== 'completed') return false;
        if (reportStatusFilter === 'processing' && eo.order.status !== 'processing') return false;
        if (reportStatusFilter === 'cancelled' && eo.order.status !== 'cancelled') return false;
      }

      return true;
    });
  }, [enrichedOrders, reportPeriod, reportStatusFilter, customStartDate, customEndDate]);

  const reportTotalRevenue = useMemo(() => {
    return reportFilteredOrders
      .filter((o) => o.order.status !== 'cancelled')
      .reduce((sum, o) => sum + o.order.total_price, 0);
  }, [reportFilteredOrders]);

  const reportAverageOrderValue = useMemo(() => {
    const valid = reportFilteredOrders.filter((o) => o.order.status !== 'cancelled');
    return valid.length > 0 ? Math.round(reportTotalRevenue / valid.length) : 0;
  }, [reportFilteredOrders, reportTotalRevenue]);

  // Overall KPIs
  const totalRevenue = useMemo(() => {
    return orders
      .filter((o) => o.status !== 'cancelled')
      .reduce((sum, o) => sum + o.total_price, 0);
  }, [orders]);

  const verifiedPaymentsCount = useMemo(() => {
    return payments.filter((p) => p.status === 'verified').length;
  }, [payments]);

  const pendingPaymentsCount = useMemo(() => {
    return payments.filter((p) => p.status === 'pending').length;
  }, [payments]);

  // -------------------------------------------------------------
  // DYNAMIC SALES REPORT FILE GENERATOR & DOWNLOADER
  // -------------------------------------------------------------
  const handleDownloadCustomReport = () => {
    let headers: string[] = [];
    let rows: (string | number)[][] = [];
    const timestamp = new Date().toISOString().slice(0, 10);

    if (reportType === 'orders') {
      headers = [
        'Order ID',
        'Date & Time',
        'Customer Name',
        'Customer Email',
        'Phone',
        'Shipping Address',
        'Courier',
        'Tracking No',
        'Fulfillment Status',
        'Payment Status',
        'Verified Date',
        'Order Total (THB)',
      ];

      rows = reportFilteredOrders.map((eo) => [
        eo.order.order_id,
        eo.order.order_date,
        `"${eo.user.name}"`,
        eo.user.email,
        `"${eo.user.phone}"`,
        `"${eo.shipping.shipping_address}"`,
        eo.shipping.courier_name,
        eo.shipping.tracking_number,
        eo.order.status,
        eo.payment.status,
        eo.payment.verified_at || 'N/A',
        eo.order.total_price,
      ]);
    } else if (reportType === 'scents') {
      headers = [
        'Scent Category / Family',
        'Associated Ingredients Count',
        'Formulation Frequency',
        'Status',
      ];

      const categories = ['Citrus', 'Floral', 'Woody', 'Fruity', 'Sweet', 'Fresh'];

      rows = categories.map((cat) => {
        const count = ingredients.filter(
          (i) => i.category.toLowerCase() === cat.toLowerCase()
        ).length;

        const matchingOrdersCount = reportFilteredOrders.filter((eo) =>
          eo.items.some((item) =>
            item.formula_name.toLowerCase().includes(cat.toLowerCase())
          )
        ).length;

        return [cat, count, matchingOrdersCount, 'Active Catalog'];
      });
    } else if (reportType === 'ingredients') {
      headers = [
        'Ingredient ID',
        'Botanical Name',
        'Category',
        'Current Stock Qty',
        'Depletion Level',
      ];

      rows = ingredients.map((ing) => {
        const level =
          ing.stock_qty <= 20
            ? 'CRITICAL LOW'
            : ing.stock_qty <= 50
              ? 'LOW REORDER'
              : 'OPTIMAL';

        return [ing.ingredient_id, `"${ing.name}"`, ing.category, ing.stock_qty, level];
      });
    } else {
      // Bottles report
      headers = [
        'Bottle ID',
        'Size (ml)',
        'Type / Flacon Style',
        'Unit Price (THB)',
        'Stock Status',
      ];

      rows = bottles.map((b) => [
        b.bottle_id,
        b.size,
        `"${b.bottleType}"`,
        b.price,
        b.inStock ? 'In Stock' : 'Out of Stock',
      ]);
    }

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');

    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `Scentify_Report_${reportType}_${reportPeriod}_${timestamp}.csv`
    );

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast(`Sales Report exported successfully: ${rows.length} rows.`);
  };

  // Orders Filter & Modal State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<
    'all' | 'pending' | 'processing' | 'completed' | 'cancelled'
  >('all');
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'verified' | 'pending' | 'failed'>(
    'all'
  );
  const [selectedOrder, setSelectedOrder] = useState<EnrichedOrder | null>(null);
  const [isEditingShipping, setIsEditingShipping] = useState(false);
  const [shippingForm, setShippingForm] = useState<{ courier: string; tracking: string }>({
    courier: '',
    tracking: '',
  });
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // -------------------------------------------------------------
  // FILTERED ORDERS FOR ORDERS TAB
  // -------------------------------------------------------------
  const filteredOrders = useMemo(() => {
    return enrichedOrders.filter((eo) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        eo.order.order_id.toString().includes(q) ||
        eo.user.name.toLowerCase().includes(q) ||
        eo.user.email.toLowerCase().includes(q) ||
        eo.shipping.tracking_number.toLowerCase().includes(q) ||
        eo.shipping.courier_name.toLowerCase().includes(q);

      const matchStatus = statusFilter === 'all' || eo.order.status === statusFilter;
      const matchPayment = paymentFilter === 'all' || eo.payment.status === paymentFilter;

      return matchSearch && matchStatus && matchPayment;
    });
  }, [enrichedOrders, searchQuery, statusFilter, paymentFilter]);

  // -------------------------------------------------------------
  // ORDER STATUS / PAYMENT / SHIPPING / PREP PHOTO
  // -------------------------------------------------------------
  const handleUpdateOrderStatus = async (orderId: number, newStatus: DbOrder['status']) => {
    try {
      await onUpdateOrderStatus?.(orderId, newStatus);
    } catch (error) {
      console.error('Failed to update order status:', error);
      showToast(error instanceof Error ? error.message : 'Order status could not be saved.');
      return;
    }

    setOrders((prev) =>
      prev.map((ord) => (ord.order_id === orderId ? { ...ord, status: newStatus } : ord))
    );
    showToast(`Order #${orderId} status set to "${newStatus.toUpperCase()}"`);

    if (selectedOrder && selectedOrder.order.order_id === orderId) {
      setSelectedOrder((prev) =>
        prev ? { ...prev, order: { ...prev.order, status: newStatus } } : null
      );
    }
  };

  const handleVerifyPayment = async (paymentId: number, orderId: number) => {
    const now = new Date().toISOString();
    try {
      await onVerifyPayment?.(paymentId, orderId);
    } catch (error) {
      console.error('Failed to verify payment:', error);
      showToast(error instanceof Error ? error.message : 'Payment verification could not be saved.');
      return;
    }

    setPayments((prev) =>
      prev.map((p) =>
        p.payment_id === paymentId ? { ...p, status: 'verified', verified_at: now } : p
      )
    );
    showToast(`PromptPay payment verified for Order #${orderId}`);

    if (selectedOrder && selectedOrder.payment.payment_id === paymentId) {
      setSelectedOrder((prev) =>
        prev
          ? {
              ...prev,
              payment: { ...prev.payment, status: 'verified', verified_at: now },
            }
          : null
      );
    }
  };

  const handleConfirmOrder = async (orderId: number) => {
    const now = new Date().toISOString();
    try {
      if (onConfirmOrder) {
        await onConfirmOrder(orderId);
      } else {
        await handleVerifyPayment(1_000_000 + orderId, orderId);
        await handleUpdateOrderStatus(orderId, 'processing');
      }
    } catch (error) {
      console.error('Failed to confirm order:', error);
      showToast(error instanceof Error ? error.message : 'Order confirmation could not be saved.');
      return;
    }

    setOrders((prev) =>
      prev.map((ord) => (ord.order_id === orderId ? { ...ord, status: 'processing' } : ord))
    );
    setPayments((prev) =>
      prev.map((p) =>
        p.order_id === orderId ? { ...p, status: 'verified', verified_at: now } : p
      )
    );

    if (selectedOrder && selectedOrder.order.order_id === orderId) {
      setSelectedOrder((prev) =>
        prev
          ? {
              ...prev,
              order: { ...prev.order, status: 'processing' },
              payment: { ...prev.payment, status: 'verified', verified_at: now },
            }
          : null
      );
    }

    showToast(`Order #${orderId} verified and advanced to PREPARATION!`);
  };

  const handleCancelOrder = async (orderId: number) => {
    try {
      await onCancelOrder?.(orderId);
    } catch (error) {
      console.error('Failed to cancel order:', error);
      showToast(error instanceof Error ? error.message : 'Order cancellation could not be saved.');
      return;
    }

    setOrders((prev) =>
      prev.map((ord) => (ord.order_id === orderId ? { ...ord, status: 'cancelled' } : ord))
    );
    setPayments((prev) =>
      prev.map((p) => (p.order_id === orderId ? { ...p, status: 'failed' } : p))
    );

    if (selectedOrder && selectedOrder.order.order_id === orderId) {
      setSelectedOrder((prev) =>
        prev
          ? {
              ...prev,
              order: { ...prev.order, status: 'cancelled' },
              payment: { ...prev.payment, status: 'failed' },
            }
          : null
      );
    }

    showToast(`Order #${orderId} cancelled by Admin.`);
  };

  const handleSaveShipping = (shippingId: number) => {
    setShippings((prev) =>
      prev.map((s) =>
        s.shipping_id === shippingId
          ? {
              ...s,
              courier_name: shippingForm.courier || s.courier_name,
              tracking_number: shippingForm.tracking || s.tracking_number,
            }
          : s
      )
    );
    setIsEditingShipping(false);
    showToast('Shipping courier and tracking details updated.');

    if (selectedOrder && selectedOrder.shipping.shipping_id === shippingId) {
      setSelectedOrder((prev) =>
        prev
          ? {
              ...prev,
              shipping: {
                ...prev.shipping,
                courier_name: shippingForm.courier || prev.shipping.courier_name,
                tracking_number: shippingForm.tracking || prev.shipping.tracking_number,
              },
            }
          : null
      );
    }
  };

  const handleSetPrepPhoto = (orderId: number, photoUrl: string) => {
    setOrders((prev) =>
      prev.map((ord) => (ord.order_id === orderId ? { ...ord, prep_photo_url: photoUrl } : ord))
    );
    showToast(`Preparation flacon photo assigned to Order #${orderId}`);
    if (selectedOrder && selectedOrder.order.order_id === orderId) {
      setSelectedOrder((prev) =>
        prev ? { ...prev, order: { ...prev.order, prep_photo_url: photoUrl } } : null
      );
    }
  };

  // -------------------------------------------------------------
  // BOTTLE & PRICING MODAL STATE
  // -------------------------------------------------------------
  const [isBottleModalOpen, setIsBottleModalOpen] = useState(false);
  const [isSavingAdmin, setIsSavingAdmin] = useState(false);
  const [editingBottle, setEditingBottle] = useState<BottleOption | null>(null);
  const [bottleForm, setBottleForm] = useState({
    size: '',
    volume: 50,
    price: 1680,
    bottleType: 'Classic Flacon',
    description: '',
    inStock: true,
  });


  // -------------------------------------------------------------
  // INGREDIENT & SCENT CATEGORY MODAL STATE
  // -------------------------------------------------------------
  const [isIngredientModalOpen, setIsIngredientModalOpen] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState<DbIngredient | null>(null);
  const [ingredientForm, setIngredientForm] = useState({
    name: '',
    category: 'Floral',
    stock_qty: 100,
    description: '',
    isPopular: false,
  });

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    subtitle: '',
    description: '',
  });


  // -------------------------------------------------------------
  // BOTTLE & PRICING ACTIONS
  // -------------------------------------------------------------
  const handleOpenAddBottle = () => {
    setEditingBottle(null);
    setBottleForm({
      size: '75 ml',
      volume: 75,
      price: 2190,
      bottleType: 'Maison Flacon',
      description: 'Handcrafted mid-size flacon with artisanal seal and fine mist sprayer.',
      inStock: true,
    });
    setIsBottleModalOpen(true);
  };

  const handleOpenEditBottle = (bottle: BottleOption) => {
    setEditingBottle(bottle);
    setBottleForm({
      size: bottle.size,
      volume: bottle.volume,
      price: bottle.price,
      bottleType: bottle.bottleType,
      description: bottle.description || '',
      inStock: bottle.inStock,
    });
    setIsBottleModalOpen(true);
  };

  const handleSaveBottle = (e: React.FormEvent) => {
    e.preventDefault();
    let updated: BottleOption[];
    if (editingBottle) {
      updated = bottles.map((b) =>
        b.bottle_id === editingBottle.bottle_id
          ? {
              ...b,
              size: bottleForm.size,
              volume: Number(bottleForm.volume),
              price: Number(bottleForm.price),
              bottleType: bottleForm.bottleType,
              description: bottleForm.description,
              inStock: bottleForm.inStock,
            }
          : b
      );
      showToast(`Bottle "${bottleForm.size}" updated to ฿${Number(bottleForm.price).toLocaleString()}.`);
    } else {
      const nextId =
        bottles.length > 0 ? Math.max(...bottles.map((b) => b.bottle_id)) + 1 : 1;
      const newBottle: BottleOption = {
        bottle_id: nextId,
        size: bottleForm.size,
        volume: Number(bottleForm.volume),
        price: Number(bottleForm.price),
        bottleType: bottleForm.bottleType,
        description: bottleForm.description,
        inStock: bottleForm.inStock,
      };
      updated = [...bottles, newBottle];
      showToast(`New bottle "${bottleForm.size}" added to store catalog.`);
    }

    setBottles(updated);
    onUpdateBottles?.(updated);
    setIsBottleModalOpen(false);
  };

  const handleDeleteBottle = (bottleId: number) => {
    const target = bottles.find((b) => b.bottle_id === bottleId);
    if (!target) return;
    const updated = bottles.filter((b) => b.bottle_id !== bottleId);
    setBottles(updated);
    onUpdateBottles?.(updated);
    showToast(`Bottle size "${target.size}" removed.`);
  };

  const handleToggleBottleStock = (bottleId: number) => {
    const updated = bottles.map((b) =>
      b.bottle_id === bottleId ? { ...b, inStock: !b.inStock } : b
    );
    setBottles(updated);
    onUpdateBottles?.(updated);
    const target = updated.find((b) => b.bottle_id === bottleId);
    showToast(`Bottle "${target?.size}" is now ${target?.inStock ? 'IN STOCK' : 'OUT OF STOCK'}.`);
  };


  // -------------------------------------------------------------
  // SCENT & INGREDIENT ACTIONS
  // -------------------------------------------------------------
  const handleOpenAddIngredient = () => {
    setEditingIngredient(null);
    setIngredientForm({
      name: '',
      category: 'Floral',
      stock_qty: 80,
      description: 'Luminous natural botanical essential extract.',
      isPopular: false,
    });
    setIsIngredientModalOpen(true);
  };

  const handleOpenEditIngredient = (ing: DbIngredient) => {
    setEditingIngredient(ing);
    setIngredientForm({
      name: ing.name,
      category: ing.category,
      stock_qty: ing.stock_qty,
      description: 'Hand-selected artisanal distillation harvested at peak bloom.',
      isPopular: false,
    });
    setIsIngredientModalOpen(true);
  };

  const handleSaveIngredient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ingredientForm.name.trim()) return;

    let updated: DbIngredient[];
    if (editingIngredient) {
      updated = ingredients.map((i) =>
        i.ingredient_id === editingIngredient.ingredient_id
          ? {
              ...i,
              name: ingredientForm.name.trim(),
              category: ingredientForm.category,
              stock_qty: Number(ingredientForm.stock_qty),
            }
          : i
      );
      showToast(`Ingredient "${ingredientForm.name}" updated.`);
    } else {
      const nextId =
        ingredients.length > 0 ? Math.max(...ingredients.map((i) => i.ingredient_id)) + 1 : 1;
      const newIng: DbIngredient = {
        ingredient_id: nextId,
        name: ingredientForm.name.trim(),
        category: ingredientForm.category,
        stock_qty: Number(ingredientForm.stock_qty),
      };
      updated = [...ingredients, newIng];
      showToast(`New ingredient "${ingredientForm.name}" added to catalog.`);
    }

    setIngredients(updated);

    // Also sync with propScentFamilies if provided
    if (propScentFamilies && onUpdateScentFamilies) {
      const catKey = ingredientForm.category.toLowerCase();
      const updatedFamilies = propScentFamilies.map((fam) => {
        if (fam.id === catKey || fam.name.toLowerCase() === catKey) {
          const ingId = ingredientForm.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
          const existing = fam.ingredients.find(
            (i) => i.name.toLowerCase() === ingredientForm.name.toLowerCase()
          );
          if (existing) {
            return {
              ...fam,
              ingredients: fam.ingredients.map((i) =>
                i.id === existing.id
                  ? {
                      ...i,
                      name: ingredientForm.name,
                      description: ingredientForm.description,
                      isPopular: ingredientForm.isPopular,
                    }
                  : i
              ),
            };
          } else {
            const newIngredientObj: Ingredient = {
              id: ingId,
              name: ingredientForm.name,
              description: ingredientForm.description,
              familyId: fam.id,
              familyName: fam.name,
              isPopular: ingredientForm.isPopular,
            };
            return {
              ...fam,
              notes: [...fam.notes, ingredientForm.name.toUpperCase()],
              ingredients: [...fam.ingredients, newIngredientObj],
            };
          }
        }
        return fam;
      });
      onUpdateScentFamilies(updatedFamilies);
    }

    setIsIngredientModalOpen(false);
  };

  const handleDeleteIngredient = (ingredientId: number) => {
    const target = ingredients.find((i) => i.ingredient_id === ingredientId);
    if (!target) return;
    const updated = ingredients.filter((i) => i.ingredient_id !== ingredientId);
    setIngredients(updated);

    // Sync removal from propScentFamilies
    if (propScentFamilies && onUpdateScentFamilies) {
      const updatedFamilies = propScentFamilies.map((fam) => ({
        ...fam,
        notes: fam.notes.filter((n) => n.toUpperCase() !== target.name.toUpperCase()),
        ingredients: fam.ingredients.filter(
          (i) => i.name.toLowerCase() !== target.name.toLowerCase()
        ),
      }));
      onUpdateScentFamilies(updatedFamilies);
    }

    showToast(`Ingredient "${target.name}" removed from library.`);
  };

  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryForm.name.trim()) return;

    if (propScentFamilies && onUpdateScentFamilies) {
      const catId = categoryForm.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
      const num = String(propScentFamilies.length + 1).padStart(2, '0');
      const newFamily: ScentFamily = {
        id: catId,
        number: num,
        name: categoryForm.name.trim(),
        subtitle: categoryForm.subtitle.trim() || 'Artisanal Botanical Harmony',
        description:
          categoryForm.description.trim() ||
          'Rich handcrafted olfactory expressions distilled from organic mountain harvests.',
        notes: [],
        image: '/assets/botanicals/citrus.png',
        ingredients: [],
      };
      onUpdateScentFamilies([...propScentFamilies, newFamily]);
      showToast(`New Scent Category "${categoryForm.name}" created!`);
    } else {
      showToast(`Category "${categoryForm.name}" registered.`);
    }

    setIsCategoryModalOpen(false);
    setCategoryForm({ name: '', subtitle: '', description: '' });
  };



  const handleAdjustStock = (ingredientId: number, delta: number) => {
    setIngredients((prev) =>
      prev.map((ing) =>
        ing.ingredient_id === ingredientId
          ? { ...ing, stock_qty: Math.max(0, ing.stock_qty + delta) }
          : ing
      )
    );
    showToast('Ingredient stock adjusted.');
  };

  // RULES & FORMULAS MODAL STATE
  // -------------------------------------------------------------
  const [isRuleModalOpen, setIsRuleModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<CustomizationRule | null>(null);
  const [ruleForm, setRuleForm] = useState<{
    name: string;
    description: string;
    type: CustomizationRule['type'];
    active: boolean;
    familyA: string;
    familyB: string;
    requiredFamily: string;
    maxNotes: number;
    reason: string;
  }>({
    name: '',
    description: '',
    type: 'recommended_pairing',
    active: true,
    familyA: 'Citrus',
    familyB: 'Woody',
    requiredFamily: 'Floral',
    maxNotes: 3,
    reason: '',
  });

  const [isFormulaModalOpen, setIsFormulaModalOpen] = useState(false);
  const [editingFormula, setEditingFormula] = useState<MasterFormula | null>(null);
  const [formulaForm, setFormulaForm] = useState({
    name: '',
    topNote: 'Bergamot',
    heartNote: 'Jasmine',
    baseNote: 'Sandalwood',
    recommendedBottle: '50 ml',
    description: '',
    active: true,
  });



  // -------------------------------------------------------------
  // CUSTOMIZATION RULES & FORMULAS ACTIONS
  // -------------------------------------------------------------
  const handleToggleRule = (ruleId: string) => {
    const updated = rules.map((r) => (r.id === ruleId ? { ...r, active: !r.active } : r));
    setRules(updated);
    onUpdateRules?.(updated);
    const r = updated.find((x) => x.id === ruleId);
    showToast(`Rule "${r?.name}" is now ${r?.active ? 'ACTIVE' : 'DEACTIVATED'}.`);
  };

  const handleSaveRule = (e: React.FormEvent) => {
    e.preventDefault();
    let updated: CustomizationRule[];
    if (editingRule) {
      updated = rules.map((r) =>
        r.id === editingRule.id
          ? {
              ...r,
              name: ruleForm.name,
              description: ruleForm.description,
              type: ruleForm.type,
              active: ruleForm.active,
              params: {
                familyA: ruleForm.familyA,
                familyB: ruleForm.familyB,
                requiredFamily: ruleForm.requiredFamily,
                maxNotes: Number(ruleForm.maxNotes),
                reason: ruleForm.reason,
              },
            }
          : r
      );
      showToast(`Rule "${ruleForm.name}" updated.`);
    } else {
      const newRule: CustomizationRule = {
        id: `rule-${Date.now().toString(36)}`,
        name: ruleForm.name,
        description: ruleForm.description,
        type: ruleForm.type,
        active: ruleForm.active,
        params: {
          familyA: ruleForm.familyA,
          familyB: ruleForm.familyB,
          requiredFamily: ruleForm.requiredFamily,
          maxNotes: Number(ruleForm.maxNotes),
          reason: ruleForm.reason,
        },
      };
      updated = [...rules, newRule];
      showToast(`New customization rule "${ruleForm.name}" registered.`);
    }
    setRules(updated);
    onUpdateRules?.(updated);
    setIsRuleModalOpen(false);
  };

  const handleDeleteRule = (ruleId: string) => {
    const updated = rules.filter((r) => r.id !== ruleId);
    setRules(updated);
    onUpdateRules?.(updated);
    showToast('Customization rule deleted.');
  };

  const handleToggleFormula = (formulaId: number) => {
    const updated = masterFormulas.map((f) =>
      f.id === formulaId ? { ...f, active: !f.active } : f
    );
    setMasterFormulas(updated);
    onUpdateMasterFormulas?.(updated);
    const target = updated.find((f) => f.id === formulaId);
    showToast(`Formula "${target?.name}" is now ${target?.active ? 'AVAILABLE' : 'DEACTIVATED'}.`);
  };

  const handleSaveFormula = (e: React.FormEvent) => {
    e.preventDefault();
    let updated: MasterFormula[];
    if (editingFormula) {
      updated = masterFormulas.map((f) =>
        f.id === editingFormula.id
          ? {
              ...f,
              name: formulaForm.name,
              topNote: formulaForm.topNote,
              heartNote: formulaForm.heartNote,
              baseNote: formulaForm.baseNote,
              recommendedBottle: formulaForm.recommendedBottle,
              description: formulaForm.description,
              active: formulaForm.active,
            }
          : f
      );
      showToast(`Formula "${formulaForm.name}" updated.`);
    } else {
      const nextId =
        masterFormulas.length > 0
          ? Math.max(...masterFormulas.map((f) => f.id)) + 1
          : 101;
      const newF: MasterFormula = {
        id: nextId,
        name: formulaForm.name,
        topNote: formulaForm.topNote,
        heartNote: formulaForm.heartNote,
        baseNote: formulaForm.baseNote,
        recommendedBottle: formulaForm.recommendedBottle,
        description: formulaForm.description,
        active: formulaForm.active,
        created_at: new Date().toISOString(),
      };
      updated = [...masterFormulas, newF];
      showToast(`Master Formula "${formulaForm.name}" created.`);
    }
    setMasterFormulas(updated);
    onUpdateMasterFormulas?.(updated);
    setIsFormulaModalOpen(false);
  };

  const handleDeleteFormula = (formulaId: number) => {
    const updated = masterFormulas.filter((f) => f.id !== formulaId);
    setMasterFormulas(updated);
    onUpdateMasterFormulas?.(updated);
    showToast('Master Formula removed.');
  };

  return (
    <>
      {/* SALES & REPORTS STUDIO WITH DYNAMIC RANGE SELECTION & DOWNLOAD */}
      {/* ========================================================================= */}
      {activeTab === 'sales' && (
        <div className="space-y-8 animate-in fade-in duration-200">

          {/* Header & Controls Card */}
          <div className="bg-[#FBF7F0] border border-[#DAD1C5] p-5 sm:p-6 shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-[#DAD1C5]/40">
              <div>
                <span className="text-[10px] tracking-[0.25em] uppercase text-[#C9A25C] font-semibold block mb-1">
                  Financial Reporting &amp; Diagnostics
                </span>

                <h2 className="font-serif text-2xl sm:text-3xl text-[#28192A]">
                  Sales Reports &amp; Analytics Dashboard
                </h2>

                <p className="text-xs text-[#6B6166] mt-1">
                  Select your reporting period and report focus to preview metrics and export a data file.
                </p>
              </div>

              <button
                onClick={handleDownloadCustomReport}
                className="px-4 py-2.5 bg-[#28192A] hover:bg-[#3D2540] text-[#FBF7F0] text-xs uppercase tracking-wider font-medium flex items-center justify-center gap-2 transition-all shadow-sm shrink-0"
              >
                <Download className="w-4 h-4 text-[#C9A25C]" />
                <span>Download Sales Report (.CSV)</span>
              </button>
            </div>

            {/* Range & Filter Selectors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-5">

              {/* 1. Reporting Period */}
              <div>
                <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#28192A] mb-1.5">
                  1. Reporting Period
                </label>

                <select
                  value={reportPeriod}
                  onChange={(e) => setReportPeriod(e.target.value as any)}
                  className="w-full bg-[#FBF7F0] border border-[#DAD1C5] px-3 py-2 text-xs text-[#28192A] focus:outline-none focus:border-[#C9A25C]"
                >
                  <option value="all">All Time (Lifetime)</option>
                  <option value="today">Today Only</option>
                  <option value="7days">Last 7 Days</option>
                  <option value="30days">Last 30 Days</option>
                  <option value="month">Current Month (October 2026)</option>
                  <option value="custom">Custom Date Range...</option>
                </select>
              </div>

              {/* 2. Report Type / Focus */}
              <div>
                <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#28192A] mb-1.5">
                  2. Report Focus
                </label>

                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value as any)}
                  className="w-full bg-[#FBF7F0] border border-[#DAD1C5] px-3 py-2 text-xs text-[#28192A] focus:outline-none focus:border-[#C9A25C]"
                >
                  <option value="orders">Complete Sales &amp; Order Transactions</option>
                  <option value="scents">Revenue by Scent Family &amp; Notes</option>
                  <option value="ingredients">Ingredient Stock &amp; Depletion Demand</option>
                  <option value="bottles">Bottle Sizes &amp; Packaging Breakdown</option>
                </select>
              </div>

              {/* 3. Status Filter */}
              <div>
                <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#28192A] mb-1.5">
                  3. Payment / Order Status
                </label>

                <select
                  value={reportStatusFilter}
                  onChange={(e) => setReportStatusFilter(e.target.value)}
                  className="w-full bg-[#FBF7F0] border border-[#DAD1C5] px-3 py-2 text-xs text-[#28192A] focus:outline-none focus:border-[#C9A25C]"
                >
                  <option value="all">All Orders (Inclusive)</option>
                  <option value="verified">Verified &amp; Paid Only</option>
                  <option value="pending">Pending Payment Verification</option>
                  <option value="processing">In Preparation</option>
                  <option value="completed">Completed &amp; Dispatched</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              {/* 4. Active Scope Badge */}
              <div className="flex flex-col justify-end">
                <span className="text-[10px] uppercase tracking-wider text-[#6B6166] mb-1">
                  Matching Orders in Scope:
                </span>

                <div className="bg-[#FBF7F0] border border-[#C9A25C]/40 px-3 py-2 text-xs font-mono font-medium text-[#28192A] flex items-center justify-between">
                  <span>{reportFilteredOrders.length} Transactions</span>
                  <span className="text-[#C9A25C] font-bold">
                    ฿{reportTotalRevenue.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Custom Date Range Picker when selected */}
            {reportPeriod === 'custom' && (
              <div className="mt-4 pt-4 border-t border-[#DAD1C5]/40 grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#FBF7F0] p-3">
                <div>
                  <label className="block text-[10px] uppercase font-semibold text-[#6B6166] mb-1">
                    Start Date
                  </label>

                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="w-full bg-[#FBF7F0] border border-[#DAD1C5] px-2 py-1.5 text-xs text-[#28192A]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-semibold text-[#6B6166] mb-1">
                    End Date
                  </label>

                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="w-full bg-[#FBF7F0] border border-[#DAD1C5] px-2 py-1.5 text-xs text-[#28192A]"
                  />
                </div>
              </div>
            )}
          </div>

          {/* KPI Cards for the selected period */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">

            <div className="bg-[#FBF7F0] border border-[#DAD1C5] p-5 shadow-xs">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#6B6166] block">
                Period Revenue
              </span>

              <div className="font-serif text-2xl sm:text-3xl text-[#28192A] mt-1 font-medium">
                ฿{reportTotalRevenue.toLocaleString()}
              </div>

              <span className="text-[10px] text-[#C9A25C] font-medium mt-1 block">
                {reportFilteredOrders.filter((o) => o.order.status !== 'cancelled').length} qualifying orders
              </span>
            </div>

            <div className="bg-[#FBF7F0] border border-[#DAD1C5] p-5 shadow-xs">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#6B6166] block">
                Average Ticket Size
              </span>

              <div className="font-serif text-2xl sm:text-3xl text-[#28192A] mt-1 font-medium">
                ฿{reportAverageOrderValue.toLocaleString()}
              </div>

              <span className="text-[10px] text-[#6B6166] mt-1 block">
                Per confirmed customer order
              </span>
            </div>

            <div className="bg-[#FBF7F0] border border-[#DAD1C5] p-5 shadow-xs">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#6B6166] block">
                Verified Payment Rate
              </span>

              <div className="font-serif text-2xl sm:text-3xl text-[#28192A] mt-1 font-medium">
                {reportFilteredOrders.length > 0
                  ? Math.round(
                      (reportFilteredOrders.filter((o) => o.payment.status === 'verified').length /
                        reportFilteredOrders.length) *
                        100
                    )
                  : 100}
                %
              </div>

              <span className="text-[10px] text-emerald-700 font-medium mt-1 block">
                PromptPay Slip confirmation
              </span>
            </div>

            <div className="bg-[#FBF7F0] border border-[#DAD1C5] p-5 shadow-xs">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#6B6166] block">
                Active Formula Library
              </span>

              <div className="font-serif text-2xl sm:text-3xl text-[#28192A] mt-1 font-medium">
                {masterFormulas.filter((f) => f.active).length}
              </div>

              <span className="text-[10px] text-[#C9A25C] mt-1 block">
                Master blends ready for customers
              </span>
            </div>
          </div>

          {/* Generated Report Table Preview */}
          <div className="bg-[#FBF7F0] border border-[#DAD1C5] overflow-hidden shadow-xs">
            <div className="px-5 py-4 border-b border-[#DAD1C5] bg-[#FBF7F0] flex items-center justify-between">
              <div>
                <h3 className="font-serif text-base text-[#28192A] font-medium">
                  Live Report Preview: {reportType.toUpperCase()} ({reportFilteredOrders.length} records)
                </h3>

                <p className="text-[11px] text-[#6B6166]">
                  Filtered by: {reportPeriod.toUpperCase()} · Status: {reportStatusFilter.toUpperCase()}
                </p>
              </div>

              <button
                onClick={handleDownloadCustomReport}
                className="px-3 py-1.5 bg-[#28192A] text-[#FBF7F0] text-xs flex items-center gap-1.5 hover:bg-[#3D2540] transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-[#C9A25C]" />
                <span>Download File</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#FBF7F0]/60 border-b border-[#DAD1C5] text-[10px] font-mono uppercase tracking-wider text-[#6B6166]">
                    <th className="py-3 px-4">Order #</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Formula &amp; Notes</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Payment</th>
                    <th className="py-3 px-4 text-right">Total</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#DAD1C5]/40 font-light">
                  {reportFilteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-[#6B6166]">
                        No records match the selected reporting period and filters.
                      </td>
                    </tr>
                  ) : (
                    reportFilteredOrders.map((eo) => (
                      <tr key={eo.order.order_id} className="hover:bg-[#FBF7F0]/50 transition-colors">
                        <td className="py-3 px-4 font-mono font-medium text-[#28192A]">
                          #{eo.order.order_id}
                        </td>

                        <td className="py-3 px-4 text-[#6B6166]">
                          {new Date(eo.order.order_date).toLocaleDateString()}
                        </td>

                        <td className="py-3 px-4">
                          <span className="font-medium text-[#28192A] block">{eo.user.name}</span>
                          <span className="text-[10px] text-[#6B6166]">{eo.user.email}</span>
                        </td>

                        <td className="py-3 px-4">
                          <span className="text-[#28192A] block font-serif">
                            {eo.items[0]?.formula_name || 'Bespoke Blend'}
                          </span>

                          <span className="text-[10px] text-[#6B6166]">
                            {eo.items[0]?.bottle?.size || 50} ml · {eo.items[0]?.qty || 1} unit(s)
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          <span
                            className={`inline-block px-2 py-0.5 text-[9px] uppercase font-mono tracking-wider ${
                              eo.order.status === 'completed'
                                ? 'bg-emerald-100 text-emerald-800'
                                : eo.order.status === 'processing'
                                  ? 'bg-amber-100 text-amber-800'
                                  : eo.order.status === 'cancelled'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-zinc-100 text-zinc-800'
                            }`}
                          >
                            {eo.order.status}
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          <span
                            className={`inline-block px-2 py-0.5 text-[9px] uppercase font-mono tracking-wider ${
                              eo.payment.status === 'verified'
                                ? 'bg-emerald-100 text-emerald-800 font-medium'
                                : eo.payment.status === 'failed'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {eo.payment.status}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-right font-mono font-medium text-[#28192A]">
                          ฿{eo.order.total_price.toLocaleString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ORDER MANAGEMENT & VERIFICATION */}
      {/* ========================================================================= */}
      {activeTab === 'orders' && (
        <div className="space-y-6 animate-in fade-in duration-200">

          {/* Filter toolbar */}
          <div className="bg-[#FBF7F0] border border-[#DAD1C5] p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-xs">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#6B6166] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search orders by ID, customer name, email, courier tracking..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#FBF7F0] border border-[#DAD1C5] pl-9 pr-4 py-2 text-xs text-[#28192A] focus:outline-none focus:border-[#C9A25C]"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="bg-[#FBF7F0] border border-[#DAD1C5] px-3 py-2 text-xs text-[#28192A]"
              >
                <option value="all">All Order Statuses</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>

              <select
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value as any)}
                className="bg-[#FBF7F0] border border-[#DAD1C5] px-3 py-2 text-xs text-[#28192A]"
              >
                <option value="all">All Payments</option>
                <option value="verified">Verified</option>
                <option value="pending">Pending Slip</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </div>

          {/* Orders list */}
          <div className="bg-[#FBF7F0] border border-[#DAD1C5] overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#FBF7F0] border-b border-[#DAD1C5] text-[10px] font-mono uppercase tracking-wider text-[#6B6166]">
                    <th className="py-3.5 px-4">Order ID</th>
                    <th className="py-3.5 px-4">Date</th>
                    <th className="py-3.5 px-4">Customer</th>
                    <th className="py-3.5 px-4">Formula</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">PromptPay</th>
                    <th className="py-3.5 px-4">Total</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#DAD1C5]/40 font-light">
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-[#6B6166]">
                        No orders found matching the filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((eo) => (
                      <tr key={eo.order.order_id} className="hover:bg-[#FBF7F0]/60 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-medium text-[#28192A]">
                          #{eo.order.order_id}
                        </td>
                        <td className="py-3.5 px-4 text-[#6B6166]">
                          {new Date(eo.order.order_date).toLocaleDateString()}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-medium text-[#28192A] block">{eo.user.name}</span>
                          <span className="text-[10px] text-[#6B6166]">{eo.user.phone}</span>
                        </td>
                        <td className="py-3.5 px-4 font-serif text-[#28192A]">
                          {eo.items[0]?.formula_name || 'Bespoke Blend'}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-block px-2 py-0.5 text-[9px] uppercase font-mono tracking-wider ${
                              eo.order.status === 'completed'
                                ? 'bg-emerald-100 text-emerald-800'
                                : eo.order.status === 'processing'
                                  ? 'bg-amber-100 text-amber-800'
                                  : eo.order.status === 'cancelled'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-zinc-100 text-zinc-800'
                            }`}
                          >
                            {eo.order.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-block px-2 py-0.5 text-[9px] uppercase font-mono tracking-wider ${
                              eo.payment.status === 'verified'
                                ? 'bg-emerald-100 text-emerald-800 font-medium'
                                : eo.payment.status === 'failed'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {eo.payment.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono font-medium text-[#28192A]">
                          ฿{eo.order.total_price.toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {eo.payment.status === 'pending' && (
                              <button
                                onClick={() => handleConfirmOrder(eo.order.order_id)}
                                className="px-2 py-1 bg-emerald-700 hover:bg-emerald-800 text-white text-[10px] uppercase font-mono transition-colors"
                                title="Verify Slip & Confirm Order"
                              >
                                Verify
                              </button>
                            )}
                            <button
                              onClick={() => {
                                setSelectedOrder(eo);
                                setShippingForm({
                                  courier: eo.shipping.courier_name,
                                  tracking: eo.shipping.tracking_number,
                                });
                              }}
                              className="px-2 py-1 bg-[#28192A] hover:bg-[#3D2540] text-[#FBF7F0] text-[10px] uppercase font-mono transition-colors"
                            >
                              View
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ORDER DETAILS DRAWER */}
      {/* ========================================================================= */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FBF7F0] border border-[#DAD1C5] max-w-2xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95">

            <div className="flex items-center justify-between pb-3 border-b border-[#DAD1C5] mb-5">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#C9A25C]">
                  Order #{selectedOrder.order.order_id}
                </span>
                <h3 className="font-serif text-2xl text-[#28192A]">
                  Order &amp; Formulation Details
                </h3>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="text-[#6B6166]">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Customer & Shipping Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#FBF7F0] p-4 border border-[#DAD1C5]/50 mb-5 text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#6B6166] block mb-1">
                  Customer
                </span>
                <div className="font-medium text-[#28192A]">{selectedOrder.user.name}</div>
                <div className="text-[#6B6166]">{selectedOrder.user.email}</div>
                <div className="text-[#6B6166]">{selectedOrder.user.phone}</div>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-[#6B6166] block mb-1">
                  Shipping Destination
                </span>
                <div className="text-[#28192A] font-light leading-relaxed">
                  {selectedOrder.shipping.shipping_address}
                </div>
                <div className="mt-1 text-[11px] font-mono text-[#C9A25C]">
                  Courier: {selectedOrder.shipping.courier_name} · Track: {selectedOrder.shipping.tracking_number}
                </div>
              </div>
            </div>

            {/* Items */}
            <div className="space-y-3 mb-5">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#28192A] block">
                Formulated Items
              </span>
              {selectedOrder.items.map((it, idx) => (
                <div
                  key={idx}
                  className="bg-[#FBF7F0] border border-[#DAD1C5] p-3.5 flex items-center justify-between text-xs"
                >
                  <div>
                    <h4 className="font-serif text-base text-[#28192A] font-medium">
                      {it.formula_name}
                    </h4>
                    <span className="text-[#6B6166] text-[11px]">
                      {it.bottle?.size || 50} ml Vessel · Quantity: {it.qty}
                    </span>
                  </div>
                  <span className="font-mono font-semibold text-[#28192A]">
                    ฿{(it.price * it.qty).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            {/* PromptPay Slip Section */}
            {selectedOrder.payment.qr_receipt_url && (
              <div className="border border-[#DAD1C5] p-4 mb-5 bg-[#FBF7F0]">
                <span className="text-xs font-semibold uppercase text-[#28192A] block mb-2">
                  PromptPay Transfer Slip
                </span>
                <div className="flex items-center gap-4">
                  <img
                    src={selectedOrder.payment.qr_receipt_url}
                    alt="Payment Slip"
                    className="w-20 h-20 object-contain border border-[#DAD1C5] bg-white cursor-pointer hover:opacity-90"
                    onClick={() => setPreviewImage(selectedOrder.payment.qr_receipt_url)}
                  />
                  <div>
                    <span className="text-xs text-[#6B6166] block">
                      Status: <strong className="uppercase">{selectedOrder.payment.status}</strong>
                    </span>
                    {selectedOrder.payment.status === 'pending' && (
                      <button
                        onClick={() => handleConfirmOrder(selectedOrder.order.order_id)}
                        className="mt-2 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-medium"
                      >
                        Verify Slip &amp; Advance
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Shipping Tracking Update Form */}
            <div className="border border-[#DAD1C5] p-4 mb-5 bg-[#FBF7F0]">
              <span className="text-xs font-semibold uppercase text-[#28192A] block mb-2">
                Courier &amp; Tracking Update
              </span>
              <div className="grid grid-cols-2 gap-3 text-xs mb-2">
                <input
                  type="text"
                  placeholder="Courier (e.g. DHL Express)"
                  value={shippingForm.courier}
                  onChange={(e) => setShippingForm({ ...shippingForm, courier: e.target.value })}
                  className="bg-[#FBF7F0] border border-[#DAD1C5] px-2.5 py-1.5"
                />
                <input
                  type="text"
                  placeholder="Tracking Number"
                  value={shippingForm.tracking}
                  onChange={(e) => setShippingForm({ ...shippingForm, tracking: e.target.value })}
                  className="bg-[#FBF7F0] border border-[#DAD1C5] px-2.5 py-1.5"
                />
              </div>
              <button
                onClick={() => handleSaveShipping(selectedOrder.shipping.shipping_id)}
                className="px-3 py-1.5 bg-[#28192A] text-[#FBF7F0] text-xs font-medium"
              >
                Save Courier Details
              </button>
            </div>

            {/* Quick Status Adjustments */}
            <div className="flex items-center justify-between pt-4 border-t border-[#DAD1C5]/40 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-[#6B6166]">Status:</span>
                <button
                  onClick={() => handleUpdateOrderStatus(selectedOrder.order.order_id, 'processing')}
                  className="px-2 py-1 bg-amber-100 text-amber-800 uppercase font-mono font-bold text-[10px]"
                >
                  Set Processing
                </button>
                <button
                  onClick={() => handleUpdateOrderStatus(selectedOrder.order.order_id, 'completed')}
                  className="px-2 py-1 bg-emerald-100 text-emerald-800 uppercase font-mono font-bold text-[10px]"
                >
                  Set Completed
                </button>
                <button
                  onClick={() => handleCancelOrder(selectedOrder.order.order_id)}
                  className="px-2 py-1 bg-red-100 text-red-800 uppercase font-mono font-bold text-[10px]"
                >
                  Cancel Order
                </button>
              </div>

              <button
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-1.5 border border-[#DAD1C5] text-[#28192A]"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Slip Image Full Preview Modal */}
      {previewImage && (
        <div
          onClick={() => setPreviewImage(null)}
          className="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-4 cursor-pointer"
        >
          <img
            src={previewImage}
            alt="Full Slip Preview"
            className="max-w-md max-h-[85vh] object-contain border-2 border-white shadow-2xl"
          />
        </div>
      )}

        {/* TAB 3: BOTTLE AND PRICING MANAGEMENT (NEW REQUESTED PAGE) */}
        {/* ========================================================================= */}
        {activeTab === 'bottles' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            
            {/* Header with Add Button */}
            <div className="bg-[#FBF7F0] border border-[#DAD1C5] p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] tracking-[0.25em] uppercase text-[#C9A25C] font-semibold block mb-1">
                  Packaging &amp; Pricing Catalog
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl text-[#28192A]">
                  Bottle Sizes &amp; Pricing Management
                </h2>
                <p className="text-xs text-[#6B6166] mt-1 max-w-xl">
                  Add custom bottle capacities, select existing sizes to update their retail prices in Thai Baht (THB), or toggle stock availability. Updates are immediately displayed to customers in the bespoke customizer.
                </p>
              </div>

              <button
                onClick={handleOpenAddBottle}
                className="px-4 py-2.5 bg-[#28192A] hover:bg-[#3D2540] text-[#FBF7F0] text-xs uppercase tracking-wider font-medium flex items-center justify-center gap-2 transition-all shadow-sm shrink-0"
              >
                <Plus className="w-4 h-4 text-[#C9A25C]" />
                <span>Add Bottle Size</span>
              </button>
            </div>

            {/* Bottles Grid Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {bottles.map((bottle) => (
                <div
                  key={bottle.bottle_id}
                  className={`bg-[#FBF7F0] border transition-all p-6 flex flex-col justify-between ${
                    bottle.inStock ? 'border-[#DAD1C5] shadow-xs' : 'border-dashed border-[#DAD1C5] opacity-75'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 pb-3 border-b border-[#DAD1C5]/40 mb-4">
                      <div>
                        <span className="text-[10px] font-mono uppercase tracking-widest text-[#6B6166]">
                          FLACON ID #{bottle.bottle_id}
                        </span>
                        <h3 className="font-serif text-2xl text-[#28192A] mt-0.5">
                          {bottle.size}
                        </h3>
                        <span className="text-xs text-[#C9A25C] font-medium block">
                          {bottle.bottleType}
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="font-serif text-2xl font-semibold text-[#28192A]">
                          ฿{bottle.price.toLocaleString()}
                        </span>
                        <span className="text-[9px] uppercase tracking-wider text-[#6B6166] block">
                          Retail Price
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-[#6B6166] font-light leading-relaxed mb-4">
                      {bottle.description || 'Signature Scentify Studio luxury perfume bottle.'}
                    </p>

                    <div className="flex items-center justify-between text-xs py-2 px-3 bg-[#FBF7F0] border border-[#DAD1C5]/50 mb-4">
                      <span className="text-[#6B6166]">Inventory Availability:</span>
                      <button
                        onClick={() => handleToggleBottleStock(bottle.bottle_id)}
                        className={`font-mono text-[10px] font-semibold uppercase px-2 py-0.5 ${
                          bottle.inStock ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {bottle.inStock ? 'In Stock (Active)' : 'Out of Stock'}
                      </button>
                    </div>
                  </div>

                  {/* Card Action Buttons */}
                  <div className="flex items-center gap-2 pt-3 border-t border-[#DAD1C5]/30">
                    <button
                      onClick={() => handleOpenEditBottle(bottle)}
                      className="flex-1 py-2 bg-[#28192A] hover:bg-[#3D2540] text-[#FBF7F0] text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Edit className="w-3.5 h-3.5 text-[#C9A25C]" />
                      <span>Edit Price &amp; Info</span>
                    </button>

                    <button
                      onClick={() => handleDeleteBottle(bottle.bottle_id)}
                      className="p-2 border border-red-300 text-red-700 hover:bg-red-50 transition-colors"
                      title="Delete Bottle Size"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: SCENT & INGREDIENT MANAGEMENT (ADD / EDIT / DELETE) */}
        {/* ========================================================================= */}
        {activeTab === 'inventory' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            
            {/* Header with Add Buttons */}
            <div className="bg-[#FBF7F0] border border-[#DAD1C5] p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] tracking-[0.25em] uppercase text-[#C9A25C] font-semibold block mb-1">
                  Botanical Extraction Inventory
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl text-[#28192A]">
                  Scent Categories &amp; Botanical Ingredients
                </h2>
                <p className="text-xs text-[#6B6166] mt-1 max-w-xl">
                  Add new scent categories or ingredients, edit extraction details, adjust warehouse stock, or remove discontinued scents. All modifications dynamically update the customer library.
                </p>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => setIsCategoryModalOpen(true)}
                  className="px-3.5 py-2.5 bg-[#FBF7F0] hover:bg-[#FBF7F0] border border-[#DAD1C5] text-[#28192A] text-xs uppercase tracking-wider font-medium flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5 text-[#C9A25C]" />
                  <span>Add Scent Category</span>
                </button>

                <button
                  onClick={handleOpenAddIngredient}
                  className="px-4 py-2.5 bg-[#28192A] hover:bg-[#3D2540] text-[#FBF7F0] text-xs uppercase tracking-wider font-medium flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  <Plus className="w-4 h-4 text-[#C9A25C]" />
                  <span>Add Ingredient</span>
                </button>
              </div>
            </div>

            {/* Ingredients Table */}
            <div className="bg-[#FBF7F0] border border-[#DAD1C5] overflow-hidden shadow-xs">
              <div className="px-5 py-3.5 border-b border-[#DAD1C5] bg-[#FBF7F0] flex items-center justify-between">
                <span className="font-serif text-base text-[#28192A]">
                  Catalog Ingredients ({ingredients.length} items)
                </span>
                <span className="text-xs text-[#6B6166]">
                  Live status across all botanical families
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#FBF7F0]/60 border-b border-[#DAD1C5] text-[10px] font-mono uppercase tracking-wider text-[#6B6166]">
                      <th className="py-3 px-4">ID</th>
                      <th className="py-3 px-4">Botanical Name</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Stock Qty</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#DAD1C5]/40 font-light">
                    {ingredients.map((ing) => (
                      <tr key={ing.ingredient_id} className="hover:bg-[#FBF7F0]/60 transition-colors">
                        <td className="py-3 px-4 font-mono font-medium text-[#28192A]">
                          #{ing.ingredient_id}
                        </td>
                        <td className="py-3 px-4 font-serif text-base text-[#28192A]">
                          {ing.name}
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2.5 py-0.5 bg-[#FBF7F0] border border-[#DAD1C5] text-[11px] font-medium text-[#28192A]">
                            {ing.category}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleAdjustStock(ing.ingredient_id, -5)}
                              className="w-6 h-6 border border-[#DAD1C5] text-[#28192A] hover:bg-[#FBF7F0] flex items-center justify-center font-bold"
                            >
                              -
                            </button>
                            <span className="font-mono text-xs w-10 text-center font-medium">
                              {ing.stock_qty}
                            </span>
                            <button
                              onClick={() => handleAdjustStock(ing.ingredient_id, 5)}
                              className="w-6 h-6 border border-[#DAD1C5] text-[#28192A] hover:bg-[#FBF7F0] flex items-center justify-center font-bold"
                            >
                              +
                            </button>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          {ing.stock_qty <= 20 ? (
                            <span className="px-2 py-0.5 bg-red-100 text-red-800 text-[9px] font-mono uppercase font-bold">
                              Critical Low
                            </span>
                          ) : ing.stock_qty <= 50 ? (
                            <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[9px] font-mono uppercase font-bold">
                              Low Reorder
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[9px] font-mono uppercase font-bold">
                              Available
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenEditIngredient(ing)}
                              className="px-2 py-1 bg-[#28192A] hover:bg-[#3D2540] text-[#FBF7F0] text-[10px] uppercase font-mono transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteIngredient(ing.ingredient_id)}
                              className="px-2 py-1 border border-red-300 text-red-700 hover:bg-red-50 text-[10px] uppercase font-mono transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* ========================================================================= */}


      {/* ========================================================================= */}
      {/* BOTTLE AND PRICING MODAL */}
      {/* ========================================================================= */}
      {isBottleModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FBF7F0] border border-[#DAD1C5] max-w-lg w-full p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-[#DAD1C5] mb-5">
              <h3 className="font-serif text-xl text-[#28192A]">
                {editingBottle ? 'Edit Bottle Size & Price' : 'Add New Bottle Size'}
              </h3>
              <button
                onClick={() => setIsBottleModalOpen(false)}
                className="text-[#6B6166] hover:text-[#28192A]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBottle} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-[#28192A] mb-1">
                  Bottle Size Display Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 50 ml, 100 ml, 30 ml Travel"
                  value={bottleForm.size}
                  onChange={(e) => setBottleForm({ ...bottleForm, size: e.target.value })}
                  className="w-full bg-[#FBF7F0] border border-[#DAD1C5] px-3 py-2 text-xs text-[#28192A] focus:outline-none focus:border-[#C9A25C]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-[#28192A] mb-1">
                    Volume Capacity (ml)
                  </label>
                  <input
                    type="number"
                    required
                    min={5}
                    max={1000}
                    value={bottleForm.volume}
                    onChange={(e) => setBottleForm({ ...bottleForm, volume: Number(e.target.value) })}
                    className="w-full bg-[#FBF7F0] border border-[#DAD1C5] px-3 py-2 text-xs text-[#28192A] focus:outline-none focus:border-[#C9A25C]"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-[#28192A] mb-1">
                    Retail Price (THB ฿)
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={bottleForm.price}
                    onChange={(e) => setBottleForm({ ...bottleForm, price: Number(e.target.value) })}
                    className="w-full bg-[#FBF7F0] border border-[#DAD1C5] px-3 py-2 text-xs text-[#28192A] font-semibold text-[#C9A25C] focus:outline-none focus:border-[#C9A25C]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-[#28192A] mb-1">
                  Bottle Flacon Style / Type
                </label>
                <input
                  type="text"
                  placeholder="e.g. Classic Flacon, Grand Flacon, Travel Atomizer"
                  value={bottleForm.bottleType}
                  onChange={(e) => setBottleForm({ ...bottleForm, bottleType: e.target.value })}
                  className="w-full bg-[#FBF7F0] border border-[#DAD1C5] px-3 py-2 text-xs text-[#28192A] focus:outline-none focus:border-[#C9A25C]"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-[#28192A] mb-1">
                  Packaging Description
                </label>
                <textarea
                  rows={2}
                  value={bottleForm.description}
                  onChange={(e) => setBottleForm({ ...bottleForm, description: e.target.value })}
                  className="w-full bg-[#FBF7F0] border border-[#DAD1C5] px-3 py-2 text-xs text-[#28192A] focus:outline-none focus:border-[#C9A25C]"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="bottleStockCheck"
                  checked={bottleForm.inStock}
                  onChange={(e) => setBottleForm({ ...bottleForm, inStock: e.target.checked })}
                  className="w-4 h-4 text-[#C9A25C] accent-[#C9A25C]"
                />
                <label htmlFor="bottleStockCheck" className="text-xs text-[#28192A]">
                  Active and available for customer bespoke orders
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#DAD1C5]/40">
                <button
                  type="button"
                  onClick={() => setIsBottleModalOpen(false)}
                  className="px-4 py-2 border border-[#DAD1C5] text-xs text-[#6B6166] hover:bg-[#FBF7F0]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingAdmin}
                  className="px-5 py-2 bg-[#28192A] text-[#FBF7F0] text-xs uppercase tracking-wider font-medium hover:bg-[#3D2540] disabled:opacity-50"
                >
                  Save Bottle Options
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}



      {/* ========================================================================= */}
      {/* INGREDIENT MODAL (ADD / EDIT) */}
      {/* ========================================================================= */}
      {isIngredientModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FBF7F0] border border-[#DAD1C5] max-w-lg w-full p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-[#DAD1C5] mb-5">
              <h3 className="font-serif text-xl text-[#28192A]">
                {editingIngredient ? 'Edit Botanical Ingredient' : 'Add New Ingredient'}
              </h3>
              <button onClick={() => setIsIngredientModalOpen(false)} className="text-[#6B6166]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveIngredient} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-[#28192A] mb-1">
                  Ingredient Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cardamom, White Musk, Neroli"
                  value={ingredientForm.name}
                  onChange={(e) => setIngredientForm({ ...ingredientForm, name: e.target.value })}
                  className="w-full bg-[#FBF7F0] border border-[#DAD1C5] px-3 py-2 text-xs text-[#28192A]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-[#28192A] mb-1">
                    Scent Category
                  </label>
                  <select
                    value={ingredientForm.category}
                    onChange={(e) => setIngredientForm({ ...ingredientForm, category: e.target.value })}
                    className="w-full bg-[#FBF7F0] border border-[#DAD1C5] px-3 py-2 text-xs text-[#28192A]"
                  >
                    <option value="Citrus">Citrus</option>
                    <option value="Floral">Floral</option>
                    <option value="Woody">Woody</option>
                    <option value="Fruity">Fruity</option>
                    <option value="Sweet">Sweet</option>
                    <option value="Fresh">Fresh</option>
                    {propScentFamilies
                      ?.filter(
                        (f) =>
                          !['citrus', 'floral', 'woody', 'fruity', 'sweet', 'fresh'].includes(
                            f.id.toLowerCase()
                          )
                      )
                      .map((f) => (
                        <option key={f.id} value={f.name}>
                          {f.name}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-[#28192A] mb-1">
                    Stock Quantity (Units)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={ingredientForm.stock_qty}
                    onChange={(e) =>
                      setIngredientForm({ ...ingredientForm, stock_qty: Number(e.target.value) })
                    }
                    className="w-full bg-[#FBF7F0] border border-[#DAD1C5] px-3 py-2 text-xs text-[#28192A]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-[#28192A] mb-1">
                  Botanical Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Describe its aromatic facets and origin..."
                  value={ingredientForm.description}
                  onChange={(e) => setIngredientForm({ ...ingredientForm, description: e.target.value })}
                  className="w-full bg-[#FBF7F0] border border-[#DAD1C5] px-3 py-2 text-xs text-[#28192A]"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="ingPopularCheck"
                  checked={ingredientForm.isPopular}
                  onChange={(e) => setIngredientForm({ ...ingredientForm, isPopular: e.target.checked })}
                  className="w-4 h-4 text-[#C9A25C] accent-[#C9A25C]"
                />
                <label htmlFor="ingPopularCheck" className="text-xs text-[#28192A]">
                  Mark as "Popular" note in customer fragrance creator
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#DAD1C5]/40">
                <button
                  type="button"
                  onClick={() => setIsIngredientModalOpen(false)}
                  className="px-4 py-2 border border-[#DAD1C5] text-xs text-[#6B6166]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#28192A] text-[#FBF7F0] text-xs uppercase tracking-wider font-medium hover:bg-[#3D2540]"
                >
                  Save Ingredient
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: CATEGORY MODAL */}
      {/* ========================================================================= */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FBF7F0] border border-[#DAD1C5] max-w-lg w-full p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-[#DAD1C5] mb-5">
              <h3 className="font-serif text-xl text-[#28192A]">
                Add New Scent Category
              </h3>
              <button onClick={() => setIsCategoryModalOpen(false)} className="text-[#6B6166]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-[#28192A] mb-1">
                  Category Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Spicy, Oriental, Gourmand, Aquatic"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  className="w-full bg-[#FBF7F0] border border-[#DAD1C5] px-3 py-2 text-xs text-[#28192A]"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-[#28192A] mb-1">
                  Subtitle
                </label>
                <input
                  type="text"
                  placeholder="e.g. Exotic · Warm · Enveloping"
                  value={categoryForm.subtitle}
                  onChange={(e) => setCategoryForm({ ...categoryForm, subtitle: e.target.value })}
                  className="w-full bg-[#FBF7F0] border border-[#DAD1C5] px-3 py-2 text-xs text-[#28192A]"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-[#28192A] mb-1">
                  Category Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Aromatic profile and character of this scent family..."
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                  className="w-full bg-[#FBF7F0] border border-[#DAD1C5] px-3 py-2 text-xs text-[#28192A]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#DAD1C5]/40">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="px-4 py-2 border border-[#DAD1C5] text-xs text-[#6B6166]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#28192A] text-[#FBF7F0] text-xs uppercase tracking-wider font-medium hover:bg-[#3D2540]"
                >
                  Create Scent Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
 // -------------------------------------------------------------




        {/* TAB 4: CUSTOMIZATION RULES & FORMULAS (NEW REQUESTED PAGE) */}
        {/* ========================================================================= */}
        {activeTab === 'rules' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            
            {/* Top Info Banner */}
            <div className="bg-[#FBF7F0] border border-[#DAD1C5] p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] tracking-[0.25em] uppercase text-[#C9A25C] font-semibold block mb-1">
                  Olfactory Guardrails &amp; Formulations
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl text-[#28192A]">
                  Customization Rules &amp; Master Formulas
                </h2>
                <p className="text-xs text-[#6B6166] mt-1 max-w-2xl">
                  Configure real-time olfactory combination rules (max notes, mandatory harmonic anchors, forbidden pairings) and curate master pre-formulated blends that customers can select as bespoke inspirations.
                </p>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => {
                    setEditingRule(null);
                    setRuleForm({
                      name: '',
                      description: '',
                      type: 'recommended_pairing',
                      active: true,
                      familyA: 'Citrus',
                      familyB: 'Woody',
                      requiredFamily: 'Floral',
                      maxNotes: 3,
                      reason: '',
                    });
                    setIsRuleModalOpen(true);
                  }}
                  className="px-3.5 py-2 bg-[#28192A] hover:bg-[#3D2540] text-[#FBF7F0] text-xs uppercase tracking-wider font-medium flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5 text-[#C9A25C]" />
                  <span>Add Rule</span>
                </button>

                <button
                  onClick={() => {
                    setEditingFormula(null);
                    setFormulaForm({
                      name: '',
                      topNote: 'Bergamot',
                      heartNote: 'Jasmine',
                      baseNote: 'Sandalwood',
                      recommendedBottle: '50 ml',
                      description: 'Signature balanced formula.',
                      active: true,
                    });
                    setIsFormulaModalOpen(true);
                  }}
                  className="px-3.5 py-2 bg-[#C9A25C] hover:bg-[#B38F4D] text-[#28192A] text-xs uppercase tracking-wider font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Add Formula</span>
                </button>
              </div>
            </div>

            {/* SECTION 1: CUSTOMIZATION RULES */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#DAD1C5] pb-2">
                <h3 className="font-serif text-xl text-[#28192A] flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-[#C9A25C]" />
                  <span>Active Customization Rules ({rules.length})</span>
                </h3>
                <span className="text-xs text-[#6B6166]">
                  Applied live to customer perfume creation
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {rules.map((rule) => (
                  <div
                    key={rule.id}
                    className={`bg-[#FBF7F0] border p-5 transition-all flex flex-col justify-between ${
                      rule.active ? 'border-[#DAD1C5] shadow-xs' : 'border-dashed border-[#DAD1C5] opacity-60'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-serif text-lg font-medium text-[#28192A]">
                              {rule.name}
                            </span>
                          </div>
                          <span className="text-[10px] font-mono tracking-wider uppercase text-[#C9A25C]">
                            TYPE: {rule.type.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>

                        <button
                          onClick={() => handleToggleRule(rule.id)}
                          className={`px-2.5 py-1 text-[10px] font-mono uppercase font-bold transition-colors ${
                            rule.active ? 'bg-emerald-100 text-emerald-800' : 'bg-zinc-200 text-zinc-700'
                          }`}
                        >
                          {rule.active ? 'ACTIVE' : 'DEACTIVATED'}
                        </button>
                      </div>

                      <p className="text-xs text-[#6B6166] font-light leading-relaxed mb-3">
                        {rule.description}
                      </p>

                      {rule.params?.reason && (
                        <div className="text-[11px] bg-[#FBF7F0] p-2.5 border border-[#DAD1C5]/60 text-[#28192A] mb-3">
                          <span className="font-semibold text-[#C9A25C]">Olfactory Rule: </span>
                          {rule.params.reason}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#DAD1C5]/30">
                      <button
                        onClick={() => {
                          setEditingRule(rule);
                          setRuleForm({
                            name: rule.name,
                            description: rule.description,
                            type: rule.type,
                            active: rule.active,
                            familyA: rule.params?.familyA || 'Citrus',
                            familyB: rule.params?.familyB || 'Woody',
                            requiredFamily: rule.params?.requiredFamily || 'Floral',
                            maxNotes: rule.params?.maxNotes || 3,
                            reason: rule.params?.reason || '',
                          });
                          setIsRuleModalOpen(true);
                        }}
                        className="px-2.5 py-1 text-xs text-[#28192A] hover:bg-[#FBF7F0] border border-[#DAD1C5] flex items-center gap-1"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>

                      <button
                        onClick={() => handleDeleteRule(rule.id)}
                        className="px-2.5 py-1 text-xs text-red-600 hover:bg-red-50 border border-red-200 flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* SECTION 2: MASTER FORMULAS */}
            <div className="space-y-4 pt-4">
              <div className="flex items-center justify-between border-b border-[#DAD1C5] pb-2">
                <h3 className="font-serif text-xl text-[#28192A] flex items-center gap-2">
                  <FlaskConical className="w-5 h-5 text-[#C9A25C]" />
                  <span>Master Formulations Catalog ({masterFormulas.length})</span>
                </h3>
                <span className="text-xs text-[#6B6166]">
                  Available in Scentify customizer as inspiration blends
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {masterFormulas.map((form) => (
                  <div
                    key={form.id}
                    className={`bg-[#FBF7F0] border p-5 transition-all flex flex-col justify-between ${
                      form.active ? 'border-[#DAD1C5] shadow-xs' : 'border-dashed border-[#DAD1C5] opacity-60'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 pb-2 border-b border-[#DAD1C5]/30 mb-3">
                        <div>
                          <span className="text-[10px] font-mono text-[#6B6166]">FORMULA #{form.id}</span>
                          <h4 className="font-serif text-lg text-[#28192A] font-medium">
                            {form.name}
                          </h4>
                        </div>
                        <button
                          onClick={() => handleToggleFormula(form.id)}
                          className={`px-2 py-0.5 text-[9px] font-mono uppercase font-bold ${
                            form.active ? 'bg-emerald-100 text-emerald-800' : 'bg-zinc-200 text-zinc-700'
                          }`}
                        >
                          {form.active ? 'LIVE' : 'OFF'}
                        </button>
                      </div>

                      <div className="space-y-1.5 text-xs mb-3 bg-[#FBF7F0] p-2.5 border border-[#DAD1C5]/50">
                        <div className="flex justify-between">
                          <span className="text-[#6B6166] text-[10px] uppercase">Top Note:</span>
                          <span className="font-medium text-[#28192A]">{form.topNote}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#6B6166] text-[10px] uppercase">Heart Note:</span>
                          <span className="font-medium text-[#28192A]">{form.heartNote}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#6B6166] text-[10px] uppercase">Base Note:</span>
                          <span className="font-medium text-[#28192A]">{form.baseNote}</span>
                        </div>
                        {form.recommendedBottle && (
                          <div className="flex justify-between pt-1 border-t border-[#DAD1C5]/30">
                            <span className="text-[#C9A25C] text-[10px] uppercase">Vessel:</span>
                            <span className="font-mono text-[11px] text-[#28192A]">{form.recommendedBottle}</span>
                          </div>
                        )}
                      </div>

                      <p className="text-xs text-[#6B6166] font-light leading-relaxed mb-4">
                        {form.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#DAD1C5]/30">
                      <button
                        onClick={() => {
                          setEditingFormula(form);
                          setFormulaForm({
                            name: form.name,
                            topNote: form.topNote,
                            heartNote: form.heartNote,
                            baseNote: form.baseNote,
                            recommendedBottle: form.recommendedBottle || '50 ml',
                            description: form.description,
                            active: form.active,
                          });
                          setIsFormulaModalOpen(true);
                        }}
                        className="px-2.5 py-1 text-xs text-[#28192A] hover:bg-[#FBF7F0] border border-[#DAD1C5] flex items-center gap-1"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>

                      <button
                        onClick={() => handleDeleteFormula(form.id)}
                        className="px-2.5 py-1 text-xs text-red-600 hover:bg-red-50 border border-red-200 flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* ========================================================================= */}


      {/* MODAL 2: CUSTOMIZATION RULES MODAL */}
      {/* ========================================================================= */}
      {isRuleModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FBF7F0] border border-[#DAD1C5] max-w-lg w-full p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-[#DAD1C5] mb-5">
              <h3 className="font-serif text-xl text-[#28192A]">
                {editingRule ? 'Edit Customization Rule' : 'Add Customization Rule'}
              </h3>
              <button onClick={() => setIsRuleModalOpen(false)} className="text-[#6B6166]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRule} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-[#28192A] mb-1">
                  Rule Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Citrus & Woody Harmonious Bridge"
                  value={ruleForm.name}
                  onChange={(e) => setRuleForm({ ...ruleForm, name: e.target.value })}
                  className="w-full bg-[#FBF7F0] border border-[#DAD1C5] px-3 py-2 text-xs text-[#28192A]"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-[#28192A] mb-1">
                  Rule Type
                </label>
                <select
                  value={ruleForm.type}
                  onChange={(e) => setRuleForm({ ...ruleForm, type: e.target.value as any })}
                  className="w-full bg-[#FBF7F0] border border-[#DAD1C5] px-3 py-2 text-xs text-[#28192A]"
                >
                  <option value="max_notes">Maximum Notes Limit</option>
                  <option value="recommended_pairing">Harmonious Pairing Recommendation</option>
                  <option value="required_family">Mandatory Olfactory Family Anchor</option>
                  <option value="forbidden_pairing">Incompatible Pairing Restriction</option>
                </select>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-[#28192A] mb-1">
                  Description / Instruction
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Explain how this rule protects the fragrance balance..."
                  value={ruleForm.description}
                  onChange={(e) => setRuleForm({ ...ruleForm, description: e.target.value })}
                  className="w-full bg-[#FBF7F0] border border-[#DAD1C5] px-3 py-2 text-xs text-[#28192A]"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-[#28192A] mb-1">
                  Olfactory Reason shown to customer
                </label>
                <input
                  type="text"
                  placeholder="e.g. Bridging with Floral creates a smooth transition."
                  value={ruleForm.reason}
                  onChange={(e) => setRuleForm({ ...ruleForm, reason: e.target.value })}
                  className="w-full bg-[#FBF7F0] border border-[#DAD1C5] px-3 py-2 text-xs text-[#28192A]"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="ruleActiveCheck"
                  checked={ruleForm.active}
                  onChange={(e) => setRuleForm({ ...ruleForm, active: e.target.checked })}
                  className="w-4 h-4 text-[#C9A25C] accent-[#C9A25C]"
                />
                <label htmlFor="ruleActiveCheck" className="text-xs text-[#28192A]">
                  Rule is active and strictly enforced in customer Scentify customizer
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#DAD1C5]/40">
                <button
                  type="button"
                  onClick={() => setIsRuleModalOpen(false)}
                  className="px-4 py-2 border border-[#DAD1C5] text-xs text-[#6B6166]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#28192A] text-[#FBF7F0] text-xs uppercase tracking-wider font-medium hover:bg-[#3D2540]"
                >
                  Save Customization Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: MASTER FORMULA MODAL */}
      {/* ========================================================================= */}
      {isFormulaModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FBF7F0] border border-[#DAD1C5] max-w-lg w-full p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-[#DAD1C5] mb-5">
              <h3 className="font-serif text-xl text-[#28192A]">
                {editingFormula ? 'Edit Master Formula' : 'Add Master Formula'}
              </h3>
              <button onClick={() => setIsFormulaModalOpen(false)} className="text-[#6B6166]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveFormula} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-[#28192A] mb-1">
                  Formula Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Golden Dawn, Imperial Oud"
                  value={formulaForm.name}
                  onChange={(e) => setFormulaForm({ ...formulaForm, name: e.target.value })}
                  className="w-full bg-[#FBF7F0] border border-[#DAD1C5] px-3 py-2 text-xs text-[#28192A]"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-semibold text-[#28192A] mb-1">
                    Top Note
                  </label>
                  <input
                    type="text"
                    required
                    value={formulaForm.topNote}
                    onChange={(e) => setFormulaForm({ ...formulaForm, topNote: e.target.value })}
                    className="w-full bg-[#FBF7F0] border border-[#DAD1C5] px-2.5 py-1.5 text-xs text-[#28192A]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-semibold text-[#28192A] mb-1">
                    Heart Note
                  </label>
                  <input
                    type="text"
                    required
                    value={formulaForm.heartNote}
                    onChange={(e) => setFormulaForm({ ...formulaForm, heartNote: e.target.value })}
                    className="w-full bg-[#FBF7F0] border border-[#DAD1C5] px-2.5 py-1.5 text-xs text-[#28192A]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-semibold text-[#28192A] mb-1">
                    Base Note
                  </label>
                  <input
                    type="text"
                    required
                    value={formulaForm.baseNote}
                    onChange={(e) => setFormulaForm({ ...formulaForm, baseNote: e.target.value })}
                    className="w-full bg-[#FBF7F0] border border-[#DAD1C5] px-2.5 py-1.5 text-xs text-[#28192A]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-[#28192A] mb-1">
                  Recommended Bottle Size
                </label>
                <input
                  type="text"
                  placeholder="e.g. 50 ml, 100 ml"
                  value={formulaForm.recommendedBottle}
                  onChange={(e) => setFormulaForm({ ...formulaForm, recommendedBottle: e.target.value })}
                  className="w-full bg-[#FBF7F0] border border-[#DAD1C5] px-3 py-2 text-xs text-[#28192A]"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-[#28192A] mb-1">
                  Formula Description
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Artisanal description of this fragrance blend..."
                  value={formulaForm.description}
                  onChange={(e) => setFormulaForm({ ...formulaForm, description: e.target.value })}
                  className="w-full bg-[#FBF7F0] border border-[#DAD1C5] px-3 py-2 text-xs text-[#28192A]"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="formulaActiveCheck"
                  checked={formulaForm.active}
                  onChange={(e) => setFormulaForm({ ...formulaForm, active: e.target.checked })}
                  className="w-4 h-4 text-[#C9A25C] accent-[#C9A25C]"
                />
                <label htmlFor="formulaActiveCheck" className="text-xs text-[#28192A]">
                  Formula is live and available in customer studio presets
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#DAD1C5]/40">
                <button
                  type="button"
                  onClick={() => setIsFormulaModalOpen(false)}
                  className="px-4 py-2 border border-[#DAD1C5] text-xs text-[#6B6166]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#28192A] text-[#FBF7F0] text-xs uppercase tracking-wider font-medium hover:bg-[#3D2540]"
                >
                  Save Master Formula
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


    </>
  );
};
