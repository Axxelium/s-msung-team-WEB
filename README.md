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

## Deploy
https://axxelium.github.io/s-msung-team-WEB/
