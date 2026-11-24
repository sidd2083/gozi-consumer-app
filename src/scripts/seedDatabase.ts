/**
 * Gozi Dark Store Database Seeder (Updated with 3 Sectioned Categories & 25+ Products)
 * 
 * Run via: npx ts-node src/scripts/seedDatabase.ts
 * 
 * Populates:
 * 1. settings/appConfig (deliveryFee: 0 default)
 * 2. categories (14 categories across Grocery & Kitchen, Snacks & Drinks, Beauty & Household)
 * 3. products (25+ realistic Nepali everyday essentials with real NPR Rs. prices)
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { INITIAL_APP_CONFIG, INITIAL_CATEGORIES, INITIAL_PRODUCTS } from '../mock/mockData';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "AIzaSyDkyo7HCnxjlNUdTWenoNsHWDboecAHgdM",
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || "gozi-4d81e.firebaseapp.com",
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "gozi-4d81e",
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || "gozi-4d81e.firebasestorage.app",
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "238036732699",
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || "1:238036732699:web:43efbdb9c1b906c1e5e1be",
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-VSQ6HCN72V"
};

async function seed() {
  console.log('🚀 Starting Gozi Database Seeding to Firestore:', firebaseConfig.projectId);

  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  try {
    // 1. Seed App Config
    console.log('📦 Seeding settings/appConfig...');
    await setDoc(doc(db, 'settings', 'appConfig'), INITIAL_APP_CONFIG);
    console.log('✅ settings/appConfig seeded successfully!');

    // 2. Seed 16 Categories across departments
    console.log('📂 Seeding Categories across departments...');
    for (const cat of INITIAL_CATEGORIES) {
      await setDoc(doc(db, 'categories', cat.id), cat);
      console.log(`  -> [${cat.department}] ${cat.name} (Priority: ${cat.priorityOrder})`);
    }
    console.log('✅ All categories seeded successfully!');

    // 3. Seed Products
    console.log('🛒 Seeding Products...');
    for (const prod of INITIAL_PRODUCTS) {
      await setDoc(doc(db, 'products', prod.id), prod);
      console.log(`  -> Product: ${prod.name} | Rs. ${prod.sellingPrice} (Dept: ${prod.department})`);
    }
    console.log('✅ All products seeded successfully!');

    console.log('\n🎉 GOZI FIRESTORE SEEDING COMPLETED CLEANLY!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seed();
