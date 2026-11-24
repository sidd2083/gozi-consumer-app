import { 
  collection, 
  doc, 
  onSnapshot, 
  setDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy,
  getDocs,
  getDoc
} from 'firebase/firestore';
import { db, isFirebaseConnected } from '../services/firebase';
import { 
  INITIAL_APP_CONFIG, 
  INITIAL_CATEGORIES, 
  INITIAL_PRODUCTS, 
  INITIAL_USER 
} from '../mock/mockData';
import { Category, Product, AppConfig, Order, UserProfile, OrderStatus } from '../types';

/**
 * Data Service with Real Firestore Subscription + Mock In-Memory Fallback
 * Ensures 100% offline & instant development velocity while keeping real
 * Firestore live synchronizations fully operational.
 */

// In-Memory state for mock fallback mode
let mockCategories = [...INITIAL_CATEGORIES];
let mockProducts = [...INITIAL_PRODUCTS];
let mockConfig = { ...INITIAL_APP_CONFIG };
let mockOrders: Order[] = [];
let mockUser: UserProfile = { ...INITIAL_USER };

const listeners = {
  categories: new Set<(data: Category[]) => void>(),
  products: new Set<(data: Product[]) => void>(),
  config: new Set<(data: AppConfig) => void>(),
  orders: new Map<string, Set<(data: Order | null) => void>>(),
  userOrders: new Set<(data: Order[]) => void>(),
};

/**
 * Subscribe to App Settings (deliveryFee, etc.)
 */
export function subscribeAppConfig(callback: (config: AppConfig) => void): () => void {
  if (isFirebaseConnected && db) {
    try {
      const docRef = doc(db, 'settings', 'appConfig');
      const unsubscribe = onSnapshot(docRef, (snapshot) => {
        if (snapshot.exists()) {
          callback(snapshot.data() as AppConfig);
        } else {
          callback(INITIAL_APP_CONFIG);
        }
      }, (err) => {
        console.warn('[Gozi DataService] Firestore config listen error, using fallback:', err);
        callback(mockConfig);
      });
      return unsubscribe;
    } catch (e) {
      console.warn('[Gozi DataService] Exception setting up config listener:', e);
    }
  }

  // Mock Fallback
  callback(mockConfig);
  listeners.config.add(callback);
  return () => {
    listeners.config.delete(callback);
  };
}

/**
 * Subscribe to Categories sorted by priorityOrder
 */
export function subscribeCategories(callback: (categories: Category[]) => void): () => void {
  if (isFirebaseConnected && db) {
    try {
      const colRef = collection(db, 'categories');
      const q = query(colRef, where('isActive', '==', true), orderBy('priorityOrder', 'asc'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          const items = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Category));
          callback(items);
        } else {
          callback(mockCategories);
        }
      }, (err) => {
        console.warn('[Gozi DataService] Firestore categories error, using fallback:', err);
        callback(mockCategories);
      });
      return unsubscribe;
    } catch (e) {
      console.warn('[Gozi DataService] Category setup error:', e);
    }
  }

  // Mock Fallback
  callback(mockCategories);
  listeners.categories.add(callback);
  return () => {
    listeners.categories.delete(callback);
  };
}

/**
 * Subscribe to Products (filterable by category or all)
 */
export function subscribeProducts(
  categoryId: string | null,
  callback: (products: Product[]) => void
): () => void {
  if (isFirebaseConnected && db) {
    try {
      const colRef = collection(db, 'products');
      const q = categoryId 
        ? query(colRef, where('categoryId', '==', categoryId), where('isHidden', '==', false))
        : query(colRef, where('isHidden', '==', false));

      const unsubscribe = onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          const items = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Product));
          callback(items);
        } else {
          const filtered = categoryId 
            ? mockProducts.filter(p => p.categoryId === categoryId && !p.isHidden)
            : mockProducts.filter(p => !p.isHidden);
          callback(filtered);
        }
      }, (err) => {
        console.warn('[Gozi DataService] Firestore products error, using fallback:', err);
        const filtered = categoryId 
          ? mockProducts.filter(p => p.categoryId === categoryId && !p.isHidden)
          : mockProducts.filter(p => !p.isHidden);
        callback(filtered);
      });
      return unsubscribe;
    } catch (e) {
      console.warn('[Gozi DataService] Products setup error:', e);
    }
  }

  // Mock Fallback
  const notify = () => {
    const filtered = categoryId 
      ? mockProducts.filter(p => p.categoryId === categoryId && !p.isHidden)
      : mockProducts.filter(p => !p.isHidden);
    callback(filtered);
  };
  notify();

  const listener = () => notify();
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
      console.log('[Gozi DataService] Order placed in Firestore:', orderId);
      return orderId;
    } catch (e) {
      console.warn('[Gozi DataService] Failed to place order in Firestore, falling back to mock:', e);
    }
  }

  // Mock Store
  mockOrders.unshift(fullOrder);
  listeners.userOrders.forEach(cb => cb([...mockOrders]));
  
  // Trigger simulated progression for demo testing if needed
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
          const found = mockOrders.find(o => o.id === orderId) || null;
          callback(found);
        }
      }, (err) => {
        console.warn('[Gozi DataService] Firestore order listen error:', err);
        const found = mockOrders.find(o => o.id === orderId) || null;
        callback(found);
      });
      return unsubscribe;
    } catch (e) {
      console.warn('[Gozi DataService] Order subscribe exception:', e);
    }
  }

  // Mock
  const found = mockOrders.find(o => o.id === orderId) || null;
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
        console.warn('[Gozi DataService] Firestore user orders error:', err);
        callback(mockOrders.filter(o => o.userId === userId));
      });
      return unsubscribe;
    } catch (e) {
      console.warn('[Gozi DataService] User orders exception:', e);
    }
  }

  callback(mockOrders.filter(o => o.userId === userId));
  listeners.userOrders.add(callback);
  return () => {
    listeners.userOrders.delete(callback);
  };
}

/**
 * Demo Simulation Helper: Simulates rider progression for mock testing
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
        lat: 27.7180,
        lng: 85.3235,
      } 
    },
    { 
      status: 'reached', 
      delay: 15000, 
      rider: { 
        name: 'Suman Thapa', 
        phone: '+977 9841234567', 
        photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
        lat: 27.7210,
        lng: 85.3209,
      } 
    },
    { status: 'delivered', delay: 22000 },
  ];

  steps.forEach(({ status, delay, rider }) => {
    setTimeout(() => {
      const order = mockOrders.find(o => o.id === orderId);
      if (order) {
        order.status = status;
        if (rider) {
          order.riderDetails = rider;
          order.riderId = 'rider-suman-1';
        }
        order.updatedAt = new Date().toISOString();

        // Notify subscribers
        const subscribers = listeners.orders.get(orderId);
        if (subscribers) {
          subscribers.forEach(cb => cb({ ...order }));
        }
        listeners.userOrders.forEach(cb => cb([...mockOrders]));
      }
    }, delay);
  });
}
