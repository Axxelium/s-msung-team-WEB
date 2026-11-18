document.addEventListener('DOMContentLoaded', () => {
  'use strict';
  const app = window.CafeMania;
  const { element, money, cart } = app;
  const grid = document.getElementById('product-grid');
  const favorites = document.getElementById('favorites-grid');

  function isProductFavorite(product) {
    try {
      const favs = JSON.parse(localStorage.getItem('cafe-mania-favorites') || '[]');
      return favs.some(f => f.id === product.id || f.title.toLowerCase() === product.name.toLowerCase());
    } catch (_) { return false; }
  }

  function productCard(product) {
    const column = element('div', 'col product-entry');
    const card = element('article', 'card h-100 position-relative');
    const image = element('img', 'card-img-top');
    image.dataset.lazySrc = product.image;
    image.classList.add('lazy-image');
    image.alt = product.name;
    image.loading = 'lazy';

    // Heart favorite button on menu card
    const isFav = isProductFavorite(product);
    const favBtn = element('button', `btn btn-sm position-absolute top-0 end-0 m-2 rounded-circle border-0 shadow-sm btn-menu-fav ${isFav ? 'btn-danger text-white' : 'btn-light text-muted'}`);
    favBtn.type = 'button';
    favBtn.innerHTML = isFav ? '❤️' : '🤍';
    favBtn.dataset.favProduct = product.id;
    favBtn.setAttribute('aria-label', `Favorite ${product.name}`);
    favBtn.style.width = '34px';
    favBtn.style.height = '34px';
    favBtn.style.display = 'flex';
    favBtn.style.alignItems = 'center';
    favBtn.style.justifyContent = 'center';
    favBtn.style.zIndex = '5';
    favBtn.style.transition = 'transform 0.2s ease, background 0.2s ease';

    const body = element('div', 'card-body d-flex flex-column p-3');
    body.append(element('h3', 'card-title', product.name), element('p', 'card-text', product.description));
    const price = element('div', 'price-line d-flex justify-content-between align-items-center mt-auto pt-3 gap-2');
    const add = element('button', 'btn btn-primary btn-round rounded-circle p-0', '＋');
    add.type = 'button';
    add.dataset.addProduct = product.id;
    add.setAttribute('aria-label', `Add ${product.name} to cart`);
    price.append(element('span', '', money(product.price)), add);
    body.append(price);
    card.append(favBtn, image, body);
    column.append(card);
    return column;
  }

  function productsFor(category) {
    switch (category) {
      case 'coffee': return app.products.filter((product) => product.category === 'coffee');
      case 'breakfast': return app.products.filter((product) => product.category === 'breakfast');
      case 'bakery': return app.products.filter((product) => product.category === 'bakery');
      case 'lunch': return app.products.filter((product) => product.category === 'lunch');
      case 'tea': return app.products.filter((product) => product.category === 'tea');
      default: return app.products;
    }
  }

  if (grid) {
    const filters = [...document.querySelectorAll('[data-category]')];
    const renderProducts = (category) => {
      const products = productsFor(category);
      const fragment = document.createDocumentFragment();
      for (const product of products) fragment.append(productCard(product));
      grid.replaceChildren(fragment);
      filters.forEach((button) => {
        const active = button.dataset.category === category;
        button.classList.toggle('is-active', active);
        button.setAttribute('aria-pressed', String(active));
      });
      const selected = filters.find((button) => button.dataset.category === category);
      grid.dataset.currentCategory = category;
      try { localStorage.setItem('cafe-mania-category', category); } catch (_) {}
      const resultsEl = document.getElementById('menu-results');
      if (resultsEl && selected) {
        resultsEl.textContent = `${selected.textContent} · ${products.length} ${products.length === 1 ? 'item' : 'items'}`;
      }
    };
    filters.forEach((button) => button.addEventListener('click', () => renderProducts(button.dataset.category)));
    let initialCategory = 'all';
    try {
      const savedCategory = localStorage.getItem('cafe-mania-category');
      if (savedCategory && filters.some(b => b.dataset.category === savedCategory)) {
        initialCategory = savedCategory;
      }
    } catch (_) {}
    renderProducts(initialCategory);
  }

  if (favorites) {
    for (const id of ['morning-set', 'mania-brunch', 'berry-puff']) favorites.append(productCard(app.productById(id)));
  }

  document.addEventListener('click', (event) => {
    // Favorite heart toggle on menu cards
    const favBtn = event.target.closest('[data-fav-product]');
    if (favBtn) {
      event.preventDefault();
      event.stopPropagation();
      const pId = favBtn.dataset.favProduct;
      const product = app.productById(pId);
      if (!product) return;
      let favs = [];
      try { favs = JSON.parse(localStorage.getItem('cafe-mania-favorites') || '[]'); } catch (_) {}
      const existingIdx = favs.findIndex(f => f.id === product.id || f.title.toLowerCase() === product.name.toLowerCase());
      if (existingIdx >= 0) {
        favs.splice(existingIdx, 1);
        favBtn.innerHTML = '🤍';
        favBtn.className = 'btn btn-sm position-absolute top-0 end-0 m-2 rounded-circle border-0 shadow-sm btn-menu-fav btn-light text-muted';
        app.showToast(`Removed ${product.name} from favorites`);
      } else {
        favs.push({
          id: product.id,
          title: product.name,
          description: product.description,
          image: product.image,
          ingredients: ['Cafe Mania house specialty']
        });
        favBtn.innerHTML = '❤️';
        favBtn.className = 'btn btn-sm position-absolute top-0 end-0 m-2 rounded-circle border-0 shadow-sm btn-menu-fav btn-danger text-white';
        favBtn.style.transform = 'scale(1.25)';
        setTimeout(() => { favBtn.style.transform = 'scale(1)'; }, 200);
        app.showToast(`Saved ${product.name} to favorites! ❤️`);
      }
      try { localStorage.setItem('cafe-mania-favorites', JSON.stringify(favs)); } catch (_) {}
      return;
    }

    // Add to cart button
    const button = event.target.closest('[data-add-product]');
    if (!button) return;
    const product = app.productById(button.dataset.addProduct);
    if (cart.add(product.id)) {
      app.showToast(`${product.name} added to your cart.`);
      app.playAddSound();
      app.animateBadge();
      button.style.transform = 'scale(1.2)';
      setTimeout(() => { button.style.transform = 'scale(1)'; }, 200);
    } else app.showToast('You can add up to 99 of each item.');
  });

  const cartItems = document.getElementById('cart-items');
  if (!cartItems) return;
  function renderCart() {
    const active = document.activeElement;
    const focusId = active?.dataset.itemId;
    const focusAction = active?.dataset.cartAction;
    const oldIndex = [...cartItems.children].indexOf(active?.closest('article'));
    cartItems.replaceChildren();
    for (const item of cart.items) {
      const product = app.productById(item.id);
      const row = element('article', 'cart-item d-flex flex-wrap align-items-center gap-3 p-3');
      const image = element('img');
      image.src = product.image;
      image.alt = product.name;
      const info = element('div', 'cart-product-info flex-grow-1');
      info.append(element('h3', 'mb-1', product.name), element('p', 'mb-2 small', `${money(product.price)} each`));
      const controls = element('div', 'd-flex align-items-center flex-wrap gap-2');
      const makeButton = (action, label, text) => {
        const button = element('button', 'btn btn-outline-primary btn-sm quantity-button', text);
        button.type = 'button';
        button.dataset.cartAction = action;
        button.dataset.itemId = item.id;
        button.setAttribute('aria-label', `${label} ${product.name}`);
        return button;
      };
      const increase = makeButton('increase', 'Increase quantity of', '+');
      increase.disabled = item.quantity >= 99;
      controls.append(makeButton('decrease', 'Decrease quantity of', '−'), element('span', 'quantity-value', String(item.quantity)), increase, makeButton('remove', 'Remove', 'Remove'));
      info.append(controls);
      row.append(image, info, element('strong', 'item-cost ms-auto', money(product.price * item.quantity)));
      cartItems.append(row);
    }
    const empty = cart.items.length === 0;
    document.getElementById('cart-empty').hidden = !empty;
    document.getElementById('cart-summary').hidden = empty;
    document.getElementById('cart-heading').textContent = empty ? 'Your cart is waiting.' : `Your cart · ${cart.count()} ${cart.count() === 1 ? 'item' : 'items'}`;
    document.getElementById('cart-subtotal').textContent = money(cart.subtotal());
    document.getElementById('cart-delivery').textContent = cart.delivery() ? money(cart.delivery()) : 'Free';
    document.getElementById('cart-total').textContent = money(cart.total());
    document.querySelectorAll('[name="method"]').forEach((radio) => { radio.checked = radio.value === cart.method; });
    if (focusId) {
      const replacement = [...cartItems.querySelectorAll('button')].find((button) => button.dataset.itemId === focusId && button.dataset.cartAction === focusAction && !button.disabled);
      const fallback = cartItems.children[Math.min(Math.max(oldIndex, 0), cartItems.children.length - 1)]?.querySelector('button');
      (replacement || fallback || document.querySelector('#cart-empty a'))?.focus();
    }
  }
  cartItems.addEventListener('click', (event) => {
    const button = event.target.closest('[data-cart-action]');
    if (!button) return;
    const item = cart.items.find((entry) => entry.id === button.dataset.itemId);
    if (!item) return;
    const name = app.productById(item.id).name;
    let toastMsg = `${name}: cart updated.`;
    switch (button.dataset.cartAction) {
      case 'increase':
        cart.setQuantity(item.id, item.quantity + 1);
        break;
      case 'decrease':
        if (item.quantity === 1) toastMsg = `${name} removed from cart.`;
        cart.setQuantity(item.id, item.quantity - 1);
        break;
      case 'remove':
        cart.remove(item.id);
        toastMsg = `${name} removed from cart.`;
        break;
    }
    app.showToast(toastMsg);
  });
  document.querySelectorAll('[name="method"]').forEach((radio) => radio.addEventListener('change', () => cart.setMethod(radio.value)));
  document.addEventListener('cafe:cart-change', renderCart);
  renderCart();
});
