// ═══════════════════════════════════════════════════════
//  UI HELPERS — toast notifications, modal dialog, sidebar
// ═══════════════════════════════════════════════════════

function toast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    const icons = { success: 'fa-check-circle', error: 'fa-times-circle', warning: 'fa-exclamation-triangle', info: 'fa-info-circle' };
    el.innerHTML = `<i class="fas ${icons[type] || icons.info}"></i> ${message}`;
    container.appendChild(el);
    setTimeout(() => {
        el.style.opacity = '0';
        el.style.transform = 'translateX(40px)';
        setTimeout(() => el.remove(), 400);
    }, 3500);
}

let modalCallback = null;

function openModal(title, html, confirmText, callback) {
    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalBody').innerHTML = html;
    const btn = document.getElementById('modalConfirmBtn');
    btn.textContent = confirmText || t('confirm');
    modalCallback = callback;
    document.getElementById('modalOverlay').classList.add('show');
    document.querySelectorAll('#modalBody .form-control').forEach(el => {
        if (el.tagName === 'INPUT' && el.type === 'file') {
            el.onchange = function (e) {
                const preview = document.getElementById('imagePreview');
                if (preview && e.target.files.length) {
                    const reader = new FileReader();
                    reader.onload = function (ev) {
                        preview.src = ev.target.result;
                        preview.style.display = 'block';
                    };
                    reader.readAsDataURL(e.target.files[0]);
                }
            };
        }
    });
}

function closeModal() {
    document.getElementById('modalOverlay').classList.remove('show');
    modalCallback = null;
}

function initModal() {
    document.getElementById('modalConfirmBtn').addEventListener('click', function () {
        if (modalCallback) modalCallback();
    });
    document.getElementById('modalOverlay').addEventListener('click', function (e) {
        if (e.target === this) closeModal();
    });
}

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const backdrop = document.getElementById('sidebarBackdrop');
    sidebar.classList.toggle('open');
    backdrop.classList.toggle('show');
}

function applyTheme(theme) {
    const html = document.documentElement;
    const themeBtn = document.getElementById('themeToggle');
    if (theme === 'dark') {
        html.classList.add('dark');
        if (themeBtn) themeBtn.innerHTML = '<i class="fas fa-sun"></i>';
    } else {
        html.classList.remove('dark');
        if (themeBtn) themeBtn.innerHTML = '<i class="fas fa-moon"></i>';
    }
}

async function toggleTheme() {
    const s = getSettings();
    const newSettings = { ...s, theme: s.theme === 'light' ? 'dark' : 'light' };
    try {
        await updateSettingsDb(newSettings);
        applyTheme(getSettings().theme);
        toast(getSettings().theme === 'dark' ? t('dark_mode') : t('light_mode'), 'info');
    } catch (e) {
        toast('Failed to update theme: ' + e.message, 'error');
    }
}

async function toggleLang() {
    const s = getSettings();
    const newSettings = { ...s, language: s.language === 'en' ? 'kh' : 'en' };
    try {
        await updateSettingsDb(newSettings);
        toast(getSettings().language === 'en' ? 'English' : 'ភាសាខ្មែរ', 'info');
        renderNav();
        renderPage(currentRoute);
        updatePageTitle(currentRoute);
    } catch (e) {
        toast('Failed to update language: ' + e.message, 'error');
    }
}

async function toggleCurrency() {
    const s = getSettings();
    const newSettings = { ...s, currency: s.currency === 'usd' ? 'khr' : 'usd' };
    try {
        await updateSettingsDb(newSettings);
        toast(getSettings().currency === 'usd' ? 'USD' : 'KHR', 'info');
        renderPage(currentRoute);
    } catch (e) {
        toast('Failed to update currency: ' + e.message, 'error');
    }
}
