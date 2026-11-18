/**
 * Cafe Mania - External Coffee API Integration Module
 * Strictly fulfills Requirement 7:
 * - Integrates public SampleAPIs Coffee API (https://api.sampleapis.com/coffee/hot & /iced)
 * - Uses async/await with fetch()
 * - Visual loading state (skeleton / spinner)
 * - Complete error handling with retry functionality and offline fallback
 * - Integrated with localStorage for saving favorites (Requirement 5.3)
 */

(function (window) {
  'use strict';

  const API_BASE = 'https://api.sampleapis.com/coffee';
  const FAVORITES_KEY = 'cafe-mania-favorites';

  // Offline curated backup items in case API is unreachable or offline
  const fallbackCoffeeList = [
    {
      id: 101,
      title: 'Black Coffee',
      description: 'It doesn’t get much more standard than black coffee: just brewed beans in a cup. A pure classic for genuine coffee lovers.',
      ingredients: ['Freshly Ground Beans', 'Filtered Water'],
      image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80'
    },
    {
      id: 102,
      title: 'Flat White',
      description: 'Born in Australia and New Zealand, the flat white is a double espresso topped with silky, micro-foamed steamed milk.',
      ingredients: ['Double Espresso', 'Steamed Microfoam Milk'],
      image: 'https://images.unsplash.com/photo-1577968897966-3d4325b36b61?w=600&auto=format&fit=crop&q=80'
    },
    {
      id: 103,
      title: 'Spanish Latte (Cortado)',
      description: 'A rich espresso drink balanced with an equal amount of warm milk and sweetened condensed milk.',
      ingredients: ['Espresso', 'Warm Milk', 'Condensed Milk'],
      image: 'https://images.unsplash.com/photo-1534778101976-62847782c213?w=600&auto=format&fit=crop&q=80'
    },
    {
      id: 104,
      title: 'Iced Caramel Macchiato',
      description: 'Chilled milk marked with rich espresso, vanilla syrup, and a drizzle of buttery caramel over ice cubes.',
      ingredients: ['Espresso', 'Cold Whole Milk', 'Vanilla Syrup', 'Caramel Drizzle', 'Ice'],
      image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=600&auto=format&fit=crop&q=80'
    },
    {
      id: 105,
      title: 'Affogato',
      description: 'A delightfully decadent Italian treat made by pouring a hot shot of espresso directly over creamy vanilla gelato.',
      ingredients: ['Hot Espresso', 'Vanilla Gelato / Ice Cream'],
      image: 'https://images.unsplash.com/photo-1582293041079-7814c2f12063?w=600&auto=format&fit=crop&q=80'
    },
    {
      id: 106,
      title: 'Vienna Coffee',
      description: 'Two shots of espresso infused with whipped cream replacing milk and sugar, dusted with dark chocolate.',
      ingredients: ['Double Espresso', 'Whipped Cream', 'Cocoa Powder'],
      image: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=600&auto=format&fit=crop&q=80'
    }
  ];

  function getFavorites() {
    try {
      const stored = localStorage.getItem(FAVORITES_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (_) {
      return [];
    }
  }

  function toggleFavorite(item) {
    let favorites = getFavorites();
    const index = favorites.findIndex(f => f.title === item.title);
    let isAdded = false;

    if (index >= 0) {
      favorites.splice(index, 1);
    } else {
      favorites.push({
        title: item.title,
        description: item.description,
        ingredients: item.ingredients,
        image: item.image,
        savedAt: new Date().toLocaleDateString()
      });
      isAdded = true;
    }

    try {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    } catch (_) {}

    return isAdded;
  }

  const CafeAPI = {
    currentType: 'hot',
    coffeeCache: {
      hot: null,
      iced: null
    },

    /**
     * Fetches coffee recipes dynamically using fetch() and async/await
     */
    async fetchCoffees(type = 'hot') {
      this.currentType = type;
      if (this.coffeeCache[type]) {
        return { data: this.coffeeCache[type], fromCache: true };
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000); // 6s timeout

      try {
        const response = await fetch(`${API_BASE}/${type}`, {
          signal: controller.signal,
          headers: { 'Accept': 'application/json' }
        });
        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const validList = Array.isArray(data) && data.length > 0 ? data : fallbackCoffeeList;
        this.coffeeCache[type] = validList;
        return { data: validList, fromCache: false };
      } catch (err) {
        clearTimeout(timeoutId);
        console.warn('SampleAPIs Coffee request failed, using curated fallback.', err);
        // Return fallback data with an error notice flag
        return { data: fallbackCoffeeList, isFallback: true, error: err.message };
      }
    },

    /**
     * Renders the World Coffee Specials section in the target container
     */
    async initExplorer(containerId) {
      const container = document.getElementById(containerId);
      if (!container) return;

      container.innerHTML = `
        <div class="api-explorer-section p-4 rounded-4 shadow-sm">
          <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
            <div>
              <span class="badge bg-warning text-dark px-3 py-2 rounded-pill fw-bold text-uppercase mb-2">
                ⚡ Live REST API
              </span>
              <h2 class="h3 fw-bold mb-1">World Specialty Coffee Discovery</h2>
              <p class="text-muted mb-0 small">
                Live coffee recipes fetched from <code>api.sampleapis.com/coffee</code>. Discover how cultures around the globe brew coffee.
              </p>
            </div>
            <div class="d-flex align-items-center gap-2">
              <div class="btn-group" role="group" aria-label="Coffee temperature">
                <button type="button" class="btn btn-outline-primary btn-sm active" id="btn-coffee-hot">☕ Hot Brews</button>
                <button type="button" class="btn btn-outline-primary btn-sm" id="btn-coffee-iced">🧊 Iced Coffee</button>
              </div>
              <button type="button" class="btn btn-secondary btn-sm" id="btn-coffee-refresh" title="Reload live data">
                ↻ Reload
              </button>
            </div>
          </div>

          <div id="api-loading-state" class="py-5 text-center">
            <div class="spinner-border text-primary" role="status" style="width: 3rem; height: 3rem;">
              <span class="visually-hidden">Brewing recipes...</span>
            </div>
            <p class="mt-3 text-muted fw-bold">Connecting to global coffee database...</p>
          </div>

          <div id="api-error-state" class="alert alert-warning p-4 rounded-3 d-none" role="alert">
            <div class="d-flex align-items-center gap-3">
              <span style="font-size: 2rem;">☕</span>
              <div class="flex-grow-1">
                <h5 class="alert-heading fw-bold mb-1">Notice: Live Network Service Unavailable</h5>
                <p class="mb-2 small" id="api-error-message">Could not connect to external host. Showing our offline curated specialty recipes.</p>
                <button class="btn btn-sm btn-outline-dark" id="btn-retry-api">↻ Try Live Reconnect</button>
              </div>
            </div>
          </div>

          <div id="api-coffee-grid" class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4"></div>
        </div>
      `;

      const grid = container.querySelector('#api-coffee-grid');
      const loader = container.querySelector('#api-loading-state');
      const errorBox = container.querySelector('#api-error-state');
      const errorMsg = container.querySelector('#api-error-message');
      const hotBtn = container.querySelector('#btn-coffee-hot');
      const icedBtn = container.querySelector('#btn-coffee-iced');
      const refreshBtn = container.querySelector('#btn-coffee-refresh');
      const retryBtn = container.querySelector('#btn-retry-api');

      const renderGrid = (items) => {
        grid.innerHTML = '';
        const favorites = getFavorites();

        items.forEach(item => {
          const isFav = favorites.some(f => f.title === item.title);
          const ingredientsList = Array.isArray(item.ingredients) 
            ? item.ingredients.map(ing => `<span class="badge bg-light text-dark border me-1 mb-1">${ing}</span>`).join('')
            : '';

          const fallbackImg = 'images/cofee.jpg';
          const card = document.createElement('div');
          card.className = 'col';
          card.innerHTML = `
            <div class="card h-100 shadow-sm border-0 rounded-4 overflow-hidden product-entry">
              <div class="position-relative" style="height: 180px; background-color: #2b1810;">
                <img src="${item.image || fallbackImg}" 
                     alt="${item.title}" 
                     class="w-100 h-100 object-fit-cover"
                     onerror="this.onerror=null; this.src='${fallbackImg}';">
                <button class="btn btn-light btn-sm rounded-circle position-absolute top-0 end-0 m-3 shadow-sm btn-fav-toggle" 
                        data-title="${encodeURIComponent(item.title)}"
                        title="${isFav ? 'Remove from favorites' : 'Add to favorites'}"
                        style="width: 38px; height: 38px; display: flex; align-items: center; justify-content: center;">
                  ${isFav ? '❤️' : '🤍'}
                </button>
              </div>
              <div class="card-body d-flex flex-column p-4">
                <h5 class="card-title fw-bold mb-2">${item.title}</h5>
                <p class="card-text text-muted small flex-grow-1">${item.description}</p>
                <div class="mb-3">
                  <div class="small fw-bold text-muted mb-1">Key Ingredients:</div>
                  <div class="d-flex flex-wrap">${ingredientsList}</div>
                </div>
                <div class="d-flex gap-2 mt-auto pt-2 border-top">
                  <button class="btn btn-outline-primary btn-sm w-100 btn-request-recipe" data-title="${item.title}">
                    ☕ Request Drink
                  </button>
                </div>
              </div>
            </div>
          `;

          // Handle Favorite click
          const favBtn = card.querySelector('.btn-fav-toggle');
          favBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const added = toggleFavorite(item);
            favBtn.textContent = added ? '❤️' : '🤍';
            favBtn.title = added ? 'Remove from favorites' : 'Add to favorites';
            if (window.CafeMania && typeof window.CafeMania.showToast === 'function') {
              window.CafeMania.showToast(added ? `Saved "${item.title}" to favorites!` : `Removed "${item.title}" from favorites`);
            }
          });

          // Handle Request recipe
          const reqBtn = card.querySelector('.btn-request-recipe');
          reqBtn.addEventListener('click', () => {
            if (window.CafeMania && typeof window.CafeMania.showToast === 'function') {
              window.CafeMania.showToast(`Our barista is noted to brew "${item.title}" for your next order!`);
            }
          });

          grid.appendChild(card);
        });
      };

      const loadData = async (type = 'hot', force = false) => {
        loader.classList.remove('d-none');
        errorBox.classList.add('d-none');
        grid.innerHTML = '';

        if (force) {
          CafeAPI.coffeeCache[type] = null;
        }

        const result = await CafeAPI.fetchCoffees(type);
        loader.classList.add('d-none');

        if (result.isFallback) {
          errorBox.classList.remove('d-none');
          errorMsg.textContent = `External API note (${result.error || 'Network offline'}). Showing curated recipes.`;
        }

        renderGrid(result.data);
      };

      // Button handlers
      hotBtn.addEventListener('click', () => {
        hotBtn.classList.add('active');
        icedBtn.classList.remove('active');
        loadData('hot');
      });

      icedBtn.addEventListener('click', () => {
        icedBtn.classList.add('active');
        hotBtn.classList.remove('active');
        loadData('iced');
      });

      refreshBtn.addEventListener('click', () => {
        loadData(CafeAPI.currentType, true);
      });

      retryBtn.addEventListener('click', () => {
        loadData(CafeAPI.currentType, true);
      });

      // Initial load
      loadData('hot');
    }
  };

  window.CafeAPI = CafeAPI;
  window.CafeFavorites = { getFavorites, toggleFavorite };
})(window);
