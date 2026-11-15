/*
 * Shared frontend integration tasks:
 * connect member views, authentication, profile, ingredients, orders, and chat.
 */
import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
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
import type { ApiOrder } from './api';
import { formatChatMessageTime } from './chatTime';
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
  ApiBottle,
  ApiFormula,
  ApiIngredient,
} from './types';
import {
  INITIAL_ORDER,
  SCENT_FAMILIES,
} from './data/perfumeData';
import {
  INITIAL_DB_USERS,
  INITIAL_DB_INGREDIENTS,
  INITIAL_CUSTOMIZATION_RULES,
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
      formulaId: typeof record.formulaId === 'number' ? record.formulaId : undefined,
      bottleId: typeof record.bottleId === 'number' ? record.bottleId : undefined,
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
            bottleType: typeof details.bottleType === 'string' ? details.bottleType : undefined,
          }
        : itemSize
        ? { size: itemSize }
        : undefined,
    }];
  });
}

function toBottleOption(bottle: ApiBottle): BottleOption {
  return {
    bottle_id: bottle.bottleId,
    size: `${bottle.size} ml`,
    volume: bottle.size,
    price: Number(bottle.price),
    bottleType: bottle.bottleType,
    inStock: bottle.available,
    description: bottle.description || undefined,
  };
}

function normalizeIngredientName(name: string): string {
  return name.replace(/\s*\([^)]*\)/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

function toSavedFormula(formula: ApiFormula): MasterFormula {
  const note = (type: 'top' | 'heart' | 'base', index: number) =>
    formula.details.find((detail) => detail.noteType.toLowerCase() === type)?.ingredientName
    || formula.details[index]?.ingredientName
    || '';
  return {
    id: -formula.formulaId,
    formulaId: formula.formulaId,
    name: formula.formulaName,
    topNote: note('top', 0),
    heartNote: note('heart', 1),
    baseNote: note('base', 2),
    active: formula.active,
    description: formula.description || '',
    created_at: formula.createdAt || undefined,
  };
}

function toMasterFormula(formula: ApiFormula, bottles: BottleOption[]): MasterFormula {
  const saved = toSavedFormula(formula);
  return {
    ...saved,
    id: formula.formulaId,
    recommendedBottle: bottles.find(
      (bottle) => bottle.bottle_id === formula.recommendedBottleId
    )?.size,
  };
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
    bottleType: 'Classic Flacon',
  });

  // Shopping Bag / Cart State
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // Active Order State
  const [order, setOrder] = useState<OrderDetails>(() => ({
    ...INITIAL_ORDER,
    orderId: createOrderNumber(),
  }));

  // Relational Database State for Admin Panel
  const [dbOrders, setDbOrders] = useState<DbOrder[]>([]);
  const [dbUsers, setDbUsers] = useState<DbUser[]>(INITIAL_DB_USERS);
  const [dbShippings, setDbShippings] = useState<DbShipping[]>([]);
  const [dbPayments, setDbPayments] = useState<DbPayment[]>([]);
  const [dbIngredients, setDbIngredients] = useState<DbIngredient[]>(INITIAL_DB_INGREDIENTS);
  const [dbFormulas, setDbFormulas] = useState<DbFormula[]>([]);
  const [dbFormulaDetails, setDbFormulaDetails] = useState<DbFormulaDetail[]>([]);
  const [dbOrderItems, setDbOrderItems] = useState<DbOrderItem[]>([]);

  // Backend catalog state and local-only customization rules
  const [bottles, setBottles] = useState<BottleOption[]>([]);
  const [ingredients, setIngredients] = useState<ApiIngredient[]>([]);
  const [savedFormulas, setSavedFormulas] = useState<MasterFormula[]>([]);
  const [catalogError, setCatalogError] = useState<string | null>(null);
  const [formulaLoadError, setFormulaLoadError] = useState<string | null>(null);
  const [masterFormulaLoadError, setMasterFormulaLoadError] = useState<string | null>(null);

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

  const [masterFormulas, setMasterFormulas] = useState<MasterFormula[]>([]);

  const [adminStaffUsers, setAdminStaffUsers] = useState<AdminStaffUser[]>(() => {
    try {
      const raw = localStorage.getItem('scentify_admin_users');
      return raw ? JSON.parse(raw) : INITIAL_ADMIN_USERS;
    } catch {
      return INITIAL_ADMIN_USERS;
    }
  });

  const handleUpdateBottles = async (newBottles: BottleOption[]): Promise<BottleOption[]> => {
    const previousById = new Map(bottles.map((bottle) => [bottle.bottle_id, bottle]));
    const nextById = new Map(newBottles.map((bottle) => [bottle.bottle_id, bottle]));

    for (const [id, oldBottle] of previousById) {
      if (!nextById.has(id)) await backendApi.deleteBottle(id);
      else {
        const bottle = nextById.get(id)!;
        if (JSON.stringify(bottle) !== JSON.stringify(oldBottle)) {
          await backendApi.updateBottle(id, {
            size: bottle.volume,
            bottleType: bottle.bottleType,
            price: bottle.price,
            available: bottle.inStock,
            description: bottle.description,
          });
        }
      }
    }

    for (const bottle of newBottles) {
      if (!previousById.has(bottle.bottle_id)) {
        await backendApi.createBottle({
          size: bottle.volume,
          bottleType: bottle.bottleType,
          price: bottle.price,
          available: bottle.inStock,
          description: bottle.description,
        });
      }
    }

    const savedBottles = (await backendApi.getBottles()).map(toBottleOption);
    setBottles(savedBottles);
    return savedBottles;
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

  const handleUpdateMasterFormulas = async (newFormulas: MasterFormula[]): Promise<void> => {
    const previousIds = new Set(masterFormulas.map((formula) => formula.id));
    const nextIds = new Set(newFormulas.map((formula) => formula.id));
    const savedRows: ApiFormula[] = [];
    const payloadFor = (formula: MasterFormula) => {
      const noteNames = [formula.topNote, formula.heartNote, formula.baseNote];
      const noteTypes = ['top', 'heart', 'base'] as const;
      const details = noteNames.map((name, index) => {
        const ingredient = ingredients.find(
          (entry) => normalizeIngredientName(entry.name) === normalizeIngredientName(name)
        );
        if (!ingredient) {
          throw new Error(`Ingredient "${name}" is not available in the backend catalog.`);
        }
        return { ingredientId: ingredient.id, noteType: noteTypes[index] };
      });
      const recommendedBottleId = bottles.find(
        (bottle) => bottle.size === formula.recommendedBottle
      )?.bottle_id;
      if (formula.recommendedBottle && !recommendedBottleId) {
        throw new Error(`Bottle "${formula.recommendedBottle}" is not available in the backend catalog.`);
      }
      return {
        formulaName: formula.name,
        description: formula.description,
        active: formula.active,
        recommendedBottleId,
        details,
      };
    };

    for (const formula of masterFormulas) {
      if (!nextIds.has(formula.id)) await backendApi.deleteMasterFormula(formula.id);
    }
    for (const formula of newFormulas) {
      const payload = payloadFor(formula);
      if (previousIds.has(formula.id)) {
        savedRows.push(await backendApi.updateMasterFormula(formula.id, payload));
      } else {
        savedRows.push(await backendApi.createMasterFormula(payload));
      }
    }
    setMasterFormulas(savedRows.map((formula) => toMasterFormula(formula, bottles)));
    setDbFormulas(savedRows.map((formula) => ({
      formula_id: formula.formulaId,
      formula_name: formula.formulaName,
      created_at: formula.createdAt || '',
    })));
    setDbFormulaDetails(savedRows.flatMap((formula) => formula.details.map((detail) => ({
      formula_detail_id: detail.formulaDetailId,
      formula_id: formula.formulaId,
      ingredient_id: detail.ingredientId,
    }))));
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
  const pendingCheckoutOrder = useRef<ApiOrder | null>(null);

  useEffect(() => {
    let active = true;
    setBottles([]);
    setMasterFormulas([]);
    setIngredients([]);
    setMasterFormulaLoadError(null);

    const loadCatalog = async () => {
      const failures: string[] = [];
      try {
        const bottleRows = await backendApi.getBottles();
        const savedBottles = bottleRows.map(toBottleOption);
        if (active) setBottles(savedBottles);
        try {
          const formulaRows = isAdminUser
            ? await backendApi.getManageMasterFormulas()
            : await backendApi.getMasterFormulas();
          if (active) {
            setMasterFormulas(formulaRows.map((formula) => toMasterFormula(formula, savedBottles)));
            setDbFormulas(formulaRows.map((formula) => ({
              formula_id: formula.formulaId,
              formula_name: formula.formulaName,
              created_at: formula.createdAt || '',
            })));
            setDbFormulaDetails(formulaRows.flatMap((formula) => formula.details.map((detail) => ({
              formula_detail_id: detail.formulaDetailId,
              formula_id: formula.formulaId,
              ingredient_id: detail.ingredientId,
            }))));
            setMasterFormulaLoadError(null);
          }
        } catch (error) {
          console.error('Failed to load master formulas:', error);
          if (active) {
            setMasterFormulaLoadError(
              `Could not load master formulas: ${error instanceof Error ? error.message : 'Unexpected error'}.`
            );
          }
        }
      } catch (error) {
        console.error('Failed to load bottle catalog:', error);
        failures.push(`bottles: ${error instanceof Error ? error.message : 'Unexpected error'}`);
        if (active) {
          setMasterFormulaLoadError(
            `Could not load master formulas: ${error instanceof Error ? error.message : 'Unexpected error'}.`
          );
        }
      }
      if (authenticatedUser) {
        try {
          const ingredientRows = await backendApi.getIngredients();
          if (active) setIngredients(ingredientRows);
        } catch (error) {
          console.error('Failed to load ingredients:', error);
          failures.push(`ingredients: ${error instanceof Error ? error.message : 'Unexpected error'}`);
        }
      }
      if (active) {
        setCatalogError(failures.length ? `Could not load backend catalog (${failures.join('; ')}).` : null);
      }
    };
    void loadCatalog();
    return () => { active = false; };
  }, [authenticatedUser?.id, isAdminUser]);

  useEffect(() => {
    let active = true;
    if (!authenticatedUser || isAdminUser) {
      setSavedFormulas([]);
      setFormulaLoadError(null);
      return () => { active = false; };
    }

    void backendApi.getMyFormulas().then((rows) => {
      if (active) {
        setSavedFormulas(rows.map(toSavedFormula));
        setFormulaLoadError(null);
      }
    }).catch((error: unknown) => {
      console.error('Failed to load saved formulas:', error);
      if (active) {
        setFormulaLoadError(
          `Could not load saved formulas: ${error instanceof Error ? error.message : 'Unexpected error'}.`
        );
      }
    });
    return () => { active = false; };
  }, [authenticatedUser?.id, isAdminUser]);

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
            timestamp: formatChatMessageTime(row.createdAt),
          })));
          setChatLoadError(null);
        }
      } catch (error) {
        console.error('Failed to load customer chat messages:', error);
        if (active) setChatLoadError(`Could not load messages: ${error instanceof Error ? error.message : 'Unexpected error'}`);
      }
    };

    void loadMessages();
    const refreshTimer = window.setInterval(() => {
      void loadMessages();
    }, 3000);

    return () => {
      active = false;
      window.clearInterval(refreshTimer);
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
              const adminId = row.userId;
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
                  shipping_id: undefined,
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
                authUserId: row.userId,
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
            const [paymentRows, shippingRows] = await Promise.all([
              backendApi.getPayments(),
              backendApi.getShippingRecords(),
            ]);
            setDbPayments(paymentRows.map((payment) => ({
              payment_id: payment.paymentId,
              order_id: payment.orderId,
              qr_receipt_url: payment.receiptUrl || '',
              status: payment.status,
              verified_at: payment.verifiedAt || undefined,
            })));
            setDbShippings(shippingRows.map((shipping) => ({
              shipping_id: shipping.shippingId,
              order_id: shipping.orderId,
              shipping_fee: Number(shipping.shippingFee),
              tracking_number: shipping.trackingNumber || '',
              courier_name: shipping.courierName || '',
              shipping_address: shipping.shippingAddress,
              shipping_status: shipping.shippingStatus,
            })));
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
      setComposition((prev) => ({ ...prev, formulaId: undefined, topNote: ingredient.name }));
    } else if (ingredient.familyId === 'floral') {
      setComposition((prev) => ({ ...prev, formulaId: undefined, heartNote: ingredient.name }));
    } else {
      setComposition((prev) => ({ ...prev, formulaId: undefined, baseNote: ingredient.name }));
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
      timestamp: formatChatMessageTime(data.createdAt),
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
    const formulaDetails = ingredients.reduce((details, ingredient) => {
      if (ingredient.available) {
        details.set(normalizeIngredientName(ingredient.name), ingredient.id);
      }
      return details;
    }, new Map<string, number>());
    const placedItems = pendingCheckoutOrder.current?.items || await Promise.all(cartItems.map(async (item) => {
      const savedItem = { ...item };
      if (savedItem.details?.size) {
        const selectedBottle = bottles.find((entry) =>
          entry.bottle_id === savedItem.bottleId &&
          entry.size === savedItem.details?.size &&
          (!savedItem.details?.bottleType || entry.bottleType === savedItem.details.bottleType)
        );
        const bottle = selectedBottle || bottles.find((entry) =>
          entry.size === savedItem.details?.size &&
          (!savedItem.details?.bottleType || entry.bottleType === savedItem.details.bottleType)
        );
        if (!bottle?.inStock) {
          throw new Error(`The selected bottle (${savedItem.details.size}) is unavailable.`);
        }
        savedItem.bottleId = bottle.bottle_id;
      }
      if (!savedItem.formulaId && savedItem.details?.notes?.length) {
        const noteTypes = ['top', 'heart', 'base'] as const;
        const formulaIngredients = savedItem.details.notes
          .filter((name) => name.trim().length > 0)
          .slice(0, 3)
          .map((name, index) => {
          const ingredientId = formulaDetails.get(normalizeIngredientName(name));
          if (!ingredientId) throw new Error(`Ingredient "${name}" is not available in the backend catalog.`);
          return { ingredientId, noteType: noteTypes[index] };
        });
        if (formulaIngredients.length) {
          const savedFormula = await backendApi.createFormula({
            formulaName: savedItem.title,
            description: savedItem.description,
            details: formulaIngredients,
          });
          savedItem.formulaId = savedFormula.formulaId;
          setSavedFormulas((previous) => [toSavedFormula(savedFormula), ...previous]);
        }
      }
      return savedItem;
    }));
    setCartItems(placedItems);
    const savedOrder = pendingCheckoutOrder.current || await backendApi.createOrder({
      orderNumber: payload.orderId,
      customerName: custName,
      customerEmail: custEmail,
      customerPhone: custPhone,
      shippingAddress: fullAddr,
      total: payload.total,
      paymentSlipUrl: payload.slipUrl,
      items: placedItems.map((item) => ({ ...item, name: item.title })),
    });
    pendingCheckoutOrder.current = savedOrder;
    const savedPayment = await backendApi.createPayment({
      orderId: Number(savedOrder.id),
      paymentMethod: 'PromptPay',
      receiptUrl: payload.slipUrl,
    });
    pendingCheckoutOrder.current = null;
    const savedOrderNumber = savedOrder.orderNumber || String(savedOrder.id);

    setPurchaseHistory((previous) => [
      {
        orderId: savedOrderNumber,
        date: savedOrder.createdAt,
        status: 'Awaiting payment verification',
        total: payload.total,
        items: placedItems,
      },
      ...previous,
    ]);
    setPurchaseHistoryError(null);

    const numericOrderId = Number(savedOrder.id);
    const newDbUser: DbUser = {
      id: authenticatedUser.id,
      name: custName,
      email: custEmail,
      phone: custPhone,
      address: fullAddr,
      role: 'customer',
    };
    const newDbPayment: DbPayment = {
      payment_id: savedPayment.paymentId,
      order_id: numericOrderId,
      qr_receipt_url: savedPayment.receiptUrl || '',
      status: savedPayment.status,
    };
    const newDbOrder: DbOrder = {
      order_id: numericOrderId,
      user_id: authenticatedUser.id,
      order_date: savedOrder.createdAt,
      status: 'pending',
      total_price: payload.total,
      prep_photo_url: '',
      items: placedItems,
    };
    setDbUsers((prev) => [newDbUser, ...prev]);
    setDbPayments((prev) => [newDbPayment, ...prev]);
    setDbOrders((prev) => [newDbOrder, ...prev]);
    setCartItems([]);
    setOrder((prev) => ({
      ...prev,
      orderId: savedOrderNumber,
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
    const payment = dbPayments.find((entry) => entry.order_id === orderId);
    if (!payment) throw new Error('No backend payment record exists for this order.');
    const verifiedPayment = await backendApi.verifyPayment(payment.payment_id);
    const dbOrder = dbOrders.find((entry) => entry.order_id === orderId);
    if (!dbOrder) throw new Error('Order details are unavailable for shipping creation.');
    const existingShippingRows = await backendApi.getShippingRecords();
    let shipping = existingShippingRows.find((entry) => entry.orderId === orderId);
    if (!shipping) {
      const address = dbUsers.find((user) => user.id === dbOrder.user_id)?.address;
      if (!address) throw new Error('Shipping address is unavailable for this order.');
      const subtotal = (dbOrder.items || []).reduce((sum, item) => sum + item.price * item.quantity, 0);
      shipping = await backendApi.createShipping({
        orderId,
        shippingFee: subtotal > 1500 ? 0 : 50,
        shippingAddress: address,
      });
    }
    await backendApi.updateOrderStatus(orderId, 'processing');

    setDbOrders((previous) =>
      previous.map((entry) => (entry.order_id === orderId ? { ...entry, status: 'processing' } : entry))
    );
    setDbPayments((previous) => previous.map((entry) =>
      entry.order_id === orderId
        ? {
            ...entry,
            status: verifiedPayment.status,
            verified_at: verifiedPayment.verifiedAt || undefined,
            qr_receipt_url: verifiedPayment.receiptUrl || entry.qr_receipt_url,
          }
        : entry
    ));
    setDbShippings((previous) => [{
      shipping_id: shipping.shippingId,
      order_id: shipping.orderId,
      shipping_fee: Number(shipping.shippingFee),
      tracking_number: shipping.trackingNumber || '',
      courier_name: shipping.courierName || '',
      shipping_address: shipping.shippingAddress,
      shipping_status: shipping.shippingStatus,
    }, ...previous.filter((entry) => entry.order_id !== orderId)]);
    setOrder((prev) =>
      Number(prev.orderId.replace(/\D/g, '')) === orderId
        ? { ...prev, status: 'verified' }
        : prev
    );
  };

  // Admin cancels the order
  const handleAdminCancelOrder = async (orderId: number) => {
    await backendApi.updateOrderStatus(orderId, 'cancelled');
    const shipping = dbShippings.find((entry) => entry.order_id === orderId);
    if (shipping) {
      await backendApi.updateShipping(shipping.shipping_id, {
        trackingNumber: shipping.tracking_number,
        courierName: shipping.courier_name,
        shippingStatus: 'cancelled',
      });
      setDbShippings((previous) => previous.map((entry) =>
        entry.shipping_id === shipping.shipping_id
          ? { ...entry, shipping_status: 'cancelled' }
          : entry
      ));
    }

    setDbOrders((prev) =>
      prev.map((o) => (o.order_id === orderId ? { ...o, status: 'cancelled' } : o))
    );
    setOrder((prev) =>
      Number(prev.orderId.replace(/\D/g, '')) === orderId
        ? { ...prev, status: 'cancelled' }
        : prev
    );
  };

  const handleAdminUpdateOrderStatus = async (orderId: number, status: DbOrder['status']) => {
    await backendApi.updateOrderStatus(orderId, status);
    const shippingStatus = status === 'completed'
      ? 'delivered'
      : status === 'processing'
      ? 'processing'
      : status === 'cancelled'
      ? 'cancelled'
      : undefined;
    const shipping = shippingStatus
      ? dbShippings.find((entry) => entry.order_id === orderId)
      : undefined;
    if (shipping && shippingStatus) {
      const saved = await backendApi.updateShipping(shipping.shipping_id, {
        trackingNumber: shipping.tracking_number,
        courierName: shipping.courier_name,
        shippingStatus,
      });
      setDbShippings((previous) => previous.map((entry) => entry.shipping_id === shipping.shipping_id
        ? { ...entry, shipping_status: saved.shippingStatus }
        : entry
      ));
    }

    setDbOrders((prev) =>
      prev.map((order) => (order.order_id === orderId ? { ...order, status } : order))
    );
  };

  const handleAdminVerifyPayment = async (paymentId: number, orderId: number) => {
    const verified = await backendApi.verifyPayment(paymentId);

    setDbPayments((prev) =>
      prev.map((payment) =>
        payment.order_id === orderId
          ? {
              ...payment,
              status: verified.status,
              verified_at: verified.verifiedAt || undefined,
              qr_receipt_url: verified.receiptUrl || payment.qr_receipt_url,
            }
          : payment
      )
    );
  };

  const handleAdminUpdateShipping = async (
    shippingId: number,
    update: { trackingNumber: string; courierName: string },
  ): Promise<DbShipping> => {
    const saved = await backendApi.updateShipping(shippingId, update);
    const shipping: DbShipping = {
      shipping_id: saved.shippingId,
      order_id: saved.orderId,
      shipping_fee: Number(saved.shippingFee),
      tracking_number: saved.trackingNumber || '',
      courier_name: saved.courierName || '',
      shipping_address: saved.shippingAddress,
      shipping_status: saved.shippingStatus,
    };
    setDbShippings((previous) => previous.map((entry) =>
      entry.shipping_id === shippingId ? shipping : entry
    ));
    return shipping;
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
        onUpdateShipping={handleAdminUpdateShipping}
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
        {currentView === 'admin' && !isAdminUser && (
          <section
            className="min-h-[65vh] flex items-center justify-center px-6 text-center"
            role="alert"
          >
            <div className="max-w-md">
              <p className="text-xs uppercase tracking-[0.25em] text-[#C9A25C]">Studio Console</p>
              <h1 className="mt-3 font-serif text-3xl text-[#28192A]">Access denied</h1>
              <p className="mt-3 text-sm text-[#6B6166]">
                You do not have authority to access the admin portal.
              </p>
              <button
                type="button"
                onClick={() => navigateTo('home')}
                className="mt-6 border border-[#28192A] px-6 py-3 text-xs uppercase tracking-[0.18em] text-[#28192A]"
              >
                Return to storefront
              </button>
            </div>
          </section>
        )}

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
            formulas={[...savedFormulas, ...masterFormulas]}
            catalogError={catalogError || formulaLoadError || masterFormulaLoadError}
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
                setOrder((previous) => ({
                  ...previous,
                  orderId: createOrderNumber(),
                  items: [],
                  paymentSlipUrl: undefined,
                  status: 'awaiting_confirmation',
                  subtotal: 0,
                  shipping: 0,
                  tax: 0,
                  discount: 0,
                  total: 0,
                }));
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
        isOpen={authModalOpen && !(currentView === 'admin' && !isAdminUser)}
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
