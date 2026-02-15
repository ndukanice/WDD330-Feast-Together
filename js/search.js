/* ============================================
   FEAST TOGETHER - Search Module
   Handles recipe search, display, and detail modals
   ============================================ */

/**
 * Search for recipes using the API or sample data
 */
async function searchRecipes() {
  const query = document.getElementById('searchInput').value.trim();
  const diet = document.getElementById('filterDiet').value;
  const cuisine = document.getElementById('filterCuisine').value;
  const type = document.getElementById('filterType').value;

  const resultsContainer = document.getElementById('searchResults');
  const loader = document.getElementById('searchLoader');

  // Show loading
  loader.classList.remove('hidden');
  resultsContainer.innerHTML = '';

  try {
    let recipes = [];

    if (SpoonacularAPI.isConfigured()) {
      // Use live API
      const data = await SpoonacularAPI.searchRecipes({
        query,
        diet,
        cuisine,
        type,
        number: 12
      });
      recipes = data.results || [];
    } else {
      // Use sample data for demo
      await new Promise(resolve => setTimeout(resolve, 800)); // Simulate API delay
      let sampleRecipes = SpoonacularAPI.getSampleRecipes();

      // Filter by type
      if (type) {
        sampleRecipes = sampleRecipes.filter(r =>
          r.dishTypes.some(dt => dt.toLowerCase().includes(type.toLowerCase()))
        );
      }

      // Filter by diet
      if (diet) {
        sampleRecipes = sampleRecipes.filter(r =>
          r.diets.some(d => d.toLowerCase().includes(diet.toLowerCase()))
        );
      }

      // Filter by cuisine
      if (cuisine) {
        sampleRecipes = sampleRecipes.filter(r =>
          r.cuisines.some(c => c.toLowerCase().includes(cuisine.toLowerCase()))
        );
      }

      // Filter by search query
      if (query) {
        const q = query.toLowerCase();
        sampleRecipes = sampleRecipes.filter(r =>
          r.title.toLowerCase().includes(q) ||
          r.summary.toLowerCase().includes(q) ||
          r.extendedIngredients.some(ing => ing.name.toLowerCase().includes(q))
        );
      }

      recipes = sampleRecipes;
    }

    // Hide loader
    loader.classList.add('hidden');

    // Display results
    if (recipes.length === 0) {
      resultsContainer.innerHTML = `
        <div class="empty-state fade-in">
          <div class="empty-icon">😕</div>
          <h3>No Recipes Found</h3>
          <p>Try adjusting your search terms or filters.</p>
        </div>
      `;
      return;
    }

    displayRecipeCards(recipes, resultsContainer);

  } catch (error) {
    loader.classList.add('hidden');
    resultsContainer.innerHTML = `
      <div class="alert alert-error">
        <span>❌</span>
        <span>Error fetching recipes. Please try again later.</span>
      </div>
    `;
    console.error('Search error:', error);
  }
}

/**
 * Display recipe cards in a grid
 */
function displayRecipeCards(recipes, container) {
  let html = '<div class="recipe-grid">';

  recipes.forEach((recipe, index) => {
    const diets = (recipe.diets || []).map(d =>
      `<span class="tag tag-diet">${Utils.capitalize(d)}</span>`
    ).join('');

    const cuisines = (recipe.cuisines || []).slice(0, 2).map(c =>
      `<span class="tag tag-cuisine">${Utils.capitalize(c)}</span>`
    ).join('');

    const types = (recipe.dishTypes || []).slice(0, 2).map(t =>
      `<span class="tag tag-type">${Utils.capitalize(t)}</span>`
    ).join('');

    const summary = Utils.truncateText(Utils.stripHtml(recipe.summary || ''), 100);

    html += `
      <div class="card fade-in-up delay-${Math.min(index % 4, 3)}" style="animation-delay: ${index * 0.1}s;">
        <img src="${recipe.image || 'https://via.placeholder.com/312x231?text=No+Image'}"
             alt="${recipe.title}" class="card-img"
             onerror="this.src='https://via.placeholder.com/312x231?text=No+Image'">
        <div class="card-body">
          <h3>${recipe.title}</h3>
          <p>${summary}</p>
          <div class="mb-1">
            ${types}${diets}${cuisines}
          </div>
          <div style="display: flex; gap: 8px; margin-top: 12px; flex-wrap: wrap;">
            <button class="btn btn-sm btn-primary" onclick='viewRecipeDetail(${JSON.stringify(recipe).replace(/'/g, "&#39;")})'>View Details</button>
            <button class="btn btn-sm btn-secondary" onclick='addToMealPlan(${JSON.stringify(recipe).replace(/'/g, "&#39;")})'>+ Meal Plan</button>
          </div>
        </div>
      </div>
    `;
  });

  html += '</div>';
  container.innerHTML = html;
}

/**
 * View recipe detail in modal
 * Uses the /recipes/{id}/information endpoint for full details
 */
async function viewRecipeDetail(recipe) {
  const modal = document.getElementById('recipeModal');
  const title = document.getElementById('modalRecipeTitle');
  const content = document.getElementById('modalRecipeContent');

  // Show modal with loading state
  title.textContent = recipe.title;
  content.innerHTML = '<div class="loader"><div class="spinner"></div></div>';
  modal.classList.add('active');

  // Fetch full recipe details from API (2nd unique endpoint)
  let fullRecipe = recipe;
  try {
    if (SpoonacularAPI.isConfigured() && recipe.id) {
      fullRecipe = await SpoonacularAPI.getRecipeById(recipe.id);
    }
  } catch (error) {
    console.warn('Could not fetch full details, using search data:', error);
  }

  const diets = (fullRecipe.diets || []).map(d =>
    `<span class="tag tag-diet">${Utils.capitalize(d)}</span>`
  ).join('');

  const ingredients = (fullRecipe.extendedIngredients || []).map(ing =>
    `<li>${ing.amount} ${ing.unit} ${ing.name}</li>`
  ).join('');

  const instructions = fullRecipe.instructions || fullRecipe.analyzedInstructions?.[0]?.steps?.map(s => s.step).join('\n') || 'No instructions available.';

  // Nutrition info (from full details endpoint)
  const nutrition = fullRecipe.nutrition;
  let nutritionHtml = '';
  if (nutrition && nutrition.nutrients) {
    const keyNutrients = nutrition.nutrients.filter(n =>
      ['Calories', 'Protein', 'Fat', 'Carbohydrates', 'Fiber', 'Sugar'].includes(n.name)
    );
    if (keyNutrients.length > 0) {
      nutritionHtml = `
        <h3 style="margin-bottom: 12px;">📊 Nutrition (per serving)</h3>
        <div style="display: flex; flex-wrap: wrap; gap: 12px; margin-bottom: 20px;">
          ${keyNutrients.map(n => `
            <div style="background: var(--neutral-light); padding: 8px 14px; border-radius: 8px; text-align: center;">
              <div style="font-weight: 600; color: var(--primary);">${Math.round(n.amount)}${n.unit}</div>
              <div style="font-size: 0.8rem; color: var(--neutral-mid);">${n.name}</div>
            </div>
          `).join('')}
        </div>
      `;
    }
  }

  content.innerHTML = `
    <img src="${fullRecipe.image || 'https://via.placeholder.com/600x300?text=No+Image'}"
         alt="${fullRecipe.title}"
         style="width: 100%; border-radius: 8px; margin-bottom: 16px; max-height: 300px; object-fit: cover;"
         onerror="this.src='https://via.placeholder.com/600x300?text=No+Image'">

    <div style="display: flex; gap: 24px; margin-bottom: 16px; flex-wrap: wrap; color: var(--neutral-mid); font-size: 0.95rem;">
      <span>⏱️ ${fullRecipe.readyInMinutes || '?'} minutes</span>
      <span>👥 ${fullRecipe.servings || '?'} servings</span>
      ${fullRecipe.healthScore ? `<span>💚 Health Score: ${fullRecipe.healthScore}</span>` : ''}
      ${fullRecipe.pricePerServing ? `<span>💰 $${(fullRecipe.pricePerServing / 100).toFixed(2)}/serving</span>` : ''}
    </div>

    <div class="mb-2">${diets}</div>

    <p style="margin-bottom: 20px; color: var(--neutral-mid); line-height: 1.7;">
      ${Utils.stripHtml(fullRecipe.summary || '')}
    </p>

    ${nutritionHtml}

    <h3 style="margin-bottom: 12px;">🧾 Ingredients</h3>
    <ul style="margin-bottom: 20px; padding-left: 20px; line-height: 2;">
      ${ingredients || '<li>No ingredients listed</li>'}
    </ul>

    <h3 style="margin-bottom: 12px;">📝 Instructions</h3>
    <div style="line-height: 1.8; white-space: pre-line; color: var(--neutral-mid);">
      ${Utils.stripHtml(instructions)}
    </div>

    <div style="margin-top: 24px; display: flex; gap: 12px;">
      <button class="btn btn-primary" onclick='addToMealPlan(${JSON.stringify(fullRecipe).replace(/'/g, "&#39;")}); closeRecipeModal();'>
        + Add to Meal Plan
      </button>
      <button class="btn btn-secondary" onclick="closeRecipeModal()">Close</button>
    </div>
  `;
}

/**
 * Close recipe detail modal
 */
function closeRecipeModal() {
  document.getElementById('recipeModal').classList.remove('active');
}

/**
 * Add a recipe to the current meal plan (stored in sessionStorage)
 */
function addToMealPlan(recipe) {
  // Determine the course type
  const types = recipe.dishTypes || [];
  let courseType = 'main course'; // default

  if (types.some(t => t.toLowerCase().includes('appetizer') || t.toLowerCase().includes('starter') || t.toLowerCase().includes('salad'))) {
    courseType = 'appetizer';
  } else if (types.some(t => t.toLowerCase().includes('dessert'))) {
    courseType = 'dessert';
  } else if (types.some(t => t.toLowerCase().includes('main'))) {
    courseType = 'main course';
  }

  // Save to sessionStorage for meal plan page
  const currentPlan = JSON.parse(sessionStorage.getItem('feast_current_plan') || '{}');
  currentPlan[courseType] = recipe;
  sessionStorage.setItem('feast_current_plan', JSON.stringify(currentPlan));

  Utils.showToast(`"${recipe.title}" added as ${Utils.capitalize(courseType)}!`, 'success');
}
