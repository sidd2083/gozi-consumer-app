# GOZI — 10-Minute Quick Commerce Engineering History & Architecture

## 1. Project Overview & Vision
- **Product:** **Gozi** — Dark-store 10-minute quick-commerce delivery platform in Nepal.
- **Benchmark Quality:** Zepto & Blinkit visual ergonomics, speed, density, and conversion psychology.
- **Brand Palette:**
  - Exact logo green shade: `#38B29C` / `#2C8E7C`
  - Logo accent orange: `#FF6B35`
  - Zero red on navigation or icons.
  - Pre-home screens: full Gozi green canvas.
  - Home screen & catalog: pure clean white canvas (`#FFFFFF`).

---

## 2. Completed Architecture & Refinements

### A. Scroll-Reactive Floating Curved Dock Menu
- **Floating Curved Dock:** Rounded pill (`borderRadius: 29`, margin horizontal: 20px, subtle shadow, elevated above bottom edge).
- **Zepto Scroll Reactivity:**
  - When scrolling **down**, the floating menu and floating cart bar smoothly slide down out of view for an immersive reading/shopping experience.
  - When scrolling **up** or near the top, the floating menu smoothly slides back up.
- **Brand Theming:** Active tabs and cart count badge are strictly colored in Gozi green (`#38B29C`), completely removing legacy red styles.

### B. Home Screen Hierarchy & Department Flow
1. **Top Header:** `Hi, {FirstName}` + `10 mins` delivery time badge + active address dropdown + Profile button + Cycling search bar.
2. **Top Hierarchy — Trending Items First:** Prominently displays high-demand items right at the top for instant 1-tap `ADD` / `- 1 +` access.
3. **Core Department Blocks:** Each department features a bold heading, 4-column categories underneath, followed by products inside those categories:
   - **`Grocery & Kitchen`** (Rice & Grains, Daal & Pulses, Cooking Oil & Ghee, Atta & Flours)
   - **`Snacks & Drinks`** (Chips & Namkeen, Chocolates & Sweets, Biscuits & Cookies, Instant Noodles)
   - **`Beverages & Smokes`** (Chilled Sodas, Tea & Coffee, Energy Drinks, Rolls & Accessories)
   - **`Late Night Craving Combo`** (Curated bundle sets only, such as Midnight Gamer Set & Movie Night Munch Pack)
   - **`Beauty & Personal Care`** (Skin & Face Care, Hair & Daily Hygiene)
4. **Continuous Endless Scroll Feed (`Recommended & More For You`):**
   - Seamlessly transitions into a 2-column infinite product feed sorted by popularity, relevance, and in-stock status so users can keep browsing naturally without hitting a dead end.

### C. Category Page Grid Fix (Max 2 Columns, Zero Overflow)
- When opening any category, products are rendered in a **strict, responsive 2-column grid** calculated via `(screenWidth - 80 - 28) / 2`.
- Every card fits 100% inside the viewport on any screen size with zero horizontal overflow or clipping.

---

## 3. Git Status
- Committed to local branch `main` in `C:\Users\Admin\.gemini\antigravity\scratch\gozi-consumer-app`.
- Production `firestore.rules` document included.
- Clean TypeScript check: `npx tsc --noEmit` exited code 0.
