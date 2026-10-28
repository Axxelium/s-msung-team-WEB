document.addEventListener('DOMContentLoaded', () => {
  'use strict';
  const app = window.CafeMania;
  const { element, money } = app;
  const order = app.storage.read(app.orderKey);
  const items = app.normalizeItems(order?.items);
  if (!order || typeof order.id !== 'string' || !items.length || !['pickup', 'delivery'].includes(order.method)) {
    document.getElementById('no-order').hidden = false;
    return;
  }
  document.getElementById('confirmed-order').hidden = false;
  document.getElementById('order-number').textContent = `Order ${order.id}`;
  document.getElementById('confirmation-message').textContent = order.method === 'pickup'
    ? 'Your selected items are listed below. Estimated pickup time: 15–20 minutes.'
    : 'Your selected items are listed below. Estimated delivery time: 20–35 minutes.';
  const list = document.getElementById('confirmation-items');
  let subtotal = 0;
  for (const item of items) {
    const product = app.productById(item.id);
    const amount = product.price * item.quantity;
    subtotal += amount;
    const row = element('div', 'summary-line');
    row.append(element('span', '', `${product.name} × ${item.quantity}`), element('strong', '', money(amount)));
    list.append(row);
  }
  const delivery = order.method === 'delivery' ? 700 : 0;
  document.getElementById('confirmation-method').textContent = order.method === 'delivery' ? 'Delivery' : 'Pick up at Cafe Mania';
  document.getElementById('confirmation-delivery').textContent = delivery ? money(delivery) : 'Free';
  document.getElementById('confirmation-total').textContent = money(subtotal + delivery);

  const stars = [...document.querySelectorAll('[data-rating]')];
  const renderRating = (rating) => {
    stars.forEach((star) => {
      const value = Number(star.dataset.rating);
      star.classList.toggle('is-selected', value <= rating);
      star.setAttribute('aria-pressed', String(value === rating));
    });
    document.getElementById('rating-message').textContent = rating ? `Your rating: ${rating}/5. Thank you for your feedback!` : 'Choose a star to leave your rating.';
  };
  stars.forEach((star, index) => {
    star.addEventListener('click', () => {
      order.rating = Number(star.dataset.rating);
      renderRating(order.rating);
      if (!app.storage.write(app.orderKey, order)) app.showToast('Rating selected, but could not be saved on this device.');
    });
    star.addEventListener('keydown', (event) => {
      if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
      event.preventDefault();
      stars[(index + (event.key === 'ArrowRight' ? 1 : -1) + stars.length) % stars.length].focus();
    });
  });
  renderRating(Number.isInteger(order.rating) && order.rating >= 1 && order.rating <= 5 ? order.rating : 0);
});
