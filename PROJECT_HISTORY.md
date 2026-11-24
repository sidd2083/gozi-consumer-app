# GOZI — 10-Minute Quick Commerce Engineering History & Architecture

## 1. Project Overview & Vision
- **Product:** **Gozi** — Dark-store 10-minute quick-commerce delivery platform in Nepal (Hetauda & Kathmandu).
- **Benchmark Design System:** Zepto & Blinkit visual ergonomics, speed, density, and conversion psychology.
- **Target Platform:** React Native (Expo SDK 58 / SDK 52+ compatible) with TypeScript.
- **Backend & Real-Time Sync:** Firebase Cloud Firestore & Firebase Storage with reactive subscriptions, paired with an automatic in-memory mock fallback mode for resilient offline/local testing.

---

## 2. Architecture & Directory Structure
```
gozi-consumer-app/
├── App.tsx                         # Main app root & auth gate orchestrator with BottomNavBar
├── package.json
├── src/
│   ├── types/                      # Single source of truth for TypeScript data contracts
│   │   └── index.ts                # AppConfig, UserProfile, Category, Product, Cart, Order, Rider
│   ├── constants/
│   │   └── theme.ts                # Zepto/Blinkit Anti-AI design tokens (Zero emojis, #0C831F green, #F3F4F6 canvas)
│   ├── services/
│   │   ├── firebase.ts             # Firebase web initialization (gozi-4d81e) with error-handled fallback
│   │   ├── authService.ts          # Session caching (AsyncStorage), test OTP verification ('123456'), Firestore user sync
│   │   └── dataService.ts          # Unified data access layer with onSnapshot subscriptions & mock fallbacks
│   ├── mock/
│   │   └── mockData.ts             # 14 categories across 3 sections, 25+ realistic Nepali products, demo user profile
│   ├── context/
│   │   ├── AppContext.tsx          # User profile, active doorstep address, dynamic appConfig (deliveryFee)
│   │   └── CartContext.tsx         # Cart calculations, persistent line totals, ADD/stepper state
│   ├── components/
│   │   ├── GoziLogo.tsx            # Crisp typographic and vector wordmark component with electric badge
│   │   ├── BottomNavBar.tsx        # Persistent 62px bottom tab bar (Home, Categories, Cart, Orders)
│   │   ├── AnimatedSearchBar.tsx   # Cycling upward keyword search pill (Zepto/Blinkit signature)
│   │   ├── ProductCard.tsx         # 2-line title, 110px image, discount tag, ADD / - 1 + stepper with haptics
│   │   ├── CategoryCard.tsx        # 4-col bento category grid tile (#F8FAFC soft white-shaded surface + drop shadow)
│   │   ├── FloatingCartBar.tsx     # Persistent bottom pill with overlapping thumbnails & View Cart CTA
│   │   ├── ProductDetailModal.tsx  # Bottom sheet with photo gallery, description, unit & stepper
│   │   └── AddressSelectorModal.tsx# GPS auto-location detection + manual doorstep address entry
│   ├── screens/
│   │   ├── SplashScreen.tsx        # High-contrast 1.5s branded splash screen
│   │   ├── OnboardingFlow.tsx      # Sequential Phone (+977) -> 6-digit OTP (123456) -> Name & GPS Location
│   │   ├── HomeScreen.tsx          # Rich scrollable Zepto storefront (Greeting, 3 sections, 4 shelves, 2-col grid)
│   │   ├── CategoriesTabScreen.tsx # Zepto split browser (Left vertical category rail + Right 2-column instant grid)
│   │   ├── CartScreen.tsx          # 10-min delivery badge, item list, bill breakdown, COD payment, place order
│   │   ├── OrdersTabScreen.tsx     # Live order tracking list & past order history with 1-tap Reorder
│   │   ├── SearchScreen.tsx        # Instant live filter as user types with empty states
│   │   ├── OrderTrackingScreen.tsx # Live Dark Store -> Rider -> Doorstep map route & onSnapshot progress
│   │   └── ProfileScreen.tsx       # User account details, editable name, and saved addresses
│   └── scripts/
│       └── seedDatabase.ts         # Seeding script for settings/appConfig, 14 categories & 25+ products
└── PROJECT_HISTORY.md
```

---

## 3. Key Architectural Decisions & Overhauls
1. **Mandatory Sequential Auth Gate (No Skipping):**
   - **Step 1:** Branded Splash Screen (1.5 seconds) checking `AsyncStorage` / Firestore session.
   - **Step 2:** Nepali Mobile Number Entry (`+977` prefix locked with Nepal flag badge, 10-digit validation starting with `98` or `97`).
   - **Step 3:** 6 individual auto-advancing numeric OTP boxes validating against test OTP `123456`.
   - **Step 4:** Full Name and doorstep address setup using `expo-location` GPS auto-detection + draggable/editable fields before unlocking the app.
2. **Zepto White-Shaded Visual Hierarchy & Depth:**
   - Soft white-shaded category surfaces (`#F8FAFC`, `borderRadius: 16`, border `#E6EAF2`, drop shadow `elevation: 2`).
   - Organized into 3 distinct sections: `Grocery & Kitchen`, `Snacks & Drinks`, and `Beauty, Skin Care & Household`.
   - 4 horizontal carousels (`Trending Products`, `Snacks & Late Night Cravings`, `Daily Morning Essentials`, `Beauty Picks`) + 2-column dense `Explore More Everyday Items` grid so scrolling feels substantial and complete.
3. **Industry-Standard Persistent Bottom Navigation Bar:**
   - 62px bottom bar with tabs: `Home`, `Categories` (Split-Screen Browser), `Cart` (with live item badge), and `Orders`.
   - Floating green "View Cart" summary pill floats above the bottom bar across screens when items are added.
4. **25+ Realistic Nepali Products with Real NPR (`Rs.`) Pricing:**
   - Includes staples like Wai Wai Quick, Current 2X, DDC Milk, Brown Eggs, Amul Butter, Jeera Masino Rice, Sharbati Atta, Lay's Classic, Dark Fantasy, KitKat, Coca-Cola 1.5L, Ilam Tea, Nivea Soft, Dettol Handwash, and Surf Excel.

---

## 4. Completed Milestones
- [x] Fixed navigation gate: `Splash (1.5s) -> Phone (+977) -> OTP (123456) -> Name + GPS Location -> Firestore Save -> Home`.
- [x] Created crisp typographic & vector logo component (`GoziLogo`).
- [x] Upgraded categories into 3 structured sections with white-shaded tiles and drop shadows.
- [x] Expanded catalog to 25+ authentic Nepali items across 4 horizontal shelves and 2-column grid.
- [x] Added persistent bottom tab navigation bar (`Home`, `Categories`, `Cart`, `Orders`).
- [x] Rebuilt Category Split-Screen browser with 82px vertical rail and 2-column product grid.
- [x] Real-time Firestore order tracking with simulated rider movement.
- [x] Clean TypeScript typecheck verification (`npx tsc --noEmit` exited 0).
