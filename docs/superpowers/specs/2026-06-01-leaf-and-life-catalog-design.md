# Leaf & Life — Product Catalog Website Design

**Date:** 2026-06-01
**Status:** Approved

---

## Overview

A static product catalog website for **Leaf & Life**, a pots and planters nursery based in Kelambakkam, Chennai. Customers browse products by category, add items to a cart, and send their order directly via WhatsApp. No payment gateway. Retail only.

---

## Stack

| Concern | Choice |
|---|---|
| Framework | Astro (static site generator) |
| Hosting | Netlify (auto-deploy on git push) |
| Version control | GitHub |
| Styling | Vanilla CSS (no Tailwind, no CSS-in-JS) |
| Cart state | `localStorage` (client-side JS) |
| Product data | `src/data/products.json` |

---

## Repository Structure

```
leaf-and-life/
├── src/
│   ├── pages/
│   │   └── index.astro             # single catalog page
│   ├── components/
│   │   ├── Header.astro
│   │   ├── CategoryTabs.astro
│   │   ├── ProductCard.astro
│   │   ├── ProductGrid.astro
│   │   └── CartDrawer.astro
│   ├── data/
│   │   └── products.json           # single source of truth for all products
│   └── styles/
│       └── global.css
├── public/
│   └── images/                     # all product PNGs (descriptively named)
├── astro.config.mjs
└── package.json
```

---

## Product Data Schema

`src/data/products.json` — an array of product objects:

```json
[
  {
    "id": "round-hanging-balcony-planter",
    "name": "Round Hanging Balcony Planter",
    "category": "plastic",
    "sizes": ["7cm width / 6.5cm height"],
    "price": 0,
    "image": "round-hanging-balcony-planter.png",
    "colors": ["lavender", "beige", "purple", "red", "white"]
  }
]
```

**Fields:**
- `id` — URL-safe slug, unique
- `name` — display name
- `category` — one of `"plastic"`, `"ceramic"`, `"fiber"`
- `sizes` — array of size strings shown as selectable options
- `price` — number in INR (₹); set to `0` initially, owner fills in before launch
- `image` — filename in `public/images/`
- `colors` — optional array of color variant names (display only, not selectable)

**Adding a product:** Add one object to the array, drop the image in `public/images/`, push to GitHub.

**Updating a price:** Change the `price` field, push to GitHub.

---

## Pages & Layout

Single page — no routing.

### Header
- Leaf & Life logo (text + leaf emoji fallback until brand assets added)
- Tagline: "Add Life to Your Space"
- Cart icon (top-right) with item count badge

### Category Tabs
- Three tabs: `Plastic | Ceramic | Fiber`
- Underline-style active indicator
- Clicking a tab filters the product grid client-side (no page reload)
- Default: "Plastic" tab active on load

### Product Grid
- 3 columns desktop / 2 columns tablet / 1 column mobile
- Each **ProductCard** shows:
  - Product image (object-fit: cover, consistent height)
  - Product name
  - Size options (dropdown if multiple sizes, plain text if one)
  - Color variants (text list, e.g. "Available in: red, white, blue")
  - Price (₹XX or "Price TBD" if 0)
  - "Add to Cart" button (green)

### Cart Drawer
- Triggered by the cart icon in the header
- Clicking "Add to Cart" adds the item silently and animates the cart badge (does NOT auto-open the drawer)
- Slides in from the right; rest of page gets dark overlay
- Lists added items: name, selected size, quantity (+/− controls), line total
- "Remove" link per item
- Order total at bottom
- "Send Order on WhatsApp" button (disabled + tooltip if cart empty)
- Full-screen on mobile

### Footer
- Phone: +91 99420 93711
- Instagram: @leafandlifenursery
- Email: leafandlifenursery@gmail.com
- Address: Kelambakkam, Chennai – 603103

---

## WhatsApp Integration

**Number:** +91 99420 93711 → `919942093711`

**Trigger:** "Send Order on WhatsApp" button in cart drawer.

**Message format:**
```
Hello Leaf & Life! 🌿

I'd like to order the following:

1. Round Hanging Balcony Planter – 7cm – ₹149 x 2
2. Square Premium Planter – 10" – ₹299 x 1

Total items: 3
Total: ₹597

Please confirm availability and delivery details.
```

**Implementation:** `window.open('https://wa.me/919942093711?text=' + encodeURIComponent(message))`

**Post-send UX:** Confirmation banner "Your order was sent! We'll get back to you shortly." + "Clear Cart" button.

**Empty cart:** WhatsApp button is disabled with `title="Add items to your cart first"`.

---

## Visual Design

### Color Palette
| Token | Value | Usage |
|---|---|---|
| Background | `#FAFAF7` | Page background |
| Surface | `#FFFFFF` | Cards, drawer |
| Primary | `#4A7C59` | Buttons, active tab, accents |
| Secondary | `#C2714F` | Hover states, price, badge |
| Text | `#1C1C1C` | Body text |
| Muted | `#6B7280` | Sizes, secondary labels |
| Border | `#E5E7EB` | Card borders, dividers |

### Typography
- Headings: `Playfair Display` (Google Fonts)
- UI/Body: `Inter` (Google Fonts)

### Interactions
- Card hover: `translateY(-4px)` + shadow increase
- "Add to Cart": brief green pulse animation on click
- Cart icon: badge animates (scale bounce) when item added
- Drawer: `transform: translateX(100%)` → `translateX(0)` slide

---

## Cart State (localStorage)

Key: `leaf-and-life-cart`

Shape:
```json
[
  {
    "id": "round-hanging-balcony-planter",
    "name": "Round Hanging Balcony Planter",
    "size": "7cm width / 6.5cm height",
    "price": 149,
    "quantity": 2
  }
]
```

Cart is read on page load and synced to `localStorage` on every change.

---

## Image Handling

- Source: 33 PNGs extracted from PDF at `/Users/balajrajendran/Downloads/Test_images/`
- img-000.png is the brand logo
- img-001 to img-032 are product images (mapped to descriptive names during implementation)
- Images are copied to `public/images/` with descriptive filenames matching `products.json`
- No image optimization pipeline needed for initial launch (Netlify serves them as-is)

---

## Out of Scope

- Payment gateway
- User accounts / order history
- Combo offers
- Wholesale flow
- CMS / admin panel
- Search / filtering beyond category tabs
- Product detail pages

---

## Launch Checklist

- [ ] Fill in all `price` fields in `products.json`
- [ ] Verify WhatsApp number receives test message
- [ ] Connect GitHub repo to Netlify
- [ ] Set custom domain (if any)
- [ ] Test cart flow on mobile (WhatsApp opens correctly on phone)
