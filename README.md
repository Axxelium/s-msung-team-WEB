# Cafe Mania — Website

A small responsive cafe website

## Pages
- `index.html` — home page (hero + guest favorites)
- `menu.html` — menu with category sidebar
- `about.html` — our story, team, atmosphere gallery, hours
- `cart.html` — shopping cart
- `checkout.html` — checkout form
- `responsive.html` — Assignment 3 Part 1 demo (media queries only, no Bootstrap)
- `confirmation.html` — order confirmation

## Assignment 2 (Flexbox & Grid) — where each task lives
- **Task 1, Flexbox navbar:** `#main-header .topbar` on every page (logo left, links right).
- **Task 2, Flexbox card row:** `.card-grid` on `index.html` — equal-height cards with a lift/shadow hover effect.
- **Task 3, Grid Areas layout:** `.menu-layout` on `menu.html` — `grid-template-areas` with header / sidebar / main / footer, sidebar holds category filters + kitchen hours.
- **Task 4, Image gallery:** `.gallery-grid` on `about.html` — 9-photo grid with a caption overlay on hover.

## Assignment 3 (Media Queries + Bootstrap) — where each task lives
- **Task 1, responsive typography:** media queries at 576px / 992px at the end of `css/style.css` (`h1`–`h3`, body text).
- **Task 2, card group (no Bootstrap):** `.mq-cards` in `css/media-queries.css`, page `responsive.html` — 3 / 2 / 1 cards per row.
- **Task 3, grid:** `container` + `row` / `col-*` on every page (hero `col-lg-6`, cards `col-lg-4` via `row-cols-lg-3`, cart/checkout `col-lg-8` + `col-lg-4`, menu sidebar `col-lg-3` + `col-lg-9`).
- **Task 4, spacing:** `m-*`, `p-*`, `gap-*` utilities, with responsive ones such as `mt-lg-4`, `pt-md-5`, `p-sm-4`.
- **Task 5, navbar:** `navbar navbar-expand-md` with `navbar-toggler` on every page (4 links: Home, Menu, About, Cart).
- **Task 6, buttons:** `btn-primary`, `btn-secondary`, `btn-outline-primary`, `btn-lg`, `btn-sm`; `btn-group` for the collection method in `cart.html`.
- **Task 7, carousel:** 9 slides with indicators and controls in `about.html`.
- **Task 8, cards:** Bootstrap `card` in a `row-cols-*` grid on `index.html` and `menu.html` (`card-deck` no longer exists in Bootstrap 5).
- **Task 9, form:** `form-control`, `form-select`, `input-group`, `form-check` in `checkout.html`.
- **Task 10, accessibility:** semantic `<nav>`, `<button>`, labels, `aria-*`, alt texts, `visually-hidden` control labels.

## Team
Aidos, Arnur, Mukhammajon.

## Assignment 5 — Part 1

Cafe Mania now has a connected menu → cart → three-step checkout → confirmation flow.
This is a browser-only student demo: no payment, account registration, real order or message delivery takes place.
Use a local static server for consistent storage across pages, for example `python -m http.server 8000`, then open `http://localhost:8000`.
No build step, Node.js package installation or `.cjs` files are required to run the website.

### Where each requirement lives

| Requirement | Implementation | How to demonstrate |
| --- | --- | --- |
| Select and modify DOM elements | `js/shop.js`: `productCard`, product grid, cart rows; `js/checkout.js`: summaries | Add an item and change its quantity; the badge and totals update. |
| Dynamic styles | `script.js`: `applyTheme`; CSS transitions | Click Change theme: light → dark → green → blue → red. The choice is remembered. |
| Manipulating attributes — chosen option: rating stars | `js/confirmation.js`: `renderRating`, `querySelectorAll`, classes and `aria-pressed` | Complete a demo order, select 1–5 stars and reload; the local rating remains. |
| Click event listeners | `js/shop.js`: add/remove/quantity buttons and category filters | Click Coffee, add Cappuccino, then increase/remove it in Cart. |
| Keyboard events | `js/site-ui.js`: navigation `keydown` handler | Tab to Home, use arrows to move between links, then Enter. Home/End also work. On mobile open the menu first. |
| Callbacks — chosen option: multi-step form | `js/checkout.js`: `changeStep(index, onStepChange)` invokes the `renderStep` callback | Next validates the current step; Back preserves entered values. Final submission validates all applicable fields. |
| Switch statement | `js/shop.js`: `productsFor(category)` | Filter All, Coffee, Breakfast, Bakery, Lunch and Tea. |
| Objects and methods | `js/catalog.js`: product objects; `js/cart.js`: cart object with `add`, `remove`, `setQuantity`, `subtotal`, `total` | Quantity changes recalculate prices; pickup removes the 700 ₸ delivery fee. |
| Arrays and loops | `js/catalog.js`: products; `js/shop.js`: `for…of` card/row rendering | Each product object becomes a card; the same catalog supplies every page. |
| Higher-order functions | `filter`, `map`, `reduce`, `forEach`; `changeStep` | Explain the category predicate, total accumulator and step-render callback. |
| Sounds | `js/site-ui.js`: `playAddSound` using Web Audio | Adding an item plays a short tone. Sound on/off is in the footer. A busy guard prevents overlapping sounds. |
| Event-triggered animations | `css/style.css`: `content-enter`, `badge-pop`, theme transitions | Filter products, add to cart, change checkout steps or switch themes. Reduced-motion preferences disable animation. |
| Separation of concerns | HTML for structure, CSS for appearance, ordinary external JS files for behavior | No inline event handlers or embedded scripts. Runtime package-color preview demonstrates `style.backgroundColor`. |
| Theme integration and UX | Existing Cafe Mania cards, imagery, colors and language | Follow one complete order journey on desktop, mobile, and using the keyboard. |

### JavaScript responsibilities

- `script.js`: existing FAQ accordion, contact popup, toast, theme cycle and clock.
- `js/catalog.js`: catalog data, money formatting and safe element creation.
- `js/cart.js`: cart state, calculations, storage validation and demo order snapshot.
- `js/site-ui.js`: badges, keyboard navigation, sound preference and modal focus handling.
- `js/shop.js`: menu/favorites rendering, filters and cart controls.
- `js/checkout.js`: field validation, callbacks, step state and order review.
- `js/confirmation.js`: actual order summary and local rating.

### Behavior and edge cases

- A new visitor starts with an empty cart. Quantities range from 1 to 99; decreasing 1 removes the item.
- Delivery costs 700 ₸ for a non-empty order; pickup is free. Catalog prices are integers in tenge.
- Cart, collection method, theme and sound preference survive reloads. The cart uses session storage if local storage is unavailable.
- Malformed stored cart entries are ignored; unknown products and invalid quantities cannot affect totals.
- Empty carts cannot be checked out. Opening confirmation before placing an order shows a link to the menu.
- Checkout preserves values between steps. Delivery requires an address; pickup does not. A final check returns focus to the first invalid field on its step.
- Passwords and contact details are never written to browser storage or the URL. They are cleared when the demo order is completed.
- Only product IDs, quantities, collection method, totals, timestamp, order ID and local rating are stored in the order snapshot. Order notes and contact details are not sent anywhere.
- With storage blocked or full, the page remains usable and explains when the cart/order cannot be saved.
- Existing Assignment 4 validation, FAQ, contact popup and live clock are retained. Contact form submission is a local demonstration; the Assignment 5 callback requirement uses the multi-step checkout option.

### Suggested defense walkthrough

1. Filter the menu and explain `switch`, the product objects and `filter`.
2. Add two different products, change quantity, and compare delivery with pickup.
3. Try Next with missing fields, then finish each checkout step. Go Back to show state preservation.
4. Try a weak password and mismatched confirmation, then complete the demo order.
5. Select a rating and show its changed classes, text and `aria-pressed` attribute.
6. Demonstrate arrow-key navigation, the sound toggle, animations and the five themes.
7. Open FAQ/contact popup and show that Assignment 4 features still work.

Part 2 deployment and the submission report/ZIP are separate from this implementation.

### Verification

Checked in Microsoft Edge on 2026-10-29 with desktop (1440px) and mobile-sized (390px / 320px) windows:

- Complete delivery and pickup flows, category counts, quantity changes, delivery fees and matching totals across pages.
- Missing/invalid fields, weak passwords, mismatched confirmation, Back/Next state and final validation of earlier steps.
- Cart persistence and cross-tab updates, empty cart/confirmation, malformed storage, quantity limits, storage failure and session-storage fallback.
- Rating persistence, navigation focus, sound generation/mute/non-overlap, theme cycle and reduced-motion behavior.
- Existing FAQ, popup and clock; no JavaScript errors, missing local assets or duplicate IDs in the checked pages.

Mobile checks use browser viewport emulation; physical devices and other browser engines have not been verified.

## Deploy
https://axxelium.github.io/s-msung-team-WEB/
