// ═══════════════════════════════════════════════════════
//  DASHBOARD PAGE
// ═══════════════════════════════════════════════════════

let dashChartInstance = null;

function renderDashboard(el) {
    const sales = getSales();
    const products = getProducts();
    const customers = getCustomers();

    const totalRevenue = sales.filter(s => !s.is_payment).reduce((sum, s) => sum + s.total_usd, 0);
    let totalRevenueKhr = 0;
    sales.filter(s => !s.is_payment).forEach(s => {
        const usd = s.total_usd || 0, khr = s.total_khr || 0;
        totalRevenueKhr += (khr < usd * 100 && usd > 0) ? usd * 4050 : khr;
    });
    const totalOrders = sales.filter(s => !s.is_payment).length;
    const totalProducts = products.length;
    const totalStock = products.reduce((sum, p) => sum + p.stock, 0);
    const totalDebt = customers.reduce((sum, c) => sum + c.debt_balance, 0);

    const recent = [...sales].filter(s => !s.is_payment).sort((a, b) => b.date - a.date).slice(0, 5);

    const days = 7;
    const labels = [], dataUsd = [], dataKhr = [];
    const now = Date.now();
    for (let i = days - 1; i >= 0; i--) {
        const d = new Date(now - i * 86400000);
        const key = d.toDateString();
        labels.push(d.toLocaleDateString('en', { weekday: 'short' }));
        const daySales = sales.filter(s => !s.is_payment && new Date(s.date).toDateString() === key);
        dataUsd.push(daySales.reduce((sum, s) => sum + s.total_usd, 0));
        let dayKhr = 0;
        daySales.forEach(s => {
            const usd = s.total_usd || 0, khr = s.total_khr || 0;
            dayKhr += (khr < usd * 100 && usd > 0) ? usd * 4050 : khr;
        });
        dataKhr.push(dayKhr);
    }

    const s = getSettings();
    const isUsd = s.currency === 'usd';

    el.innerHTML = `
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:1rem;margin-bottom:1.5rem;">
          <div class="stat-card"><div class="icon purple"><i class="fas fa-dollar-sign"></i></div><div class="info"><h3>${isUsd ? '$' + totalRevenue.toFixed(2) : '៛' + Math.round(totalRevenueKhr).toLocaleString()}</h3><p>${t('total_sales')}</p><div class="currency-both">${formatPriceBoth(totalRevenue, totalRevenueKhr)}</div></div></div>
          <div class="stat-card"><div class="icon blue"><i class="fas fa-shopping-cart"></i></div><div class="info"><h3>${totalOrders}</h3><p>${t('orders')}</p></div></div>
          <div class="stat-card"><div class="icon green"><i class="fas fa-box"></i></div><div class="info"><h3>${totalProducts}</h3><p>${t('products_count')}</p></div></div>
          <div class="stat-card"><div class="icon orange"><i class="fas fa-warehouse"></i></div><div class="info"><h3>${totalStock}</h3><p>${t('stock')}</p></div></div>
          <div class="stat-card"><div class="icon red"><i class="fas fa-hand-holding-usd"></i></div><div class="info"><h3>${isUsd ? '$' + totalDebt.toFixed(2) : '៛' + Math.round(totalDebt * 4050).toLocaleString()}</h3><p>${t('debt_balance')}</p></div></div>
        </div>

        <div style="display:grid;grid-template-columns:2fr 1fr;gap:1.5rem;margin-bottom:1.5rem;">
          <div class="card"><h4 style="font-weight:600;margin-bottom:0.8rem;">${t('sales_summary')} (7d)</h4>
            <div class="chart-container-sm"><canvas id="dashChart"></canvas></div>
          </div>
          <div class="card"><h4 style="font-weight:600;margin-bottom:0.8rem;">${t('recent_orders')}</h4>
            ${recent.length ? `<div style="max-height:200px;overflow-y:auto;">
              ${recent.map(s => `<div style="display:flex;justify-content:space-between;padding:0.4rem 0;border-bottom:1px solid var(--border-color);font-size:0.8rem;">
                <span>#${s.id} ${formatDate(s.date)}</span>
                <span style="font-weight:600;">${formatPrice(s.total_usd)}</span>
              </div>`).join('')}
            </div>` : `<p class="text-muted">${t('no_data')}</p>`}
          </div>
        </div>

        <div class="card"><h4 style="font-weight:600;margin-bottom:0.8rem;">${t('top_products')}</h4>
          ${sales.length ? `<div class="table-wrap">
            <table><thead><tr><th>${t('name')}</th><th>${t('qty')}</th><th>${t('total')}</th></tr></thead><tbody>
              ${(() => {
                const map = {};
                sales.filter(s => !s.is_payment).forEach(s => s.items.forEach(it => { map[it.productId] = (map[it.productId] || 0) + it.qty; }));
                const sorted = Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 5);
                return sorted.map(([pid, qty]) => {
                    const p = products.find(pr => pr.id == pid);
                    const price = p ? getPrice(p) : 0;
                    return `<tr><td>${p ? p.name : 'Unknown'}</td><td>${qty}</td><td>${formatPrice(qty * price)}</td></tr>`;
                }).join('');
            })()}
            </tbody></table>
          </div>` : `<p class="text-muted">${t('no_data')}</p>`}
        </div>
      `;

    setTimeout(() => {
        const ctx = document.getElementById('dashChart');
        if (!ctx) return;
        if (dashChartInstance) { dashChartInstance.destroy(); dashChartInstance = null; }
        const isDark = document.documentElement.classList.contains('dark');
        const textColor = isDark ? '#94a3b8' : '#475569';
        const datasetColor = isDark ? 'rgba(124,58,237,0.7)' : 'rgba(124,58,237,0.6)';
        dashChartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: isUsd ? 'USD' : 'KHR',
                    data: isUsd ? dataUsd : dataKhr,
                    backgroundColor: datasetColor, borderColor: '#7c3aed', borderWidth: 2, borderRadius: 4
                }]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: { beginAtZero: true, ticks: { color: textColor, font: { size: 9 } }, grid: { color: isDark ? '#334155' : '#e2e8f0' } },
                    x: { ticks: { color: textColor, font: { size: 9 } }, grid: { display: false } }
                }
            }
        });
    }, 100);
}
