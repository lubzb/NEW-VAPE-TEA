// ═══════════════════════════════════════════════════════
//  DB LAYER — talks to Supabase, keeps `cache` (state.js) in sync.
//  Table names / columns must match sql/schema.sql.
// ═══════════════════════════════════════════════════════

// ── Row -> App-object mappers (snake_case DB columns -> camelCase app fields) ──
function mapCategory(r) { return { id: r.id, name: r.name, description: r.description || '' }; }

function mapProduct(r) {
    return {
        id: r.id, name: r.name, description: r.description || '', category: r.category_id,
        price_usd: Number(r.price_usd || 0), price_khr: Number(r.price_khr || 0), stock: r.stock || 0,
        image: r.image || '', barcode: r.barcode || '',
        created: r.created ? new Date(r.created).getTime() : Date.now()
    };
}

function mapCustomer(r) {
    return {
        id: r.id, name: r.name, phone: r.phone || '', email: r.email || '', address: r.address || '',
        debt_balance: Number(r.debt_balance || 0), created: r.created ? new Date(r.created).getTime() : Date.now()
    };
}

function mapUser(r) {
    return {
        id: r.id, username: r.username, password: r.password, name: r.name, role: r.role,
        created: r.created ? new Date(r.created).getTime() : Date.now()
    };
}

function mapSale(r) {
    return {
        id: r.id, items: r.items || [], total_usd: Number(r.total_usd || 0), total_khr: Number(r.total_khr || 0),
        subtotal_usd: Number(r.subtotal_usd || 0), subtotal_khr: Number(r.subtotal_khr || 0),
        tax: Number(r.tax || 0), discount: Number(r.discount || 0), payment: r.payment,
        customerId: r.customer_id, debt_amount: Number(r.debt_amount || 0),
        date: r.date ? new Date(r.date).getTime() : Date.now(),
        userId: r.user_id, userName: r.user_name, is_payment: !!r.is_payment,
        payment_amount: r.payment_amount != null ? Number(r.payment_amount) : null,
        payment_method: r.payment_method || null
    };
}

function mapSettings(r) {
    if (!r) return cache.settings;
    return {
        language: r.language || 'en', currency: r.currency || 'usd', theme: r.theme || 'light',
        telegramBotToken: r.telegram_bot_token || '', telegramChatId: r.telegram_chat_id || '',
        autoSendReport: r.auto_send_report !== false, lastReportDate: r.last_report_date || ''
    };
}

// ── Reload individual tables into cache ──
async function reloadCategories() {
    const { data, error } = await sb.from('categories').select('*').order('id');
    if (error) throw error;
    cache.categories = (data || []).map(mapCategory);
}
async function reloadProducts() {
    const { data, error } = await sb.from('products').select('*').order('id');
    if (error) throw error;
    cache.products = (data || []).map(mapProduct);
}
async function reloadCustomers() {
    const { data, error } = await sb.from('customers').select('*').order('id');
    if (error) throw error;
    cache.customers = (data || []).map(mapCustomer);
}
async function reloadUsers() {
    const { data, error } = await sb.from('users').select('*').order('id');
    if (error) throw error;
    cache.users = (data || []).map(mapUser);
}
async function reloadSales() {
    const { data, error } = await sb.from('sales').select('*').order('date', { ascending: false });
    if (error) throw error;
    cache.sales = (data || []).map(mapSale);
}
async function reloadSettings() {
    const { data, error } = await sb.from('settings').select('*').eq('id', 1).maybeSingle();
    if (error) throw error;
    cache.settings = mapSettings(data);
}

async function loadAllData() {
    await Promise.all([
        reloadCategories(), reloadProducts(), reloadCustomers(),
        reloadUsers(), reloadSales(), reloadSettings()
    ]);
}

// ── Auth ──
async function loginDb(username, password) {
    const { data, error } = await sb.from('users').select('*')
        .eq('username', username).eq('password', password).maybeSingle();
    if (error || !data) return null;
    return mapUser(data);
}

// ── Products ──
async function addProductDb(p) {
    const { error } = await sb.from('products').insert({
        name: p.name, description: p.description || '', category_id: p.category,
        price_usd: p.price_usd, price_khr: p.price_khr, stock: p.stock,
        barcode: p.barcode || '', image: p.image || ''
    });
    if (error) throw error;
    await reloadProducts();
}
async function updateProductDb(id, p) {
    const patch = {};
    if ('name' in p) patch.name = p.name;
    if ('description' in p) patch.description = p.description;
    if ('category' in p) patch.category_id = p.category;
    if ('price_usd' in p) patch.price_usd = p.price_usd;
    if ('price_khr' in p) patch.price_khr = p.price_khr;
    if ('stock' in p) patch.stock = p.stock;
    if ('barcode' in p) patch.barcode = p.barcode;
    if ('image' in p) patch.image = p.image;
    const { error } = await sb.from('products').update(patch).eq('id', id);
    if (error) throw error;
    await reloadProducts();
}
async function deleteProductDb(id) {
    const { error } = await sb.from('products').delete().eq('id', id);
    if (error) throw error;
    await reloadProducts();
}
async function decrementStockDb(id, qty) {
    const product = cache.products.find(p => p.id === id);
    const newStock = Math.max(0, (product ? product.stock : 0) - qty);
    const { error } = await sb.from('products').update({ stock: newStock }).eq('id', id);
    if (error) throw error;
}

// ── Categories ──
async function addCategoryDb(c) {
    const { error } = await sb.from('categories').insert({ name: c.name, description: c.description || '' });
    if (error) throw error;
    await reloadCategories();
}
async function updateCategoryDb(id, c) {
    const { error } = await sb.from('categories').update({ name: c.name, description: c.description || '' }).eq('id', id);
    if (error) throw error;
    await reloadCategories();
}
async function deleteCategoryDb(id) {
    const { error } = await sb.from('categories').delete().eq('id', id);
    if (error) throw error;
    await reloadCategories();
}

// ── Customers ──
async function addCustomerDb(c) {
    const { error } = await sb.from('customers').insert({
        name: c.name, phone: c.phone || '', email: c.email || '', address: c.address || '', debt_balance: 0
    });
    if (error) throw error;
    await reloadCustomers();
}
async function updateCustomerDb(id, c) {
    const patch = {};
    if ('name' in c) patch.name = c.name;
    if ('phone' in c) patch.phone = c.phone;
    if ('email' in c) patch.email = c.email;
    if ('address' in c) patch.address = c.address;
    if ('debt_balance' in c) patch.debt_balance = c.debt_balance;
    const { error } = await sb.from('customers').update(patch).eq('id', id);
    if (error) throw error;
    await reloadCustomers();
}
async function deleteCustomerDb(id) {
    const { error } = await sb.from('customers').delete().eq('id', id);
    if (error) throw error;
    await reloadCustomers();
}

// ── Users ──
async function addUserDb(u) {
    const { error } = await sb.from('users').insert({
        name: u.name, username: u.username, password: u.password, role: u.role
    });
    if (error) throw error;
    await reloadUsers();
}
async function updateUserDb(id, u) {
    const patch = {};
    if ('name' in u) patch.name = u.name;
    if ('username' in u) patch.username = u.username;
    if ('password' in u && u.password) patch.password = u.password;
    if ('role' in u) patch.role = u.role;
    const { error } = await sb.from('users').update(patch).eq('id', id);
    if (error) throw error;
    await reloadUsers();
    // Keep the current session's user object fresh if it's the one being edited
    if (cache.currentUser && cache.currentUser.id === id) {
        cache.currentUser = getUsers().find(u2 => u2.id === id) || cache.currentUser;
    }
}
async function deleteUserDb(id) {
    const { error } = await sb.from('users').delete().eq('id', id);
    if (error) throw error;
    await reloadUsers();
}

// ── Sales ──
async function addSaleDb(sale) {
    const { data, error } = await sb.from('sales').insert({
        items: sale.items, total_usd: sale.total_usd, total_khr: sale.total_khr,
        subtotal_usd: sale.subtotal_usd, subtotal_khr: sale.subtotal_khr,
        tax: sale.tax || 0, discount: sale.discount || 0, payment: sale.payment,
        customer_id: sale.customerId || null, debt_amount: sale.debt_amount || 0,
        is_payment: !!sale.is_payment, payment_amount: sale.payment_amount ?? null,
        payment_method: sale.payment_method || null,
        user_id: sale.userId, user_name: sale.userName
    }).select().single();
    if (error) throw error;
    await reloadSales();
    return data ? mapSale(data) : null;
}
async function resetSalesDb() {
    // Keep payment records so customer debt history/balance stays consistent
    const { error } = await sb.from('sales').delete().eq('is_payment', false);
    if (error) throw error;
    await reloadSales();
}

// ── Settings ──
async function updateSettingsDb(s) {
    const { error } = await sb.from('settings').upsert({
        id: 1,
        language: s.language, currency: s.currency, theme: s.theme,
        telegram_bot_token: s.telegramBotToken || '', telegram_chat_id: s.telegramChatId || '',
        auto_send_report: !!s.autoSendReport, last_report_date: s.lastReportDate || ''
    });
    if (error) throw error;
    await reloadSettings();
}
