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

## 📋 Final Project Requirements Implementation Matrix

| Requirement | Points | Implementation Details |
| :--- | :--- | :--- |
| **1. Responsiveness** | 10 pts | Built with Bootstrap 5.3 + Flexbox + CSS Grid + custom media queries. Seamless display on mobile (320px+), tablet, and desktop without overflow. |
| **2. Hosting** | 5 pts | Hosted on GitHub Pages. Relative asset paths ensure 0 broken links or 404s. |
| **3. Light and Dark Modes** | 5 pts | Interactive **☀️ Light / 🌙 Dark** toggle switch in the navbar on every page. Persists across all pages in `localStorage` (`cafe-mania-theme`) with high-contrast, accessible palettes. |
| **4. Design & User Experience** | 20 pts | Warm specialty coffee palette (espresso `#3c221e`, latte cream `#fdfbf7`, amber accents). Clear visual hierarchy, accessible touch targets, and rich imagery. |
| **5.1. Authentication Simulation** | 10 pts | Simulates Sign Up & Log In via `localStorage` (`js/auth.js`). New signups receive 150 bonus beans. Valid login redirects to `profile.html` displaying user details, loyalty balance, and past orders. Navbar dynamically reflects auth state. |
| **5.2. Form Validation** | 10 pts | **Strictly NO HTML validation attributes** (`required`, `pattern`, `minlength`, `maxlength`, `min`, `max`, or `type="email"` are NOT used). All forms have `novalidate`. Pure JavaScript validator (`js/validation.js` & `js/checkout.js`) checks email regex, password length (8+) & complexity, required fields, and phone patterns with friendly on-page error messages. |
| **5.3. Search & Filtering** | 5 pts | Menu live search and category filters dynamically update results and save selections to `localStorage` (`cafe-mania-category`, `cafe-mania-search`). Users can bookmark favorite drinks (saved in `localStorage` and listed in `profile.html`). |
| **5.4. Animated Buttons & UI Effects** | 5 pts | Smooth hover transitions (`translateY(-2px)`, warm shadow glow), micro-click press (`scale(0.97)`), rotating add buttons, animated badge pulses, toast alerts, and skeleton loaders (`css/style.css`). |
| **7. External REST API Integration** | 10 pts | Integrated public **[SampleAPIs Coffee](https://api.sampleapis.com/coffee)** (`/hot` and `/iced`) using `fetch()` and `async/await`. Features visual loading spinner, error alert with retry button, temperature switcher, and curated offline fallback. |
| **8. Feature Cohesion & Theme** | 10 pts | Every single feature, microcopy, bonus system, and API integration directly supports the specialty coffee shop experience. |
| **10. Code Quality & Organization** | 5 pts | Structured directory layout matching requirements (`/css`, `/js`, `/images`). Modular code with comprehensive documentation and clean separation of concerns. |

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
