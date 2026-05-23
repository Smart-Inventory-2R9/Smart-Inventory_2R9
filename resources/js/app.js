import './bootstrap';

function showStartupError(error) {
    const mount = document.getElementById('app') || document.body;
    const message = error?.message || String(error || 'Unknown startup error');
    mount.innerHTML = `<main class="auth-layout"><section class="auth-panel"><div class="brand-row"><div class="brand-mark">SI</div><div><h1 class="brand-title">SmartExpiryItem</h1><p class="brand-subtitle">Startup failed</p></div></div><div class="empty-state">${String(message).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')}</div></section></main>`;
}

window.addEventListener('error', (event) => showStartupError(event.error || event.message));
window.addEventListener('unhandledrejection', (event) => showStartupError(event.reason));

const root = document.getElementById('app');
if (!root) {
    throw new Error('SmartExpiryItem root element was not found.');
}

window.__SmartExpiryBooted = true;
root.innerHTML = '<main class="boot-screen"><div class="loading-state">Loading SmartExpiryItem</div></main>';

const apiBase = root.dataset.apiBase || `${window.location.origin}/api`;
const state = {
    token: localStorage.getItem('smartExpiryToken') || '',
    user: null,
    isAdmin: false,
    page: 'dashboard',
    inventoryItems: [],
    alertPayloads: [],
    sidebarHidden: localStorage.getItem('smartExpirySidebarHidden') === 'true',
};

const navItems = [
    ['dashboard', 'Dashboard'],
    ['inventory', 'Inventory'],
    ['monitoring', 'Monitoring'],
    ['reports', 'Reports'],
    ['lookup', 'Food Lookup'],
    ['alerts', 'Alerts'],
    ['admin', 'Admin Users'],
];

const esc = (value) => String(value ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#039;');
const num = (value) => Number(value ?? 0).toLocaleString();

function toast(message, type = 'success') {
    document.querySelector('.toast')?.remove();
    const node = document.createElement('div');
    node.className = `toast ${type === 'error' ? 'error' : ''}`;
    node.textContent = message;
    document.body.appendChild(node);
    setTimeout(() => node.remove(), 3200);
}

function errorMessage(error) {
    const data = error?.data || error;
    if (data?.errors) return Object.values(data.errors).flat().join(' ');
    const message = data?.message || error?.message || 'Request failed.';
    return error?.status ? `HTTP ${error.status}: ${message}` : message;
}

async function api(path, options = {}) {
    const headers = { Accept: 'application/json', ...(options.headers || {}) };
    if (state.token) headers.Authorization = `Bearer ${state.token}`;

    let body = options.body;
    if (body && typeof body === 'object') {
        headers['Content-Type'] = 'application/json';
        body = JSON.stringify(body);
    }

    const response = await fetch(`${apiBase}${path}`, { ...options, headers, body });
    const data = await response.json().catch(() => ({}));

    if (response.status === 401 && !['/login', '/register'].includes(path)) {
        logout(false);
        throw { status: response.status, data };
    }

    if (!response.ok) throw { status: response.status, data };
    return data;
}

function formData(form) {
    const data = Object.fromEntries(new FormData(form).entries());
    Object.keys(data).forEach((key) => {
        if (data[key] === '') delete data[key];
        if (['quantity', 'minimum_stock', 'days', 'page_size', 'page_number', 'expires_within_days'].includes(key) && data[key] !== undefined) data[key] = Number(data[key]);
    });
    return data;
}

async function runForm(form, busyText, callback) {
    const button = form.querySelector('button[type="submit"]');
    const originalText = button?.textContent;
    if (button) {
        button.disabled = true;
        button.textContent = busyText;
    }

    try {
        return await callback();
    } finally {
        if (button) {
            button.disabled = false;
            button.textContent = originalText;
        }
    }
}

function renderAuth(tab = 'login') {
    root.innerHTML = `
        <main class="auth-layout">
            <section class="auth-panel">
                <div class="brand-row">
                    <div class="brand-mark">SI</div>
                    <div><h1 class="brand-title">SmartExpiryItem</h1><p class="brand-subtitle">Backend console</p></div>
                </div>
                <div class="segmented">
                    <button class="${tab === 'login' ? 'active' : ''}" data-tab="login" type="button">Login</button>
                    <button class="${tab === 'register' ? 'active' : ''}" data-tab="register" type="button">Register</button>
                </div>
                <form id="loginForm" class="form-stack ${tab === 'login' ? '' : 'hidden'}">
                    <label class="field"><span>Email</span><input class="input" name="email" type="email" value="admin@example.com" required></label>
                    <label class="field"><span>Password</span><input class="input" name="password" type="password" value="password123" required></label>
                    <button class="btn primary" type="submit">Login</button>
                </form>
                <form id="registerForm" class="form-stack ${tab === 'register' ? '' : 'hidden'}">
                    <label class="field"><span>Name</span><input class="input" name="name" required></label>
                    <label class="field"><span>Email</span><input class="input" name="email" type="email" required></label>
                    <label class="field"><span>Password</span><input class="input" name="password" type="password" required></label>
                    <label class="field"><span>Confirm password</span><input class="input" name="password_confirmation" type="password" required></label>
                    <button class="btn primary" type="submit">Register</button>
                </form>
            </section>
            <section class="auth-side"><div class="auth-status"><div class="panel-header"><h2 class="panel-title">API Status</h2><span id="healthBadge" class="badge">Checking</span></div><div class="panel-body"><pre id="healthBody" class="result-box">GET /api/health</pre></div></div></section>
        </main>`;

    root.querySelectorAll('[data-tab]').forEach((button) => button.addEventListener('click', () => renderAuth(button.dataset.tab)));
    root.querySelector('#loginForm').addEventListener('submit', submitLogin);
    root.querySelector('#registerForm').addEventListener('submit', submitRegister);
    loadHealth();
}

async function loadHealth() {
    try {
        const data = await api('/health');
        document.getElementById('healthBadge').className = 'badge good';
        document.getElementById('healthBadge').textContent = 'Online';
        document.getElementById('healthBody').textContent = JSON.stringify(data, null, 2);
    } catch (error) {
        document.getElementById('healthBadge').className = 'badge danger';
        document.getElementById('healthBadge').textContent = 'Offline';
        document.getElementById('healthBody').textContent = errorMessage(error);
    }
}

async function submitLogin(event) {
    event.preventDefault();
    try {
        const data = await api('/login', { method: 'POST', body: formData(event.currentTarget) });
        state.token = data.token;
        state.user = data.user;
        localStorage.setItem('smartExpiryToken', data.token);
        state.isAdmin = await checkAdmin();
        renderShell();
        loadPage('dashboard');
    } catch (error) {
        toast(errorMessage(error), 'error');
    }
}

async function submitRegister(event) {
    event.preventDefault();
    try {
        const data = await api('/register', { method: 'POST', body: formData(event.currentTarget) });
        state.token = data.token;
        state.user = data.user;
        localStorage.setItem('smartExpiryToken', data.token);
        state.isAdmin = false;
        renderShell();
        loadPage('dashboard');
    } catch (error) {
        toast(errorMessage(error), 'error');
    }
}

async function checkAdmin() {
    try {
        await api('/admin/test');
        return true;
    } catch (_) {
        return false;
    }
}

function renderShell() {
    const nav = navItems.filter(([id]) => id !== 'admin' || state.isAdmin).map(([id, label]) => `<button class="nav-btn ${state.page === id ? 'active' : ''}" data-page="${id}" type="button">${label}</button>`).join('');
    const title = navItems.find(([id]) => id === state.page)?.[1] || 'Dashboard';
    root.innerHTML = `<main class="shell ${state.sidebarHidden ? 'sidebar-hidden' : ''}"><aside class="sidebar"><div class="brand-row"><div class="brand-mark">SI</div><div><h1 class="brand-title">SmartExpiryItem</h1><p class="brand-subtitle">${state.isAdmin ? 'Admin' : 'Staff'}</p></div></div><nav class="nav-list">${nav}</nav><div class="sidebar-footer"><div class="user-chip">${esc(state.user?.name || 'User')}<br>${esc(state.user?.email || '')}</div><button id="logoutButton" class="btn small" type="button">Logout</button></div></aside><section class="main"><header class="topbar"><div><h2 class="page-title">${esc(title)}</h2><p class="page-subtitle">SmartExpiryItem</p></div><div class="topbar-actions"><button class="btn" data-sidebar-toggle type="button" aria-expanded="${state.sidebarHidden ? 'false' : 'true'}">${state.sidebarHidden ? 'Show menu' : 'Hide menu'}</button><button class="btn" data-refresh type="button">Refresh</button></div></header><div id="view" class="view"><div class="loading-state">Loading</div></div></section></main>`;
    root.querySelectorAll('[data-page]').forEach((button) => button.addEventListener('click', () => loadPage(button.dataset.page)));
    root.querySelector('[data-sidebar-toggle]').addEventListener('click', toggleSidebar);
    root.querySelector('[data-refresh]').addEventListener('click', () => loadPage(state.page));
    root.querySelector('#logoutButton').addEventListener('click', () => logout());
}

function toggleSidebar() {
    state.sidebarHidden = !state.sidebarHidden;
    localStorage.setItem('smartExpirySidebarHidden', String(state.sidebarHidden));
    const shell = root.querySelector('.shell');
    if (shell) shell.classList.toggle('sidebar-hidden', state.sidebarHidden);

    root.querySelectorAll('[data-sidebar-toggle]').forEach((button) => {
        button.textContent = state.sidebarHidden ? 'Show menu' : 'Hide menu';
        button.setAttribute('aria-expanded', state.sidebarHidden ? 'false' : 'true');
    });
}

async function logout(callApi = true) {
    if (callApi) await api('/logout', { method: 'POST' }).catch(() => null);
    state.token = '';
    state.user = null;
    state.isAdmin = false;
    localStorage.removeItem('smartExpiryToken');
    renderAuth();
}

function setView(markup) {
    document.getElementById('view').innerHTML = markup;
}

async function loadPage(page) {
    state.page = page;
    renderShell();
    try {
        if (page === 'dashboard') await renderDashboard();
        if (page === 'inventory') await renderInventory();
        if (page === 'monitoring') await renderMonitoring();
        if (page === 'reports') await renderReports();
        if (page === 'lookup') await renderLookup();
        if (page === 'alerts') await renderAlerts();
        if (page === 'admin') await renderAdmin();
    } catch (error) {
        setView(`<section class="panel"><div class="empty-state">${esc(errorMessage(error))}</div></section>`);
    }
}

function metric(label, value) {
    return `<article class="metric-card"><div class="metric-label">${esc(label)}</div><div class="metric-value">${esc(value)}</div></article>`;
}

function smallTable(title, headers, rows) {
    const body = rows.length ? rows.map((row) => `<tr>${row.map((cell) => `<td>${esc(cell)}</td>`).join('')}</tr>`).join('') : `<tr><td colspan="${headers.length}" class="empty-state">No records</td></tr>`;
    return `<article class="panel"><div class="panel-header"><h3 class="panel-title">${esc(title)}</h3></div><div class="panel-body table-wrap"><table><thead><tr>${headers.map((h) => `<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${body}</tbody></table></div></article>`;
}

async function renderDashboard() {
    const [health, summary, lowStock, expiring] = await Promise.all([api('/health'), api('/reports/summary'), api('/inventory/low-stock'), api('/inventory/expiring-soon?days=30')]);
    const s = summary.data || {};
    setView(`<section class="metrics">${metric('API', health.status || 'ok')}${metric('Role', state.isAdmin ? 'Admin' : 'Staff')}${metric('Total items', num(s.total_items))}${metric('Low stock', num(s.low_stock_count))}${metric('Expired', num(s.expired_count))}${metric('Expiring soon', num(s.expiring_soon_count))}</section><section class="grid-2">${smallTable('Session', ['Field', 'Value'], [['User', state.user?.name || '-'], ['Email', state.user?.email || '-'], ['App', health.app || 'SmartExpiryItem']])}${smallTable('Low Stock', ['Name', 'Quantity', 'Unit', 'Minimum'], (lowStock.data || []).map((i) => [i.name, i.quantity, i.unit || '-', i.minimum_stock]))}${smallTable('Expiring Soon', ['Name', 'Expires', 'Quantity', 'Unit'], (expiring.data || []).map((i) => [i.name, i.expiration_date || '-', i.quantity, i.unit || '-']))}</section>`);
}
function itemRows(items) {
    if (!items.length) return '<tr><td colspan="9" class="empty-state">No records</td></tr>';
    return items.map((item) => `<tr><td>${esc(item.name)}</td><td>${esc(item.barcode || '-')}</td><td>${num(item.quantity)}</td><td>${esc(item.unit || '-')}</td><td>${num(item.minimum_stock)}</td><td>${esc(item.expiration_date || '-')}</td><td>${esc(item.location || '-')}</td><td>${inventoryStatusBadge(item)}</td><td><div class="btn-row"><button class="btn small" data-edit="${esc(item.id)}" type="button">Edit</button><button class="btn small danger" data-delete="${esc(item.id)}" type="button">Delete</button></div></td></tr>`).join('');
}

function inventoryStatusBadge(item) {
    const quantity = Number(item.quantity || 0);
    const minimum = Number(item.minimum_stock || 0);
    if (quantity <= 0) return '<span class="badge danger">Out</span>';
    if (quantity <= minimum) return '<span class="badge warn">Low</span>';
    return '<span class="badge good">Ok</span>';
}

async function renderInventory() {
    setView(`<section class="panel"><div class="panel-header"><h3 id="itemFormTitle" class="panel-title">Create Item</h3></div><div class="panel-body"><form id="itemForm" class="form-grid"><input name="id" type="hidden"><label class="field span-2"><span>Name</span><input class="input" name="name" required></label><label class="field"><span>Barcode</span><input class="input" name="barcode"></label><label class="field"><span>Quantity</span><input class="input" name="quantity" type="number" min="0" step="1" inputmode="numeric" required></label><label class="field"><span>Unit</span><input class="input" name="unit" placeholder="kg, pcs, cans"></label><label class="field"><span>Minimum</span><input class="input" name="minimum_stock" type="number" min="0" step="1" inputmode="numeric"></label><label class="field"><span>Expiry</span><input class="input" name="expiration_date" type="date"></label><label class="field"><span>Location</span><input class="input" name="location"></label><div class="span-4 btn-row"><button id="itemSubmitButton" class="btn primary" type="submit">Save Item</button><button id="itemResetButton" class="btn" type="button">Clear</button></div></form></div></section><section class="panel"><div class="panel-header"><h3 class="panel-title">Inventory Items</h3><form id="searchForm" class="btn-row"><input class="input" name="search" placeholder="Search"><select name="status"><option value="">All status</option><option value="low_stock">Low stock</option><option value="out_of_stock">Out of stock</option><option value="in_stock">In stock</option><option value="expired">Expired</option><option value="expiring_soon">Expiring soon</option></select><button class="btn" type="submit">Filter</button></form></div><div id="inventoryTable" class="panel-body table-wrap"><div class="loading-state">Loading</div></div></section>`);
    document.getElementById('itemForm').addEventListener('submit', async (event) => {
        event.preventDefault();
        try {
            const data = formData(event.currentTarget);
            const id = data.id;
            delete data.id;
            await api(id ? `/inventory/${id}` : '/inventory', { method: id ? 'PUT' : 'POST', body: data });
            resetInventoryForm();
            toast(id ? 'Inventory item updated.' : 'Inventory item created.');
            await loadInventory();
        } catch (error) {
            toast(errorMessage(error), 'error');
        }
    });
    document.getElementById('itemResetButton').addEventListener('click', resetInventoryForm);
    document.getElementById('searchForm').addEventListener('submit', async (event) => {
        event.preventDefault();
        const params = new URLSearchParams(formData(event.currentTarget));
        await loadInventory(`?${params.toString()}`);
    });
    await loadInventory();
}

async function loadInventory(query = '') {
    const response = await api(`/inventory${query}`);
    const items = response.data?.data || [];
    state.inventoryItems = items;
    document.getElementById('inventoryTable').innerHTML = `<table><thead><tr><th>Name</th><th>Barcode</th><th>Quantity</th><th>Unit</th><th>Minimum</th><th>Expiry</th><th>Location</th><th>Status</th><th>Actions</th></tr></thead><tbody>${itemRows(items)}</tbody></table>`;
    document.querySelectorAll('[data-edit]').forEach((button) => button.addEventListener('click', () => editInventoryItem(button.dataset.edit)));
    document.querySelectorAll('[data-delete]').forEach((button) => button.addEventListener('click', () => deleteInventoryItem(button.dataset.delete)));
}

function editInventoryItem(id) {
    const item = state.inventoryItems.find((record) => String(record.id) === String(id));
    const form = document.getElementById('itemForm');
    if (!item || !form) return;

    form.elements.id.value = item.id;
    form.elements.name.value = item.name || '';
    form.elements.barcode.value = item.barcode || '';
    form.elements.quantity.value = item.quantity ?? 0;
    form.elements.unit.value = item.unit || '';
    form.elements.minimum_stock.value = item.minimum_stock ?? 0;
    form.elements.expiration_date.value = item.expiration_date || '';
    form.elements.location.value = item.location || '';
    document.getElementById('itemFormTitle').textContent = `Edit Item #${item.id}`;
    document.getElementById('itemSubmitButton').textContent = 'Update Item';
    form.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function resetInventoryForm() {
    const form = document.getElementById('itemForm');
    if (!form) return;
    form.reset();
    form.elements.id.value = '';
    document.getElementById('itemFormTitle').textContent = 'Create Item';
    document.getElementById('itemSubmitButton').textContent = 'Save Item';
}

async function deleteInventoryItem(id) {
    if (!confirm('Delete this inventory item?')) return;
    try {
        await api(`/inventory/${id}`, { method: 'DELETE' });
        toast('Inventory item deleted.');
        await loadInventory();
    } catch (error) {
        toast(errorMessage(error), 'error');
    }
}

function monitoringRows(items) {
    if (!items.length) return '<tr><td colspan="6" class="empty-state">No records</td></tr>';
    return items.map((item) => `<tr><td>${esc(item.name)}</td><td>${num(item.quantity)}</td><td>${esc(item.unit || '-')}</td><td>${num(item.minimum_stock)}</td><td>${esc(item.expiration_date || '-')}</td><td>${esc(item.location || '-')}</td></tr>`).join('');
}

async function renderMonitoring() {
    const [expiring, expired, lowStock] = await Promise.all([
        api('/inventory/expiring-soon?days=30'),
        api('/inventory/expired'),
        api('/inventory/low-stock'),
    ]);

    setView(`<section class="metrics">${metric('Expiring in 30 days', num((expiring.data || []).length))}${metric('Expired', num((expired.data || []).length))}${metric('Low stock', num((lowStock.data || []).length))}${metric('Needs action', num((expired.data || []).length + (lowStock.data || []).length))}</section><section class="grid-3">${smallTable('Expiring Soon', ['Name', 'Quantity', 'Unit', 'Minimum', 'Expires', 'Location'], (expiring.data || []).map((i) => [i.name, i.quantity, i.unit || '-', i.minimum_stock, i.expiration_date || '-', i.location || '-']))}${smallTable('Expired', ['Name', 'Quantity', 'Unit', 'Minimum', 'Expired', 'Location'], (expired.data || []).map((i) => [i.name, i.quantity, i.unit || '-', i.minimum_stock, i.expiration_date || '-', i.location || '-']))}${smallTable('Low Stock', ['Name', 'Quantity', 'Unit', 'Minimum', 'Expires', 'Location'], (lowStock.data || []).map((i) => [i.name, i.quantity, i.unit || '-', i.minimum_stock, i.expiration_date || '-', i.location || '-']))}</section>`);
}

function shortDateTime(value) {
    if (!value) return '-';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

function shortText(value, limit = 90) {
    const text = String(value ?? '');
    return text.length > limit ? `${text.slice(0, limit)}...` : text;
}

function stockRows(items) {
    return (items || []).map((item) => [
        item.name,
        item.quantity,
        item.unit || '-',
        item.minimum_stock,
        item.expiration_date || '-',
        item.location || '-',
    ]);
}

async function renderReports() {
    const [summary, stockStatus, activities, notifications] = await Promise.all([
        api('/reports/summary'),
        api('/reports/stock-status'),
        api('/activity-logs?per_page=10'),
        api('/notifications?per_page=10'),
    ]);

    const s = summary.data || {};
    const stock = stockStatus.data || {};
    const activityRows = (activities.data || []).map((log) => [
        log.action,
        log.module,
        log.description || '-',
        shortDateTime(log.created_at),
    ]);
    const notificationRows = (notifications.data || []).map((log) => [
        log.type,
        log.channel,
        log.status,
        log.recipient || '-',
        shortDateTime(log.sent_at || log.created_at),
    ]);

    setView(`<section class="metrics">${metric('Total items', num(s.total_items))}${metric('Total quantity', num(s.total_quantity))}${metric('Out of stock', num(s.out_of_stock_count))}${metric('Low stock', num(s.low_stock_count))}${metric('Expired', num(s.expired_count))}${metric('Expiring soon', num(s.expiring_soon_count))}</section><section class="grid-3">${smallTable('Out of Stock', ['Name', 'Quantity', 'Unit', 'Minimum', 'Expires', 'Location'], stockRows(stock.out_of_stock))}${smallTable('Low Stock', ['Name', 'Quantity', 'Unit', 'Minimum', 'Expires', 'Location'], stockRows(stock.low_stock))}${smallTable('In Stock', ['Name', 'Quantity', 'Unit', 'Minimum', 'Expires', 'Location'], stockRows(stock.in_stock))}</section><section class="grid-2">${smallTable('Recent Activity', ['Action', 'Module', 'Description', 'Date'], activityRows)}${smallTable('Notification History', ['Type', 'Channel', 'Status', 'Recipient', 'Date'], notificationRows)}</section>`);
}

function asArray(value) {
    if (Array.isArray(value)) return value;
    return value ? [value] : [];
}

function firstFilled(...values) {
    return values.find((value) => value !== undefined && value !== null && String(value).trim() !== '') || '';
}

function safeObject(value) {
    if (!value) return {};
    if (typeof value === 'string') {
        try {
            return JSON.parse(value);
        } catch {
            return {};
        }
    }

    return typeof value === 'object' ? value : {};
}

function syntaxHighlightJson(data) {
    const json = esc(JSON.stringify(data ?? {}, null, 2));

    return json
        .replace(/(&quot;[^&]*?&quot;)(?=:)/g, '<span class="json-key">$1</span>')
        .replace(/: (&quot;[^&]*?&quot;)/g, ': <span class="json-string">$1</span>')
        .replace(/: (-?\d+(?:\.\d+)?(?:e[+-]?\d+)?)/gi, ': <span class="json-number">$1</span>')
        .replace(/: (true|false)/g, ': <span class="json-bool">$1</span>')
        .replace(/: (null)/g, ': <span class="json-null">$1</span>');
}

function rawJsonAccordion(id, data, label = 'View Raw JSON') {
    return `<div class="raw-json-wrap"><button class="btn small raw-toggle" data-json-toggle="${esc(id)}" type="button">${label}</button><div id="${esc(id)}" class="json-accordion hidden"><pre class="json-code">${syntaxHighlightJson(data)}</pre></div></div>`;
}

function bindJsonToggles(scope = document) {
    scope.querySelectorAll('[data-json-toggle]').forEach((button) => {
        button.addEventListener('click', () => {
            const panel = document.getElementById(button.dataset.jsonToggle);
            if (!panel) return;
            panel.classList.toggle('hidden');
            button.textContent = panel.classList.contains('hidden') ? 'View Raw JSON' : 'Hide Raw JSON';
        });
    });
}

function openJsonModal(title, payload) {
    document.querySelector('.modal-backdrop')?.remove();
    const modal = document.createElement('div');
    modal.className = 'modal-backdrop';
    modal.innerHTML = `<section class="json-modal" role="dialog" aria-modal="true"><div class="modal-header"><div><h3>${esc(title)}</h3><p>Exact payload used by this row.</p></div><button class="btn small" data-modal-close type="button">Close</button></div><div class="modal-body"><pre class="json-code">${syntaxHighlightJson(payload)}</pre></div></section>`;
    document.body.appendChild(modal);
    modal.addEventListener('click', (event) => {
        if (event.target === modal || event.target.closest('[data-modal-close]')) modal.remove();
    });
}

function mealIngredients(meal) {
    return Array.from({ length: 20 }, (_, index) => {
        const number = index + 1;
        const ingredient = meal[`strIngredient${number}`];
        const measure = meal[`strMeasure${number}`];
        return ingredient ? `${measure ? `${measure} ` : ''}${ingredient}`.trim() : '';
    }).filter(Boolean);
}

function nutritionBadgesFromProduct(product, raw) {
    const nutriments = safeObject(raw.nutriments);
    const badges = [
        product.nutrition_grade ? `Grade ${String(product.nutrition_grade).toUpperCase()}` : '',
        nutriments.energy ? `Energy ${nutriments.energy}` : '',
        nutriments.proteins ? `Protein ${nutriments.proteins}g` : '',
        nutriments.carbohydrates ? `Carbs ${nutriments.carbohydrates}g` : '',
        nutriments.fat ? `Fat ${nutriments.fat}g` : '',
    ].filter(Boolean);

    return badges.map((badge) => `<span class="nutri-badge">${esc(badge)}</span>`).join('');
}

function nutritionBadgesFromUsda(food) {
    const wanted = ['energy', 'protein', 'carbohydrate', 'total lipid', 'fat', 'fiber', 'sugars'];
    return asArray(food.foodNutrients)
        .filter((nutrient) => wanted.some((name) => String(nutrient.nutrientName || '').toLowerCase().includes(name)))
        .slice(0, 6)
        .map((nutrient) => `<span class="nutri-badge">${esc(nutrient.nutrientName)} ${esc(nutrient.value ?? nutrient.amount ?? '')}${esc(nutrient.unitName || '')}</span>`)
        .join('');
}

function foodImage(src, title) {
    if (src) return `<img class="food-image" src="${esc(src)}" alt="${esc(title || 'Food item')}" loading="lazy">`;
    const initials = String(title || 'Food').split(/\s+/).slice(0, 2).map((word) => word[0] || '').join('').toUpperCase();
    return `<div class="image-placeholder">${esc(initials || 'SI')}</div>`;
}

function renderFoodCard({ title, subtitle, image, meta = [], badges = '', ingredients = [], steps = [], payload }) {
    const rawId = `lookup-raw-${Math.random().toString(36).slice(2)}`;
    return `<article class="food-card"><div class="food-card-media">${foodImage(image, title)}</div><div class="food-card-body"><div class="food-card-head"><div><h4>${esc(title || 'Food item')}</h4>${subtitle ? `<p>${esc(subtitle)}</p>` : ''}</div></div>${meta.length ? `<dl class="meta-grid">${meta.filter((item) => item.value).map((item) => `<div><dt>${esc(item.label)}</dt><dd>${esc(item.value)}</dd></div>`).join('')}</dl>` : ''}${badges ? `<div class="pill-row">${badges}</div>` : ''}${ingredients.length ? `<div class="food-section"><strong>Ingredients</strong><div class="ingredient-grid">${ingredients.slice(0, 16).map((item) => `<span>${esc(item)}</span>`).join('')}</div></div>` : ''}${steps.length ? `<div class="food-section"><strong>Preparation</strong><ol class="step-list">${steps.slice(0, 4).map((step) => `<li>${esc(step)}</li>`).join('')}</ol></div>` : ''}${rawJsonAccordion(rawId, payload)}</div></article>`;
}

function lookupCards(data) {
    const cards = [];

    if (data?.food_product) {
        const product = data.food_product;
        const raw = safeObject(product.raw_data);
        cards.push(renderFoodCard({
            title: firstFilled(product.product_name, raw.product_name, 'Open Food Facts product'),
            subtitle: firstFilled(product.brand, raw.brands, product.categories, raw.categories),
            image: firstFilled(product.image_url, raw.image_url),
            meta: [
                { label: 'Barcode', value: firstFilled(product.barcode, raw.code) },
                { label: 'Brand', value: firstFilled(product.brand, raw.brands) },
                { label: 'Category', value: firstFilled(product.categories, raw.categories) },
            ],
            badges: nutritionBadgesFromProduct(product, raw),
            ingredients: String(firstFilled(raw.ingredients_text, raw.ingredients_text_en)).split(',').map((item) => item.trim()).filter(Boolean),
            payload: data,
        }));
    }

    asArray(data?.foods).slice(0, 6).forEach((food) => {
        cards.push(renderFoodCard({
            title: firstFilled(food.description, food.lowercaseDescription, 'USDA food item'),
            subtitle: firstFilled(food.brandOwner, food.brandName, food.foodCategory, food.dataType),
            image: '',
            meta: [
                { label: 'FDC ID', value: food.fdcId },
                { label: 'Category', value: food.foodCategory },
                { label: 'Data type', value: food.dataType },
            ],
            badges: nutritionBadgesFromUsda(food),
            payload: food,
        }));
    });

    asArray(data?.meals).slice(0, 8).forEach((meal) => {
        const steps = String(meal.strInstructions || '').split(/\r?\n|\. /).map((step) => step.trim()).filter(Boolean);
        cards.push(renderFoodCard({
            title: firstFilled(meal.strMeal, 'Meal result'),
            subtitle: [meal.strCategory, meal.strArea].filter(Boolean).join(' | '),
            image: meal.strMealThumb,
            meta: [
                { label: 'Meal ID', value: meal.idMeal },
                { label: 'Category', value: meal.strCategory },
                { label: 'Area', value: meal.strArea },
            ],
            ingredients: mealIngredients(meal),
            steps,
            payload: meal,
        }));
    });

    return cards;
}

function renderLookupResult(data) {
    const target = document.getElementById('lookupResult');
    if (!target) return;

    const cards = lookupCards(data);
    const rawId = `lookup-response-${Date.now()}`;

    if (!cards.length) {
        target.innerHTML = `<div class="lookup-empty"><h4>No mapped food result</h4><p>The response was valid, but it did not include a known product, food, or meal structure.</p>${rawJsonAccordion(rawId, data)}</div>`;
        bindJsonToggles(target);
        return;
    }

    target.innerHTML = `<div class="lookup-result-head"><div><h3>Food Lookup Result</h3><p>${num(cards.length)} mapped item${cards.length > 1 ? 's' : ''} from the API response.</p></div>${rawJsonAccordion(rawId, data)}</div><div class="lookup-grid">${cards.join('')}</div>`;
    bindJsonToggles(target);
}

async function renderLookup() {
    setView(`<section class="grid-3"><article class="panel"><div class="panel-header"><h3 class="panel-title">Open Food Facts</h3></div><div class="panel-body"><form id="offForm" class="form-stack"><label class="field"><span>Barcode</span><input class="input" name="barcode" value="3017620422003" required></label><button class="btn primary">Search</button></form></div></article><article class="panel"><div class="panel-header"><h3 class="panel-title">USDA</h3></div><div class="panel-body"><form id="usdaForm" class="form-stack"><label class="field"><span>Query</span><input class="input" name="query" value="apple" required></label><button class="btn primary">Search</button></form></div></article><article class="panel"><div class="panel-header"><h3 class="panel-title">Meal Search</h3></div><div class="panel-body"><form id="mealSearchForm" class="form-stack"><label class="field"><span>Meal name</span><input class="input" name="query" value="chicken" required></label><button class="btn primary">Search</button></form></div></article><article class="panel"><div class="panel-header"><h3 class="panel-title">Meal Ingredient</h3></div><div class="panel-body"><form id="mealIngredientForm" class="form-stack"><label class="field"><span>Ingredient</span><input class="input" name="ingredient" value="chicken_breast" required></label><button class="btn primary">Filter</button></form></div></article><article class="panel"><div class="panel-header"><h3 class="panel-title">Meal Lookup</h3></div><div class="panel-body"><form id="mealLookupForm" class="form-stack"><label class="field"><span>Meal ID</span><input class="input" name="meal_id" value="52772" required></label><button class="btn primary">Lookup</button></form></div></article></section><section class="panel"><div class="panel-header"><h3 class="panel-title">Result</h3></div><div id="lookupResult" class="panel-body lookup-result"><div class="lookup-empty"><h4>Search for a food item</h4><p>Results will render as product or meal cards with images, nutrition details, ingredients, and raw JSON toggles.</p></div></div></section>`);
    document.getElementById('offForm').addEventListener('submit', (event) => handleJsonForm(event, 'lookupResult', (data) => api(`/open-food-facts/${encodeURIComponent(data.barcode)}`)));
    document.getElementById('usdaForm').addEventListener('submit', (event) => handleJsonForm(event, 'lookupResult', (data) => api('/usda/lookup', { method: 'POST', body: { query: data.query, page_size: 6, page_number: 1, data_type: ['Foundation'] } })));
    document.getElementById('mealSearchForm').addEventListener('submit', (event) => handleJsonForm(event, 'lookupResult', (data) => api('/mealdb/search', { method: 'POST', body: data })));
    document.getElementById('mealIngredientForm').addEventListener('submit', (event) => handleJsonForm(event, 'lookupResult', (data) => api('/mealdb/filter-by-ingredient', { method: 'POST', body: data })));
    document.getElementById('mealLookupForm').addEventListener('submit', (event) => handleJsonForm(event, 'lookupResult', (data) => api('/mealdb/lookup', { method: 'POST', body: data })));
}

function showJson(data, targetId = 'lookupResult') {
    if (targetId === 'lookupResult') {
        renderLookupResult(data);
        return;
    }

    const target = document.getElementById(targetId);
    if (target) target.textContent = JSON.stringify(data, null, 2);
}

function showError(error, targetId = 'lookupResult') {
    const payload = {
        message: errorMessage(error),
        status: error?.status || 'network_error',
        errors: error?.data?.errors || null,
    };

    if (targetId === 'lookupResult') {
        const target = document.getElementById(targetId);
        if (target) {
            const rawId = `lookup-error-${Date.now()}`;
            target.innerHTML = `<div class="lookup-empty error-state"><h4>Lookup failed</h4><p>${esc(payload.message)}</p>${rawJsonAccordion(rawId, payload)}</div>`;
            bindJsonToggles(target);
        }
        return;
    }

    showJson(payload, targetId);
}

async function handleJsonForm(event, targetId, callback) {
    event.preventDefault();
    const form = event.currentTarget;
    await runForm(form, 'Loading', async () => {
        try {
            showJson(await callback(formData(form)), targetId);
        } catch (error) {
            showError(error, targetId);
            toast(errorMessage(error), 'error');
        }
    });
}

function sanitizePreviewHtml(html) {
    const template = document.createElement('template');
    template.innerHTML = html || '';
    template.content.querySelectorAll('script, iframe, object, embed, link, meta').forEach((node) => node.remove());
    template.content.querySelectorAll('*').forEach((node) => {
        [...node.attributes].forEach((attribute) => {
            const name = attribute.name.toLowerCase();
            const value = attribute.value.trim().toLowerCase();
            const dangerousUrl = ['href', 'src', 'xlink:href'].includes(name) && value.startsWith('javascript:');

            if (name.startsWith('on') || dangerousUrl) {
                node.removeAttribute(attribute.name);
            }
        });
    });

    return template.innerHTML;
}

function showHtmlPreview(html) {
    const preview = document.getElementById('brevoPreview');
    if (!preview) return;

    const safeHtml = sanitizePreviewHtml(html);

    if (!safeHtml.trim()) {
        preview.classList.add('empty');
        preview.textContent = 'Write HTML to preview the email output before sending.';
        return;
    }

    preview.classList.remove('empty');
    preview.innerHTML = safeHtml;
}

function daysUntil(dateValue) {
    if (!dateValue) return null;
    const today = new Date();
    const target = new Date(dateValue);
    if (Number.isNaN(target.getTime())) return null;
    today.setHours(0, 0, 0, 0);
    target.setHours(0, 0, 0, 0);
    return Math.ceil((target - today) / 86400000);
}

function alertStatusForItem(item, type) {
    if (type === 'low_stock') return { label: 'Low stock', className: 'warn' };

    const days = daysUntil(item.expiration_date);
    if (days !== null && days < 0) return { label: 'Expired', className: 'danger' };
    if (days !== null && days < 3) return { label: `${days} day${days === 1 ? '' : 's'}`, className: 'danger' };
    if (days !== null && days < 7) return { label: `${days} days`, className: 'warn' };
    return { label: 'Expiring soon', className: 'soft' };
}

function alertRow(row, index) {
    const item = row.item;
    const status = alertStatusForItem(item, row.type);
    return `<article class="alert-row"><div class="alert-main"><div><h4>${esc(item.name)}</h4><p>${esc(item.location || 'No location set')}</p></div><span class="status-badge ${status.className}">${esc(status.label)}</span></div><div class="alert-details"><div><span>Expiry date</span><strong>${esc(item.expiration_date || '-')}</strong></div><div><span>Quantity</span><strong>${num(item.quantity)} ${esc(item.unit || '')}</strong></div><div><span>Minimum</span><strong>${num(item.minimum_stock)}</strong></div><button class="btn small" data-alert-payload="${index}" type="button">View Payload</button></div></article>`;
}

async function loadSystemAlerts() {
    const container = document.getElementById('systemAlerts');
    if (!container) return;

    container.innerHTML = '<div class="loading-state">Loading alerts</div>';

    try {
        const [expired, expiringSoon, lowStock] = await Promise.all([
            api('/inventory/expired'),
            api('/inventory/expiring-soon?days=7'),
            api('/inventory/low-stock'),
        ]);

        const alerts = [
            ...asArray(expired.data).map((item) => ({ type: 'expired', item })),
            ...asArray(expiringSoon.data).map((item) => ({ type: 'expiring_soon', item })),
            ...asArray(lowStock.data).map((item) => ({ type: 'low_stock', item })),
        ];

        state.alertPayloads = alerts.map((alert) => ({
            type: alert.type,
            item: alert.item,
            generated_at: new Date().toISOString(),
        }));

        if (!alerts.length) {
            container.innerHTML = '<div class="lookup-empty"><h4>No active inventory alerts</h4><p>Expired, expiring-soon, and low-stock items will appear here with their payloads.</p></div>';
            return;
        }

        container.innerHTML = `<div class="alert-list">${alerts.map(alertRow).join('')}</div>`;
        container.querySelectorAll('[data-alert-payload]').forEach((button) => {
            button.addEventListener('click', () => {
                const payload = state.alertPayloads[Number(button.dataset.alertPayload)];
                openJsonModal('Alert Payload', payload);
            });
        });
    } catch (error) {
        container.innerHTML = `<div class="lookup-empty error-state"><h4>Unable to load alerts</h4><p>${esc(errorMessage(error))}</p></div>`;
    }
}

function renderAlertActionResponse(response) {
    const target = document.getElementById('alertResult');
    if (!target) return;

    const rawId = `alert-response-${Date.now()}`;
    const sent = Object.entries(response.alerts_sent || {}).map(([channel, result]) => `${channel}: HTTP ${result.status || '-'}`);
    target.innerHTML = `<div class="action-result-card"><div><h4>${esc(response.message || 'Action completed')}</h4><p>${sent.length ? esc(sent.join(' | ')) : 'Response received from the API.'}</p></div>${rawJsonAccordion(rawId, response)}</div>`;
    bindJsonToggles(target);
}

function renderAlertActionError(error) {
    const target = document.getElementById('alertResult');
    if (!target) return;

    const payload = {
        message: errorMessage(error),
        status: error?.status || 'network_error',
        errors: error?.data?.errors || null,
    };
    const rawId = `alert-error-${Date.now()}`;
    target.innerHTML = `<div class="action-result-card error-state"><div><h4>Action failed</h4><p>${esc(payload.message)}</p></div>${rawJsonAccordion(rawId, payload)}</div>`;
    bindJsonToggles(target);
}

async function renderAlerts() {
    setView(`<section class="grid-3"><article class="panel"><div class="panel-header"><h3 class="panel-title">Telegram</h3></div><div class="panel-body"><form id="telegramForm" class="form-stack"><label class="field"><span>Chat ID</span><input class="input" name="chat_id" placeholder="Use configured default if blank"></label><label class="field"><span>Message</span><textarea name="message" required>SmartExpiryItem UI alert.</textarea></label><label class="field"><span>Parse mode</span><select name="parse_mode"><option value="">Plain text</option><option value="HTML">HTML</option><option value="Markdown">Markdown</option><option value="MarkdownV2">MarkdownV2</option></select></label><button class="btn primary">Send Alert</button></form></div></article><article class="panel"><div class="panel-header"><h3 class="panel-title">Brevo Email</h3></div><div class="panel-body"><form id="brevoForm" class="form-stack"><label class="field"><span>To email</span><input class="input" name="to_email" type="email" value="${esc(state.user?.email || '')}" required></label><label class="field"><span>To name</span><input class="input" name="to_name" value="${esc(state.user?.name || '')}"></label><label class="field"><span>Subject</span><input class="input" name="subject" value="SmartExpiryItem test email" required></label><label class="field"><span>Message</span><textarea id="brevoHtmlContent" name="html_content" required><p style="background-color:blue;color:white;padding:12px;">SmartExpiryItem Brevo email test.</p></textarea></label><div class="html-preview-wrap"><div class="field-label">Rendered Preview Before Send</div><div id="brevoPreview" class="html-preview empty">Write HTML to preview the email output before sending.</div></div><button class="btn primary">Send Email</button></form></div></article><article class="panel"><div class="panel-header"><h3 class="panel-title">Inventory Alert Sender</h3></div><div class="panel-body btn-row"><button class="btn primary" data-alert="low" type="button">Send Low Stock</button><button class="btn primary" data-alert="expiry" type="button">Send Expiring Soon</button></div></article></section><section class="panel"><div class="panel-header"><div><h3 class="panel-title">System Alerts</h3><p class="panel-subtitle">Inventory items needing attention with raw payload access.</p></div><button id="refreshSystemAlerts" class="btn small" type="button">Refresh</button></div><div id="systemAlerts" class="panel-body"><div class="loading-state">Loading alerts</div></div></section><section class="panel"><div class="panel-header"><h3 class="panel-title">Last Action</h3></div><div id="alertResult" class="panel-body"><div class="lookup-empty"><h4>No alert action yet</h4><p>Send a Telegram, Brevo, low-stock, or expiry alert to view the delivery response.</p></div></div></section><section class="panel"><div class="panel-header"><h3 class="panel-title">Notifications</h3></div><div id="notifications" class="panel-body table-wrap"></div></section>`);
    document.getElementById('telegramForm').addEventListener('submit', async (event) => {
        event.preventDefault();
        await runForm(event.currentTarget, 'Sending', async () => {
            try {
                const response = await api('/telegram/send-alert', { method: 'POST', body: formData(event.currentTarget) });
                renderAlertActionResponse(response);
                toast('Telegram alert sent.');
                await loadNotifications();
            } catch (error) {
                renderAlertActionError(error);
                toast(errorMessage(error), 'error');
            }
        });
    });
    document.getElementById('brevoForm').addEventListener('submit', async (event) => {
        event.preventDefault();
        await runForm(event.currentTarget, 'Sending', async () => {
            const data = formData(event.currentTarget);
            const htmlContent = data.html_content || '';
            showHtmlPreview(htmlContent);

            try {
                const response = await api('/brevo/send-email', { method: 'POST', body: data });
                renderAlertActionResponse(response);
                toast(response.message || 'Email sent successfully.');
                await loadNotifications();
            } catch (error) {
                renderAlertActionError(error);
                toast(errorMessage(error), 'error');
                await loadNotifications();
            }
        });
    });
    const brevoHtmlContent = document.getElementById('brevoHtmlContent');
    if (brevoHtmlContent) {
        showHtmlPreview(brevoHtmlContent.value);
        brevoHtmlContent.addEventListener('input', () => showHtmlPreview(brevoHtmlContent.value));
    }
    document.querySelectorAll('[data-alert]').forEach((button) => button.addEventListener('click', async () => {
        const endpoint = button.dataset.alert === 'low' ? '/alerts/low-stock' : '/alerts/expiring-soon';
        const body = button.dataset.alert === 'low' ? { channels: ['telegram'] } : { channels: ['telegram'], days: 30 };
        try {
            const response = await api(endpoint, { method: 'POST', body });
            renderAlertActionResponse(response);
            toast('Alert processed.');
            await loadNotifications();
            await loadSystemAlerts();
        } catch (error) {
            renderAlertActionError(error);
            toast(errorMessage(error), 'error');
        }
    }));
    document.getElementById('refreshSystemAlerts').addEventListener('click', loadSystemAlerts);
    await loadSystemAlerts();
    await loadNotifications();
}

async function loadNotifications() {
    const response = await api('/notifications?per_page=10').catch(() => ({ data: [] }));
    const rows = (response.data || []).map((item) => `<tr><td>${esc(item.type)}</td><td>${esc(item.channel)}</td><td><span class="badge ${item.status === 'sent' ? 'good' : 'danger'}">${esc(item.status)}</span></td><td>${esc(item.recipient || '-')}</td><td>${esc(shortText(item.message || '-'))}</td><td>${esc(shortDateTime(item.sent_at || item.created_at))}</td></tr>`).join('') || '<tr><td colspan="6" class="empty-state">No records</td></tr>';
    document.getElementById('notifications').innerHTML = `<table><thead><tr><th>Type</th><th>Channel</th><th>Status</th><th>Recipient</th><th>Message</th><th>Timestamp</th></tr></thead><tbody>${rows}</tbody></table>`;
}

async function renderAdmin() {
    if (!state.isAdmin) {
        setView('<section class="panel"><div class="empty-state">Admin access required.</div></section>');
        return;
    }
    setView(`<section class="grid-2"><article class="panel"><div class="panel-header"><h3 class="panel-title">Active Users</h3></div><div id="adminUsers" class="panel-body table-wrap"><div class="loading-state">Loading</div></div></article><article class="panel"><div class="panel-header"><h3 class="panel-title">Deleted Users</h3></div><div id="deletedUsers" class="panel-body table-wrap"><div class="loading-state">Loading</div></div></article></section><section class="panel"><div class="panel-header"><h3 class="panel-title">Roles</h3></div><div id="roleSummary" class="panel-body table-wrap"><div class="loading-state">Loading</div></div></section>`);
    await loadAdminTables();
}

async function loadAdminTables() {
    const [users, deleted, roles] = await Promise.all([
        api('/admin/users?per_page=50'),
        api('/admin/users/deleted?per_page=50'),
        api('/admin/roles'),
    ]);

    const roleList = roles.data || [];
    document.getElementById('adminUsers').innerHTML = `<table><thead><tr><th>Name</th><th>Email</th><th>Current Role</th><th>Change Role</th><th>Actions</th></tr></thead><tbody>${adminUserRows(users.data || [], roleList)}</tbody></table>`;
    document.getElementById('deletedUsers').innerHTML = `<table><thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Action</th></tr></thead><tbody>${deletedUserRows(deleted.data || [])}</tbody></table>`;
    document.getElementById('roleSummary').innerHTML = `<table><thead><tr><th>Role</th><th>Users</th></tr></thead><tbody>${roleList.map((role) => `<tr><td>${esc(role.name)}</td><td>${num(role.users_count)}</td></tr>`).join('') || '<tr><td colspan="2" class="empty-state">No records</td></tr>'}</tbody></table>`;

    document.querySelectorAll('[data-update-role]').forEach((button) => button.addEventListener('click', () => updateUserRole(button.dataset.updateRole)));
    document.querySelectorAll('[data-delete-user]').forEach((button) => button.addEventListener('click', () => deleteUser(button.dataset.deleteUser)));
    document.querySelectorAll('[data-restore-user]').forEach((button) => button.addEventListener('click', () => restoreUser(button.dataset.restoreUser)));
}

function adminUserRows(users, roles) {
    if (!users.length) return '<tr><td colspan="5" class="empty-state">No records</td></tr>';

    return users.map((user) => {
        const currentRoleId = Number(user.role_id || user.role?.id || 0);
        const options = roles.map((role) => `<option value="${esc(role.id)}" ${Number(role.id) === currentRoleId ? 'selected' : ''}>${esc(role.name)}</option>`).join('');
        const isCurrentUser = Number(user.id) === Number(state.user?.id);
        const deleteButton = isCurrentUser
            ? '<button class="btn small danger" type="button" disabled>Current User</button>'
            : `<button class="btn small danger" data-delete-user="${esc(user.id)}" type="button">Delete</button>`;

        return `<tr><td>${esc(user.name)}</td><td>${esc(user.email)}</td><td><span class="badge ${user.role?.name === 'admin' ? 'good' : ''}">${esc(user.role?.name || user.role_id || '-')}</span></td><td><select id="role-${esc(user.id)}">${options}</select></td><td><div class="btn-row"><button class="btn small" data-update-role="${esc(user.id)}" type="button">Update</button>${deleteButton}</div></td></tr>`;
    }).join('');
}

function deletedUserRows(users) {
    if (!users.length) return '<tr><td colspan="4" class="empty-state">No deleted users</td></tr>';

    return users.map((user) => `<tr><td>${esc(user.name)}</td><td>${esc(user.email)}</td><td>${esc(user.role?.name || user.role_id || '-')}</td><td><button class="btn small" data-restore-user="${esc(user.id)}" type="button">Restore</button></td></tr>`).join('');
}

async function updateUserRole(id) {
    const select = document.getElementById(`role-${id}`);
    if (!select) return;

    try {
        await api(`/admin/users/${id}/role`, { method: 'PUT', body: { role_id: Number(select.value) } });
        toast('User role updated.');
        await loadAdminTables();
    } catch (error) {
        toast(errorMessage(error), 'error');
    }
}

async function deleteUser(id) {
    if (!confirm('Soft delete this user?')) return;

    try {
        await api(`/admin/users/${id}`, { method: 'DELETE' });
        toast('User deleted.');
        await loadAdminTables();
    } catch (error) {
        toast(errorMessage(error), 'error');
    }
}

async function restoreUser(id) {
    try {
        await api(`/admin/users/${id}/restore`, { method: 'PUT' });
        toast('User restored.');
        await loadAdminTables();
    } catch (error) {
        toast(errorMessage(error), 'error');
    }
}

async function boot() {
    renderAuth();

    if (!state.token) {
        return;
    }

    try {
        const profile = await api('/me');
        state.user = profile.user;
        state.isAdmin = await checkAdmin();
        renderShell();
        loadPage('dashboard');
    } catch (error) {
        console.error('SmartExpiryItem boot failed:', error);
        state.token = '';
        state.user = null;
        state.isAdmin = false;
        localStorage.removeItem('smartExpiryToken');
        renderAuth();
        toast(errorMessage(error), 'error');
    }
}

boot().catch((error) => {
    console.error('SmartExpiryItem fatal startup error:', error);
    root.innerHTML = `<main class="auth-layout"><section class="auth-panel"><div class="brand-row"><div class="brand-mark">SI</div><div><h1 class="brand-title">SmartExpiryItem</h1><p class="brand-subtitle">Startup failed</p></div></div><div class="empty-state">${esc(errorMessage(error))}</div></section></main>`;
});
