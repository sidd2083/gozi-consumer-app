import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, Product } from '../types';

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  itemTotal: number;
  getItemQuantity: (productId: string) => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  const addToCart = (product: Product) => {
    setItems(currentItems => {
      const existing = currentItems.find(i => i.product.id === product.id);
      if (existing) {
        return currentItems.map(i =>
          i.product.id === product.id
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      return [...currentItems, { product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setItems(currentItems => {
      const existing = currentItems.find(i => i.product.id === productId);
      if (!existing) return currentItems;
      if (existing.quantity === 1) {
        return currentItems.filter(i => i.product.id !== productId);
      }
      return currentItems.map(i =>
        i.product.id === productId
          ? { ...i, quantity: i.quantity - 1 }
          : i
      );
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      setItems(currentItems => currentItems.filter(i => i.product.id !== productId));
      return;
    }
    setItems(currentItems =>
      currentItems.map(i =>
        i.product.id === productId ? { ...i, quantity } : i
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const getItemQuantity = (productId: string): number => {
    const item = items.find(i => i.product.id === productId);
    return item ? item.quantity : 0;
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const itemTotal = items.reduce(
    (sum, item) => sum + item.product.sellingPrice * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        itemTotal,
        getItemQuantity,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
