// ═══════════════════════════════════════════════════════
//  REPORTS PAGE
// ═══════════════════════════════════════════════════════

let reportTab = 'daily';

function renderReports(el) {
    el.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;margin-bottom:1.2rem;">
          <div class="report-tabs">
            <button class="${reportTab === 'daily' ? 'active' : ''}" data-tab="daily">${t('daily')}</button>
            <button class="${reportTab === 'monthly' ? 'active' : ''}" data-tab="monthly">${t('monthly')}</button>
            <button class="${reportTab === 'yearly' ? 'active' : ''}" data-tab="yearly">${t('yearly')}</button>
          </div>
          <div style="display:flex;gap:8px;flex-wrap:wrap;">
            <button class="btn btn-primary btn-sm" onclick="exportReport('pdf')"><i class="fas fa-file-pdf"></i> ${t('export_pdf')}</button>
            <button class="btn btn-success btn-sm" onclick="exportReport('excel')"><i class="fas fa-file-excel"></i> ${t('export_excel')}</button>
            <button class="btn btn-warning btn-sm" onclick="sendTelegramManual()"><i class="fab fa-telegram"></i> ${t('send_report')}</button>
            <button class="btn btn-danger btn-sm" onclick="resetReports()"><i class="fas fa-trash-alt"></i> ${t('reset_reports')}</button>
          </div>
        </div>
        <div class="card" id="reportContent">${generateReport(reportTab)}</div>
      `;

    el.querySelectorAll('.report-tabs button').forEach(btn => {
        btn.addEventListener('click', function () {
            reportTab = this.dataset.tab;
            renderReports(el);
        });
    });
}

function getFilteredSales(type) {
    const sales = getSales();
    if (type === 'daily') {
        const today = new Date().toDateString();
        return sales.filter(s => new Date(s.date).toDateString() === today);
    } else if (type === 'monthly') {
        const month = new Date().getMonth(), year = new Date().getFullYear();
        return sales.filter(s => { const d = new Date(s.date); return d.getMonth() === month && d.getFullYear() === year; });
    }
    const year = new Date().getFullYear();
    return sales.filter(s => new Date(s.date).getFullYear() === year);
}

function generateReport(type) {
    const products = getProducts();
    const now = Date.now();
    const s = getSettings();
    const isUsd = s.currency === 'usd';
    const label = type === 'daily' ? t('daily_report') : type === 'monthly' ? t('monthly_report') : t('yearly_report');

    const saleFiltered = getFilteredSales(type).filter(s => !s.is_payment);
    let totalUsd = 0, totalKhr = 0;
    saleFiltered.forEach(s => {
        totalUsd += s.total_usd || 0;
        const usd = s.total_usd || 0, khr = s.total_khr || 0;
        totalKhr += (khr < usd * 100 && usd > 0) ? usd * 4050 : khr;
    });
    const count = saleFiltered.length;
    const displayTotal = isUsd ? totalUsd : totalKhr;

    const map = {};
    saleFiltered.forEach(s => s.items.forEach(it => { map[it.productId] = (map[it.productId] || 0) + it.qty; }));
    const top = Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 5);

    const pmap = {}, pmapTotal = {};
    saleFiltered.forEach(s => {
        const method = s.payment || 'cash';
        pmap[method] = (pmap[method] || 0) + 1;
        const usd = s.total_usd || 0, khr = s.total_khr || 0;
        let val = isUsd ? usd : khr;
        if (!isUsd && khr < usd * 100 && usd > 0) val = usd * 4050;
        pmapTotal[method] = (pmapTotal[method] || 0) + val;
    });

    return `
        <div id="reportPrintArea">
          <h3 style="font-weight:700;margin-bottom:0.5rem;">${label}</h3>
          <p style="color:var(--text-secondary);margin-bottom:1.2rem;">${saleFiltered.length} ${t('orders')} · ${formatPrice(displayTotal)} ${t('total')}</p>
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:1rem;margin-bottom:1.5rem;">
            <div class="stat-card"><div class="icon purple"><i class="fas fa-dollar-sign"></i></div><div class="info"><h3>${formatPrice(displayTotal)}</h3><p>${t('revenue')}</p></div></div>
            <div class="stat-card"><div class="icon blue"><i class="fas fa-shopping-cart"></i></div><div class="info"><h3>${count}</h3><p>${t('orders')}</p></div></div>
            <div class="stat-card"><div class="icon teal"><i class="fas fa-exchange-alt"></i></div><div class="info"><h3 style="font-size:1rem;">${formatPriceBoth(totalUsd, totalKhr)}</h3><p>${t('both_currency')}</p></div></div>
          </div>
          <h4 style="font-weight:600;margin:1rem 0 0.5rem;">${t('top_products')}</h4>
          <div class="table-wrap">
            <table>
              <thead><tr><th>${t('name')}</th><th>${t('qty')}</th><th>${t('total')}</th></tr></thead>
              <tbody>
                ${top.length ? top.map(([pid, qty]) => {
                    const p = products.find(pr => pr.id == pid);
                    const price = p ? getPrice(p) : 0;
                    return `<tr><td>${p ? p.name : 'Unknown'}</td><td>${qty}</td><td>${formatPrice(qty * price)}</td></tr>`;
                }).join('') : `<tr><td colspan="3" style="text-align:center;padding:1.5rem;color:var(--text-secondary);">${t('no_data')}</td></tr>`}
              </tbody>
            </table>
          </div>
          <h4 style="font-weight:600;margin:1rem 0 0.5rem;">${t('payment_methods')}</h4>
          <div class="table-wrap">
            <table>
              <thead><tr><th>${t('method')}</th><th>${t('count')}</th><th>${t('total')}</th></tr></thead>
              <tbody>
                ${Object.entries(pmap).map(([method, c]) => `<tr><td>${method}</td><td>${c}</td><td>${formatPrice(pmapTotal[method] || 0)}</td></tr>`).join('')}
              </tbody>
            </table>
          </div>
          <div style="margin-top:1rem;font-size:0.75rem;color:var(--text-secondary);">${t('generated')}: ${formatDateTime(now)}</div>
        </div>
      `;
}

async function resetReports() {
    if (!confirm(t('reset_confirm'))) return;
    try {
        await resetSalesDb();
        toast('Reports reset! All sales data cleared.', 'info');
        renderPage(currentRoute);
    } catch (e) {
        toast('Failed to reset reports: ' + e.message, 'error');
    }
}

function exportReport(type) {
    const content = document.getElementById('reportPrintArea');
    if (!content) { toast('No report data to export', 'warning'); return; }
    if (type === 'pdf') {
        const opt = {
            margin: 0.5, filename: `report_${reportTab}_${Date.now()}.pdf`,
            image: { type: 'jpeg', quality: 0.98 }, html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
        };
        html2pdf().set(opt).from(content).save();
        toast('PDF exported!', 'success');
    } else {
        const tables = content.querySelectorAll('table');
        const data = [];
        tables.forEach(table => {
            table.querySelectorAll('tr').forEach(row => {
                const rowData = [];
                row.querySelectorAll('td, th').forEach(col => rowData.push(col.textContent.trim()));
                if (rowData.length) data.push(rowData);
            });
            data.push([]);
        });
        const ws = XLSX.utils.aoa_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Report');
        XLSX.writeFile(wb, `report_${reportTab}_${Date.now()}.xlsx`);
        toast('Excel exported!', 'success');
    }
}

// ── Telegram ──
function sendTelegramManual() {
    const s = getSettings();
    if (!s.telegramBotToken || !s.telegramChatId) {
        toast('Please configure Telegram Bot Token and Chat ID in Settings', 'warning');
        return;
    }
    sendTelegramMessage(s.telegramBotToken, s.telegramChatId, generateReportText('daily'));
}

function generateReportText(type) {
    const products = getProducts();
    const s = getSettings();
    const isUsd = s.currency === 'usd';
    const filtered = getFilteredSales(type).filter(s => !s.is_payment);

    const total = filtered.reduce((sum, s) => {
        const usd = s.total_usd || 0, khr = s.total_khr || 0;
        if (!isUsd && khr < usd * 100 && usd > 0) return sum + usd * 4050;
        return sum + (isUsd ? usd : khr);
    }, 0);
    const count = filtered.length;

    let msg = `📊 *${t('app_name')} - ${t('daily_report')}*\n`;
    msg += `📅 ${formatDateTime(Date.now())}\n`;
    msg += `━━━━━━━━━━━━━━━━━━━\n`;
    msg += `🛒 ${t('orders')}: ${count}\n`;
    msg += `💰 ${t('total')}: ${formatPrice(total)}\n`;
    msg += `━━━━━━━━━━━━━━━━━━━\n`;

    const map = {};
    filtered.forEach(s => s.items.forEach(it => { map[it.productId] = (map[it.productId] || 0) + it.qty; }));
    const top = Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 3);
    if (top.length) {
        msg += `🏆 *${t('top_products')}*\n`;
        top.forEach(([pid, qty]) => {
            const p = products.find(pr => pr.id == pid);
            msg += `  • ${p ? p.name : 'Unknown'}: ${qty}x\n`;
        });
    }
    msg += `━━━━━━━━━━━━━━━━━━━\n`;
    msg += `✅ ${t('report_sent')}`;
    return msg;
}

function sendTelegramMessage(token, chatId, text) {
    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    fetch(url, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text: text, parse_mode: 'Markdown' })
    })
        .then(res => res.json())
        .then(data => {
            if (data.ok) toast('Report sent to Telegram!', 'success');
            else toast('Telegram error: ' + (data.description || 'Unknown'), 'error');
        })
        .catch(err => toast('Failed to send: ' + err.message, 'error'));
}

// ── Auto-report scheduler at 23:59 local time ──
let autoReportTimer = null;

function scheduleAutoReport() {
    if (autoReportTimer) clearTimeout(autoReportTimer);
    const s = getSettings();
    if (!s.autoSendReport || !s.telegramBotToken || !s.telegramChatId) return;

    const now = new Date();
    const target = new Date(now);
    target.setHours(23, 59, 0, 0);
    if (now > target) target.setDate(target.getDate() + 1);

    autoReportTimer = setTimeout(async function () {
        sendTelegramMessage(s.telegramBotToken, s.telegramChatId, generateReportText('daily'));
        try {
            await updateSettingsDb({ ...getSettings(), lastReportDate: new Date().toDateString() });
        } catch (e) { /* non-fatal */ }
        scheduleAutoReport();
    }, target.getTime() - now.getTime());
}

// Periodic safety-net check (runs hourly): sends the daily report once
// if the scheduled 23:59 timer was missed (e.g. tab was closed/asleep).
function checkAutoReport() {
    const s = getSettings();
    if (!s.autoSendReport || !s.telegramBotToken || !s.telegramChatId) return;
    const now = new Date();
    const todayStr = now.toDateString();
    if (now.getHours() < 23) return;
    if (s.lastReportDate === todayStr) return;
    sendTelegramMessage(s.telegramBotToken, s.telegramChatId, generateReportText('daily'));
    updateSettingsDb({ ...s, lastReportDate: todayStr }).catch(() => {});
}
