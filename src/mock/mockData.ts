import { Category, Product, AppConfig, UserProfile } from '../types';

export const INITIAL_APP_CONFIG: AppConfig = {
  deliveryFee: 0,
  freeDeliveryAbove: 0,
  estimatedMinutes: 10,
  storeCoordinates: {
    lat: 27.4287,
    lng: 85.0331,
  },
};

/**
 * EXACT Categories from the user's screenshot under "Grocery & Kitchen":
 * 1. Rice
 * 2. Daal
 * 3. Cooking Oil
 * 4. Aata, Maida & Other Flo...
 * 5. Tea & Coffee
 * 6. Geda Gudi
 * 7. Masala, Papad & He...
 * 8. Spreads & Jams
 * 9. Ketchups, Sauces & P...
 * 10. Pasta, Noodles & ...
 * 11. Baking Essentials
 * 12. Dry Fruits & Nuts
 * 13. Charcoal
 * 14. Non-Dairy
 * 15. Breakfast & Cereals
 * 16. Meat & Poultry
 */
export const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'cat-rice',
    name: 'Rice',
    imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=260&auto=format&fit=crop&q=80',
    section: 'Grocery & Kitchen',
    priorityOrder: 1,
    isActive: true,
  },
  {
    id: 'cat-daal',
    name: 'Daal',
    imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=260&auto=format&fit=crop&q=80',
    section: 'Grocery & Kitchen',
    priorityOrder: 2,
    isActive: true,
  },
  {
    id: 'cat-cooking-oil',
    name: 'Cooking Oil',
    imageUrl: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=260&auto=format&fit=crop&q=80',
    section: 'Grocery & Kitchen',
    priorityOrder: 3,
    isActive: true,
  },
  {
    id: 'cat-aata-maida',
    name: 'Aata, Maida & Other Flo...',
    imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=260&auto=format&fit=crop&q=80',
    section: 'Grocery & Kitchen',
    priorityOrder: 4,
    isActive: true,
  },
  {
    id: 'cat-tea-coffee',
    name: 'Tea & Coffee',
    imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=260&auto=format&fit=crop&q=80',
    section: 'Grocery & Kitchen',
    priorityOrder: 5,
    isActive: true,
  },
  {
    id: 'cat-geda-gudi',
    name: 'Geda Gudi',
    imageUrl: 'https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?w=260&auto=format&fit=crop&q=80',
    section: 'Grocery & Kitchen',
    priorityOrder: 6,
    isActive: true,
  },
  {
    id: 'cat-masala-papad',
    name: 'Masala, Papad & He...',
    imageUrl: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=260&auto=format&fit=crop&q=80',
    section: 'Grocery & Kitchen',
    priorityOrder: 7,
    isActive: true,
  },
  {
    id: 'cat-spreads-jams',
    name: 'Spreads & Jams',
    imageUrl: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=260&auto=format&fit=crop&q=80',
    section: 'Grocery & Kitchen',
    priorityOrder: 8,
    isActive: true,
  },
  {
    id: 'cat-ketchups-sauces',
    name: 'Ketchups, Sauces & P...',
    imageUrl: 'https://images.unsplash.com/photo-1607301406259-dfb186e15de8?w=260&auto=format&fit=crop&q=80',
    section: 'Grocery & Kitchen',
    priorityOrder: 9,
    isActive: true,
  },
  {
    id: 'cat-pasta-noodles',
    name: 'Pasta, Noodles & ...',
    imageUrl: 'https://images.unsplash.com/photo-1612927601601-6638404737ce?w=260&auto=format&fit=crop&q=80',
    section: 'Grocery & Kitchen',
    priorityOrder: 10,
    isActive: true,
  },
  {
    id: 'cat-baking-essentials',
    name: 'Baking Essentials',
    imageUrl: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=260&auto=format&fit=crop&q=80',
    section: 'Grocery & Kitchen',
    priorityOrder: 11,
    isActive: true,
  },
  {
    id: 'cat-dry-fruits',
    name: 'Dry Fruits & Nuts',
    imageUrl: 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=260&auto=format&fit=crop&q=80',
    section: 'Grocery & Kitchen',
    priorityOrder: 12,
    isActive: true,
  },
  {
    id: 'cat-charcoal',
    name: 'Charcoal',
    imageUrl: 'https://images.unsplash.com/photo-1542385151-efd9000785a0?w=260&auto=format&fit=crop&q=80',
    section: 'Grocery & Kitchen',
    priorityOrder: 13,
    isActive: true,
  },
  {
    id: 'cat-non-dairy',
    name: 'Non-Dairy',
    imageUrl: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=260&auto=format&fit=crop&q=80',
    section: 'Grocery & Kitchen',
    priorityOrder: 14,
    isActive: true,
  },
  {
    id: 'cat-breakfast-cereals',
    name: 'Breakfast & Cereals',
    imageUrl: 'https://images.unsplash.com/photo-1521483451569-e33803c0330c?w=260&auto=format&fit=crop&q=80',
    section: 'Grocery & Kitchen',
    priorityOrder: 15,
    isActive: true,
  },
  {
    id: 'cat-meat-poultry',
    name: 'Meat & Poultry',
    imageUrl: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=260&auto=format&fit=crop&q=80',
    section: 'Grocery & Kitchen',
    priorityOrder: 16,
    isActive: true,
  },
];

export const INITIAL_PRODUCTS: Product[] = [
  // Rice
  {
    id: 'prod-rice-1',
    name: 'Jeera Masino Fine Grain Rice',
    description: 'Aromatic fine slender grain Nepali rice, aged and polished for non-sticky fluffy cooking.',
    categoryId: 'cat-rice',
    unit: '5 kg',
    mrp: 650,
    sellingPrice: 580,
    discountPercent: 11,
    images: ['https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&auto=format&fit=crop&q=80'],
    inStock: true,
    isHidden: false,
    isBestseller: true,
    storeId: 'store-central',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-rice-2',
    name: 'Royal Himalayan Basmati Rice',
    description: 'Extra-long grain basmati rice with floral aroma.',
    categoryId: 'cat-rice',
    unit: '1 kg',
    mrp: 240,
    sellingPrice: 210,
    discountPercent: 12,
    images: ['https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&auto=format&fit=crop&q=80'],
    inStock: true,
    isHidden: false,
    isBestseller: false,
    storeId: 'store-central',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  // Daal
  {
    id: 'prod-daal-1',
    name: 'Pahari Yellow Moong Daal',
    description: 'Unpolished split moong lentils, rich in protein and easy to digest.',
    categoryId: 'cat-daal',
    unit: '1 kg',
    mrp: 180,
    sellingPrice: 155,
    discountPercent: 14,
    images: ['https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&auto=format&fit=crop&q=80'],
    inStock: true,
    isHidden: false,
    isBestseller: true,
    storeId: 'store-central',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  // Cooking Oil
  {
    id: 'prod-oil-1',
    name: 'Pure Kachi Ghani Mustard Oil (Tori ko Tel)',
    description: 'Cold pressed pungent mustard oil ideal for Nepali cooking and dal bhat.',
    categoryId: 'cat-cooking-oil',
    unit: '1 L',
    mrp: 310,
    sellingPrice: 275,
    discountPercent: 11,
    images: ['https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&auto=format&fit=crop&q=80'],
    inStock: true,
    isHidden: false,
    isBestseller: true,
    storeId: 'store-central',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  // Aata, Maida
  {
    id: 'prod-aata-1',
    name: 'Fortune Chakki Fresh Pure Wheat Atta',
    description: '100% whole grain wheat flour with zero maida. Absorbs more water for ultra-soft rotis.',
    categoryId: 'cat-aata-maida',
    unit: '5 kg',
    mrp: 470,
    sellingPrice: 420,
    discountPercent: 11,
    images: ['https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&auto=format&fit=crop&q=80'],
    inStock: true,
    isHidden: false,
    isBestseller: true,
    storeId: 'store-central',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  // Tea & Coffee
  {
    id: 'prod-tea-1',
    name: 'Ilam Orthodox Himalayan Black Tea',
    description: 'High-elevation whole-leaf orthodox black tea from eastern hills of Nepal.',
    categoryId: 'cat-tea-coffee',
    unit: '250 g',
    mrp: 320,
    sellingPrice: 280,
    discountPercent: 12,
    images: ['https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400&auto=format&fit=crop&q=80'],
    inStock: true,
    isHidden: false,
    isBestseller: true,
    storeId: 'store-central',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  // Pasta, Noodles
  {
    id: 'prod-noodles-1',
    name: 'Wai Wai Quick Chicken Noodles (Pack of 5)',
    description: 'Authentic Nepali ready-to-eat spiced instant noodles.',
    categoryId: 'cat-pasta-noodles',
    unit: '375 g',
    mrp: 150,
    sellingPrice: 130,
    discountPercent: 13,
    images: ['https://images.unsplash.com/photo-1612927601601-6638404737ce?w=400&auto=format&fit=crop&q=80'],
    inStock: true,
    isHidden: false,
    isBestseller: true,
    storeId: 'store-central',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-noodles-2',
    name: 'Current Hot & Spicy 2X Noodles',
    description: 'Extra fiery and spicy Nepali instant noodles for extreme chili lovers.',
    categoryId: 'cat-pasta-noodles',
    unit: '100 g',
    mrp: 60,
    sellingPrice: 50,
    discountPercent: 17,
    images: ['https://images.unsplash.com/photo-1612927601601-6638404737ce?w=400&auto=format&fit=crop&q=80'],
    inStock: true,
    isHidden: false,
    isBestseller: true,
    storeId: 'store-central',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  // Dry Fruits & Nuts
  {
    id: 'prod-nuts-1',
    name: 'California Almonds (Badam)',
    description: 'Premium whole natural crunchy almonds.',
    categoryId: 'cat-dry-fruits',
    unit: '250 g',
    mrp: 420,
    sellingPrice: 370,
    discountPercent: 12,
    images: ['https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=400&auto=format&fit=crop&q=80'],
    inStock: true,
    isHidden: false,
    isBestseller: true,
    storeId: 'store-central',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const INITIAL_USER: UserProfile = {
  uid: 'usr-demo-1',
  name: 'Bishal Sharma',
  phone: '+977 9812345678',
  addresses: [
    {
      id: 'addr-1',
      label: 'Home',
      fullAddress: 'Hetauda-4, School Road, Makwanpur',
      landmark: 'Near Bhutandevi Mandir',
      lat: 27.4287,
      lng: 85.0331,
    },
  ],
  defaultAddressId: 'addr-1',
  createdAt: new Date().toISOString(),
};
