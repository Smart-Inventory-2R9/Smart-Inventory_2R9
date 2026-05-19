const root = document.getElementById('app');
const apiBase = root.dataset.apiBase;
const state = {
    token: localStorage.getItem('smartExpiryToken') || '',
    user: null,
    isAdmin: false,
    page: 'dashboard',
    inventoryItems: [],
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
    setView(`<section class="metrics">${metric('API', health.status || 'ok')}${metric('Role', state.isAdmin ? 'Admin' : 'Staff')}${metric('Total items', num(s.total_items))}${metric('Low stock', num(s.low_stock_count))}${metric('Expired', num(s.expired_count))}${metric('Expiring soon', num(s.expiring_soon_count))}</section><section class="grid-2">${smallTable('Session', ['Field', 'Value'], [['User', state.user?.name || '-'], ['Email', state.user?.email || '-'], ['App', health.app || 'SmartExpiryItem']])}${smallTable('Low Stock', ['Name', 'Qty', 'Minimum'], (lowStock.data || []).map((i) => [i.name, i.quantity, i.minimum_stock]))}${smallTable('Expiring Soon', ['Name', 'Expires', 'Qty'], (expiring.data || []).map((i) => [i.name, i.expiration_date || '-', i.quantity]))}</section>`);
}
function itemRows(items) {
    if (!items.length) return '<tr><td colspan="8" class="empty-state">No records</td></tr>';
    return items.map((item) => `<tr><td>${esc(item.name)}</td><td>${esc(item.barcode || '-')}</td><td>${num(item.quantity)} ${esc(item.unit || '')}</td><td>${num(item.minimum_stock)}</td><td>${esc(item.expiration_date || '-')}</td><td>${esc(item.location || '-')}</td><td>${inventoryStatusBadge(item)}</td><td><div class="btn-row"><button class="btn small" data-edit="${esc(item.id)}" type="button">Edit</button><button class="btn small danger" data-delete="${esc(item.id)}" type="button">Delete</button></div></td></tr>`).join('');
}

function inventoryStatusBadge(item) {
    const quantity = Number(item.quantity || 0);
    const minimum = Number(item.minimum_stock || 0);
    if (quantity <= 0) return '<span class="badge danger">Out</span>';
    if (quantity <= minimum) return '<span class="badge warn">Low</span>';
    return '<span class="badge good">Ok</span>';
}

async function renderInventory() {
    setView(`<section class="panel"><div class="panel-header"><h3 id="itemFormTitle" class="panel-title">Create Item</h3></div><div class="panel-body"><form id="itemForm" class="form-grid"><input name="id" type="hidden"><label class="field span-2"><span>Name</span><input class="input" name="name" required></label><label class="field"><span>Barcode</span><input class="input" name="barcode"></label><label class="field"><span>Quantity</span><input class="input" name="quantity" type="number" min="0" required></label><label class="field"><span>Unit</span><input class="input" name="unit"></label><label class="field"><span>Minimum</span><input class="input" name="minimum_stock" type="number" min="0"></label><label class="field"><span>Expiry</span><input class="input" name="expiration_date" type="date"></label><label class="field"><span>Location</span><input class="input" name="location"></label><div class="span-4 btn-row"><button id="itemSubmitButton" class="btn primary" type="submit">Save Item</button><button id="itemResetButton" class="btn" type="button">Clear</button></div></form></div></section><section class="panel"><div class="panel-header"><h3 class="panel-title">Inventory Items</h3><form id="searchForm" class="btn-row"><input class="input" name="search" placeholder="Search"><select name="status"><option value="">All status</option><option value="low_stock">Low stock</option><option value="out_of_stock">Out of stock</option><option value="in_stock">In stock</option><option value="expired">Expired</option><option value="expiring_soon">Expiring soon</option></select><button class="btn" type="submit">Filter</button></form></div><div id="inventoryTable" class="panel-body table-wrap"><div class="loading-state">Loading</div></div></section>`);
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
    document.getElementById('inventoryTable').innerHTML = `<table><thead><tr><th>Name</th><th>Barcode</th><th>Quantity</th><th>Minimum</th><th>Expiry</th><th>Location</th><th>Status</th><th>Actions</th></tr></thead><tbody>${itemRows(items)}</tbody></table>`;
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
    if (!items.length) return '<tr><td colspan="5" class="empty-state">No records</td></tr>';
    return items.map((item) => `<tr><td>${esc(item.name)}</td><td>${num(item.quantity)} ${esc(item.unit || '')}</td><td>${num(item.minimum_stock)}</td><td>${esc(item.expiration_date || '-')}</td><td>${esc(item.location || '-')}</td></tr>`).join('');
}

async function renderMonitoring() {
    const [expiring, expired, lowStock] = await Promise.all([
        api('/inventory/expiring-soon?days=30'),
        api('/inventory/expired'),
        api('/inventory/low-stock'),
    ]);

    setView(`<section class="metrics">${metric('Expiring in 30 days', num((expiring.data || []).length))}${metric('Expired', num((expired.data || []).length))}${metric('Low stock', num((lowStock.data || []).length))}${metric('Needs action', num((expired.data || []).length + (lowStock.data || []).length))}</section><section class="grid-3">${smallTable('Expiring Soon', ['Name', 'Qty', 'Minimum', 'Expires', 'Location'], (expiring.data || []).map((i) => [i.name, `${i.quantity} ${i.unit || ''}`, i.minimum_stock, i.expiration_date || '-', i.location || '-']))}${smallTable('Expired', ['Name', 'Qty', 'Minimum', 'Expired', 'Location'], (expired.data || []).map((i) => [i.name, `${i.quantity} ${i.unit || ''}`, i.minimum_stock, i.expiration_date || '-', i.location || '-']))}${smallTable('Low Stock', ['Name', 'Qty', 'Minimum', 'Expires', 'Location'], (lowStock.data || []).map((i) => [i.name, `${i.quantity} ${i.unit || ''}`, i.minimum_stock, i.expiration_date || '-', i.location || '-']))}</section>`);
}

function shortDateTime(value) {
    if (!value) return '-';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

function stockRows(items) {
    return (items || []).map((item) => [
        item.name,
        `${item.quantity} ${item.unit || ''}`,
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

    setView(`<section class="metrics">${metric('Total items', num(s.total_items))}${metric('Total quantity', num(s.total_quantity))}${metric('Out of stock', num(s.out_of_stock_count))}${metric('Low stock', num(s.low_stock_count))}${metric('Expired', num(s.expired_count))}${metric('Expiring soon', num(s.expiring_soon_count))}</section><section class="grid-3">${smallTable('Out of Stock', ['Name', 'Qty', 'Minimum', 'Expires', 'Location'], stockRows(stock.out_of_stock))}${smallTable('Low Stock', ['Name', 'Qty', 'Minimum', 'Expires', 'Location'], stockRows(stock.low_stock))}${smallTable('In Stock', ['Name', 'Qty', 'Minimum', 'Expires', 'Location'], stockRows(stock.in_stock))}</section><section class="grid-2">${smallTable('Recent Activity', ['Action', 'Module', 'Description', 'Date'], activityRows)}${smallTable('Notification History', ['Type', 'Channel', 'Status', 'Recipient', 'Date'], notificationRows)}</section>`);
}

async function renderLookup() {
    setView(`<section class="grid-3"><article class="panel"><div class="panel-header"><h3 class="panel-title">Open Food Facts</h3></div><div class="panel-body"><form id="offForm" class="form-stack"><label class="field"><span>Barcode</span><input class="input" name="barcode" value="3017620422003" required></label><button class="btn primary">Search</button></form></div></article><article class="panel"><div class="panel-header"><h3 class="panel-title">USDA</h3></div><div class="panel-body"><form id="usdaForm" class="form-stack"><label class="field"><span>Query</span><input class="input" name="query" value="apple" required></label><button class="btn primary">Search</button></form></div></article><article class="panel"><div class="panel-header"><h3 class="panel-title">Meal Search</h3></div><div class="panel-body"><form id="mealSearchForm" class="form-stack"><label class="field"><span>Meal name</span><input class="input" name="query" value="chicken" required></label><button class="btn primary">Search</button></form></div></article><article class="panel"><div class="panel-header"><h3 class="panel-title">Meal Ingredient</h3></div><div class="panel-body"><form id="mealIngredientForm" class="form-stack"><label class="field"><span>Ingredient</span><input class="input" name="ingredient" value="chicken_breast" required></label><button class="btn primary">Filter</button></form></div></article><article class="panel"><div class="panel-header"><h3 class="panel-title">Meal Lookup</h3></div><div class="panel-body"><form id="mealLookupForm" class="form-stack"><label class="field"><span>Meal ID</span><input class="input" name="meal_id" value="52772" required></label><button class="btn primary">Lookup</button></form></div></article></section><section class="panel"><div class="panel-header"><h3 class="panel-title">Result</h3></div><div class="panel-body"><pre id="lookupResult" class="result-box">{}</pre></div></section>`);
    document.getElementById('offForm').addEventListener('submit', (event) => handleJsonForm(event, 'lookupResult', (data) => api(`/open-food-facts/${encodeURIComponent(data.barcode)}`)));
    document.getElementById('usdaForm').addEventListener('submit', (event) => handleJsonForm(event, 'lookupResult', (data) => api('/usda/lookup', { method: 'POST', body: { query: data.query, page_size: 3, page_number: 1, data_type: ['Foundation'] } })));
    document.getElementById('mealSearchForm').addEventListener('submit', (event) => handleJsonForm(event, 'lookupResult', (data) => api('/mealdb/search', { method: 'POST', body: data })));
    document.getElementById('mealIngredientForm').addEventListener('submit', (event) => handleJsonForm(event, 'lookupResult', (data) => api('/mealdb/filter-by-ingredient', { method: 'POST', body: data })));
    document.getElementById('mealLookupForm').addEventListener('submit', (event) => handleJsonForm(event, 'lookupResult', (data) => api('/mealdb/lookup', { method: 'POST', body: data })));
}

function showJson(data, targetId = 'lookupResult') {
    const target = document.getElementById(targetId);
    if (target) target.textContent = JSON.stringify(data, null, 2);
}

function showError(error, targetId = 'lookupResult') {
    showJson({
        message: errorMessage(error),
        status: error?.status || 'network_error',
        errors: error?.data?.errors || null,
    }, targetId);
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

async function renderAlerts() {
    setView(`<section class="grid-3"><article class="panel"><div class="panel-header"><h3 class="panel-title">Telegram</h3></div><div class="panel-body"><form id="telegramForm" class="form-stack"><label class="field"><span>Chat ID</span><input class="input" name="chat_id" placeholder="Use configured default if blank"></label><label class="field"><span>Message</span><textarea name="message" required>SmartExpiryItem UI alert.</textarea></label><label class="field"><span>Parse mode</span><select name="parse_mode"><option value="">Plain text</option><option value="HTML">HTML</option><option value="Markdown">Markdown</option><option value="MarkdownV2">MarkdownV2</option></select></label><button class="btn primary">Send Alert</button></form></div></article><article class="panel"><div class="panel-header"><h3 class="panel-title">Brevo Email</h3></div><div class="panel-body"><form id="brevoForm" class="form-stack"><label class="field"><span>To email</span><input class="input" name="to_email" type="email" value="${esc(state.user?.email || '')}" required></label><label class="field"><span>To name</span><input class="input" name="to_name" value="${esc(state.user?.name || '')}"></label><label class="field"><span>Subject</span><input class="input" name="subject" value="SmartExpiryItem test email" required></label><label class="field"><span>Message</span><textarea name="text_content" required>SmartExpiryItem Brevo email test.</textarea></label><button class="btn primary">Send Email</button></form></div></article><article class="panel"><div class="panel-header"><h3 class="panel-title">Inventory Alerts</h3></div><div class="panel-body btn-row"><button class="btn primary" data-alert="low" type="button">Low Stock</button><button class="btn primary" data-alert="expiry" type="button">Expiring Soon</button></div></article></section><section class="panel"><div class="panel-header"><h3 class="panel-title">Last Response</h3></div><div class="panel-body"><pre id="alertResult" class="result-box">{}</pre></div></section><section class="panel"><div class="panel-header"><h3 class="panel-title">Notifications</h3></div><div id="notifications" class="panel-body table-wrap"></div></section>`);
    document.getElementById('telegramForm').addEventListener('submit', async (event) => {
        event.preventDefault();
        await runForm(event.currentTarget, 'Sending', async () => {
            try {
                const response = await api('/telegram/send-alert', { method: 'POST', body: formData(event.currentTarget) });
                showJson(response, 'alertResult');
                toast('Telegram alert sent.');
                await loadNotifications();
            } catch (error) {
                showError(error, 'alertResult');
                toast(errorMessage(error), 'error');
            }
        });
    });
    document.getElementById('brevoForm').addEventListener('submit', async (event) => {
        event.preventDefault();
        await runForm(event.currentTarget, 'Sending', async () => {
            try {
                const response = await api('/brevo/send-email', { method: 'POST', body: formData(event.currentTarget) });
                showJson(response, 'alertResult');
                toast('Brevo email sent.');
                await loadNotifications();
            } catch (error) {
                showError(error, 'alertResult');
                toast(errorMessage(error), 'error');
            }
        });
    });
    document.querySelectorAll('[data-alert]').forEach((button) => button.addEventListener('click', async () => {
        const endpoint = button.dataset.alert === 'low' ? '/alerts/low-stock' : '/alerts/expiring-soon';
        const body = button.dataset.alert === 'low' ? { channels: ['telegram'] } : { channels: ['telegram'], days: 30 };
        try {
            const response = await api(endpoint, { method: 'POST', body });
            showJson(response, 'alertResult');
            toast('Alert processed.');
            await loadNotifications();
        } catch (error) {
            showError(error, 'alertResult');
            toast(errorMessage(error), 'error');
        }
    }));
    await loadNotifications();
}

async function loadNotifications() {
    const response = await api('/notifications?per_page=10').catch(() => ({ data: [] }));
    const rows = (response.data || []).map((item) => `<tr><td>${esc(item.type)}</td><td>${esc(item.channel)}</td><td><span class="badge ${item.status === 'sent' ? 'good' : 'danger'}">${esc(item.status)}</span></td><td>${esc(item.recipient || '-')}</td></tr>`).join('') || '<tr><td colspan="4" class="empty-state">No records</td></tr>';
    document.getElementById('notifications').innerHTML = `<table><thead><tr><th>Type</th><th>Channel</th><th>Status</th><th>Recipient</th></tr></thead><tbody>${rows}</tbody></table>`;
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
    if (!state.token) {
        renderAuth();
        return;
    }
    try {
        const profile = await api('/me');
        state.user = profile.user;
        state.isAdmin = await checkAdmin();
        renderShell();
        loadPage('dashboard');
    } catch (_) {
        logout(false);
    }
}

boot();
