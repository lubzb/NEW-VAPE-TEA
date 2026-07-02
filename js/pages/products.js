// ═══════════════════════════════════════════════════════
//  PRODUCTS PAGE
// ═══════════════════════════════════════════════════════

function renderProducts(el) {
    const products = getProducts();
    const categories = getCategories();
    const user = getCurrentUser();
    const canEdit = ['admin', 'manager', 'warehouse'].includes(user.role);

    el.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;margin-bottom:1.2rem;">
          <input class="form-control" style="max-width:280px;" id="productSearch" placeholder="${t('search')}..." />
          ${canEdit ? `<button class="btn btn-primary" onclick="showAddProduct()"><i class="fas fa-plus"></i> ${t('add_product')}</button>` : ''}
        </div>
        <div class="card">
          <div class="table-wrap">
            <table>
              <thead><tr>
                <th>${t('image')}</th><th>${t('name')}</th><th>${t('category')}</th>
                <th>${t('price_usd')}</th><th>${t('price_khr')}</th><th>${t('stock')}</th>
                ${canEdit ? `<th>${t('actions')}</th>` : ''}
              </tr></thead>
              <tbody id="productTableBody">
                ${products.length ? products.map(p => `
                  <tr>
                    <td>${p.image ? `<img src="${p.image}" class="product-thumb" />` : `<span style="color:var(--text-secondary);font-size:0.7rem;">No img</span>`}</td>
                    <td><strong>${p.name}</strong><br><span style="font-size:0.7rem;color:var(--text-secondary);">${p.barcode || ''}</span></td>
                    <td>${getCategoryName(p.category)}</td>
                    <td>$${p.price_usd.toFixed(2)}</td>
                    <td>៛${Math.round(p.price_khr).toLocaleString()}</td>
                    <td><span style="font-weight:600;color:${p.stock < 5 ? 'var(--danger)' : 'var(--success)'};">${p.stock}</span></td>
                    ${canEdit ? `<td>
                      <button class="btn btn-primary btn-xs" onclick="showEditProduct(${p.id})"><i class="fas fa-edit"></i></button>
                      <button class="btn btn-danger btn-xs" onclick="deleteProduct(${p.id})"><i class="fas fa-trash"></i></button>
                    </td>` : ''}
                  </tr>
                `).join('') : `<tr><td colspan="${canEdit ? 7 : 6}" style="text-align:center;padding:2rem;color:var(--text-secondary);">${t('no_data')}</td></tr>`}
              </tbody>
            </table>
          </div>
        </div>
      `;

    document.getElementById('productSearch')?.addEventListener('input', function () {
        const q = this.value.toLowerCase();
        document.querySelectorAll('#productTableBody tr').forEach(row => {
            row.style.display = row.textContent.toLowerCase().includes(q) ? '' : 'none';
        });
    });
}

function showAddProduct() {
    const categories = getCategories();
    const html = `
        <form id="productForm">
          <div class="form-group"><label>${t('name')}</label><input class="form-control" id="pName" required /></div>
          <div class="form-group"><label>${t('description')}</label><textarea class="form-control" id="pDesc" rows="2"></textarea></div>
          <div class="form-group"><label>${t('category')}</label>
            <select class="form-control" id="pCategory">${categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}</select>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
            <div class="form-group"><label>${t('price_usd')}</label><input class="form-control" id="pPriceUsd" type="number" step="0.01" required /></div>
            <div class="form-group"><label>${t('price_khr')}</label><input class="form-control" id="pPriceKhr" type="number" step="1" required /></div>
          </div>
          <div class="form-group"><label>${t('stock_qty')}</label><input class="form-control" id="pStock" type="number" required /></div>
          <div class="form-group"><label>${t('barcode')}</label><input class="form-control" id="pBarcode" placeholder="Optional" /></div>
          <div class="form-group"><label>${t('image')}</label>
            <input class="form-control" id="pImage" type="file" accept="image/*" />
            <img id="imagePreview" style="display:none;margin-top:8px;max-width:120px;border-radius:8px;border:1px solid var(--border-color);" />
          </div>
        </form>
      `;
    openModal(t('add_product'), html, t('save'), async function () {
        const name = document.getElementById('pName').value.trim();
        const description = document.getElementById('pDesc').value.trim();
        const category = parseInt(document.getElementById('pCategory').value);
        const price_usd = parseFloat(document.getElementById('pPriceUsd').value);
        const price_khr = parseInt(document.getElementById('pPriceKhr').value);
        const stock = parseInt(document.getElementById('pStock').value);
        const barcode = document.getElementById('pBarcode').value.trim();
        const file = document.getElementById('pImage').files[0];
        if (!name || !price_usd || !price_khr || isNaN(stock)) {
            toast('Please fill all required fields', 'error');
            return;
        }
        let image = '';
        if (file) image = await readFileAsDataUrl(file);
        try {
            await addProductDb({ name, description, category, price_usd, price_khr, stock, barcode, image });
            closeModal();
            toast('Product added!', 'success');
            renderPage(currentRoute);
        } catch (e) {
            toast('Failed to add product: ' + e.message, 'error');
        }
    });
    document.getElementById('pImage')?.addEventListener('change', function (e) { previewImage(e); });
}

function showEditProduct(id) {
    const p = getProducts().find(pr => pr.id === id);
    if (!p) return;
    const categories = getCategories();
    const html = `
        <form id="productForm">
          <div class="form-group"><label>${t('name')}</label><input class="form-control" id="pName" value="${p.name}" required /></div>
          <div class="form-group"><label>${t('description')}</label><textarea class="form-control" id="pDesc" rows="2">${p.description || ''}</textarea></div>
          <div class="form-group"><label>${t('category')}</label>
            <select class="form-control" id="pCategory">${categories.map(c => `<option value="${c.id}" ${c.id === p.category ? 'selected' : ''}>${c.name}</option>`).join('')}</select>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
            <div class="form-group"><label>${t('price_usd')}</label><input class="form-control" id="pPriceUsd" type="number" step="0.01" value="${p.price_usd}" required /></div>
            <div class="form-group"><label>${t('price_khr')}</label><input class="form-control" id="pPriceKhr" type="number" step="1" value="${p.price_khr}" required /></div>
          </div>
          <div class="form-group"><label>${t('stock_qty')}</label><input class="form-control" id="pStock" type="number" value="${p.stock}" required /></div>
          <div class="form-group"><label>${t('barcode')}</label><input class="form-control" id="pBarcode" value="${p.barcode || ''}" /></div>
          <div class="form-group"><label>${t('image')}</label>
            <input class="form-control" id="pImage" type="file" accept="image/*" />
            ${p.image ? `<img src="${p.image}" style="margin-top:8px;max-width:120px;border-radius:8px;border:1px solid var(--border-color);" />` : ''}
            <img id="imagePreview" style="display:none;margin-top:8px;max-width:120px;border-radius:8px;border:1px solid var(--border-color);" />
          </div>
        </form>
      `;
    openModal(t('edit_product'), html, t('save'), async function () {
        const name = document.getElementById('pName').value.trim();
        const description = document.getElementById('pDesc').value.trim();
        const category = parseInt(document.getElementById('pCategory').value);
        const price_usd = parseFloat(document.getElementById('pPriceUsd').value);
        const price_khr = parseInt(document.getElementById('pPriceKhr').value);
        const stock = parseInt(document.getElementById('pStock').value);
        const barcode = document.getElementById('pBarcode').value.trim();
        const file = document.getElementById('pImage').files[0];
        if (!name || !price_usd || !price_khr || isNaN(stock)) {
            toast('Please fill all required fields', 'error');
            return;
        }
        const patch = { name, description, category, price_usd, price_khr, stock, barcode };
        if (file) patch.image = await readFileAsDataUrl(file);
        try {
            await updateProductDb(id, patch);
            closeModal();
            toast('Product updated!', 'success');
            renderPage(currentRoute);
        } catch (e) {
            toast('Failed to update product: ' + e.message, 'error');
        }
    });
    document.getElementById('pImage')?.addEventListener('change', function (e) { previewImage(e); });
}

async function deleteProduct(id) {
    if (!confirm(t('confirm_delete'))) return;
    try {
        await deleteProductDb(id);
        toast('Product deleted', 'info');
        renderPage(currentRoute);
    } catch (e) {
        toast('Failed to delete product: ' + e.message, 'error');
    }
}

// ── Helpers ──
function readFileAsDataUrl(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = e => resolve(e.target.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}
function previewImage(e) {
    const preview = document.getElementById('imagePreview');
    if (preview && e.target.files.length) {
        const reader = new FileReader();
        reader.onload = ev => { preview.src = ev.target.result; preview.style.display = 'block'; };
        reader.readAsDataURL(e.target.files[0]);
    }
}
