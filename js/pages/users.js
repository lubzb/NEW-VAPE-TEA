// ═══════════════════════════════════════════════════════
//  USERS PAGE (admin only)
// ═══════════════════════════════════════════════════════

function renderUsers(el) {
    const users = getUsers();
    el.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;margin-bottom:1.2rem;">
          <h4 style="font-weight:600;">${t('users')}</h4>
          <button class="btn btn-primary" onclick="showAddUser()"><i class="fas fa-plus"></i> ${t('add')}</button>
        </div>
        <div class="card">
          <div class="table-wrap">
            <table>
              <thead><tr><th>${t('full_name')}</th><th>${t('username')}</th><th>${t('role')}</th><th>${t('actions')}</th></tr></thead>
              <tbody>
                ${users.map(u => `
                  <tr>
                    <td><strong>${u.name}</strong></td>
                    <td>${u.username}</td>
                    <td><span style="background:var(--accent-light);color:var(--accent);padding:2px 10px;border-radius:12px;font-size:0.7rem;font-weight:600;">${getRoleLabel(u.role)}</span></td>
                    <td>
                      <button class="btn btn-primary btn-xs" onclick="showEditUser(${u.id})"><i class="fas fa-edit"></i></button>
                      <button class="btn btn-warning btn-xs" onclick="showChangePassword(${u.id})"><i class="fas fa-key"></i></button>
                      ${u.role !== 'admin' ? `<button class="btn btn-danger btn-xs" onclick="deleteUser(${u.id})"><i class="fas fa-trash"></i></button>` : ''}
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
}

function showChangePassword(userId) {
    const u = getUsers().find(usr => usr.id === userId);
    if (!u) return;
    const html = `
        <form id="pwForm">
          <div class="form-group"><label>${t('current_password')}</label><input class="form-control" id="oldPw" type="password" required /></div>
          <div class="form-group"><label>${t('new_password')}</label><input class="form-control" id="newPw" type="password" required /></div>
          <div class="form-group"><label>${t('confirm_password')}</label><input class="form-control" id="confirmPw" type="password" required /></div>
        </form>
      `;
    openModal(t('change_password') + ' - ' + u.name, html, t('save'), async function () {
        const oldPw = document.getElementById('oldPw').value;
        const newPw = document.getElementById('newPw').value;
        const confirmPw = document.getElementById('confirmPw').value;
        if (oldPw !== u.password) { toast('Current password is incorrect', 'error'); return; }
        if (newPw.length < 4) { toast('New password must be at least 4 characters', 'error'); return; }
        if (newPw !== confirmPw) { toast('Passwords do not match', 'error'); return; }
        try {
            await updateUserDb(userId, { password: newPw });
            closeModal();
            toast(t('password_changed'), 'success');
            renderPage(currentRoute);
        } catch (e) {
            toast('Failed to change password: ' + e.message, 'error');
        }
    });
}

function showAddUser() {
    const roles = ['admin', 'manager', 'staff', 'warehouse', 'cashier'];
    const html = `
        <form id="userForm">
          <div class="form-group"><label>${t('full_name')}</label><input class="form-control" id="uName" required /></div>
          <div class="form-group"><label>${t('username')}</label><input class="form-control" id="uUsername" required /></div>
          <div class="form-group"><label>${t('password')}</label><input class="form-control" id="uPassword" type="password" required /></div>
          <div class="form-group"><label>${t('role')}</label>
            <select class="form-control" id="uRole">${roles.map(r => `<option value="${r}">${getRoleLabel(r)}</option>`).join('')}</select>
          </div>
        </form>
      `;
    openModal(t('add') + ' ' + t('user'), html, t('save'), async function () {
        const name = document.getElementById('uName').value.trim();
        const username = document.getElementById('uUsername').value.trim();
        const password = document.getElementById('uPassword').value.trim();
        const role = document.getElementById('uRole').value;
        if (!name || !username || !password) { toast('All fields required', 'error'); return; }
        if (getUsers().find(u => u.username === username)) { toast('Username already exists', 'error'); return; }
        try {
            await addUserDb({ name, username, password, role });
            closeModal();
            toast('User added!', 'success');
            renderPage(currentRoute);
        } catch (e) {
            toast('Failed to add user: ' + e.message, 'error');
        }
    });
}

function showEditUser(id) {
    const u = getUsers().find(user => user.id === id);
    if (!u) return;
    const roles = ['admin', 'manager', 'staff', 'warehouse', 'cashier'];
    const html = `
        <form id="userForm">
          <div class="form-group"><label>${t('full_name')}</label><input class="form-control" id="uName" value="${u.name}" required /></div>
          <div class="form-group"><label>${t('username')}</label><input class="form-control" id="uUsername" value="${u.username}" required /></div>
          <div class="form-group"><label>${t('password')}</label><input class="form-control" id="uPassword" type="password" placeholder="Leave blank to keep current" /></div>
          <div class="form-group"><label>${t('role')}</label>
            <select class="form-control" id="uRole">${roles.map(r => `<option value="${r}" ${r === u.role ? 'selected' : ''}>${getRoleLabel(r)}</option>`).join('')}</select>
          </div>
        </form>
      `;
    openModal(t('edit') + ' ' + t('user'), html, t('save'), async function () {
        const name = document.getElementById('uName').value.trim();
        const username = document.getElementById('uUsername').value.trim();
        const password = document.getElementById('uPassword').value.trim();
        const role = document.getElementById('uRole').value;
        if (!name || !username) { toast('Name and username required', 'error'); return; }
        try {
            await updateUserDb(id, password ? { name, username, password, role } : { name, username, role });
            closeModal();
            toast('User updated!', 'success');
            renderPage(currentRoute);
        } catch (e) {
            toast('Failed to update user: ' + e.message, 'error');
        }
    });
}

async function deleteUser(id) {
    if (!confirm(t('confirm_delete'))) return;
    try {
        await deleteUserDb(id);
        toast('User deleted', 'info');
        renderPage(currentRoute);
    } catch (e) {
        toast('Failed to delete user: ' + e.message, 'error');
    }
}
