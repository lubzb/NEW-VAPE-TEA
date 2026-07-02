// ═══════════════════════════════════════════════════════
//  CATEGORIES PAGE
// ═══════════════════════════════════════════════════════

function renderCategories(el) {
    const categories = getCategories();
    const user = getCurrentUser();
    const canEdit = ['admin', 'manager'].includes(user.role);

    el.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;margin-bottom:1.2rem;">
          <h4 style="font-weight:600;">${t('categories')}</h4>
          ${canEdit ? `<button class="btn btn-primary" onclick="showAddCategory()"><i class="fas fa-plus"></i> ${t('add')}</button>` : ''}
        </div>
        <div class="card">
          <div class="table-wrap">
            <table>
              <thead><tr><th>${t('name')}</th><th>${t('description')}</th>${canEdit ? `<th>${t('actions')}</th>` : ''}</tr></thead>
              <tbody>
                ${categories.length ? categories.map(c => `
                  <tr>
                    <td><strong>${c.name}</strong></td>
                    <td>${c.description || '-'}</td>
                    ${canEdit ? `<td>
                      <button class="btn btn-primary btn-xs" onclick="showEditCategory(${c.id})"><i class="fas fa-edit"></i></button>
                      <button class="btn btn-danger btn-xs" onclick="deleteCategory(${c.id})"><i class="fas fa-trash"></i></button>
                    </td>` : ''}
                  </tr>
                `).join('') : `<tr><td colspan="${canEdit ? 3 : 2}" style="text-align:center;padding:2rem;color:var(--text-secondary);">${t('no_data')}</td></tr>`}
              </tbody>
            </table>
          </div>
        </div>
      `;
}

function showAddCategory() {
    const html = `
        <form id="catForm">
          <div class="form-group"><label>${t('name')}</label><input class="form-control" id="cName" required /></div>
          <div class="form-group"><label>${t('description')}</label><textarea class="form-control" id="cDesc" rows="2"></textarea></div>
        </form>
      `;
    openModal(t('add') + ' ' + t('category'), html, t('save'), async function () {
        const name = document.getElementById('cName').value.trim();
        const description = document.getElementById('cDesc').value.trim();
        if (!name) { toast('Name is required', 'error'); return; }
        try {
            await addCategoryDb({ name, description });
            closeModal();
            toast('Category added!', 'success');
            renderPage(currentRoute);
        } catch (e) {
            toast('Failed to add category: ' + e.message, 'error');
        }
    });
}

function showEditCategory(id) {
    const c = getCategories().find(cat => cat.id === id);
    if (!c) return;
    const html = `
        <form id="catForm">
          <div class="form-group"><label>${t('name')}</label><input class="form-control" id="cName" value="${c.name}" required /></div>
          <div class="form-group"><label>${t('description')}</label><textarea class="form-control" id="cDesc" rows="2">${c.description || ''}</textarea></div>
        </form>
      `;
    openModal(t('edit') + ' ' + t('category'), html, t('save'), async function () {
        const name = document.getElementById('cName').value.trim();
        const description = document.getElementById('cDesc').value.trim();
        if (!name) { toast('Name is required', 'error'); return; }
        try {
            await updateCategoryDb(id, { name, description });
            closeModal();
            toast('Category updated!', 'success');
            renderPage(currentRoute);
        } catch (e) {
            toast('Failed to update category: ' + e.message, 'error');
        }
    });
}

async function deleteCategory(id) {
    if (!confirm(t('confirm_delete'))) return;
    try {
        await deleteCategoryDb(id);
        toast('Category deleted', 'info');
        renderPage(currentRoute);
    } catch (e) {
        toast('Failed to delete category: ' + e.message, 'error');
    }
}
