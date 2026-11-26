import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  collection, 
  doc, 
  onSnapshot, 
  setDoc, 
  query, 
  where, 
  orderBy,
  getDocs,
  getDoc
} from 'firebase/firestore';
import { db, isFirebaseConnected } from './firebase';
import { 
  INITIAL_APP_CONFIG, 
  INITIAL_CATEGORIES, 
  INITIAL_PRODUCTS, 
  INITIAL_USER 
} from '../mock/mockData';
import { Category, Product, AppConfig, Order, UserProfile, OrderStatus } from '../types';

const STORAGE_KEY_CATEGORIES = '@gozii_catalog_categories';
const STORAGE_KEY_PRODUCTS = '@gozii_catalog_products';
const STORAGE_KEY_CATALOG_VER = '@gozii_catalog_ver';

// In-Memory state for instant UI delivery
let inMemoryCategories = [...INITIAL_CATEGORIES];
let inMemoryProducts = [...INITIAL_PRODUCTS];
let inMemoryConfig = { ...INITIAL_APP_CONFIG };
let inMemoryOrders: Order[] = [];

const listeners = {
  categories: new Set<(data: Category[]) => void>(),
  products: new Set<(data: Product[]) => void>(),
  config: new Set<(data: AppConfig) => void>(),
  orders: new Map<string, Set<(data: Order | null) => void>>(),
  userOrders: new Set<(data: Order[]) => void>(),
};

/**
 * Initialize Cache-First Catalog from AsyncStorage
 */
async function loadCachedCatalog() {
  try {
    const [cachedCats, cachedProds] = await Promise.all([
      AsyncStorage.getItem(STORAGE_KEY_CATEGORIES),
      AsyncStorage.getItem(STORAGE_KEY_PRODUCTS),
    ]);
    if (cachedCats) {
      inMemoryCategories = JSON.parse(cachedCats);
    }
    if (cachedProds) {
      inMemoryProducts = JSON.parse(cachedProds);
    }
  } catch (e) {
    console.warn('[Gozii DataService] Error loading cached catalog:', e);
  }
}
loadCachedCatalog();

/**
 * Subscribe to App Settings & Catalog Version Check (1 tiny doc read)
 */
export function subscribeAppConfig(callback: (config: AppConfig) => void): () => void {
  if (isFirebaseConnected && db) {
    try {
      const docRef = doc(db, 'settings', 'appConfig');
      const unsubscribe = onSnapshot(docRef, async (snapshot) => {
        if (snapshot.exists()) {
          const cfg = snapshot.data() as AppConfig;
          callback(cfg);
          inMemoryConfig = cfg;

          // Check if remote catalogVersion changed
          try {
            const localVer = await AsyncStorage.getItem(STORAGE_KEY_CATALOG_VER);
            const remoteVer = cfg.catalogVersion?.toString() || '1';
            if (localVer !== remoteVer) {
              await refreshCatalogFromFirestore(remoteVer);
            }
          } catch (e) {
            console.warn('[Gozii DataService] Catalog version sync check error:', e);
          }
        } else {
          callback(INITIAL_APP_CONFIG);
        }
      }, (err) => {
        console.warn('[Gozii DataService] Firestore config listen error, using fallback:', err);
        callback(inMemoryConfig);
      });
      return unsubscribe;
    } catch (e) {
      console.warn('[Gozii DataService] Exception setting up config listener:', e);
    }
  }

  callback(inMemoryConfig);
  listeners.config.add(callback);
  return () => {
    listeners.config.delete(callback);
  };
}

/**
 * Refresh Catalog docs from Firestore when catalogVersion changes
 */
async function refreshCatalogFromFirestore(newVersion: string) {
  if (!isFirebaseConnected || !db) return;
  try {
    const catsSnap = await getDocs(
      query(collection(db, 'categories'), where('isActive', '==', true), orderBy('priorityOrder', 'asc'))
    );
    if (!catsSnap.empty) {
      const freshCats = catsSnap.docs.map(d => ({ id: d.id, ...d.data() } as Category));
      inMemoryCategories = freshCats;
      await AsyncStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(freshCats));
      listeners.categories.forEach(cb => cb(freshCats));
    }

    const prodsSnap = await getDocs(
      query(collection(db, 'products'), where('isHidden', '==', false))
    );
    if (!prodsSnap.empty) {
      const freshProds = prodsSnap.docs.map(d => ({ id: d.id, ...d.data() } as Product));
      inMemoryProducts = freshProds;
      await AsyncStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(freshProds));
      listeners.products.forEach(cb => cb(freshProds));
    }

    await AsyncStorage.setItem(STORAGE_KEY_CATALOG_VER, newVersion);
  } catch (e) {
    console.warn('[Gozii DataService] Error refreshing catalog from Firestore:', e);
  }
}

/**
 * Subscribe to Categories (Cache-First Instant Load)
 */
export function subscribeCategories(callback: (categories: Category[]) => void): () => void {
  // 1. Immediately fire in-memory / cached categories (< 10ms)
  callback(inMemoryCategories);

  if (isFirebaseConnected && db) {
    try {
      const colRef = collection(db, 'categories');
      const q = query(colRef, where('isActive', '==', true), orderBy('priorityOrder', 'asc'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          const items = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Category));
          inMemoryCategories = items;
          AsyncStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(items)).catch(() => {});
          callback(items);
        } else {
          callback(inMemoryCategories);
        }
      }, (err) => {
        console.warn('[Gozii DataService] Firestore categories listen error:', err);
        callback(inMemoryCategories);
      });
      return unsubscribe;
    } catch (e) {
      console.warn('[Gozii DataService] Category setup error:', e);
    }
  }

  listeners.categories.add(callback);
  return () => {
    listeners.categories.delete(callback);
  };
}

/**
 * Subscribe to Products (Cache-First with targeted filtering)
 */
export function subscribeProducts(
  categoryId: string | null,
  callback: (products: Product[]) => void
): () => void {
  const getFiltered = () => {
    return categoryId 
      ? inMemoryProducts.filter(p => p.categoryId === categoryId && !p.isHidden)
      : inMemoryProducts.filter(p => !p.isHidden);
  };

  // 1. Immediately fire in-memory / cached products (< 10ms)
  callback(getFiltered());

  if (isFirebaseConnected && db) {
    try {
      const colRef = collection(db, 'products');
      const q = categoryId 
        ? query(colRef, where('categoryId', '==', categoryId), where('isHidden', '==', false))
        : query(colRef, where('isHidden', '==', false));

      const unsubscribe = onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          const items = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Product));
          if (!categoryId) {
            inMemoryProducts = items;
            AsyncStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(items)).catch(() => {});
          }
          callback(items);
        } else {
          callback(getFiltered());
        }
      }, (err) => {
        console.warn('[Gozii DataService] Firestore products listen error:', err);
        callback(getFiltered());
      });
      return unsubscribe;
    } catch (e) {
      console.warn('[Gozii DataService] Products setup error:', e);
    }
  }

  const listener = () => callback(getFiltered());
  listeners.products.add(listener);
  return () => {
    listeners.products.delete(listener);
  };
}

/**
 * Place a new Order
 */
export async function placeOrder(orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const orderId = 'ORD-' + Math.floor(100000 + Math.random() * 900000);
  const now = new Date().toISOString();
  const fullOrder: Order = {
    ...orderData,
    id: orderId,
    createdAt: now,
    updatedAt: now,
  };

  if (isFirebaseConnected && db) {
    try {
      await setDoc(doc(db, 'orders', orderId), fullOrder);
      console.log('[Gozii DataService] Order placed in Firestore:', orderId);
      return orderId;
    } catch (e) {
      console.warn('[Gozii DataService] Failed to place order in Firestore, falling back to mock:', e);
    }
  }

  inMemoryOrders.unshift(fullOrder);
  listeners.userOrders.forEach(cb => cb([...inMemoryOrders]));
  
  startDemoOrderProgression(orderId);
  return orderId;
}

/**
 * Subscribe to a single live Order
 */
export function subscribeOrder(orderId: string, callback: (order: Order | null) => void): () => void {
  if (isFirebaseConnected && db) {
    try {
      const docRef = doc(db, 'orders', orderId);
      const unsubscribe = onSnapshot(docRef, (snapshot) => {
        if (snapshot.exists()) {
          callback({ id: snapshot.id, ...snapshot.data() } as Order);
        } else {
          const found = inMemoryOrders.find(o => o.id === orderId) || null;
          callback(found);
        }
      }, (err) => {
        console.warn('[Gozii DataService] Firestore order listen error:', err);
        const found = inMemoryOrders.find(o => o.id === orderId) || null;
        callback(found);
      });
      return unsubscribe;
    } catch (e) {
      console.warn('[Gozii DataService] Order subscribe exception:', e);
    }
  }

  const found = inMemoryOrders.find(o => o.id === orderId) || null;
  callback(found);

  if (!listeners.orders.has(orderId)) {
    listeners.orders.set(orderId, new Set());
  }
  const set = listeners.orders.get(orderId)!;
  set.add(callback);

  return () => {
    set.delete(callback);
  };
}

/**
 * Subscribe to user orders list
 */
export function subscribeUserOrders(userId: string, callback: (orders: Order[]) => void): () => void {
  if (isFirebaseConnected && db) {
    try {
      const q = query(collection(db, 'orders'), where('userId', '==', userId), orderBy('createdAt', 'desc'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Order));
        callback(list);
      }, (err) => {
        console.warn('[Gozii DataService] Firestore user orders error:', err);
        callback(inMemoryOrders.filter(o => o.userId === userId));
      });
      return unsubscribe;
    } catch (e) {
      console.warn('[Gozii DataService] User orders exception:', e);
    }
  }

  callback(inMemoryOrders.filter(o => o.userId === userId));
  listeners.userOrders.add(callback);
  return () => {
    listeners.userOrders.delete(callback);
  };
}

/**
 * Demo Simulation Helper for offline/test environments
 */
function startDemoOrderProgression(orderId: string) {
  const steps: { status: OrderStatus; delay: number; rider?: any }[] = [
    { status: 'packing', delay: 4000 },
    { 
      status: 'handover', 
      delay: 9000, 
      rider: { 
        name: 'Suman Thapa', 
        phone: '+977 9841234567', 
        photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
        lat: 27.4250,
        lng: 85.0380,
      } 
    },
    { 
      status: 'reached', 
      delay: 15000, 
      rider: { 
        name: 'Suman Thapa', 
        phone: '+977 9841234567', 
        photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
        lat: 27.4280,
        lng: 85.0340,
      } 
    },
    { status: 'delivered', delay: 22000 },
  ];

  steps.forEach(({ status, delay, rider }) => {
    setTimeout(() => {
      const order = inMemoryOrders.find(o => o.id === orderId);
      if (order) {
        order.status = status;
        if (rider) {
          order.rider = rider;
        }
        order.updatedAt = new Date().toISOString();

        const subscribers = listeners.orders.get(orderId);
        if (subscribers) {
          subscribers.forEach(cb => cb({ ...order }));
        }
        listeners.userOrders.forEach(cb => cb([...inMemoryOrders]));
      }
    }, delay);
  });
}
