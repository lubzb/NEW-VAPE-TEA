// ═══════════════════════════════════════════════════════
//  CUSTOMERS PAGE
// ═══════════════════════════════════════════════════════

function renderCustomers(el) {
    const customers = getCustomers();
    const user = getCurrentUser();
    const canEdit = ['admin', 'manager'].includes(user.role);
    const s = getSettings();
    const isUsd = s.currency === 'usd';

    el.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;margin-bottom:1.2rem;">
          <h4 style="font-weight:600;">${t('customers')}</h4>
          ${canEdit ? `<button class="btn btn-primary" onclick="showAddCustomer()"><i class="fas fa-plus"></i> ${t('add_customer')}</button>` : ''}
        </div>
        <div class="card">
          <div class="table-wrap">
            <table>
              <thead><tr><th>${t('name')}</th><th>${t('phone')}</th><th>${t('email')}</th><th>${t('debt_balance')}</th>${canEdit ? `<th>${t('actions')}</th>` : ''}</tr></thead>
              <tbody>
                ${customers.length ? customers.map(c => `
                  <tr>
                    <td><strong>${c.name}</strong></td>
                    <td>${c.phone || '-'}</td>
                    <td>${c.email || '-'}</td>
                    <td><span class="debt-badge ${c.debt_balance > 0 ? 'positive' : 'zero'}">${isUsd ? '$' + c.debt_balance.toFixed(2) : '៛' + Math.round(c.debt_balance * 4050).toLocaleString()}</span></td>
                    ${canEdit ? `<td>
                      <button class="btn btn-primary btn-xs" onclick="showEditCustomer(${c.id})"><i class="fas fa-edit"></i></button>
                      <button class="btn btn-success btn-xs" onclick="showRecordPayment(${c.id})"><i class="fas fa-hand-holding-usd"></i></button>
                      <button class="btn btn-danger btn-xs" onclick="deleteCustomer(${c.id})"><i class="fas fa-trash"></i></button>
                    </td>` : ''}
                  </tr>
                `).join('') : `<tr><td colspan="${canEdit ? 5 : 4}" style="text-align:center;padding:2rem;color:var(--text-secondary);">${t('no_data')}</td></tr>`}
              </tbody>
            </table>
          </div>
        </div>
      `;
}

function showAddCustomer() {
    const html = `
        <form id="customerForm">
          <div class="form-group"><label>${t('name')}</label><input class="form-control" id="cName" required /></div>
          <div class="form-group"><label>${t('phone')}</label><input class="form-control" id="cPhone" /></div>
          <div class="form-group"><label>${t('email')}</label><input class="form-control" id="cEmail" type="email" /></div>
          <div class="form-group"><label>${t('address')}</label><input class="form-control" id="cAddress" /></div>
        </form>
      `;
    openModal(t('add_customer'), html, t('save'), async function () {
        const name = document.getElementById('cName').value.trim();
        const phone = document.getElementById('cPhone').value.trim();
        const email = document.getElementById('cEmail').value.trim();
        const address = document.getElementById('cAddress').value.trim();
        if (!name) { toast('Name is required', 'error'); return; }
        try {
            await addCustomerDb({ name, phone, email, address });
            closeModal();
            toast('Customer added!', 'success');
            renderPage(currentRoute);
        } catch (e) {
            toast('Failed to add customer: ' + e.message, 'error');
        }
    });
}

function showEditCustomer(id) {
    const c = getCustomers().find(cust => cust.id === id);
    if (!c) return;
    const html = `
        <form id="customerForm">
          <div class="form-group"><label>${t('name')}</label><input class="form-control" id="cName" value="${c.name}" required /></div>
          <div class="form-group"><label>${t('phone')}</label><input class="form-control" id="cPhone" value="${c.phone || ''}" /></div>
          <div class="form-group"><label>${t('email')}</label><input class="form-control" id="cEmail" type="email" value="${c.email || ''}" /></div>
          <div class="form-group"><label>${t('address')}</label><input class="form-control" id="cAddress" value="${c.address || ''}" /></div>
        </form>
      `;
    openModal(t('edit_customer'), html, t('save'), async function () {
        const name = document.getElementById('cName').value.trim();
        const phone = document.getElementById('cPhone').value.trim();
        const email = document.getElementById('cEmail').value.trim();
        const address = document.getElementById('cAddress').value.trim();
        if (!name) { toast('Name is required', 'error'); return; }
        try {
            await updateCustomerDb(id, { name, phone, email, address });
            closeModal();
            toast('Customer updated!', 'success');
            renderPage(currentRoute);
        } catch (e) {
            toast('Failed to update customer: ' + e.message, 'error');
        }
    });
}

function showRecordPayment(id) {
    const c = getCustomers().find(cust => cust.id === id);
    if (!c) return;
    const html = `
        <form id="paymentForm">
          <div style="margin-bottom:1rem;"><strong>${c.name}</strong> — ${t('outstanding')}: ${formatPrice(c.debt_balance)}</div>
          <div class="form-group"><label>${t('amount_paid')} (USD)</label>
            <input class="form-control" id="payAmount" type="number" step="0.01" value="${c.debt_balance}" min="0" max="${c.debt_balance}" required />
          </div>
          <div class="form-group"><label>${t('payment_method')}</label>
            <select class="form-control" id="payMethod">
              <option value="cash">${t('cash')}</option>
              <option value="bank">${t('bank')}</option>
            </select>
          </div>
        </form>
      `;
    openModal(t('record_payment'), html, t('save'), async function () {
        const amount = parseFloat(document.getElementById('payAmount').value);
        const method = document.getElementById('payMethod').value;
        if (!amount || amount <= 0) { toast('Enter a valid amount', 'error'); return; }
        if (amount > c.debt_balance) { toast('Amount exceeds debt balance', 'error'); return; }
        try {
            await updateCustomerDb(id, { debt_balance: Math.max(0, c.debt_balance - amount) });
            const user = getCurrentUser();
            await addSaleDb({
                items: [{ productId: 0, name: 'Payment - ' + method, priceUsd: 0, priceKhr: 0, qty: 1 }],
                total_usd: 0, total_khr: 0, subtotal_usd: 0, subtotal_khr: 0, tax: 0, discount: 0,
                payment: 'payment', customerId: id, debt_amount: -amount,
                userId: user.id, userName: user.name,
                is_payment: true, payment_amount: amount, payment_method: method
            });
            closeModal();
            toast('Payment recorded!', 'success');
            renderPage(currentRoute);
        } catch (e) {
            toast('Failed to record payment: ' + e.message, 'error');
        }
    });
}

async function deleteCustomer(id) {
    if (!confirm(t('confirm_delete'))) return;
    try {
        await deleteCustomerDb(id);
        toast('Customer deleted', 'info');
        renderPage(currentRoute);
    } catch (e) {
        toast('Failed to delete customer: ' + e.message, 'error');
    }
}
