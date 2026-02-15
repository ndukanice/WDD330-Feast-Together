/* ============================================
   FEAST TOGETHER - Authentication Module
   Uses localStorage for user account management
   ============================================ */

const Auth = {
  STORAGE_KEY: 'feast_users',
  SESSION_KEY: 'feast_current_user',

  /**
   * Get all registered users
   */
  getUsers() {
    return Utils.getFromStorage(this.STORAGE_KEY) || [];
  },

  /**
   * Get the currently logged-in user
   */
  getCurrentUser() {
    return Utils.getFromStorage(this.SESSION_KEY);
  },

  /**
   * Check if a user is logged in
   */
  isLoggedIn() {
    return this.getCurrentUser() !== null;
  },

  /**
   * Register a new user
   */
  register(name, email, password, diet = '') {
    const users = this.getUsers();

    // Check if email already exists
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
      return { success: false, message: 'An account with this email already exists.' };
    }

    const newUser = {
      id: Utils.generateId(),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: password, // In production, this would be hashed
      diet: diet,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    Utils.saveToStorage(this.STORAGE_KEY, users);

    // Auto-login
    const session = { ...newUser };
    delete session.password;
    Utils.saveToStorage(this.SESSION_KEY, session);

    return { success: true, user: session };
  },

  /**
   * Log in a user
   */
  login(email, password) {
    const users = this.getUsers();
    const user = users.find(
      u => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password
    );

    if (!user) {
      return { success: false, message: 'Invalid email or password.' };
    }

    const session = { ...user };
    delete session.password;
    Utils.saveToStorage(this.SESSION_KEY, session);

    return { success: true, user: session };
  },

  /**
   * Log out the current user
   */
  logout() {
    Utils.removeFromStorage(this.SESSION_KEY);
  },

  /**
   * Update the navigation to reflect auth state
   */
  updateNav() {
    const authNav = document.getElementById('authNav');
    if (!authNav) return;

    const user = this.getCurrentUser();
    // Determine if we're on a subpage
    const isSubpage = window.location.pathname.includes('/pages/');
    const prefix = isSubpage ? '' : 'pages/';

    if (user) {
      authNav.innerHTML = `
        <div style="display: flex; align-items: center; gap: 8px;">
          <span class="nav-link" style="font-size: 0.9rem;">👋 ${user.name.split(' ')[0]}</span>
          <a href="#" class="nav-link btn-nav" onclick="Auth.logout(); window.location.href='${prefix}login.html';">Logout</a>
        </div>
      `;
    } else {
      authNav.innerHTML = `
        <a href="${prefix}login.html" class="nav-link btn-nav">Login</a>
      `;
    }
  }
};

// === Login Form Handler ===
document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    // Redirect if already logged in
    if (Auth.isLoggedIn()) {
      const isSubpage = window.location.pathname.includes('/pages/');
      window.location.href = isSubpage ? '../index.html' : 'index.html';
      return;
    }

    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('loginEmail').value;
      const password = document.getElementById('loginPassword').value;

      const result = Auth.login(email, password);
      if (result.success) {
        Utils.showToast(`Welcome back, ${result.user.name}!`);
        setTimeout(() => {
          window.location.href = '../index.html';
        }, 500);
      } else {
        Utils.showAlert('loginAlert', result.message, 'error');
      }
    });
  }
});

// === Register Form Handler ===
document.addEventListener('DOMContentLoaded', () => {
  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    // Redirect if already logged in
    if (Auth.isLoggedIn()) {
      const isSubpage = window.location.pathname.includes('/pages/');
      window.location.href = isSubpage ? '../index.html' : 'index.html';
      return;
    }

    registerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('regName').value;
      const email = document.getElementById('regEmail').value;
      const password = document.getElementById('regPassword').value;
      const confirm = document.getElementById('regConfirm').value;
      const diet = document.getElementById('regDiet').value;

      // Validation
      if (password !== confirm) {
        Utils.showAlert('registerAlert', 'Passwords do not match.', 'error');
        return;
      }

      if (password.length < 6) {
        Utils.showAlert('registerAlert', 'Password must be at least 6 characters.', 'error');
        return;
      }

      const result = Auth.register(name, email, password, diet);
      if (result.success) {
        Utils.showToast(`Welcome to Feast Together, ${result.user.name}!`);
        setTimeout(() => {
          window.location.href = '../index.html';
        }, 500);
      } else {
        Utils.showAlert('registerAlert', result.message, 'error');
      }
    });
  }
});
