// ═══════════════════════════════════════════════════════
//  ROUTER — sidebar nav + page dispatch
// ═══════════════════════════════════════════════════════

const routes = {
    dashboard: { label: 'dashboard', icon: 'fa-chart-pie', roles: ['admin', 'manager', 'staff', 'warehouse', 'cashier'] },
    pos: { label: 'pos', icon: 'fa-cash-register', roles: ['admin', 'manager', 'staff', 'cashier'] },
    products: { label: 'products', icon: 'fa-box', roles: ['admin', 'manager', 'warehouse'] },
    categories: { label: 'categories', icon: 'fa-tags', roles: ['admin', 'manager'] },
    customers: { label: 'customers', icon: 'fa-users', roles: ['admin', 'manager', 'staff', 'cashier'] },
    users: { label: 'users', icon: 'fa-user-cog', roles: ['admin'] },
    reports: { label: 'reports', icon: 'fa-file-alt', roles: ['admin', 'manager'] },
    settings: { label: 'settings', icon: 'fa-cog', roles: ['admin', 'manager'] }
};

let currentRoute = 'dashboard';

function getNavItems() {
    const user = getCurrentUser();
    if (!user) return [];
    const items = [];
    for (const [key, route] of Object.entries(routes)) {
        if (route.roles.includes(user.role)) items.push({ key, ...route });
    }
    return items;
}

function renderNav() {
    const nav = document.getElementById('navMenu');
    const items = getNavItems();
    nav.innerHTML = items.map(item =>
        `<div class="nav-item ${currentRoute === item.key ? 'active' : ''}" data-route="${item.key}">
          <i class="fas ${item.icon}"></i> ${t(item.label)}
        </div>`
    ).join('');
    nav.querySelectorAll('.nav-item').forEach(el => {
        el.addEventListener('click', function () {
            navigateTo(this.dataset.route);
            if (window.innerWidth <= 1024) toggleSidebar();
        });
    });
    const user = getCurrentUser();
    if (user) {
        document.getElementById('userAvatar').textContent = user.name.charAt(0).toUpperCase();
        document.getElementById('userName').textContent = user.name;
        document.getElementById('userRole').textContent = getRoleLabel(user.role);
    }
}

function navigateTo(route) {
    if (!routes[route]) route = 'dashboard';
    const user = getCurrentUser();
    if (!user || !routes[route].roles.includes(user.role)) {
        toast('Access denied', 'error');
        return;
    }
    currentRoute = route;
    renderNav();
    updatePageTitle(route);
    renderPage(route);
}

function updatePageTitle(route) {
    const r = routes[route];
    if (r) document.getElementById('pageTitle').innerHTML = `${t(r.label)} <small>${t(r.label)}</small>`;
}

function renderPage(route) {
    const content = document.getElementById('pageContent');
    switch (route) {
        case 'dashboard': renderDashboard(content); break;
        case 'pos': renderPOS(content); break;
        case 'products': renderProducts(content); break;
        case 'categories': renderCategories(content); break;
        case 'customers': renderCustomers(content); break;
        case 'users': renderUsers(content); break;
        case 'reports': renderReports(content); break;
        case 'settings': renderSettings(content); break;
        default: content.innerHTML = `<div class="card"><p>${t('no_data')}</p></div>`;
    }
}
