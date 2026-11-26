# GOZII — Quick Commerce Consumer Mobile App Architecture & History

## 1. Executive Summary & Brand Identity
- **Brand Name:** **Gozii** (double 'i')
- **Benchmark Quality:** Blinkit + Zepto visual density, coziness, speed, and conversion ergonomics.
- **Brand Identity & Color Tokens:**
  - **Primary Brand Green:** Exact teal-green extracted from the circular Gozii logo: `#27A98C` (dark `#1E8B72`, light `#E6F7F3`, subtle `#F0FAF7`).
  - **Accent Orange:** `#F26A1B` (derived from the 'g' glyph in the circular logo).
  - **Canvas & Surfaces:** Crisp white `#FFFFFF`, soft surface `#F8FAFC`, borders `#E5E7EB`.
  - **Zero Emojis Everywhere:** Zero emojis across UI labels, headers, buttons, or badges. Replaced 100% with crisp vector icons (`lucide-react-native` and `react-native-svg`).
  - **Zero Red on Commerce Surfaces:** Green-first badges, steppers, and active tabs.

---

## 2. Onboarding Flow
1. **Splash Screen (`SplashScreen.tsx`):**
   - Clean entrance animation displaying the circular Gozii logo with subtle scale and fade animation (`Animated.Value`), followed by the bold "Gozii" title and "Everything delivered in 10 mins" subtitle.
   - Smooth 1200ms transition into the active session or onboarding gate.
2. **Phone Number Screen (`OnboardingFlow.tsx`):**
   - Welcoming, decluttered layout with the circular Gozii logo.
   - **Nepal (`+977`) prefix box with custom SVG outline/icon of Nepal** (`NepalMapIcon.tsx`), 10-digit phone number input (validating 98/97 prefixes), and continue CTA.
3. **OTP Verification Screen:**
   - 6-digit numeric OTP input with auto-advance focus across boxes.
   - Test mode code supported: `123456`.
4. **Full Name & Location with Reverse Geocoding & Google Maps:**
   - Full Name text input.
   - **Auto GPS Detection & Reverse Geocoding:** Auto-detects GPS position on load and reverse-geocodes to a human-readable location name (e.g. `School Road, Hetauda-4`) using `expo-location`. **NEVER** displays raw latitude/longitude coordinates to the customer.
   - **Interactive Google Maps Pin Placement (`react-native-maps`):** User can tap to open an interactive Google Maps modal with a fixed center pin in Gozii teal-green, re-centering GPS button, dynamic reverse-geocoding of pinned coordinates into clean tole/street names, and 1-tap confirmation.
   - Profile saved to Firestore `users/{uid}` and persisted locally in `AsyncStorage` (`@gozi_user_session`).

---

## 3. Dark Store Geolocation & Dynamic ETA
- **Gozii Dark Store Coordinates:**
  - Location: Hetauda, Makwanpur, Nepal
  - Exact coordinates: `27°25'16.6"N 85°02'33.8"E` (`lat: 27.421278`, `lng: 85.042722`)
- **Haversine Distance & Dynamic ETA Calculation (`src/utils/geo.ts`):**
  - Haversine spherical distance formula calculates exact kilometers between the Dark Store and the customer's selected doorstep coordinates.
  - Dynamic ETA formula:
    $$\text{Total ETA (mins)} = \max\left(8, \operatorname{round}\left(5 + \text{distanceInKm} \times 2.5\right)\right)$$
    - 5 minutes base buffer (order intake, dark store picking & packing).
    - ~2.5 minutes per km transit speed in Hetauda urban & suburban streets.
    - Example: 1.5 km $\to$ 9-10 mins; 3.0 km $\to$ 12-13 mins.
- **Top Header Bar:**
  - Bold **Gozii** title with dynamic delivery time badge (e.g., `Delivery in 10 mins`, `Delivery in 12 mins`).
  - Active doorstep address row with `chevron-down` opening the address picker anytime.
  - Animated cycling search bar ("Search for Milk", "Search for Chocolate", etc.).

---

## 4. Blinkit-Inspired Header Fade Effect
- **Top-to-Bottom Fade Header (`FadeHeaderGradient.tsx`):**
  - Implemented via `react-native-svg` `<LinearGradient>`.
  - Starts with Gozii logo green `#27A98C` at the top (82% opacity) and smoothly fades downward through 48% and 14% into clean white canvas `#FFFFFF`.
  - Non-intrusive backdrop with `pointerEvents="none"`, providing a smooth, cozy visual transition without harsh solid lines.

---

## 5. Sections & 4 Categories Per Row (Text-Only)
- Under sections with categories, category tiles render **strictly 4 per row**:
  - Exact responsive width: `Math.floor((screenWidth - 28 - 18) / 4)`.
  - Clean, subtle cards (`backgroundColor: '#F8FAFC'`, `borderRadius: 12`, border `1px solid #E5E7EB`).
  - **Text only** (category names centered in 2 lines with bold 700 weight, ready for image integration in future phases).
- **Core Section & Category Structure:**
  1. **Grocery & Kitchen:** *Veg & Fruits*, *Atta, Rice & Dal*, *Oil, Ghee & Masala*, *Dairy, Bread & Eggs*, *Bakery & Biscuits*, *Dry Fruits & Cereals*, *Chicken, Meat & Fish*, *Kitchenware & Appliances*.
  2. **Snacks & Drinks:** *Chips & Namkeen*, *Sweets & Chocolates*, *Drinks & Juices*, *Tea, Coffee & Milk Drinks*, *Instant Food*, *Sauces & Jams*, *Ice Cream & Desserts*, *Toffee & Candies*.
  3. **Liquors & Smokes:** *Smokes*, *Liquors*.
  4. **Beauty & Personal Care:** *Bath & Body*, *Hair*, *Skin & Face*, *Beauty & Cosmetics*, *Feminine Hygiene*, *Baby Care*, *Sexual Wellness*, *Health & Pharma*.
  5. **Household Essentials & Stationery:** *Home & Lifestyle*, *Cleaners & Repellents*, *Stationery Items*, *Games*.
  6. **Curated Shelf Sections:** *Late Night Combos*, *Frozen Items*, *Trending Products*.
- **High-Demand Product Feed:** Prioritizes everyday staples first (cooking oil, iodized salt, fresh milk, sliced bread, farm eggs, chocolates, chilled cold drinks, instant noodles).

---

## 6. Category Split View & Product Detail
- **Categories Tab (`CategoriesTabScreen.tsx`):**
  - Displays sections and categories 4-in-a-row (text-only tiles) plus combo shelves.
  - Never dumps individual standalone products across the main categories root.
- **Inside a Category (`CategorySplitScreen.tsx`):**
  - **Left Sub-Category Rail:** Vertical rail with sub-categories for that category (e.g., for *Chips & Namkeen*: All, Potato Chips, Namkeen & Bhujia, Nachos, Popcorn) plus same-department sibling categories.
  - **Right Product Grid:** **Strict 2-column vertical grid** (`numColumns={2}`) with exact card width math `Math.floor((screenWidth - 80 - 28) / 2)`. **Zero horizontal product scrolling**.
  - Direct Add-to-Cart / stepper controls.
- **Product Detail Modal (`ProductDetailModal.tsx`):**
  - Blinkit-style bottom sheet layout: High-res product image, % OFF badge, pack size/unit badge, delivery assurance badge, bold title, pricing breakdown (`Rs.` selling price vs strike-through MRP), detailed product description, quality assurance badge, and sticky bottom stepper CTA.

---

## 7. Bottom Navigation & Floating Cart
- **Scroll-Aware Dock Navigation (`BottomNavBar.tsx`):**
  - Curved floating dock menu (`borderRadius: 28`, elevated with soft natural shadow).
  - Slides down smoothly out of view on scroll down (`translateY: 100`, duration: 220ms) for an open browsing experience.
  - Slides back up smoothly when scrolling up or near the top of the feed (`translateY: 0`).
  - Active tab and cart count badge highlighted in Gozii brand teal-green (`#27A98C`).
- **Single Floating Cart Indicator (`FloatingCartBar.tsx`):**
  - Displays exactly one persistent floating cart bar across the app when `totalItems > 0` (slides synchronously with the dock).
  - Shows thumbnail previews, item count, total `Rs.`, and 1-tap "View Cart" checkout trigger.
- **Smart Loading State (`SmartLoader.tsx`):**
  - Ultra-fast responses (< 250ms) render immediately with zero loading screen flicker.
  - Only when a query/operation takes noticeable time (> 250ms), smoothly fades in a clean vector motion pulse with the exact message: *"Everything at your doorstep in 10 mins"*.

---

## 8. Firestore Quota & Performance Optimization
- **Cache-First Instant Catalog Load (`dataService.ts`):**
  - Persists categories and products locally in `AsyncStorage` (`@gozii_catalog_categories`, `@gozii_catalog_products`).
  - On app launch, catalog renders immediately from memory/cache in `< 10ms`.
  - Simultaneously reads 1 tiny document from Firestore: `settings/appConfig`.
  - Compares `appConfig.catalogVersion` against local `@gozii_catalog_ver`. If identical, zero product/category reads are consumed.
  - If `catalogVersion` is bumped (e.g., from the Admin Panel), fresh catalog documents are retrieved, cached locally, and listeners are notified.
- **Targeted Subscriptions & Pagination:**
  - Queries are scoped by `categoryId` and filtered by `isHidden == false`.
  - Unnecessary listeners are unsubscribed on screen unmount.

---

## 9. Verification & Build Status
- **TypeScript:** `npx tsc --noEmit` compiles cleanly with **0 errors**.
- **Vector Icons:** 100% clean vector icons (`lucide-react-native`, `react-native-svg`), 0 UI emojis.
- **Repository:** Synchronized on branch `main` at `https://github.com/sidd2083/gozi-consumer-app`.
