// ═══════════════════════════════════════════════════════
//  POS (POINT OF SALE) PAGE
// ═══════════════════════════════════════════════════════

let cart = [];
let posProducts = [];
let selectedCustomerId = null;

function renderPOS(el) {
    const products = getProducts();
    posProducts = products;
    const categories = getCategories();
    const customers = getCustomers();

    el.innerHTML = `
        <div class="pos-grid">
          <div>
            <div style="display:flex;gap:10px;margin-bottom:1rem;flex-wrap:wrap;">
              <input class="form-control" style="flex:1;min-width:160px;" id="posSearch" placeholder="${t('search')} ${t('products')}" />
              <select class="form-control" style="width:auto;min-width:120px;" id="posCategoryFilter">
                <option value="">${t('all')}</option>
                ${categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
              </select>
            </div>
            <div class="pos-products" id="posProductGrid">${posProductGridHtml(products)}</div>
          </div>
          <div class="pos-cart">
            <div class="pos-customer-select">
              <select class="form-control" id="posCustomerSelect" style="flex:1;">
                <option value="">${t('walkin')}</option>
                ${customers.map(c => `<option value="${c.id}">${c.name} ${c.debt_balance > 0 ? '(💳 $' + c.debt_balance.toFixed(2) + ')' : ''}</option>`).join('')}
              </select>
              <button class="btn btn-primary btn-sm" onclick="showAddCustomer()"><i class="fas fa-plus"></i></button>
            </div>
            <h4 style="font-weight:600;display:flex;justify-content:space-between;align-items:center;margin-top:4px;">
              <span><i class="fas fa-shopping-cart"></i> ${t('cart')}</span>
              <button class="btn btn-danger btn-xs" onclick="clearCart()">${t('clear_cart')}</button>
            </h4>
            <div class="cart-items" id="cartItems"></div>
            <div class="cart-total">
              <div style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap;">
                <select class="form-control" style="flex:1;min-width:100px;" id="paymentMethod">
                  <option value="cash">${t('cash')}</option>
                  <option value="bank">${t('bank')}</option>
                  <option value="debt">${t('debt')}</option>
                </select>
                <button class="btn btn-success" style="flex:1;" onclick="completeSale()">
                  <i class="fas fa-check"></i> ${t('complete')}
                </button>
              </div>
            </div>
          </div>
        </div>
      `;

    const custSelect = document.getElementById('posCustomerSelect');
    if (custSelect) {
        custSelect.addEventListener('change', function () {
            selectedCustomerId = this.value ? parseInt(this.value) : null;
        });
        if (selectedCustomerId) custSelect.value = selectedCustomerId;
    }

    bindPosProductClicks();
    document.getElementById('posSearch')?.addEventListener('input', filterPOSProducts);
    document.getElementById('posCategoryFilter')?.addEventListener('change', filterPOSProducts);

    renderCart();
}

function posProductGridHtml(products) {
    return products.map(p => `
        <div class="pos-product-item" data-id="${p.id}">
          ${p.image ? `<img src="${p.image}" alt="${p.name}" />` : `<div style="height:80px;background:var(--bg-primary);border-radius:6px;display:flex;align-items:center;justify-content:center;color:var(--text-secondary);font-size:2rem;"><i class="fas fa-cube"></i></div>`}
          <div class="name">${p.name}</div>
          <div class="price">${formatPrice(getPrice(p))}</div>
          <div style="font-size:0.6rem;color:var(--text-secondary);">${p.stock > 0 ? t('in_stock') : t('out_of_stock')}</div>
        </div>
      `).join('');
}

function bindPosProductClicks() {
    document.querySelectorAll('.pos-product-item').forEach(item => {
        item.addEventListener('click', function () {
            const id = parseInt(this.dataset.id);
            const product = posProducts.find(p => p.id === id);
            if (product && product.stock > 0) addToCart(product);
            else if (product) toast(t('out_of_stock'), 'warning');
        });
    });
}

function filterPOSProducts() {
    const search = document.getElementById('posSearch')?.value.toLowerCase() || '';
    const cat = document.getElementById('posCategoryFilter')?.value || '';
    const grid = document.getElementById('posProductGrid');
    if (!grid) return;
    grid.querySelectorAll('.pos-product-item').forEach(item => {
        const name = item.querySelector('.name')?.textContent.toLowerCase() || '';
        const id = parseInt(item.dataset.id);
        const product = posProducts.find(p => p.id === id);
        let show = name.includes(search);
        if (cat && product) show = show && product.category == cat;
        item.style.display = show ? 'block' : 'none';
    });
}

function addToCart(product) {
    const existing = cart.find(c => c.productId === product.id);
    if (existing) {
        if (existing.qty < product.stock) existing.qty++;
        else { toast('Stock limit reached', 'warning'); return; }
    } else {
        cart.push({
            productId: product.id, name: product.name, price: getPrice(product),
            priceUsd: product.price_usd, priceKhr: product.price_khr, qty: 1, maxStock: product.stock
        });
    }
    renderCart();
    toast(`Added ${product.name}`, 'success');
}

function adjustCart(index, delta) {
    if (!cart[index]) return;
    const item = cart[index];
    const newQty = item.qty + delta;
    if (newQty < 1) cart.splice(index, 1);
    else if (newQty > item.maxStock) { toast('Stock limit reached', 'warning'); return; }
    else item.qty = newQty;
    renderCart();
}

function removeFromCart(index) { cart.splice(index, 1); renderCart(); }
function clearCart() { cart = []; renderCart(); toast('Cart cleared', 'info'); }

function renderCart() {
    const container = document.getElementById('cartItems');
    if (!container) return;
    const totalArea = document.querySelector('.cart-total');

    if (!cart.length) {
        container.innerHTML = `<p class="text-muted" style="text-align:center;padding:1.5rem 0;">${t('cart_empty')}</p>`;
        totalArea?.querySelectorAll('.total-row').forEach(r => r.remove());
        return;
    }

    container.innerHTML = cart.map((item, idx) => `
        <div class="cart-item">
          <span>${item.name} <span style="color:var(--text-secondary);font-size:0.75rem;">x${item.qty}</span></span>
          <span style="font-weight:600;">${formatPrice(item.price * item.qty)}</span>
          <div class="qty">
            <button onclick="adjustCart(${idx}, -1)">−</button>
            <span>${item.qty}</span>
            <button onclick="adjustCart(${idx}, 1)">+</button>
            <button onclick="removeFromCart(${idx})" style="color:var(--danger);background:none;border:none;cursor:pointer;"><i class="fas fa-trash"></i></button>
          </div>
        </div>
      `).join('');

    if (totalArea) {
        totalArea.querySelectorAll('.total-row').forEach(r => r.remove());
        const totalUsd = cart.reduce((sum, i) => sum + i.priceUsd * i.qty, 0);
        const totalKhr = cart.reduce((sum, i) => sum + i.priceKhr * i.qty, 0);
        const totalDisplay = formatPrice(cart.reduce((sum, i) => sum + i.price * i.qty, 0));

        const totalRow = document.createElement('div');
        totalRow.className = 'total-row';
        totalRow.innerHTML = `<span>${t('total')}</span><span>${totalDisplay}</span>`;

        const bothRow = document.createElement('div');
        bothRow.className = 'total-row both-currency';
        bothRow.innerHTML = `<span>${t('both_currency')}</span><span>${formatPriceBoth(totalUsd, totalKhr)}</span>`;

        totalArea.insertBefore(bothRow, totalArea.firstElementChild.nextSibling || null);
        totalArea.insertBefore(totalRow, bothRow);
    }
}

async function completeSale() {
    if (!cart.length) { toast('Cart is empty', 'warning'); return; }
    const user = getCurrentUser();
    const totalUsd = cart.reduce((sum, i) => sum + i.priceUsd * i.qty, 0);
    const totalKhr = cart.reduce((sum, i) => sum + i.priceKhr * i.qty, 0);
    const paymentMethod = document.getElementById('paymentMethod')?.value || 'cash';

    const custSelect = document.getElementById('posCustomerSelect');
    const customerId = custSelect ? (custSelect.value ? parseInt(custSelect.value) : null) : selectedCustomerId;

    if (paymentMethod === 'debt' && !customerId) {
        toast('Please select a customer for debt payment', 'warning');
        return;
    }

    const debtAmount = paymentMethod === 'debt' ? totalUsd : 0;

    const sale = {
        items: cart.map(c => ({ productId: c.productId, name: c.name, priceUsd: c.priceUsd, priceKhr: c.priceKhr, qty: c.qty })),
        total_usd: totalUsd, total_khr: totalKhr, subtotal_usd: totalUsd, subtotal_khr: totalKhr,
        tax: 0, discount: 0, payment: paymentMethod, customerId: customerId, debt_amount: debtAmount,
        userId: user.id, userName: user.name
    };

    try {
        const saved = await addSaleDb(sale);

        if (customerId && paymentMethod === 'debt') {
            const cust = getCustomer(customerId);
            if (cust) await updateCustomerDb(customerId, { debt_balance: (cust.debt_balance || 0) + debtAmount });
        }

        for (const c of cart) {
            await decrementStockDb(c.productId, c.qty);
        }
        await reloadProducts();

        cart = [];
        renderCart();
        toast('Sale completed! #' + (saved ? saved.id : ''), 'success');

        posProducts = getProducts();
        const grid = document.getElementById('posProductGrid');
        if (grid) {
            grid.innerHTML = posProductGridHtml(posProducts);
            bindPosProductClicks();
        }
        checkAutoReport();
    } catch (e) {
        toast('Failed to complete sale: ' + e.message, 'error');
    }
}
