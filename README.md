# Cafe Mania — Specialty Coffee House (Final Project)

A multi-page responsive web platform for a modern specialty coffee shop in Astana.

**Live Demo:** [https://axxelium.github.io/s-msung-team-WEB/](https://axxelium.github.io/s-msung-team-WEB/)  
**Team Members:** Aidos, Arnur, Mukhammajon  
**Project Topic:** Specialty Coffee Shop & Bakery ("Cafe Mania")

---

## ☕ Connected Pages (9 functional pages)

1. `index.html` — Home page with hero, live clock, animated counters, guest favorites, FAQ accordion, clipboard copy, and contact modal.
2. `menu.html` — Full coffee & food menu with category filtering, live autocomplete search, and **Live World Specialty Coffee REST API Explorer**.
3. `about.html` — Our story, barista team profiles, atmosphere photo gallery, and kitchen hours.
4. `cart.html` — Interactive shopping cart with live calculations, promo code, and collection method selection.
5. `checkout.html` — 3-step checkout form with pure JavaScript validation and auto-fill for logged-in members.
6. `confirmation.html` — Order confirmation with summary, dynamic order tracking status, and interactive 5-star rating.
7. `login.html` — Authentication simulation with dual tabs for **Log In** and **Sign Up** using pure JS validation and `localStorage`.
8. `profile.html` — User Profile with stored details, digital "Gold Bean Club" loyalty card, saved favorite coffees, order history, and logout.
9. `responsive.html` — Media Queries and responsive typography demonstration page.

---


## 📁 File Structure

```
s-msung-team-WEB-main/
├── index.html              # Home page
├── menu.html               # Menu & Live Coffee API
├── about.html              # About & Team
├── cart.html               # Shopping Cart
├── checkout.html           # 3-Step Checkout Form
├── confirmation.html       # Order Confirmation & Rating
├── login.html              # Sign In & Sign Up Form
├── profile.html            # User Profile & Loyalty
├── responsive.html         # Pure Media Queries Demo
├── README.md               # Project Documentation
├── script.js               # Forwarding shim for backward compatibility
├── css/
│   ├── style.css           # Core stylesheet, light/dark themes, animations
│   └── media-queries.css   # Custom responsive breakpoints
├── js/
│   ├── api.js              # External SampleAPIs Coffee REST API integration
│   ├── auth.js             # Authentication simulation & localStorage user state
│   ├── validation.js       # Pure JavaScript form validation engine
│   ├── catalog.js          # Coffee shop product data & formatters
│   ├── cart.js             # Cart state, discount logic, and order snapshot
│   ├── site-ui.js          # Accessibility, sound toggle, and UI helpers
│   ├── shop.js             # Menu grid rendering & category filters
│   ├── checkout.js         # Multi-step checkout validation & review
│   ├── confirmation.js     # Order summary & interactive star rating
│   ├── script.js           # FAQ accordion, contact modal, toast, theme switch
│   └── assignment6.js      # jQuery live search, counters, and scroll progress
└── images/                 # Optimized images for products, team, and cafe
```
