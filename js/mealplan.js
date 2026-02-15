/* ============================================
   FEAST TOGETHER - Meal Plan Module
   Handles meal plan generation, saving, and display
   ============================================ */

const MEAL_PLANS_KEY = 'feast_meal_plans';

/**
 * Initialize the meal plan page
 */
document.addEventListener('DOMContentLoaded', () => {
  if (!document.getElementById('currentMealPlan')) return;

  loadGroupsIntoSelect();
  loadCurrentPlan();
  displaySavedMealPlans();
});

/**
 * Load groups into the dropdown selector
 */
function loadGroupsIntoSelect() {
  const select = document.getElementById('groupSelect');
  if (!select) return;

  const groups = Utils.getFromStorage('feast_groups') || [];
  groups.forEach(group => {
    const option = document.createElement('option');
    option.value = group.id;
    option.textContent = `${group.name} (${group.size} guests)`;
    select.appendChild(option);
  });
}

/**
 * Load the current working meal plan from sessionStorage
 */
function loadCurrentPlan() {
  const plan = JSON.parse(sessionStorage.getItem('feast_current_plan') || '{}');

  if (plan.appetizer) {
    renderCourseSlot('appetizerSlot', plan.appetizer, 'appetizer');
  }
  if (plan['main course']) {
    renderCourseSlot('mainCourseSlot', plan['main course'], 'main course');
  }
  if (plan.dessert) {
    renderCourseSlot('dessertSlot', plan.dessert, 'dessert');
  }
}

/**
 * Render a recipe card in a course slot
 */
function renderCourseSlot(slotId, recipe, courseType) {
  const slot = document.getElementById(slotId);
  if (!slot) return;

  slot.innerHTML = `
    <div class="card scale-in" style="max-width: 350px;">
      <img src="${recipe.image || 'https://via.placeholder.com/312x231?text=No+Image'}"
           alt="${recipe.title}" class="card-img"
           onerror="this.src='https://via.placeholder.com/312x231?text=No+Image'">
      <div class="card-body">
        <h3>${recipe.title}</h3>
        <p>⏱️ ${recipe.readyInMinutes || '?'} min · 👥 ${recipe.servings || '?'} servings</p>
        <div style="margin-top: 8px;">
          ${(recipe.diets || []).map(d => `<span class="tag tag-diet">${Utils.capitalize(d)}</span>`).join('')}
        </div>
        <button class="btn btn-sm btn-danger mt-2" onclick="removeCourse('${courseType}')">Remove</button>
      </div>
    </div>
  `;
}

/**
 * Remove a course from the current plan
 */
function removeCourse(courseType) {
  const plan = JSON.parse(sessionStorage.getItem('feast_current_plan') || '{}');
  delete plan[courseType];
  sessionStorage.setItem('feast_current_plan', JSON.stringify(plan));

  const slotMap = {
    'appetizer': 'appetizerSlot',
    'main course': 'mainCourseSlot',
    'dessert': 'dessertSlot'
  };

  const slot = document.getElementById(slotMap[courseType]);
  if (slot) {
    slot.innerHTML = `
      <div class="meal-plan-empty">
        <p>No ${courseType} selected</p>
        <button class="btn btn-sm btn-secondary" onclick="searchForCourse('${courseType}')">Browse ${Utils.capitalize(courseType)}s</button>
      </div>
    `;
  }

  Utils.showToast(`${Utils.capitalize(courseType)} removed.`, 'info');
}

/**
 * Navigate to search page filtered by course type
 */
function searchForCourse(courseType) {
  window.location.href = `search.html?type=${encodeURIComponent(courseType)}`;
}

/**
 * Generate a random meal plan (appetizer + main + dessert)
 */
async function generateMealPlan() {
  const loader = document.getElementById('mealPlanLoader');
  if (loader) loader.classList.remove('hidden');

  const groupId = document.getElementById('groupSelect').value;
  let diet = '';
  let cuisine = '';

  // Get group preferences if selected
  if (groupId) {
    const groups = Utils.getFromStorage('feast_groups') || [];
    const group = groups.find(g => g.id === groupId);
    if (group) {
      diet = (group.diets || [])[0] || '';
      cuisine = group.theme || '';
    }
  }

  try {
    let appetizers, mains, desserts;

    if (SpoonacularAPI.isConfigured()) {
      // Use /recipes/random endpoint (3rd unique API endpoint)
      const buildTags = (type) => {
        const tags = [type];
        if (diet) tags.push(diet);
        if (cuisine) tags.push(cuisine);
        return tags.join(',');
      };

      const [appData, mainData, dessData] = await Promise.all([
        SpoonacularAPI.getRandomRecipes({ tags: buildTags('appetizer'), number: 3 }),
        SpoonacularAPI.getRandomRecipes({ tags: buildTags('main course'), number: 3 }),
        SpoonacularAPI.getRandomRecipes({ tags: buildTags('dessert'), number: 3 })
      ]);
      appetizers = appData.recipes || [];
      mains = mainData.recipes || [];
      desserts = dessData.recipes || [];
    } else {
      // Use sample data
      await new Promise(resolve => setTimeout(resolve, 1000));
      appetizers = SpoonacularAPI.getSampleRecipes('appetizer');
      mains = SpoonacularAPI.getSampleRecipes('main course');
      desserts = SpoonacularAPI.getSampleRecipes('dessert');
    }

    // Pick random from each category
    const plan = {};
    if (appetizers.length) plan.appetizer = appetizers[Math.floor(Math.random() * appetizers.length)];
    if (mains.length) plan['main course'] = mains[Math.floor(Math.random() * mains.length)];
    if (desserts.length) plan.dessert = desserts[Math.floor(Math.random() * desserts.length)];

    // Save to session
    sessionStorage.setItem('feast_current_plan', JSON.stringify(plan));

    // Render
    if (plan.appetizer) renderCourseSlot('appetizerSlot', plan.appetizer, 'appetizer');
    if (plan['main course']) renderCourseSlot('mainCourseSlot', plan['main course'], 'main course');
    if (plan.dessert) renderCourseSlot('dessertSlot', plan.dessert, 'dessert');

    if (loader) loader.classList.add('hidden');
    Utils.showToast('Meal plan generated! 🎉', 'success');

  } catch (error) {
    if (loader) loader.classList.add('hidden');
    Utils.showToast('Error generating meal plan.', 'error');
    console.error('Generate meal plan error:', error);
  }
}

/**
 * Save the current meal plan
 */
function saveMealPlan() {
  const plan = JSON.parse(sessionStorage.getItem('feast_current_plan') || '{}');

  if (!plan.appetizer && !plan['main course'] && !plan.dessert) {
    Utils.showToast('No recipes in the current plan to save.', 'error');
    return;
  }

  const groupId = document.getElementById('groupSelect').value;
  const groups = Utils.getFromStorage('feast_groups') || [];
  const group = groups.find(g => g.id === groupId);

  const savedPlan = {
    id: Utils.generateId(),
    name: group ? `${group.name} Meal Plan` : `Meal Plan`,
    groupId: groupId || null,
    groupName: group ? group.name : 'No Group',
    appetizer: plan.appetizer || null,
    mainCourse: plan['main course'] || null,
    dessert: plan.dessert || null,
    createdAt: new Date().toISOString()
  };

  const savedPlans = Utils.getFromStorage(MEAL_PLANS_KEY) || [];
  savedPlans.unshift(savedPlan);
  Utils.saveToStorage(MEAL_PLANS_KEY, savedPlans);

  Utils.showToast('Meal plan saved!', 'success');
  displaySavedMealPlans();
}

/**
 * Display saved meal plans
 */
function displaySavedMealPlans() {
  const container = document.getElementById('savedMealPlans');
  if (!container) return;

  const plans = Utils.getFromStorage(MEAL_PLANS_KEY) || [];

  if (plans.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📋</div>
        <h3>No Saved Plans</h3>
        <p>Generate a meal plan above, then save it for future reference.</p>
      </div>
    `;
    return;
  }

  let html = '';
  plans.forEach(plan => {
    const courses = [];
    if (plan.appetizer) courses.push(`🥗 ${plan.appetizer.title}`);
    if (plan.mainCourse) courses.push(`🍽️ ${plan.mainCourse.title}`);
    if (plan.dessert) courses.push(`🍰 ${plan.dessert.title}`);

    html += `
      <div class="group-card fade-in">
        <div class="group-card-header">
          <h3>${plan.name} - ${Utils.formatDate(plan.createdAt)}</h3>
          <div class="group-card-actions">
            <button class="btn btn-sm btn-primary" onclick="loadSavedPlan('${plan.id}')">Load</button>
            <button class="btn btn-sm btn-danger" onclick="deleteMealPlan('${plan.id}')">Delete</button>
          </div>
        </div>
        <div class="group-card-meta">
          <span>👥 ${plan.groupName}</span>
        </div>
        <ul style="padding-left: 8px; list-style: none; line-height: 2;">
          ${courses.map(c => `<li>${c}</li>`).join('')}
        </ul>
      </div>
    `;
  });

  container.innerHTML = html;
}

/**
 * Load a saved meal plan into the current working plan
 */
function loadSavedPlan(planId) {
  const plans = Utils.getFromStorage(MEAL_PLANS_KEY) || [];
  const plan = plans.find(p => p.id === planId);
  if (!plan) return;

  const currentPlan = {};
  if (plan.appetizer) currentPlan.appetizer = plan.appetizer;
  if (plan.mainCourse) currentPlan['main course'] = plan.mainCourse;
  if (plan.dessert) currentPlan.dessert = plan.dessert;

  sessionStorage.setItem('feast_current_plan', JSON.stringify(currentPlan));
  loadCurrentPlan();

  Utils.showToast('Meal plan loaded!', 'success');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * Delete a saved meal plan
 */
function deleteMealPlan(planId) {
  if (!confirm('Are you sure you want to delete this meal plan?')) return;

  let plans = Utils.getFromStorage(MEAL_PLANS_KEY) || [];
  plans = plans.filter(p => p.id !== planId);
  Utils.saveToStorage(MEAL_PLANS_KEY, plans);

  displaySavedMealPlans();
  Utils.showToast('Meal plan deleted.', 'info');
}

/**
 * Generate a shopping list from current plan and navigate to shopping page
 */
function generateShoppingList() {
  const plan = JSON.parse(sessionStorage.getItem('feast_current_plan') || '{}');

  if (!plan.appetizer && !plan['main course'] && !plan.dessert) {
    Utils.showToast('Add recipes to your plan first.', 'error');
    return;
  }

  // Collect all ingredients
  const allIngredients = [];
  const courses = [plan.appetizer, plan['main course'], plan.dessert].filter(Boolean);

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

  // Save to sessionStorage for the shopping page
  sessionStorage.setItem('feast_shopping_list', JSON.stringify(allIngredients));

  window.location.href = 'shopping.html';
}

// === Auto-apply URL type filter on search page ===
document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const type = urlParams.get('type');
  if (type) {
    const filterType = document.getElementById('filterType');
    if (filterType) {
      filterType.value = type;
      searchRecipes();
    }
  }
});
