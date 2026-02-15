/* ============================================
   FEAST TOGETHER - Group Profile Module
   Handles group creation, editing, and display
   ============================================ */

const GROUPS_KEY = 'feast_groups';

/**
 * Initialize group profiles page
 */
document.addEventListener('DOMContentLoaded', () => {
  if (!document.getElementById('groupsList')) return;
  displayGroups();
});

/**
 * Open the create/edit group modal
 */
function openGroupModal(groupId = null) {
  const modal = document.getElementById('groupModal');
  const title = document.getElementById('groupModalTitle');
  const form = document.getElementById('groupForm');

  // Reset form
  form.reset();
  document.getElementById('groupId').value = '';

  if (groupId) {
    // Edit mode
    title.textContent = 'Edit Group';
    const groups = Utils.getFromStorage(GROUPS_KEY) || [];
    const group = groups.find(g => g.id === groupId);

    if (group) {
      document.getElementById('groupId').value = group.id;
      document.getElementById('groupName').value = group.name;
      document.getElementById('groupSize').value = group.size;
      document.getElementById('groupTheme').value = group.theme || '';
      document.getElementById('groupNotes').value = group.notes || '';

      // Set multi-select diets
      const dietSelect = document.getElementById('groupDiet');
      Array.from(dietSelect.options).forEach(opt => {
        opt.selected = (group.diets || []).includes(opt.value);
      });
    }
  } else {
    title.textContent = 'Create New Group';
  }

  modal.classList.add('active');
}

/**
 * Close the group modal
 */
function closeGroupModal() {
  document.getElementById('groupModal').classList.remove('active');
}

/**
 * Handle group form submission
 */
document.addEventListener('DOMContentLoaded', () => {
  const groupForm = document.getElementById('groupForm');
  if (!groupForm) return;

  groupForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const groupId = document.getElementById('groupId').value;
    const name = document.getElementById('groupName').value.trim();
    const size = parseInt(document.getElementById('groupSize').value);
    const theme = document.getElementById('groupTheme').value;
    const notes = document.getElementById('groupNotes').value.trim();

    // Get selected diets
    const dietSelect = document.getElementById('groupDiet');
    const diets = Array.from(dietSelect.selectedOptions).map(opt => opt.value);

    const groups = Utils.getFromStorage(GROUPS_KEY) || [];

    if (groupId) {
      // Update existing group
      const index = groups.findIndex(g => g.id === groupId);
      if (index !== -1) {
        groups[index] = {
          ...groups[index],
          name,
          size,
          diets,
          theme,
          notes,
          updatedAt: new Date().toISOString()
        };
      }
      Utils.showToast('Group updated!', 'success');
    } else {
      // Create new group
      const newGroup = {
        id: Utils.generateId(),
        name,
        size,
        diets,
        theme,
        notes,
        createdAt: new Date().toISOString()
      };
      groups.push(newGroup);
      Utils.showToast('Group created!', 'success');
    }

    Utils.saveToStorage(GROUPS_KEY, groups);
    closeGroupModal();
    displayGroups();
  });
});

/**
 * Display all group profiles
 */
function displayGroups() {
  const container = document.getElementById('groupsList');
  if (!container) return;

  const groups = Utils.getFromStorage(GROUPS_KEY) || [];

  if (groups.length === 0) {
    container.innerHTML = `
      <div class="empty-state fade-in">
        <div class="empty-icon">👥</div>
        <h3>No Groups Yet</h3>
        <p>Create your first group profile to get personalized meal recommendations for your gathering.</p>
      </div>
    `;
    return;
  }

  let html = '';
  groups.forEach((group, index) => {
    const diets = (group.diets || []).map(d =>
      `<span class="tag tag-diet">${Utils.capitalize(d)}</span>`
    ).join('');

    const theme = group.theme
      ? `<span class="tag tag-cuisine">${Utils.capitalize(group.theme)}</span>`
      : '';

    html += `
      <div class="group-card fade-in-up" style="animation-delay: ${index * 0.1}s;">
        <div class="group-card-header">
          <h3>${group.name}</h3>
          <div class="group-card-actions">
            <button class="btn btn-sm btn-primary" onclick="planForGroup('${group.id}')">Plan Meals</button>
            <button class="btn btn-sm btn-secondary" onclick="openGroupModal('${group.id}')">Edit</button>
            <button class="btn btn-sm btn-danger" onclick="deleteGroup('${group.id}')">Delete</button>
          </div>
        </div>
        <div class="group-card-meta">
          <span>👥 ${group.size} guests</span>
          <span>📅 Created ${Utils.formatDate(group.createdAt)}</span>
        </div>
        <div class="mb-1">
          ${theme}
          ${diets}
        </div>
        ${group.notes ? `<p style="color: var(--neutral-mid); font-size: 0.9rem; margin-top: 8px;">📝 ${group.notes}</p>` : ''}
      </div>
    `;
  });

  container.innerHTML = html;
}

/**
 * Delete a group profile
 */
function deleteGroup(groupId) {
  if (!confirm('Are you sure you want to delete this group?')) return;

  let groups = Utils.getFromStorage(GROUPS_KEY) || [];
  groups = groups.filter(g => g.id !== groupId);
  Utils.saveToStorage(GROUPS_KEY, groups);

  displayGroups();
  Utils.showToast('Group deleted.', 'info');
}

/**
 * Navigate to meal plan page with group pre-selected
 */
function planForGroup(groupId) {
  sessionStorage.setItem('feast_selected_group', groupId);
  window.location.href = 'mealplan.html';
}
