export interface AppConfig {
  deliveryFee: number;
  freeDeliveryAbove: number;
  estimatedMinutes: number;
  storeCoordinates: {
    lat: number;
    lng: number;
  };
}

export interface UserAddress {
  id: string;
  label: 'Home' | 'Work' | 'Other';
  fullAddress: string;
  landmark: string;
  lat: number;
  lng: number;
}

export interface UserProfile {
  uid: string;
  name: string;
  phone: string;
  addresses: UserAddress[];
  defaultAddressId: string | null;
  createdAt: string;
}

export type DepartmentName =
  | 'Grocery & Kitchen'
  | 'Snacks & Drinks'
  | 'Beverages & Smokes'
  | 'Late Night Craving Combo'
  | 'Beauty & Personal Care';

export interface Category {
  id: string;
  name: string;
  imageUrl: string;
  department: DepartmentName;
  priorityOrder: number;
  isActive: boolean;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  categoryId: string;
  department: DepartmentName;
  unit: string;
  mrp: number;
  sellingPrice: number;
  discountPercent: number;
  images: string[];
  inStock: boolean;
  isHidden: boolean;
  isTrending: boolean;
  isCombo?: boolean;
  storeId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type OrderStatus = 'placed' | 'packing' | 'handover' | 'reached' | 'delivered' | 'cancelled';

export interface OrderItem {
  productId: string;
  name: string;
  unit: string;
  price: number;
  qty: number;
  imageUrl: string;
}

export interface OrderBill {
  itemTotal: number;
  deliveryFee: number;
  grandTotal: number;
}

export interface RiderDetails {
  name: string;
  phone: string;
  photoUrl: string;
  lat: number;
  lng: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: {
    fullAddress: string;
    landmark: string;
    lat: number;
    lng: number;
  };
  items: OrderItem[];
  bill: OrderBill;
  paymentMethod: 'COD';
  status: OrderStatus;
  riderId: string | null;
  riderDetails: RiderDetails | null;
  storeId: string;
  createdAt: string;
  updatedAt: string;
}
