(() => {
  'use strict';
  const app = window.CafeMania;
  const cartKey = 'cafe-mania-cart-v1';
  const orderKey = 'cafe-mania-last-order-v1';
  let storage = null;

  for (const name of ['localStorage', 'sessionStorage']) {
    try {
      const candidate = window[name];
      candidate.setItem('cafe-mania-storage-check', '1');
      candidate.removeItem('cafe-mania-storage-check');
      storage = candidate;
      break;
    } catch (_) { /* Try the next storage option. */ }
  }

  app.storage = {
    get available() { return Boolean(storage); },
    read(key) {
      try { return JSON.parse(storage?.getItem(key) || 'null'); }
      catch (_) { return null; }
    },
    write(key, value) {
      try {
        if (!storage) return false;
        storage.setItem(key, JSON.stringify(value));
        return true;
      } catch (_) { return false; }
    }
  };

  const normalizeItems = (items) => {
    if (!Array.isArray(items)) return [];
    const quantities = new Map();
    for (const item of items) {
      if (!item || !app.productById(item.id) || !Number.isInteger(item.quantity) || item.quantity < 1) continue;
      quantities.set(item.id, Math.min(99, (quantities.get(item.id) || 0) + item.quantity));
    }
    return [...quantities].map(([id, quantity]) => ({ id, quantity }));
  };

  app.cart = {
    items: [],
    method: 'delivery',
    load() {
      const saved = app.storage.read(cartKey);
      this.items = normalizeItems(saved?.items);
      this.method = saved?.method === 'pickup' ? 'pickup' : 'delivery';
    },
    save() {
      const persisted = app.storage.write(cartKey, { items: this.items, method: this.method });
      document.dispatchEvent(new CustomEvent('cafe:cart-change', { detail: { persisted } }));
      return persisted;
    },
    add(id) {
      if (!app.productById(id)) return false;
      const item = this.items.find((entry) => entry.id === id);
      if (item?.quantity >= 99) return false;
      if (item) item.quantity += 1;
      else this.items.push({ id, quantity: 1 });
      this.save();
      return true;
    },
    setQuantity(id, quantity) {
      const item = this.items.find((entry) => entry.id === id);
      if (!item || !Number.isInteger(quantity)) return;
      if (quantity <= 0) return this.remove(id);
      item.quantity = Math.min(99, quantity);
      this.save();
    },
    remove(id) {
      this.items = this.items.filter((item) => item.id !== id);
      this.save();
    },
    setMethod(method) {
      this.method = method === 'pickup' ? 'pickup' : 'delivery';
      this.save();
    },
    count() { return this.items.reduce((sum, item) => sum + item.quantity, 0); },
    subtotal() { return this.items.reduce((sum, item) => sum + app.productById(item.id).price * item.quantity, 0); },
    delivery() { return this.items.length && this.method === 'delivery' ? 700 : 0; },
    total() { return this.subtotal() + this.delivery(); },
    placeOrder() {
      if (!this.items.length) return null;
      const order = {
        id: `CM-${Date.now().toString(36).toUpperCase()}`,
        createdAt: new Date().toISOString(),
        items: this.items.map((item) => ({ ...item })),
        method: this.method,
        subtotal: this.subtotal(), delivery: this.delivery(), total: this.total(), rating: 0
      };
      if (!app.storage.write(orderKey, order)) return null;
      this.items = [];
      this.save();
      return order;
    }
  };
  app.orderKey = orderKey;
  app.normalizeItems = normalizeItems;
  app.cart.load();
  window.addEventListener('storage', (event) => {
    if (event.key === cartKey || event.key === null) {
      app.cart.load();
      document.dispatchEvent(new CustomEvent('cafe:cart-change', { detail: { persisted: true } }));
    }
  });
})();
