/* ============================================
   FEAST TOGETHER - Utility Functions
   ============================================ */

const Utils = {
  /**
   * Generate a unique ID
   */
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
  },

  /**
   * Get data from localStorage
   */
  getFromStorage(key) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error('Error reading from localStorage:', e);
      return null;
    }
  },

  /**
   * Save data to localStorage
   */
  saveToStorage(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (e) {
      console.error('Error saving to localStorage:', e);
      return false;
    }
  },

  /**
   * Remove data from localStorage
   */
  removeFromStorage(key) {
    localStorage.removeItem(key);
  },

  /**
   * Show a toast notification
   */
  showToast(message, type = 'success') {
    // Remove existing toasts
    document.querySelectorAll('.toast').forEach(t => t.remove());

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('toast-exit');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  },

  /**
   * Show an alert inside a container element
   */
  showAlert(containerId, message, type = 'error') {
    const container = document.getElementById(containerId);
    if (!container) return;

    const icons = {
      success: '✅',
      error: '❌',
      info: 'ℹ️'
    };

    container.innerHTML = `
      <div class="alert alert-${type}">
        <span>${icons[type] || ''}</span>
        <span>${message}</span>
      </div>
    `;

    // Auto-clear after 5 seconds
    setTimeout(() => {
      container.innerHTML = '';
    }, 5000);
  },

  /**
   * Format a date nicely
   */
  formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  },

  /**
   * Truncate text to a max length
   */
  truncateText(text, maxLength = 100) {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + '...';
  },

  /**
   * Strip HTML tags from a string
   */
  stripHtml(html) {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
  },

  /**
   * Debounce a function call
   */
  debounce(func, wait = 300) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  /**
   * Capitalize first letter of each word
   */
  capitalize(str) {
    if (!str) return '';
    return str.replace(/\b\w/g, l => l.toUpperCase());
  },

  /**
   * Create a loading skeleton for recipe cards
   */
  createSkeletonCards(count = 6) {
    let html = '<div class="recipe-grid">';
    for (let i = 0; i < count; i++) {
      html += `
        <div class="card">
          <div class="skeleton skeleton-img"></div>
          <div class="card-body">
            <div class="skeleton skeleton-title"></div>
            <div class="skeleton skeleton-text"></div>
            <div class="skeleton skeleton-text" style="width: 60%;"></div>
          </div>
        </div>
      `;
    }
    html += '</div>';
    return html;
  },

  /**
   * Categorize ingredients by store section
   */
  categorizeIngredient(aisle) {
    if (!aisle) return 'Other';

    const aisleLower = aisle.toLowerCase();
    const categories = {
      'Produce': ['produce', 'fruit', 'vegetable', 'fresh', 'herb'],
      'Dairy': ['dairy', 'milk', 'cheese', 'yogurt', 'cream', 'butter', 'egg'],
      'Meat & Seafood': ['meat', 'poultry', 'seafood', 'fish', 'chicken', 'beef', 'pork'],
      'Bakery': ['bakery', 'bread', 'baked'],
      'Pantry': ['pantry', 'canned', 'pasta', 'rice', 'grain', 'cereal', 'baking', 'spice', 'oil', 'vinegar', 'condiment', 'sauce', 'seasoning'],
      'Frozen': ['frozen'],
      'Beverages': ['beverage', 'drink', 'juice', 'tea', 'coffee', 'water'],
      'Snacks': ['snack', 'chip', 'cracker', 'nut']
    };

    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(kw => aisleLower.includes(kw))) {
        return category;
      }
    }
    return 'Other';
  }
};
