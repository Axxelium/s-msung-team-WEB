/**
 * Cafe Mania - Authentication Simulation Module
 * Strictly fulfills Requirement 5.1:
 * - "Sign Up" stores user data locally in localStorage (name, email, phone, password).
 * - "Log In" verifies credentials against localStorage and redirects to profile.html.
 * - Profile page displays stored user details, loyalty status, saved favorites, and past orders.
 */

(function (window) {
  'use strict';

  const USERS_KEY = 'cafe-mania-users';
  const CURRENT_USER_KEY = 'cafe-mania-current-user';

  // Seed default demo user if storage is empty
  const defaultUsers = [
    {
      name: 'Aliya Nurgali',
      email: 'aliya@cafemania.kz',
      phone: '+7 777 123 45 67',
      password: 'Password123!',
      registeredAt: '2026-09-15',
      beansBalance: 450,
      favoriteDrink: 'Cappuccino',
      ordersCount: 7
    }
  ];

  function getUsers() {
    try {
      const stored = localStorage.getItem(USERS_KEY);
      if (!stored) {
        localStorage.setItem(USERS_KEY, JSON.stringify(defaultUsers));
        return defaultUsers;
      }
      const parsed = JSON.parse(stored);
      // Clean up any legacy 'Vanilla Raf' reference
      parsed.forEach(u => {
        if (u.favoriteDrink === 'Vanilla Raf') u.favoriteDrink = 'Cappuccino';
      });
      return parsed;
    } catch (_) {
      return defaultUsers;
    }
  }

  function saveUsers(users) {
    try {
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
    } catch (e) {
      console.warn('Could not save users to localStorage', e);
    }
  }

  function getCurrentUser() {
    try {
      const stored = localStorage.getItem(CURRENT_USER_KEY);
      if (!stored) return null;
      const user = JSON.parse(stored);
      if (user && user.favoriteDrink === 'Vanilla Raf') {
        user.favoriteDrink = 'Cappuccino';
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
      }
      return user;
    } catch (_) {
      return null;
    }
  }

  function setCurrentUser(user) {
    try {
      if (user) {
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(CURRENT_USER_KEY);
      }
    } catch (e) {
      console.warn('Could not save current user to localStorage', e);
    }
  }

  const CafeAuth = {
    getUsers,
    getCurrentUser,
    setCurrentUser,

    /**
     * Registers a new user and sets them as active
     */
    signUp({ name, email, phone, password }) {
      const users = getUsers();
      const existing = users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
      if (existing) {
        return { success: false, message: 'An account with this email is already registered.' };
      }

      const newUser = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        password: password,
        registeredAt: new Date().toISOString().split('T')[0],
        beansBalance: 150, // Welcome bonus of 150 coffee beans!
        favoriteDrink: 'Cappuccino',
        ordersCount: 0
      };

      users.push(newUser);
      saveUsers(users);
      setCurrentUser(newUser);

      return { success: true, user: newUser };
    },

    /**
     * Checks credentials and logs user in
     */
    logIn(email, password) {
      const users = getUsers();
      const user = users.find(
        u => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password
      );

      if (!user) {
        return { success: false, message: 'Incorrect email or password. Please try again.' };
      }

      setCurrentUser(user);
      return { success: true, user };
    },

    /**
     * Logs current user out
     */
    logOut() {
      setCurrentUser(null);
      if (window.location.pathname.endsWith('profile.html')) {
        window.location.href = 'login.html';
      } else {
        window.location.reload();
      }
    },

    /**
     * Updates header navigation bar dynamically based on authentication state
     */
    updateNavbar() {
      const user = getCurrentUser();
      const navLists = document.querySelectorAll('.navbar-nav');
      
      navLists.forEach(navList => {
        let authItem = navList.querySelector('.auth-nav-item');
        if (!authItem) {
          authItem = document.createElement('li');
          authItem.className = 'nav-item auth-nav-item';
          navList.appendChild(authItem);
        }

        if (user) {
          authItem.innerHTML = `
            <a class="nav-link rounded-pill px-3 py-2 fw-bold small btn-auth-profile" href="profile.html" title="View Profile">
              ☕ ${user.name.split(' ')[0]}
            </a>
          `;
        } else {
          authItem.innerHTML = `
            <a class="nav-link rounded-pill px-3 py-2 fw-bold small btn-auth-login" href="login.html">
              Sign In
            </a>
          `;
        }
      });
    }
  };

  // Automatically update navbar on DOMContentLoaded
  document.addEventListener('DOMContentLoaded', () => {
    CafeAuth.updateNavbar();
  });

  window.CafeAuth = CafeAuth;
})(window);
