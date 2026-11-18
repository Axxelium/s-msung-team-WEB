/* Assignment 6: jQuery interactions for Cafe Mania. */
$(document).ready(function () {
  'use strict';
  console.log('jQuery is ready!');

  // Task 4: show the visitor's reading progress on every page.
  const $progress = $('<div class="scroll-progress" role="progressbar" aria-label="Page reading progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><span class="scroll-progress__fill"></span></div>');
  $('body').prepend($progress);
  function updateProgress() {
    const scrollable = $(document).height() - $(window).height();
    const percent = scrollable > 0 ? Math.min(100, Math.max(0, ($(window).scrollTop() / scrollable) * 100)) : 100;
    $progress.attr('aria-valuenow', Math.round(percent)).find('.scroll-progress__fill').css('width', `${percent}%`);
  }
  $(window).on('scroll.assignment6 resize.assignment6', updateProgress);
  updateProgress();

  // Tasks 1-3: live menu filtering, accessible suggestions, and safe text highlighting.
  const $search = $('#menu-search');
  const $suggestions = $('#menu-suggestions');
  const escapeHtml = (text) => $('<span>').text(text).html();
  const escapeRegExp = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  function highlightMatches() {
    const query = $search.val().trim();
    const expression = query ? new RegExp(`(${escapeRegExp(query)})`, 'ig') : null;
    $('#product-grid .product-entry .card-title, #product-grid .product-entry .card-text').each(function () {
      const plainText = $(this).text();
      const safeText = escapeHtml(plainText);
      $(this).html(expression ? safeText.replace(expression, '<mark>$1</mark>') : safeText);
    });
  }
  function updateSuggestions(query) {
    $suggestions.empty();
    if (!query) { $suggestions.prop('hidden', true); return; }
    const category = $('#product-grid').attr('data-current-category') || 'all';
    const matches = window.CafeMania.products.filter((product) =>
      (category === 'all' || product.category === category) && product.name.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 5);
    matches.forEach((product) => {
      const $option = $('<li role="option">').append($('<button type="button" class="list-group-item list-group-item-action">').text(product.name).attr('data-suggestion', product.name));
      $suggestions.append($option);
    });
    $suggestions.prop('hidden', matches.length === 0);
  }
  function filterMenu() {
    if (!$search.length) return;
    const query = $search.val().trim().toLowerCase();
    try { localStorage.setItem('cafe-mania-search', $search.val().trim()); } catch (_) {}
    const $cards = $('#product-grid .product-entry');
    const $matchingCards = $cards.filter(function () { return $(this).text().toLowerCase().includes(query); });
    // Use a stable per-card check so each card is matched independently.
    $cards.each(function () { $(this).toggle(!query || $(this).text().toLowerCase().includes(query)); });
    const category = $('#product-grid').attr('data-current-category') || 'all';
    const categoryName = $(`[data-category="${category}"]`).text().trim() || 'Menu';
    $('#menu-results').text(query ? `${$matchingCards.length} ${$matchingCards.length === 1 ? 'match' : 'matches'} for “${$search.val().trim()}”` : `${categoryName} · ${$cards.length} ${$cards.length === 1 ? 'item' : 'items'}`);
    updateSuggestions(query);
    highlightMatches();
  }
  $search.on('input keyup', filterMenu).on('focus', function () { updateSuggestions($(this).val().trim()); });
  $(document).on('click', '#menu-suggestions [data-suggestion]', function () {
    $search.val($(this).attr('data-suggestion'));
    filterMenu();
    $suggestions.prop('hidden', true);
  }).on('click', '[data-category]', filterMenu);
  $(document).on('click', function (event) {
    if (!$(event.target).closest('.menu-search').length) $suggestions.prop('hidden', true);
  });
  if ($search.length) {
    try {
      const savedSearch = localStorage.getItem('cafe-mania-search');
      if (savedSearch) $search.val(savedSearch);
    } catch (_) {}
    filterMenu();
  }

  // Task 5: count the real menu items and categories up to their totals.
  $('.animated-counter').each(function () {
    const $counter = $(this);
    const target = Number($counter.attr('data-counter')) || 0;
    $({ count: 0 }).animate({ count: target }, {
      duration: 1200,
      easing: 'swing',
      step: function () { $counter.text(Math.floor(this.count)); },
      complete: function () { $counter.text(target); }
    });
  });

  // Task 8: copy the site's menu URL and give visible confirmation.
  $('#menu-link').val(new URL('menu.html', window.location.href).href);
  $('#copy-menu-link').on('click', async function () {
    const $button = $(this);
    const value = $('#menu-link').val();
    try {
      if (navigator.clipboard && window.isSecureContext) await navigator.clipboard.writeText(value);
      else {
        const input = $('#menu-link').get(0);
        input.select();
        if (!document.execCommand('copy')) throw new Error('Copy command unavailable');
        input.setSelectionRange(0, 0);
      }
      const label = $button.text();
      $button.text('✓ Copied').prop('disabled', true);
      window.CafeMania.showToast('Copied to clipboard!');
      window.setTimeout(() => $button.text(label).prop('disabled', false), 1800);
    } catch (_) {
      window.CafeMania.showToast('Select and copy the menu link.');
    }
  });

  // Task 9: load nearby images as the visitor scrolls down the page.
  function loadNearbyImages() {
    const edge = $(window).scrollTop() + $(window).height() + 180;
    $('img[data-lazy-src]').each(function () {
      const $image = $(this);
      if ($image.offset().top <= edge) {
        $image.attr('src', $image.attr('data-lazy-src')).removeAttr('data-lazy-src');
      }
    });
  }
  $(window).on('scroll.assignment6 resize.assignment6', loadNearbyImages);
  loadNearbyImages();
});
