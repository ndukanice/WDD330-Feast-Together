/* ============================================
   FEAST TOGETHER - Shopping List Module
   Handles shopping list generation, display, and sharing
   ============================================ */

/**
 * Initialize shopping list page
 */
document.addEventListener('DOMContentLoaded', () => {
  if (!document.getElementById('shoppingListContent')) return;

  loadMealPlansIntoSelect();

  // Auto-load if coming from meal plan page
  const shoppingData = sessionStorage.getItem('feast_shopping_list');
  if (shoppingData) {
    const ingredients = JSON.parse(shoppingData);
    renderShoppingList(ingredients);
    sessionStorage.removeItem('feast_shopping_list');
  }
});

/**
 * Load saved meal plans into dropdown
 */
function loadMealPlansIntoSelect() {
  const select = document.getElementById('mealPlanSelect');
  if (!select) return;

  const plans = Utils.getFromStorage('feast_meal_plans') || [];
  plans.forEach(plan => {
    const option = document.createElement('option');
    option.value = plan.id;
    option.textContent = `${plan.name} - ${Utils.formatDate(plan.createdAt)}`;
    select.appendChild(option);
  });
}

/**
 * Load shopping list from a selected saved meal plan
 */
function loadShoppingList() {
  const select = document.getElementById('mealPlanSelect');
  const planId = select.value;

  if (!planId) {
    Utils.showToast('Please select a meal plan first.', 'error');
    return;
  }

  const plans = Utils.getFromStorage('feast_meal_plans') || [];
  const plan = plans.find(p => p.id === planId);
  if (!plan) {
    Utils.showToast('Meal plan not found.', 'error');
    return;
  }

  // Collect ingredients from all courses
  const allIngredients = [];
  const courses = [plan.appetizer, plan.mainCourse, plan.dessert].filter(Boolean);

  courses.forEach(recipe => {
    (recipe.extendedIngredients || []).forEach(ing => {
      allIngredients.push({
        name: ing.name || ing.originalName || 'Unknown',
        amount: ing.amount || '',
        unit: ing.unit || '',
        aisle: ing.aisle || ''
      });
    });
  });

  if (allIngredients.length === 0) {
    Utils.showToast('No ingredients found in this meal plan.', 'error');
    return;
  }

  renderShoppingList(allIngredients);
}

/**
 * Render the shopping list grouped by category
 */
function renderShoppingList(ingredients) {
  const container = document.getElementById('shoppingListContent');
  const shareOptions = document.getElementById('shareOptions');

  if (!container) return;

  // Group ingredients by category
  const categorized = {};
  ingredients.forEach(ing => {
    const category = Utils.categorizeIngredient(ing.aisle);
    if (!categorized[category]) categorized[category] = [];

    // Check for duplicate and merge
    const existing = categorized[category].find(
      i => i.name.toLowerCase() === ing.name.toLowerCase()
    );

    if (existing) {
      // Combine amounts
      if (existing.unit === ing.unit) {
        existing.amount = (parseFloat(existing.amount) || 0) + (parseFloat(ing.amount) || 0);
      } else {
        // Different units, add as separate entry
        categorized[category].push({ ...ing, id: Utils.generateId() });
      }
    } else {
      categorized[category].push({ ...ing, id: Utils.generateId() });
    }
  });

  // Category icons
  const categoryIcons = {
    'Produce': '🥬',
    'Dairy': '🧀',
    'Meat & Seafood': '🥩',
    'Bakery': '🍞',
    'Pantry': '🫙',
    'Frozen': '🧊',
    'Beverages': '🥤',
    'Snacks': '🍿',
    'Other': '📦'
  };

  // Sort categories
  const sortedCategories = Object.keys(categorized).sort();

  let html = '';
  sortedCategories.forEach(category => {
    const items = categorized[category];
    const icon = categoryIcons[category] || '📦';

    html += `
      <div class="shopping-category fade-in-up">
        <h3>${icon} ${category} <span style="font-weight: 400; font-size: 0.85rem;">(${items.length} items)</span></h3>
    `;

    items.forEach(item => {
      const amountStr = item.amount ? `${item.amount} ${item.unit}` : '';
      html += `
        <div class="shopping-item" id="item-${item.id}">
          <input type="checkbox" id="check-${item.id}"
                 onchange="toggleShoppingItem('${item.id}')">
          <label for="check-${item.id}">${Utils.capitalize(item.name)}</label>
          <span class="item-amount">${amountStr}</span>
        </div>
      `;
    });

    html += '</div>';
  });

  container.innerHTML = html;

  // Show share options
  if (shareOptions) shareOptions.classList.remove('hidden');

  // Save current list for potential sharing
  window.currentShoppingList = categorized;

  Utils.showToast('Shopping list ready! 🛒', 'success');
}

/**
 * Toggle a shopping item as checked/unchecked
 */
function toggleShoppingItem(itemId) {
  const item = document.getElementById(`item-${itemId}`);
  const checkbox = document.getElementById(`check-${itemId}`);

  if (checkbox.checked) {
    item.classList.add('checked');
  } else {
    item.classList.remove('checked');
  }
}

/**
 * Clear all items from the shopping list
 */
function clearShoppingList() {
  if (!confirm('Clear the entire shopping list?')) return;

  const container = document.getElementById('shoppingListContent');
  const shareOptions = document.getElementById('shareOptions');

  if (container) {
    container.innerHTML = `
      <div class="empty-state fade-in">
        <div class="empty-icon">🛒</div>
        <h3>No Shopping List</h3>
        <p>Generate a shopping list from your meal plan, or select a saved plan above.</p>
        <a href="mealplan.html" class="btn btn-primary mt-2">Go to Meal Plans</a>
      </div>
    `;
  }

  if (shareOptions) shareOptions.classList.add('hidden');
  window.currentShoppingList = null;

  Utils.showToast('Shopping list cleared.', 'info');
}

/**
 * Print the shopping list
 */
function printShoppingList() {
  if (!window.currentShoppingList) {
    Utils.showToast('No shopping list to print.', 'error');
    return;
  }
  window.print();
}

/**
 * Share shopping list via email
 */
function shareViaEmail() {
  if (!window.currentShoppingList) {
    Utils.showToast('No shopping list to share.', 'error');
    return;
  }

  let body = 'Feast Together - Shopping List\n\n';

  Object.entries(window.currentShoppingList).forEach(([category, items]) => {
    body += `=== ${category} ===\n`;
    items.forEach(item => {
      const amount = item.amount ? `${item.amount} ${item.unit}` : '';
      body += `• ${Utils.capitalize(item.name)} ${amount}\n`;
    });
    body += '\n';
  });

  const subject = encodeURIComponent('Feast Together - Shopping List');
  const emailBody = encodeURIComponent(body);

  window.location.href = `mailto:?subject=${subject}&body=${emailBody}`;
}

/**
 * Copy shopping list to clipboard
 */
function copyListToClipboard() {
  if (!window.currentShoppingList) {
    Utils.showToast('No shopping list to copy.', 'error');
    return;
  }

  let text = '🛒 Feast Together - Shopping List\n\n';

  Object.entries(window.currentShoppingList).forEach(([category, items]) => {
    text += `--- ${category} ---\n`;
    items.forEach(item => {
      const amount = item.amount ? `(${item.amount} ${item.unit})` : '';
      text += `☐ ${Utils.capitalize(item.name)} ${amount}\n`;
    });
    text += '\n';
  });

  navigator.clipboard.writeText(text)
    .then(() => Utils.showToast('Shopping list copied to clipboard!', 'success'))
    .catch(() => Utils.showToast('Could not copy to clipboard.', 'error'));
}
