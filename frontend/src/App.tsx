/*
 * Shared frontend integration tasks:
 * connect member views, authentication, profile, ingredients, orders, and chat.
 */
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Navbar } from './components/NavBar';
import { Footer } from './components/Footer';
import { HomeView } from './components/HomeView';
import { IngredientLibraryView } from './components/IngredientLibraryView';
import { ScentifyView } from './components/ScentifyView';
import { ReviewFragranceView } from './components/ReviewFragranceView';
import { CartView } from './components/CartView';
import { ReviewOrderView } from './components/ReviewOrderView';
import { PaymentView } from './components/PaymentView';
import { CustomerCareView } from './components/CustomerCareView';
import { ProfileView } from './components/ProfileView';
import { AboutView } from './components/AboutView';
import { JournalView } from './components/JournalView';
import { AuthModal } from './components/AuthModal';
import { SearchModal } from './components/SearchModal';
import { StoryModal } from './components/StoryModal';
import { AdminSidePanel } from './components/AdminSidePanel';

import { firebaseAuth } from './firebase';
import { backendApi } from './api';
import type { User } from './firebase';

import {
  Composition,
  CartItem,
  OrderDetails,
  ChatMessage,
  ViewMode,
  Ingredient,
  DbOrder,
  DbUser,
  DbShipping,
  DbPayment,
  DbIngredient,
  DbFormula,
  DbFormulaDetail,
  DbOrderItem,
  PurchaseHistoryOrder,
  BottleOption,
  CustomizationRule,
  MasterFormula,
  AdminStaffUser,
  ScentFamily,
} from './types';
import {
  INITIAL_ORDER,
  SCENT_FAMILIES,
} from './data/perfumeData';
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
  INITIAL_CUSTOMIZATION_RULES,
  INITIAL_MASTER_FORMULAS,
  INITIAL_ADMIN_USERS,
} from './data/adminDatabaseData';

const viewPaths: Record<ViewMode, string> = {
  home: '/',
  collection: '/ingredients',
  scentify: '/scentify',
  'review-fragrance': '/scentify/review',
  cart: '/cart',
  'review-order': '/checkout',
  payment: '/checkout/payment',
  chat: '/customer-care',
  auth: '/auth',
  about: '/about',
  journal: '/journal',
  profile: '/profile',
  admin: '/admin',
};

const pathViews: Record<string, ViewMode> = Object.fromEntries(
  Object.entries(viewPaths).map(([view, path]) => [path, view]),
) as Record<string, ViewMode>;

function createOrderNumber(): string {
  const suffix = typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID().slice(0, 8)
    : Math.random().toString(36).slice(2, 10);
  return `SC-${Date.now()}-${suffix.toUpperCase()}`;
}

function viewForPath(pathname: string): ViewMode {
  return pathViews[pathname] || (pathname.startsWith('/admin') ? 'admin' : 'home');
}

function parseOrderItems(value: unknown): CartItem[] {
  if (!Array.isArray(value)) return [];

  return value.flatMap((entry, index) => {
    if (typeof entry !== 'object' || entry === null || Array.isArray(entry)) return [];

    const record = entry as Record<string, unknown>;
    const rawDetails = record.details;
    const details =
      typeof rawDetails === 'object' && rawDetails !== null && !Array.isArray(rawDetails)
        ? (rawDetails as Record<string, unknown>)
        : null;
    const itemSize = typeof record.size === 'string' ? record.size : undefined;
    const notes = Array.isArray(details?.notes)
      ? details.notes.filter((note): note is string => typeof note === 'string')
      : undefined;
    const price = typeof record.price === 'number' && Number.isFinite(record.price)
      ? record.price
      : 0;
    const quantity = typeof record.quantity === 'number' && Number.isFinite(record.quantity)
      ? record.quantity
      : 1;

    return [{
      id: typeof record.id === 'string' ? record.id : `order-item-${index + 1}`,
      title: typeof record.title === 'string' ? record.title : 'Perfume',
      subtitle: typeof record.subtitle === 'string' ? record.subtitle : '',
      description: typeof record.description === 'string' ? record.description : undefined,
      price,
      quantity,
      image: typeof record.image === 'string' ? record.image : '',
      details: details
        ? {
            notes,
            size: typeof details.size === 'string' ? details.size : itemSize,
          }
        : itemSize
        ? { size: itemSize }
        : undefined,
    }];
  });
}

export default function App() {
  // Navigation State
  const location = useLocation();
  const routerNavigate = useNavigate();
  const currentView = viewForPath(location.pathname);
  const setCurrentView = (view: ViewMode) => routerNavigate(viewPaths[view]);
  
  // Custom Perfume Formulation State
  const [composition, setComposition] = useState<Composition>({
    topNote: 'Bergamot',
    heartNote: 'Jasmine',
    baseNote: 'Sandalwood',
    bottleSize: '50 ml',
    bottleType: 'Classic',
  });

  // Shopping Bag / Cart State
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // Active Order State
  const [order, setOrder] = useState<OrderDetails>(() => ({
    ...INITIAL_ORDER,
    orderId: createOrderNumber(),
  }));

  // Relational Database State for Admin Panel
  const [dbOrders, setDbOrders] = useState<DbOrder[]>(INITIAL_DB_ORDERS);
  const [dbUsers, setDbUsers] = useState<DbUser[]>(INITIAL_DB_USERS);
  const [dbShippings, setDbShippings] = useState<DbShipping[]>(INITIAL_DB_SHIPPINGS);
  const [dbPayments, setDbPayments] = useState<DbPayment[]>(INITIAL_DB_PAYMENTS);
  const [dbIngredients, setDbIngredients] = useState<DbIngredient[]>(INITIAL_DB_INGREDIENTS);
  const [dbFormulas, setDbFormulas] = useState<DbFormula[]>(INITIAL_DB_FORMULAS);
  const [dbFormulaDetails, setDbFormulaDetails] = useState<DbFormulaDetail[]>(INITIAL_DB_FORMULA_DETAILS);
  const [dbOrderItems, setDbOrderItems] = useState<DbOrderItem[]>(INITIAL_DB_ORDER_ITEMS);

  // Dynamic Admin Management State (Persisted in localStorage)
  const [bottles, setBottles] = useState<BottleOption[]>(() => {
    try {
      const raw = localStorage.getItem('scentify_bottles');
      return raw ? JSON.parse(raw) : INITIAL_BOTTLE_OPTIONS;
    } catch {
      return INITIAL_BOTTLE_OPTIONS;
    }
  });

  const [scentFamilies, setScentFamilies] = useState<ScentFamily[]>(() => {
    try {
      const raw = localStorage.getItem('scentify_scent_families');
      return raw ? JSON.parse(raw) : SCENT_FAMILIES;
    } catch {
      return SCENT_FAMILIES;
    }
  });

  const [rules, setRules] = useState<CustomizationRule[]>(() => {
    try {
      const raw = localStorage.getItem('scentify_rules');
      return raw ? JSON.parse(raw) : INITIAL_CUSTOMIZATION_RULES;
    } catch {
      return INITIAL_CUSTOMIZATION_RULES;
    }
  });

  const [masterFormulas, setMasterFormulas] = useState<MasterFormula[]>(() => {
    try {
      const raw = localStorage.getItem('scentify_master_formulas');
      return raw ? JSON.parse(raw) : INITIAL_MASTER_FORMULAS;
    } catch {
      return INITIAL_MASTER_FORMULAS;
    }
  });

  const [adminStaffUsers, setAdminStaffUsers] = useState<AdminStaffUser[]>(() => {
    try {
      const raw = localStorage.getItem('scentify_admin_users');
      return raw ? JSON.parse(raw) : INITIAL_ADMIN_USERS;
    } catch {
      return INITIAL_ADMIN_USERS;
    }
  });

  const handleUpdateBottles = (newBottles: BottleOption[]) => {
    setBottles(newBottles);
    try {
      localStorage.setItem('scentify_bottles', JSON.stringify(newBottles));
    } catch (e) {
      console.error('Failed to save bottles to storage:', e);
    }
  };

  const handleUpdateScentFamilies = (newFamilies: ScentFamily[]) => {
    setScentFamilies(newFamilies);
    try {
      localStorage.setItem('scentify_scent_families', JSON.stringify(newFamilies));
    } catch (e) {
      console.error('Failed to save scent families to storage:', e);
    }
  };

  const handleUpdateRules = (newRules: CustomizationRule[]) => {
    setRules(newRules);
    try {
      localStorage.setItem('scentify_rules', JSON.stringify(newRules));
    } catch (e) {
      console.error('Failed to save customization rules to storage:', e);
    }
  };

  const handleUpdateMasterFormulas = (newFormulas: MasterFormula[]) => {
    setMasterFormulas(newFormulas);
    try {
      localStorage.setItem('scentify_master_formulas', JSON.stringify(newFormulas));
    } catch (e) {
      console.error('Failed to save master formulas to storage:', e);
    }
  };

  const handleUpdateAdminStaffUsers = (newAdmins: AdminStaffUser[]) => {
    setAdminStaffUsers(newAdmins);
    try {
      localStorage.setItem('scentify_admin_users', JSON.stringify(newAdmins));
    } catch (e) {
      console.error('Failed to save admin staff users to storage:', e);
    }
  };

  // Customer Care Chat Messages
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatLoadError, setChatLoadError] = useState<string | null>(null);

  // User State: start without log in (null)
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [authenticatedUser, setAuthenticatedUser] = useState<User | null>(null);
  const [purchaseHistory, setPurchaseHistory] = useState<PurchaseHistoryOrder[]>([]);
  const [purchaseHistoryError, setPurchaseHistoryError] = useState<string | null>(null);
  const [isAdminUser, setIsAdminUser] = useState<boolean>(false);
  const [adminUser, setAdminUser] = useState<string>('Scentify Studio Master Perfumer');
  const [isAuthResolved, setIsAuthResolved] = useState<boolean>(false);

  useEffect(() => {
    let active = true;
    const userId = authenticatedUser?.id;

    if (!userId || isAdminUser) {
      setChatMessages([]);
      setChatLoadError(null);
      return;
    }

    const loadMessages = async () => {
      try {
        const data = await backendApi.getChatMessages();
        if (active) {
        setChatMessages(data.map((row) => ({
          id: row.id,
          sender: row.senderRole === 'admin' ? 'studio' : 'user',
          text: row.message,
          timestamp: new Date(row.createdAt).toLocaleTimeString([], {
            hour: 'numeric',
            minute: '2-digit',
          }),
        })));
        setChatLoadError(null);
        }
      } catch (error) {
        console.error('Failed to load customer chat messages:', error);
        if (active) setChatLoadError(`Could not load messages: ${error instanceof Error ? error.message : 'Unexpected error'}`);
      }
    };

    void loadMessages();

    return () => {
      active = false;
    };
  }, [authenticatedUser?.id, isAdminUser]);

  // Modals
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup' | 'admin'>('signup');
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [storyModalOpen, setStoryModalOpen] = useState(false);

  // Resolve the current Firebase session and load the signed-in user's profile.
  useEffect(() => {
    let active = true;

    const resolveUser = async (user: User | null) => {
      if (!user) {
        if (active) {
          setAuthenticatedUser(null);
          setCurrentUser(null);
          setIsAdminUser(false);
          setPurchaseHistory([]);
          setPurchaseHistoryError(null);
          setIsAuthResolved(true);
        }
        return;
      }

      const userRole = user.app_metadata?.role;
      const isAdmin =
        userRole === 'admin' || userRole === 'staff' || userRole === 'perfumer';
      const initialName =
        user.user_metadata?.display_name ||
        user.user_metadata?.full_name ||
        user.email?.split('@')[0] ||
        'Studio Member';

      if (active) {
        setAuthenticatedUser(user);
        setIsAdminUser(isAdmin);
        setAdminUser(initialName);
        setCurrentUser(isAdmin ? null : initialName);
        if (isAdmin) {
          setCurrentView('admin');
        }
        // The signed-in role is already available from the auth token; don't
        // make the console wait for profile and order queries to finish.
        setIsAuthResolved(true);
      }

      let profile: Awaited<ReturnType<typeof backendApi.getProfile>> | null = null;
      try {
        profile = await backendApi.getProfile();
      } catch (error) {
        console.error('Failed to load Java backend profile:', error);
      }

      const name = profile?.displayName || initialName;
      if (active) {
        setAdminUser(name);
        setCurrentUser(isAdmin ? null : name);

        if (!isAdmin) {
          try {
            const customerOrders = await backendApi.getMyOrders();
            if (active) setPurchaseHistory(customerOrders.map((row) => ({
                  orderId: row.orderNumber || String(row.id),
                  date: row.createdAt,
                  status:
                    row.status === 'cancelled'
                      ? 'Cancelled'
                      : row.status === 'completed'
                      ? 'Completed'
                      : row.status === 'processing'
                      ? 'Preparing'
                      : row.paymentStatus === 'verified'
                      ? 'Payment verified'
                      : row.paymentStatus === 'failed'
                      ? 'Payment failed'
                      : 'Awaiting payment verification',
                  total: Number(row.total), items: parseOrderItems(row.items),
            })));
              setPurchaseHistoryError(null);
          } catch (error) {
            console.error('Failed to load purchase history:', error);
            setPurchaseHistoryError(`Could not load purchase history: ${error instanceof Error ? error.message : 'Unexpected error'}`);
          }

          const savedAddress = profile?.shippingAddress || {};
          setOrder((prev) => ({
            ...prev,
            customerName: name,
            address: savedAddress.address || prev.address,
            city: savedAddress.city || prev.city,
            province: savedAddress.province || prev.province,
            postalCode: savedAddress.postalCode || prev.postalCode,
            country: savedAddress.country || prev.country,
            phone: savedAddress.phone || prev.phone,
          }));
        } else {
          setPurchaseHistory([]);
          setPurchaseHistoryError(null);
          try {
            const rows = await backendApi.getOrders();
            if (active) {
            const savedOrders = rows.map((row) => {
              const id = Number(row.id);
              const adminId = 1_000_000 + id;
              const status: DbOrder['status'] =
                row.status === 'processing' ||
                row.status === 'completed' ||
                row.status === 'cancelled'
                  ? row.status
                  : 'pending';

              return {
                row,
                adminId,
                order: {
                  order_id: id,
                  shipping_id: adminId,
                  user_id: adminId,
                  order_date: row.createdAt,
                  status,
                  total_price: Number(row.total),
                  prep_photo_url: '',
                  items: parseOrderItems(row.items),
                } satisfies DbOrder,
              };
              });

            setDbOrders((current) => [
              ...savedOrders.map((entry) => entry.order),
              ...current.filter(
                (existing) =>
                  !savedOrders.some((entry) => entry.order.order_id === existing.order_id)
              ),
            ]);
            setDbUsers((current) => [
              ...savedOrders.map(({ row, adminId }) => ({
                id: adminId,
                name: row.customerName,
                email: row.customerEmail,
                phone: row.customerPhone,
                address: row.shippingAddress,
                role: 'customer' as const,
              })),
              ...current.filter(
                (existing) => !savedOrders.some((entry) => entry.adminId === existing.id)
              ),
            ]);
            setDbShippings((current) => [
              ...savedOrders.map(({ row, adminId }) => ({
                shipping_id: adminId,
                shipping_fee: Number(row.total) > 1500 ? 0 : 50,
                tracking_number: 'PENDING-VERIFICATION',
                courier_name: 'DHL Express',
                shipping_address: row.shippingAddress,
              })),
              ...current.filter(
                (existing) => !savedOrders.some((entry) => entry.adminId === existing.shipping_id)
              ),
            ]);
            setDbPayments((current) => [
              ...savedOrders.map(({ row, order }) => ({
                payment_id: 1_000_000 + order.order_id,
                order_id: order.order_id,
                qr_receipt_url: row.paymentSlipUrl || '',
                status: (
                  row.paymentStatus === 'verified' || row.paymentStatus === 'failed'
                    ? row.paymentStatus
                    : 'pending'
                ) as DbPayment['status'],
                verified_at: row.verifiedAt || undefined,
              })),
              ...current.filter(
                (existing) =>
                  !savedOrders.some((entry) => entry.order.order_id === existing.order_id)
              ),
            ]);
            }
          } catch (error) {
            console.error('Failed to load orders:', error);
          }
        }
      }

      if (active) {
        setIsAuthResolved(true);
      }
    };

    const { data: authListener } = firebaseAuth.auth.onAuthStateChange((_event, session) => {
      queueMicrotask(() => {
        void resolveUser(session?.user ?? null);
      });
    });

    return () => {
      active = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Cart operations
  const handleUpdateQuantity = (id: string, newQty: number) => {
    setCartItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity: newQty } : item))
    );
  };

  const handleRemoveItem = (id: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleConfirmAndShipCustom = (customItem: CartItem) => {
    // Add to cart and proceed to cart
    setCartItems((prev) => [customItem, ...prev]);
    if (!currentUser) {
      setAuthModalMode('signup');
      setAuthModalOpen(true);
    }
    setCurrentView('cart');
  };

  const handleAddIngredientToScentify = (ingredient: Ingredient) => {
    if (ingredient.familyId === 'citrus') {
      setComposition((prev) => ({ ...prev, topNote: ingredient.name }));
    } else if (ingredient.familyId === 'floral') {
      setComposition((prev) => ({ ...prev, heartNote: ingredient.name }));
    } else {
      setComposition((prev) => ({ ...prev, baseNote: ingredient.name }));
    }
  };

  // Persist customer messages so admins can read and reply from the admin portal.
  const handleSendMessage = async (text: string) => {
    if (!authenticatedUser) {
      throw new Error('Please sign in to send a message to the studio.');
    }

    const data = await backendApi.sendChatMessage(text);

    const savedMessage: ChatMessage = {
      id: data.id,
      sender: 'user',
      text: data.message,
      timestamp: new Date(data.createdAt).toLocaleTimeString([], {
        hour: 'numeric',
        minute: '2-digit',
      }),
    };
    setChatMessages((previous) =>
      previous.some((message) => message.id === savedMessage.id)
        ? previous
        : [...previous, savedMessage]
    );
  };

  const handleAddressUpdate = (newAddress: Partial<OrderDetails>) => {
    setOrder((prev) => ({ ...prev, ...newAddress }));
  };

  const handleSlipUploaded = async (fileDataUrl: string) => {
    setOrder((prev) => ({
      ...prev,
      paymentSlipUrl: fileDataUrl,
      status: 'slip_uploaded',
    }));
  };

  // Place Order handler: triggers when customer attaches slip and clicks "Place Order"
  const handlePlaceOrder = async (payload: { slipUrl: string; orderId: string; total: number }) => {
    if (!authenticatedUser) {
      throw new Error('Please sign in before placing your order.');
    }

    const custName = order.customerName || currentUser || 'Studio Client';
    const custEmail = authenticatedUser.email || '';
    const custPhone = order.phone || '';
    const fullAddr = `${order.address}, ${order.city}, ${order.province} ${order.postalCode}, ${order.country}`;
    const placedItems = cartItems.map((item) => ({ ...item }));
    const savedOrder = await backendApi.createOrder({
      orderNumber: payload.orderId,
      customerName: custName,
      customerEmail: custEmail,
      customerPhone: custPhone,
      shippingAddress: fullAddr,
      total: payload.total,
      paymentSlipUrl: payload.slipUrl,
      items: placedItems,
    });

    setPurchaseHistory((previous) => [
      {
        orderId: payload.orderId,
        date: savedOrder.createdAt,
        status: 'Awaiting payment verification',
        total: payload.total,
        items: placedItems,
      },
      ...previous,
    ]);
    setPurchaseHistoryError(null);

    const numericOrderId = Number(savedOrder.id);
    const newUserId = 1_000_000 + numericOrderId;
    const newShippingId = newUserId;
    const newPaymentId = newUserId;
    const newDbUser: DbUser = {
      id: newUserId,
      name: custName,
      email: custEmail,
      phone: custPhone,
      address: fullAddr,
      role: 'customer',
    };
    const newDbShipping: DbShipping = {
      shipping_id: newShippingId,
      shipping_fee: payload.total > 1500 ? 0 : 50,
      tracking_number: 'PENDING-VERIFICATION',
      courier_name: 'DHL Express',
      shipping_address: fullAddr,
    };
    const newDbPayment: DbPayment = {
      payment_id: newPaymentId,
      order_id: numericOrderId,
      qr_receipt_url: payload.slipUrl,
      status: 'pending',
    };
    const newDbOrder: DbOrder = {
      order_id: numericOrderId,
      shipping_id: newShippingId,
      user_id: newUserId,
      order_date: savedOrder.createdAt,
      status: 'pending',
      total_price: payload.total,
      prep_photo_url: '',
    };
    const newFormulaId = 1_000_000 + numericOrderId;
    const formulaName =
      placedItems[0]?.title ||
      `Bespoke Blend (${composition.topNote} · ${composition.heartNote} · ${composition.baseNote})`;
    const newDbFormula: DbFormula = {
      formula_id: newFormulaId,
      formula_name: formulaName,
      created_at: savedOrder.createdAt,
    };
    const newDbOrderItem: DbOrderItem = {
      order_item_id: newFormulaId,
      formula_detail_id: 1,
      order_id: numericOrderId,
      bottle_id: composition.bottleSize === '100 ml' ? 2 : 1,
      qty: placedItems.reduce((acc, item) => acc + item.quantity, 0) || 1,
    };

    setDbUsers((prev) => [newDbUser, ...prev]);
    setDbShippings((prev) => [newDbShipping, ...prev]);
    setDbPayments((prev) => [newDbPayment, ...prev]);
    setDbFormulas((prev) => [newDbFormula, ...prev]);
    setDbOrderItems((prev) => [newDbOrderItem, ...prev]);
    setDbOrders((prev) => [newDbOrder, ...prev]);
    setCartItems([]);
    setOrder((prev) => ({
      ...prev,
      orderId: payload.orderId,
      paymentSlipUrl: payload.slipUrl,
      items: placedItems,
      subtotal: placedItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
      shipping:
        payload.total -
        placedItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
      status: 'slip_uploaded',
      total: payload.total,
    }));
  };

  // Admin verifies slip and confirms the order
  const handleAdminConfirmOrder = async (orderId: number) => {
    const now = new Date().toISOString();
    await backendApi.updateOrderStatus(orderId, 'processing');

    setDbOrders((prev) =>
      prev.map((o) => (o.order_id === orderId ? { ...o, status: 'processing' } : o))
    );
    setDbPayments((prev) =>
      prev.map((p) =>
        p.order_id === orderId ? { ...p, status: 'verified', verified_at: now } : p
      )
    );
    setOrder((prev) =>
      Number(prev.orderId.replace(/\D/g, '')) === orderId
        ? { ...prev, status: 'verified' }
        : prev
    );
  };

  // Admin cancels the order
  const handleAdminCancelOrder = async (orderId: number) => {
    await backendApi.updateOrderStatus(orderId, 'cancelled');

    setDbOrders((prev) =>
      prev.map((o) => (o.order_id === orderId ? { ...o, status: 'cancelled' } : o))
    );
    setDbPayments((prev) =>
      prev.map((p) => (p.order_id === orderId ? { ...p, status: 'failed' } : p))
    );
    setOrder((prev) =>
      Number(prev.orderId.replace(/\D/g, '')) === orderId
        ? { ...prev, status: 'cancelled' }
        : prev
    );
  };

  const handleAdminUpdateOrderStatus = async (orderId: number, status: DbOrder['status']) => {
    await backendApi.updateOrderStatus(orderId, status);

    setDbOrders((prev) =>
      prev.map((order) => (order.order_id === orderId ? { ...order, status } : order))
    );
  };

  const handleAdminVerifyPayment = async (_paymentId: number, orderId: number) => {
    const now = new Date().toISOString();
    await backendApi.verifyOrderPayment(orderId);

    setDbPayments((prev) =>
      prev.map((payment) =>
        payment.order_id === orderId
          ? { ...payment, status: 'verified', verified_at: now }
          : payment
      )
    );
  };

  const handleLogout = async () => {
    const { error } = await firebaseAuth.auth.signOut();
    if (error) {
      console.error('Failed to sign out of Firebase:', error);
      return;
    }
    setCurrentUser(null);
    setAuthenticatedUser(null);
    setIsAdminUser(false);
    setOrder((prev) => ({ ...prev, customerName: '' }));
    setCurrentView('home');
  };

  const navigateTo = (view: ViewMode) => {
    routerNavigate(viewPaths[view]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!isAuthResolved) {
    return (
      <div
        className="min-h-screen bg-[#FBF7F0] flex flex-col items-center justify-center gap-4 text-[#28192A]"
        aria-busy="true"
        role="status"
      >
        <div className="h-9 w-9 animate-spin rounded-full border-2 border-[#DAD1C5] border-t-[#C9A25C]" />
        <p className="text-xs uppercase tracking-[0.2em] text-[#6B6166]">
          Loading your studio…
        </p>
      </div>
    );
  }

  // Admin full-page portal view
  if (isAdminUser && currentView === 'admin') {
    return (
      <AdminSidePanel
        isOpen
        onClose={handleLogout}
        onSwitchToStorefront={() => setCurrentView('home')}
        adminUser={adminUser}
        orders={dbOrders}
        users={dbUsers}
        shippings={dbShippings}
        payments={dbPayments}
        ingredients={dbIngredients}
        formulas={dbFormulas}
        formulaDetails={dbFormulaDetails}
        orderItems={dbOrderItems}
        bottles={bottles}
        onUpdateBottles={handleUpdateBottles}
        scentFamilies={scentFamilies}
        onUpdateScentFamilies={handleUpdateScentFamilies}
        rules={rules}
        onUpdateRules={handleUpdateRules}
        masterFormulas={masterFormulas}
        onUpdateMasterFormulas={handleUpdateMasterFormulas}
        adminStaffUsers={adminStaffUsers}
        onUpdateAdminStaffUsers={handleUpdateAdminStaffUsers}
        onConfirmOrder={handleAdminConfirmOrder}
        onCancelOrder={handleAdminCancelOrder}
        onUpdateOrderStatus={handleAdminUpdateOrderStatus}
        onVerifyPayment={handleAdminVerifyPayment}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#FBF7F0] text-[#28192A] flex flex-col font-sans selection:bg-[#C9A25C]/20">
      
      {/* Navigation Bar */}
      <Navbar
        currentView={currentView}
        onNavigate={navigateTo}
        cartCount={cartItems.reduce((acc, i) => acc + i.quantity, 0)}
        userName={currentUser}
        isAdminUser={isAdminUser}
        onOpenAdmin={() => setCurrentView('admin')}
        onOpenAuth={(mode = 'signup') => {
          setAuthModalMode(mode);
          setAuthModalOpen(true);
        }}
        onLogout={handleLogout}
        onOpenSearch={() => setSearchModalOpen(true)}
      />

      {/* Main Content Router */}
      <main className="flex-1">
        {currentView === 'home' && (
          <HomeView
            onNavigate={navigateTo}
            onOpenStoryModal={() => setStoryModalOpen(true)}
          />
        )}

        {currentView === 'collection' && (
          <IngredientLibraryView
            onNavigate={navigateTo}
            onSelectIngredientToScentify={handleAddIngredientToScentify}
            scentFamilies={scentFamilies}
          />
        )}

        {currentView === 'scentify' && (
          <ScentifyView
            composition={composition}
            onUpdateComposition={setComposition}
            onNavigate={navigateTo}
            scentFamilies={scentFamilies}
            bottles={bottles}
            rules={rules}
            formulas={masterFormulas}
          />
        )}

        {currentView === 'review-fragrance' && (
          <ReviewFragranceView
            composition={composition}
            onConfirmAndShip={handleConfirmAndShipCustom}
            onRequestChange={() => navigateTo('chat')}
            onNavigate={navigateTo}
            bottles={bottles}
          />
        )}

        {currentView === 'cart' && (
          <CartView
            items={cartItems}
            currentUser={currentUser}
            onOpenAuth={(mode = 'signup') => {
              setAuthModalMode(mode);
              setAuthModalOpen(true);
            }}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveItem}
            onProceedToOrder={() => {
              if (!currentUser) {
                setAuthModalMode('signup');
                setAuthModalOpen(true);
              } else {
                navigateTo('review-order');
              }
            }}
            onNavigate={navigateTo}
          />
        )}

        {currentView === 'review-order' && (
          <ReviewOrderView
            order={order}
            items={cartItems}
            currentUser={currentUser}
            onOpenSignUp={() => {
              setAuthModalMode('signup');
              setAuthModalOpen(true);
            }}
            onUpdateAddress={handleAddressUpdate}
            onProceedToPayment={() => {
              if (!currentUser) {
                setAuthModalMode('signup');
                setAuthModalOpen(true);
              } else {
                navigateTo('payment');
              }
            }}
            onNavigate={navigateTo}
          />
        )}

        {currentView === 'payment' && (
          <PaymentView
            order={order}
            items={cartItems}
            onSlipUploaded={handleSlipUploaded}
            onPlaceOrder={handlePlaceOrder}
            onNavigate={navigateTo}
          />
        )}

        {currentView === 'chat' && (
          <CustomerCareView
            order={order}
            messages={chatMessages}
            loadError={chatLoadError}
            onSendMessage={handleSendMessage}
            onNavigate={navigateTo}
          />
        )}

        {currentView === 'profile' && (
          <ProfileView
            userName={currentUser || 'Studio Member'}
            userEmail={authenticatedUser?.email || undefined}
            order={order}
            purchaseHistory={purchaseHistory}
            purchaseHistoryError={purchaseHistoryError}
            onUpdateAddress={handleAddressUpdate}
            onLogout={handleLogout}
            onNavigate={navigateTo}
          />
        )}

        {currentView === 'about' && (
          <AboutView onNavigate={navigateTo} />
        )}

        {currentView === 'journal' && (
          <JournalView onNavigate={navigateTo} />
        )}
      </main>

      {/* Global Footer */}
      <Footer onNavigate={navigateTo} />

      {/* Modals & Overlays */}
      <AuthModal
        isOpen={authModalOpen}
        initialMode={authModalMode}
        onClose={() => setAuthModalOpen(false)}
        onLoginSuccess={(name, email, role) => {
          if (role === 'admin' || role === 'staff' || role === 'perfumer') {
            setIsAdminUser(true);
            setAdminUser(name);
            setCurrentUser(null);
            setCurrentView('admin');
          } else {
            setCurrentUser(name);
            setIsAdminUser(false);
            setOrder((prev) => ({ ...prev, customerName: name }));
          }
        }}
        onAdminLogin={() => {
          setIsAdminUser(true);
          setCurrentUser(null);
          setCurrentView('admin');
        }}
      />

      <SearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
        onSelectIngredient={handleAddIngredientToScentify}
        onNavigate={navigateTo}
        scentFamilies={scentFamilies}
      />

      <StoryModal
        isOpen={storyModalOpen}
        onClose={() => setStoryModalOpen(false)}
        onOpenScentify={() => {
          setStoryModalOpen(false);
          navigateTo('scentify');
        }}
      />

    </div>
  );
}
