/**
 * Cafe Mania - External Coffee API Integration Module
 * Strictly fulfills Requirement 7:
 * - Integrates public SampleAPIs Coffee API (https://api.sampleapis.com/coffee/hot & /iced)
 * - Uses async/await with fetch()
 * - Visual loading state (skeleton / spinner)
 * - Complete error handling with retry functionality and offline fallback
 * - Filters out common menu drinks (e.g. basic Black Coffee, Latte, Cappuccino)
 *   so that ONLY unique, iconic, and specialty coffee recipes are displayed!
 * - Integrated with localStorage for saving favorites (Requirement 5.3)
 */

(function (window) {
  'use strict';

  const API_BASE = 'https://api.sampleapis.com/coffee';
  const FAVORITES_KEY = 'cafe-mania-favorites';

  // Common standard drinks that already exist in standard coffee shop menus
  const standardDrinkNames = [
    'black coffee',
    'latte',
    'cappuccino',
    'espresso',
    'caramel latte',
    'americano',
    'iced coffee',
    'iced latte'
  ];

  function isUniqueSpecialty(item) {
    if (!item || !item.title) return false;
    const lower = item.title.toLowerCase().trim();
    if (standardDrinkNames.includes(lower)) return false;
    if (lower === 'latte' || lower === 'caramel latte') return false;
    return true;
  }

  // Curated iconic and specialty coffee recipes for hot & iced selections
  const iconicHotSpecials = [
    {
      id: 201,
      title: 'Spanish Cortado',
      description: 'An iconic Spanish bar classic: equal parts intense double espresso and silky warm milk, cut with a sweet ribbon of condensed milk.',
      ingredients: ['Double Espresso', 'Steamed Whole Milk', 'Sweet Condensed Milk'],
      image: 'https://images.unsplash.com/photo-1534778101976-62847782c213?w=600&auto=format&fit=crop&q=80'
    },
    {
      id: 202,
      title: 'Flat White',
      description: 'Born in Wellington and Melbourne: a double ristretto espresso crowned with velvety, glossy microfoam for maximum coffee aroma.',
      ingredients: ['Double Ristretto', 'Silky Microfoam Milk'],
      image: 'https://images.unsplash.com/photo-1577968897966-3d4325b36b61?w=600&auto=format&fit=crop&q=80'
    },
    {
      id: 203,
      title: 'Affogato al Caffè',
      description: 'A decadent Italian classic: a piping hot shot of freshly extracted espresso poured directly over artisan vanilla bean gelato.',
      ingredients: ['Fresh Hot Espresso', 'Artisan Vanilla Gelato'],
      image: 'https://images.unsplash.com/photo-1582293041079-7814c2f12063?w=600&auto=format&fit=crop&q=80'
    },
    {
      id: 204,
      title: 'Vienna Coffee (Einspänner)',
      description: 'Traditional Austrian coachman brew: rich double espresso served under a thick blanket of whipped cream and dusted with raw cocoa.',
      ingredients: ['Double Espresso', 'Whipped Cream', 'Dark Cocoa Powder'],
      image: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=600&auto=format&fit=crop&q=80'
    },
    {
      id: 205,
      title: 'Café de Olla',
      description: 'Traditional Mexican earthen clay pot coffee brewed with coarse ground beans, Ceylon cinnamon sticks, whole cloves, and dark piloncillo sugar.',
      ingredients: ['Coarse Coffee', 'Ceylon Cinnamon', 'Raw Piloncillo', 'Cloves'],
      image: 'https://images.unsplash.com/photo-1511920170033-f8396924c348?w=600&auto=format&fit=crop&q=80'
    },
    {
      id: 206,
      title: 'Irish Specialty Coffee',
      description: 'Full-bodied dark roast coffee sweetened with raw demerara sugar and topped with a cold, gently whipped heavy cream float.',
      ingredients: ['Dark Roast Coffee', 'Demerara Sugar', 'Whipped Cream Float'],
      image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80'
    }
  ];

  const iconicIcedSpecials = [
    {
      id: 301,
      title: 'Mazagran (Portuguese Lemon Coffee)',
      description: 'The world’s original 1840 iced coffee: concentrated cold espresso shaken vigorously with freshly squeezed lemon juice, mint, and ice.',
      ingredients: ['Espresso Shot', 'Fresh Lemon Juice', 'Cane Sugar', 'Mint', 'Crushed Ice'],
      image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=600&auto=format&fit=crop&q=80'
    },
    {
      id: 302,
      title: 'Nitro Cold Brew',
      description: 'Slow-steeped for 20 hours and infused with food-grade nitrogen gas, delivering a creamy Guinness-like cascade and velvety foam head.',
      ingredients: ['20-Hour Cold Brew', 'Nitrogen Microbubbles'],
      image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=600&auto=format&fit=crop&q=80'
    },
    {
      id: 303,
      title: 'Espresso Tonic (Bumble)',
      description: 'Chilled botanical tonic water poured over crystal ice and topped with a double shot of bright Ethiopian espresso and fresh orange peel.',
      ingredients: ['Double Espresso', 'Botanical Tonic', 'Orange Zest', 'Ice'],
      image: 'https://images.unsplash.com/photo-1551030173-122aabc4489c?w=600&auto=format&fit=crop&q=80'
    },
    {
      id: 304,
      title: 'Iced Vietnamese Egg Coffee',
      description: 'Intense slow-drip dark roast coffee poured over ice and crowned with a luscious custard cream whipped from fresh egg yolks and condensed milk.',
      ingredients: ['Robusta Drip Coffee', 'Whipped Egg Yolk', 'Condensed Milk', 'Ice'],
      image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=600&auto=format&fit=crop&q=80'
    },
    {
      id: 305,
      title: 'Kyoto Slow Drip',
      description: 'Artisan cold extraction: chilled water drops bead-by-bead through specialty single-origin grounds over 12 hours, capturing delicate fruity notes.',
      ingredients: ['Single-Origin Beans', 'Cold Filtered Drops'],
      image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&auto=format&fit=crop&q=80'
    },
    {
      id: 306,
      title: 'Iced Pistachio Raf',
      description: 'Signature cold brew espresso steamed directly with light cream, natural roasted pistachio butter, and Madagascar vanilla over ice.',
      ingredients: ['Espresso', 'Light Cream', 'Pistachio Paste', 'Vanilla', 'Ice'],
      image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=600&auto=format&fit=crop&q=80'
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
     * Fetches coffee recipes dynamically using fetch() and async/await,
     * filtering out common standard drinks already present in the cafe menu.
     */
    async fetchCoffees(type = 'hot') {
      this.currentType = type;
      const fallbackList = type === 'iced' ? iconicIcedSpecials : iconicHotSpecials;

      if (this.coffeeCache[type]) {
        return { data: this.coffeeCache[type], fromCache: true };
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      try {
        const response = await fetch(`${API_BASE}/${type}`, {
          signal: controller.signal,
          headers: { 'Accept': 'application/json' }
        });
        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP status: ${response.status}`);
        }

        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          // Filter out standard common coffee drinks (Black coffee, plain Latte, Cappuccino, etc.)
          const uniqueApiItems = data.filter(item => isUniqueSpecialty(item));
          
          // Combine unique items from API with iconic recipes to ensure high quality presentation
          const combined = [];
          const seen = new Set();
          
          [...uniqueApiItems, ...fallbackList].forEach(item => {
            const key = item.title.toLowerCase().trim();
            if (!seen.has(key) && isUniqueSpecialty(item)) {
              seen.add(key);
              combined.push(item);
            }
          });

          const finalList = combined.slice(0, 6);
          this.coffeeCache[type] = finalList;
          return { data: finalList, fromCache: false };
        }

        this.coffeeCache[type] = fallbackList;
        return { data: fallbackList, fromCache: false };
      } catch (err) {
        clearTimeout(timeoutId);
        // Use iconic specialty collection when offline or network fails
        this.coffeeCache[type] = fallbackList;
        return { data: fallbackList, isFallback: true, error: err.message };
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
              <h2 class="h3 fw-bold mb-1">World Specialty Coffee Discovery</h2>
              <p class="text-muted mb-0 small">
                Unique and iconic brewing traditions from around the globe.
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

          <div id="api-error-state" class="alert alert-warning p-3 rounded-3 d-none" role="alert">
            <div class="d-flex align-items-center justify-content-between">
              <span class="small" id="api-error-message">Showing curated global specialty recipes.</span>
              <button class="btn btn-sm btn-outline-dark" id="btn-retry-api">↻ Reconnect</button>
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
          errorMsg.textContent = `Showing curated iconic recipes (${result.error || 'offline mode'}).`;
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
