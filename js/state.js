// ═══════════════════════════════════════════════════════
//  APP STATE — in-memory cache populated from Supabase.
//  Pages read synchronously from this cache; db.js keeps
//  it in sync with the real database.
// ═══════════════════════════════════════════════════════

const cache = {
    currentUser: null,
    users: [],
    categories: [],
    products: [],
    sales: [],
    customers: [],
    settings: {
        language: 'en',
        currency: 'usd',
        theme: 'light',
        telegramBotToken: '',
        telegramChatId: '',
        autoSendReport: true,
        lastReportDate: ''
    }
};

function getUsers() { return cache.users; }
function getCategories() { return cache.categories; }
function getProducts() { return cache.products; }
function getSales() { return cache.sales; }
function getCustomers() { return cache.customers; }
function getSettingsCache() { return cache.settings; }
function getSettings() { return cache.settings; }
function getCurrentUser() { return cache.currentUser; }

function nextId(arr) { return arr.length ? Math.max(...arr.map(a => a.id || 0)) + 1 : 1; }

function formatDate(ts) { return new Date(ts).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }); }
function formatTime(ts) { return new Date(ts).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }); }
function formatDateTime(ts) { return formatDate(ts) + ' ' + formatTime(ts); }

function getCurrencySymbol() {
    const s = getSettings();
    return s.currency === 'usd' ? '$' : '៛';
}
function formatPrice(amount) {
    const s = getSettings();
    if (s.currency === 'usd') return '$' + (amount || 0).toFixed(2);
    return '៛' + Math.round(amount || 0).toLocaleString();
}
function formatPriceBoth(amountUsd, amountKhr) {
    return '$' + (amountUsd || 0).toFixed(2) + ' / ៛' + Math.round(amountKhr || 0).toLocaleString();
}
function getPrice(product) {
    const s = getSettings();
    return s.currency === 'usd' ? product.price_usd : product.price_khr;
}
function getCategoryName(id) {
    const c = getCategories().find(cat => cat.id === id);
    return c ? c.name : 'Uncategorized';
}
function getUser(id) { return getUsers().find(u => u.id === id); }
function getUserName(id) { const u = getUser(id); return u ? u.name : 'Unknown'; }
function getRoleLabel(role) {
    const map = { admin: 'Admin', manager: 'Manager', staff: 'Staff', warehouse: 'Warehouse', cashier: 'Cashier' };
    return map[role] || role;
}
function getCustomer(id) { return getCustomers().find(c => c.id === id); }
function getCustomerName(id) { const c = getCustomer(id); return c ? c.name : 'Walk-in Customer'; }
