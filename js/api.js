/* ============================================
   FEAST TOGETHER - Spoonacular API Module
   ============================================ */

const SpoonacularAPI = {
  // Spoonacular API key
  API_KEY: 'd70c248622b0451da42289f07934ecfe',
  BASE_URL: 'https://api.spoonacular.com',

  /**
   * Search for recipes
   * @param {Object} params - Search parameters
   * @returns {Promise<Object>} - Search results
   */
  async searchRecipes(params = {}) {
    const queryParams = new URLSearchParams({
      apiKey: this.API_KEY,
      number: params.number || 12,
      addRecipeInformation: true,
      fillIngredients: true,
      ...(params.query && { query: params.query }),
      ...(params.diet && { diet: params.diet }),
      ...(params.cuisine && { cuisine: params.cuisine }),
      ...(params.type && { type: params.type }),
      ...(params.offset && { offset: params.offset })
    });

    try {
      const response = await fetch(`${this.BASE_URL}/recipes/complexSearch?${queryParams}`);
      if (!response.ok) throw new Error(`API Error: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Search recipes error:', error);
      throw error;
    }
  },

  /**
   * Get recipe details by ID
   * @param {number} id - Recipe ID
   * @returns {Promise<Object>} - Recipe details
   */
  async getRecipeById(id) {
    try {
      const response = await fetch(
        `${this.BASE_URL}/recipes/${id}/information?apiKey=${this.API_KEY}&includeNutrition=true`
      );
      if (!response.ok) throw new Error(`API Error: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Get recipe error:', error);
      throw error;
    }
  },

  /**
   * Get random recipes
   * @param {Object} params - Parameters (tags, number)
   * @returns {Promise<Object>} - Random recipes
   */
  async getRandomRecipes(params = {}) {
    const queryParams = new URLSearchParams({
      apiKey: this.API_KEY,
      number: params.number || 3,
      ...(params.tags && { tags: params.tags })
    });

    try {
      const response = await fetch(`${this.BASE_URL}/recipes/random?${queryParams}`);
      if (!response.ok) throw new Error(`API Error: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Random recipes error:', error);
      throw error;
    }
  },

  /**
   * Get recipes by ingredients
   * @param {string} ingredients - Comma-separated ingredients
   * @returns {Promise<Array>} - Matching recipes
   */
  async getRecipesByIngredients(ingredients) {
    const queryParams = new URLSearchParams({
      apiKey: this.API_KEY,
      ingredients: ingredients,
      number: 10,
      ranking: 1,
      ignorePantry: true
    });

    try {
      const response = await fetch(`${this.BASE_URL}/recipes/findByIngredients?${queryParams}`);
      if (!response.ok) throw new Error(`API Error: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Recipes by ingredients error:', error);
      throw error;
    }
  },

  /**
   * Check if API key is configured
   */
  isConfigured() {
    return this.API_KEY && this.API_KEY !== 'YOUR_API_KEY_HERE';
  },

  /**
   * Returns sample/dummy data for demo purposes when API key is not set
   */
  getSampleRecipes(type = '') {
    const allRecipes = [
      {
        id: 1001,
        title: 'Bruschetta with Tomato and Basil',
        image: 'https://img.spoonacular.com/recipes/716429-312x231.jpg',
        readyInMinutes: 25,
        servings: 6,
        summary: 'Classic Italian bruschetta topped with fresh tomatoes, basil, garlic, and olive oil on crispy toasted bread.',
        diets: ['vegetarian', 'vegan'],
        cuisines: ['Italian', 'Mediterranean'],
        dishTypes: ['appetizer', 'starter'],
        extendedIngredients: [
          { id: 1, name: 'baguette', amount: 1, unit: 'loaf', aisle: 'Bakery' },
          { id: 2, name: 'tomatoes', amount: 4, unit: 'medium', aisle: 'Produce' },
          { id: 3, name: 'fresh basil', amount: 0.25, unit: 'cup', aisle: 'Produce' },
          { id: 4, name: 'garlic', amount: 3, unit: 'cloves', aisle: 'Produce' },
          { id: 5, name: 'olive oil', amount: 3, unit: 'tbsp', aisle: 'Oil, Vinegar, Salad Dressing' },
          { id: 6, name: 'balsamic vinegar', amount: 1, unit: 'tbsp', aisle: 'Oil, Vinegar, Salad Dressing' }
        ],
        instructions: '1. Preheat oven to 400°F.\n2. Slice baguette and brush with olive oil.\n3. Toast in oven until golden.\n4. Dice tomatoes and mix with basil, garlic, olive oil, and balsamic.\n5. Top toasted bread with tomato mixture and serve.'
      },
      {
        id: 1002,
        title: 'Spinach and Artichoke Dip',
        image: 'https://img.spoonacular.com/recipes/715495-312x231.jpg',
        readyInMinutes: 30,
        servings: 8,
        summary: 'Creamy hot dip loaded with spinach, artichoke hearts, and melted cheese. Perfect party appetizer.',
        diets: ['vegetarian'],
        cuisines: ['American'],
        dishTypes: ['appetizer'],
        extendedIngredients: [
          { id: 7, name: 'frozen spinach', amount: 10, unit: 'oz', aisle: 'Frozen' },
          { id: 8, name: 'artichoke hearts', amount: 14, unit: 'oz', aisle: 'Canned and Jarred' },
          { id: 9, name: 'cream cheese', amount: 8, unit: 'oz', aisle: 'Dairy' },
          { id: 10, name: 'sour cream', amount: 0.5, unit: 'cup', aisle: 'Dairy' },
          { id: 11, name: 'parmesan cheese', amount: 0.5, unit: 'cup', aisle: 'Dairy' },
          { id: 12, name: 'garlic', amount: 2, unit: 'cloves', aisle: 'Produce' }
        ],
        instructions: '1. Preheat oven to 350°F.\n2. Thaw and drain spinach.\n3. Mix all ingredients in a bowl.\n4. Transfer to baking dish.\n5. Bake for 25 minutes until bubbly.'
      },
      {
        id: 1003,
        title: 'Grilled Lemon Herb Chicken',
        image: 'https://img.spoonacular.com/recipes/782585-312x231.jpg',
        readyInMinutes: 45,
        servings: 4,
        summary: 'Juicy grilled chicken breasts marinated in lemon, herbs, and garlic. A crowd-pleasing main course.',
        diets: ['gluten free', 'paleo'],
        cuisines: ['American', 'Mediterranean'],
        dishTypes: ['main course'],
        extendedIngredients: [
          { id: 13, name: 'chicken breasts', amount: 4, unit: 'pieces', aisle: 'Meat' },
          { id: 14, name: 'lemons', amount: 2, unit: '', aisle: 'Produce' },
          { id: 15, name: 'olive oil', amount: 3, unit: 'tbsp', aisle: 'Oil, Vinegar, Salad Dressing' },
          { id: 16, name: 'garlic', amount: 4, unit: 'cloves', aisle: 'Produce' },
          { id: 17, name: 'fresh rosemary', amount: 2, unit: 'sprigs', aisle: 'Produce' },
          { id: 18, name: 'fresh thyme', amount: 4, unit: 'sprigs', aisle: 'Produce' },
          { id: 19, name: 'salt', amount: 1, unit: 'tsp', aisle: 'Spices and Seasonings' },
          { id: 20, name: 'black pepper', amount: 0.5, unit: 'tsp', aisle: 'Spices and Seasonings' }
        ],
        instructions: '1. Mix lemon juice, olive oil, minced garlic, and chopped herbs.\n2. Marinate chicken for 30 minutes.\n3. Preheat grill to medium-high.\n4. Grill chicken 6-7 minutes per side until cooked through.\n5. Let rest 5 minutes before serving.'
      },
      {
        id: 1004,
        title: 'Vegetable Stir-Fry with Tofu',
        image: 'https://img.spoonacular.com/recipes/716426-312x231.jpg',
        readyInMinutes: 30,
        servings: 4,
        summary: 'Colorful stir-fried vegetables with crispy tofu in a savory sauce. Quick, healthy main course.',
        diets: ['vegetarian', 'vegan'],
        cuisines: ['Chinese', 'Asian'],
        dishTypes: ['main course'],
        extendedIngredients: [
          { id: 21, name: 'firm tofu', amount: 14, unit: 'oz', aisle: 'Produce' },
          { id: 22, name: 'broccoli', amount: 2, unit: 'cups', aisle: 'Produce' },
          { id: 23, name: 'bell pepper', amount: 2, unit: 'medium', aisle: 'Produce' },
          { id: 24, name: 'soy sauce', amount: 3, unit: 'tbsp', aisle: 'Ethnic Foods' },
          { id: 25, name: 'sesame oil', amount: 1, unit: 'tbsp', aisle: 'Oil, Vinegar, Salad Dressing' },
          { id: 26, name: 'ginger', amount: 1, unit: 'tbsp', aisle: 'Produce' },
          { id: 27, name: 'cornstarch', amount: 1, unit: 'tbsp', aisle: 'Baking' },
          { id: 28, name: 'rice', amount: 2, unit: 'cups', aisle: 'Pasta and Rice' }
        ],
        instructions: '1. Press and cube tofu, then pan-fry until golden.\n2. Stir-fry vegetables in sesame oil.\n3. Mix soy sauce, ginger, and cornstarch for sauce.\n4. Combine tofu, vegetables, and sauce.\n5. Serve over steamed rice.'
      },
      {
        id: 1005,
        title: 'Pasta Primavera',
        image: 'https://img.spoonacular.com/recipes/654959-312x231.jpg',
        readyInMinutes: 35,
        servings: 6,
        summary: 'A vibrant pasta dish with fresh seasonal vegetables in a light garlic and olive oil sauce.',
        diets: ['vegetarian'],
        cuisines: ['Italian'],
        dishTypes: ['main course'],
        extendedIngredients: [
          { id: 29, name: 'penne pasta', amount: 1, unit: 'lb', aisle: 'Pasta and Rice' },
          { id: 30, name: 'zucchini', amount: 2, unit: 'medium', aisle: 'Produce' },
          { id: 31, name: 'cherry tomatoes', amount: 1, unit: 'cup', aisle: 'Produce' },
          { id: 32, name: 'bell pepper', amount: 1, unit: 'medium', aisle: 'Produce' },
          { id: 33, name: 'parmesan cheese', amount: 0.5, unit: 'cup', aisle: 'Dairy' },
          { id: 34, name: 'olive oil', amount: 3, unit: 'tbsp', aisle: 'Oil, Vinegar, Salad Dressing' },
          { id: 35, name: 'garlic', amount: 3, unit: 'cloves', aisle: 'Produce' }
        ],
        instructions: '1. Cook pasta according to package directions.\n2. Sauté garlic in olive oil.\n3. Add vegetables and cook until tender-crisp.\n4. Toss with pasta and parmesan.\n5. Season with salt and pepper.'
      },
      {
        id: 1006,
        title: 'Chocolate Lava Cake',
        image: 'https://img.spoonacular.com/recipes/665747-312x231.jpg',
        readyInMinutes: 30,
        servings: 4,
        summary: 'Rich, indulgent chocolate cakes with a warm, gooey chocolate center. An impressive dessert.',
        diets: ['vegetarian'],
        cuisines: ['French'],
        dishTypes: ['dessert'],
        extendedIngredients: [
          { id: 36, name: 'dark chocolate', amount: 4, unit: 'oz', aisle: 'Baking' },
          { id: 37, name: 'butter', amount: 0.5, unit: 'cup', aisle: 'Dairy' },
          { id: 38, name: 'eggs', amount: 2, unit: '', aisle: 'Dairy' },
          { id: 39, name: 'egg yolks', amount: 2, unit: '', aisle: 'Dairy' },
          { id: 40, name: 'sugar', amount: 0.25, unit: 'cup', aisle: 'Baking' },
          { id: 41, name: 'flour', amount: 2, unit: 'tbsp', aisle: 'Baking' },
          { id: 42, name: 'vanilla extract', amount: 1, unit: 'tsp', aisle: 'Baking' }
        ],
        instructions: '1. Preheat oven to 425°F.\n2. Melt chocolate and butter together.\n3. Whisk eggs, yolks, and sugar. Combine with chocolate.\n4. Fold in flour and vanilla.\n5. Pour into greased ramekins.\n6. Bake 12-14 minutes. Center should be soft.\n7. Invert onto plates and serve immediately.'
      },
      {
        id: 1007,
        title: 'Mango Sorbet',
        image: 'https://img.spoonacular.com/recipes/649056-312x231.jpg',
        readyInMinutes: 15,
        servings: 4,
        summary: 'A refreshing and light frozen dessert made with ripe mangoes. Dairy-free and naturally sweet.',
        diets: ['vegan', 'gluten free'],
        cuisines: ['Indian'],
        dishTypes: ['dessert'],
        extendedIngredients: [
          { id: 43, name: 'frozen mango', amount: 4, unit: 'cups', aisle: 'Frozen' },
          { id: 44, name: 'lime juice', amount: 2, unit: 'tbsp', aisle: 'Produce' },
          { id: 45, name: 'honey', amount: 2, unit: 'tbsp', aisle: 'Baking' },
          { id: 46, name: 'coconut milk', amount: 0.25, unit: 'cup', aisle: 'Dairy' }
        ],
        instructions: '1. Blend frozen mango chunks until smooth.\n2. Add lime juice, honey, and coconut milk.\n3. Blend until creamy.\n4. Freeze for 1-2 hours.\n5. Scoop and serve.'
      },
      {
        id: 1008,
        title: 'Caesar Salad',
        image: 'https://img.spoonacular.com/recipes/649886-312x231.jpg',
        readyInMinutes: 20,
        servings: 4,
        summary: 'A classic Caesar salad with crispy croutons, tangy dressing, and shaved parmesan cheese.',
        diets: ['vegetarian'],
        cuisines: ['Italian', 'American'],
        dishTypes: ['appetizer', 'salad'],
        extendedIngredients: [
          { id: 47, name: 'romaine lettuce', amount: 2, unit: 'heads', aisle: 'Produce' },
          { id: 48, name: 'croutons', amount: 1, unit: 'cup', aisle: 'Bakery' },
          { id: 49, name: 'parmesan cheese', amount: 0.5, unit: 'cup', aisle: 'Dairy' },
          { id: 50, name: 'caesar dressing', amount: 0.5, unit: 'cup', aisle: 'Oil, Vinegar, Salad Dressing' },
          { id: 51, name: 'lemon', amount: 1, unit: '', aisle: 'Produce' }
        ],
        instructions: '1. Wash and chop romaine lettuce.\n2. Toss with Caesar dressing.\n3. Top with croutons and shaved parmesan.\n4. Squeeze fresh lemon over salad.\n5. Season with black pepper.'
      },
      {
        id: 1009,
        title: 'Beef Tacos',
        image: 'https://img.spoonacular.com/recipes/795751-312x231.jpg',
        readyInMinutes: 25,
        servings: 6,
        summary: 'Seasoned ground beef tacos with fresh toppings. A fun, customizable main course for groups.',
        diets: [],
        cuisines: ['Mexican'],
        dishTypes: ['main course'],
        extendedIngredients: [
          { id: 52, name: 'ground beef', amount: 1.5, unit: 'lbs', aisle: 'Meat' },
          { id: 53, name: 'taco shells', amount: 12, unit: '', aisle: 'Ethnic Foods' },
          { id: 54, name: 'lettuce', amount: 2, unit: 'cups', aisle: 'Produce' },
          { id: 55, name: 'tomatoes', amount: 2, unit: 'medium', aisle: 'Produce' },
          { id: 56, name: 'cheddar cheese', amount: 1, unit: 'cup', aisle: 'Dairy' },
          { id: 57, name: 'sour cream', amount: 0.5, unit: 'cup', aisle: 'Dairy' },
          { id: 58, name: 'taco seasoning', amount: 1, unit: 'packet', aisle: 'Spices and Seasonings' }
        ],
        instructions: '1. Brown ground beef in a skillet.\n2. Add taco seasoning with water per package.\n3. Warm taco shells.\n4. Prepare toppings.\n5. Assemble tacos and serve.'
      }
    ];

    if (type) {
      return allRecipes.filter(r =>
        r.dishTypes.some(dt => dt.toLowerCase().includes(type.toLowerCase()))
      );
    }
    return allRecipes;
  }
};
