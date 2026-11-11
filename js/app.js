import { loadState, saveState, downloadBackup, validateBackup, createDefaultState } from './storage.js';
import { createTransaction, totals, transactionsForMonth, categorySpending, deleteTransaction, monthTotals, projectedCashAfterTransactionChange } from './transactions.js';
import { budgetSummary, upsertBudget } from './budget.js';
import { goalBalance, totalSavings, addGoal, addMovement } from './savings.js';
import { tripSpent, addTrip, deleteTrip } from './trips.js';
import { addBill, payBill, deleteBill } from './bills.js';
import { reportTotals, categoryTotals, monthlyTrend } from './reports.js';
import { APP_CATEGORIES, t, uid, todayISO, monthKey, formatMoney, formatDate, sum, clamp, el, icon, button, badge, progressBar, emptyState, field, makeInput, makeSelect } from './utils.js';

let state = loadState();
let currentView = 'dashboard';
let deferredInstallPrompt = null;
let serviceWorkerRegistration = null;
let reportPeriod = 'monthly';
let transactionFilters = { search: '', type: 'all', month: 'all', category: 'all', sort: 'newest' };
let activeModal = null;
let modalReturnFocus = null;
let privacyMode = false;

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const lang = () => state.settings.language;
const tr = key => t(key, lang());
const money = value => privacyMode ? '••••••' : formatMoney(value, state.settings.currency, lang());
const currentMonth = () => monthKey();

function categoryLabel(category) {
  if (category === 'bills') return tr('billsCat');
  return tr(category || 'other');
}

function persist(showMessage = false) {
  const ok = saveState(state);
  if (!ok) toast('Could not save. Device storage may be full.', 'error');
  else if (showMessage) toast(tr('savedMessage'), 'success');
  return ok;
}

function toast(message, type = 'success') {
  const region = $('#toast-region');
  const node = el('div', { class: `toast toast-${type}` }, icon(type === 'error' ? 'info' : 'check', 17), el('span', {}, message));
  region.append(node);
  window.setTimeout(() => node.remove(), 3200);
}

function setTheme() {
  document.documentElement.dataset.theme = state.settings.theme;
  const themeIcon = $('#theme-toggle');
  themeIcon.replaceChildren(icon(state.settings.theme === 'dark' ? 'sun' : 'moon', 17));
  $('#theme-toggle').setAttribute('aria-label', state.settings.theme === 'dark' ? tr('switchToLightTheme') : tr('switchToDarkTheme'));
  $('#theme-toggle').setAttribute('aria-pressed', String(state.settings.theme === 'dark'));
}

function decorateIcons(root = document) {
  $$('[data-icon]', root).forEach(node => {
    const name = node.dataset.icon;
    node.replaceChildren(icon(name, 18));
  });
}

function updateChrome() {
  document.documentElement.lang = lang();
  decorateIcons();
  const title = tr(currentView);
  $('#page-breadcrumb').textContent = title;
  document.title = lang() === 'km' ? 'Monee — គ្រប់គ្រងហិរញ្ញវត្ថុ' : 'Monee — Money Management';
  $('#sidebar')?.setAttribute('aria-label', tr('mainNavigation'));
  $('.mobile-nav')?.setAttribute('aria-label', tr('mainNavigation'));
  const menuButton = $('#mobile-menu');
  if (menuButton) {
    const isOpen = $('#sidebar')?.classList.contains('sidebar-open') || false;
    menuButton.setAttribute('aria-expanded', String(isOpen));
    menuButton.setAttribute('aria-label', isOpen ? tr('close') : tr('openNavigation'));
  }
  $$('[data-nav-label]').forEach(node => { node.textContent = tr(node.dataset.navLabel); });
  $$('.nav-link, .mobile-nav-link').forEach(node => {
    const label = tr(node.dataset.view);
    node.setAttribute('aria-label', label);
    node.setAttribute('title', label);
  });
  $$('[data-i18n]').forEach(node => { node.textContent = tr(node.dataset.i18n); });
  // Show the language currently in use, not the language it will switch to.
  $('#language-toggle .language-short').textContent = lang() === 'km' ? 'KM' : 'EN';
  const switchLanguageLabel = tr(lang() === 'km' ? 'switchToEnglish' : 'switchToKhmer');
  $('#language-toggle').setAttribute('aria-label', switchLanguageLabel);
  $('#language-toggle').setAttribute('title', switchLanguageLabel);
  $('#install-button').setAttribute('aria-label', tr('installApp'));
  $('#install-button').setAttribute('title', tr('installApp'));
  $('#user-avatar').textContent = (state.settings.userName || 'M').trim().slice(0, 1).toUpperCase();
  $('#connection-text').textContent = navigator.onLine ? tr('onlineStatus') : tr('offline');
  $('#connection-status').classList.toggle('offline', !navigator.onLine);
  const privacyToggle = $('#privacy-toggle');
  if (privacyToggle) {
    privacyToggle.replaceChildren(icon(privacyMode ? 'eyeOff' : 'eye', 17));
    privacyToggle.setAttribute('aria-label', privacyMode ? tr('showAmounts') : tr('hideAmounts'));
    privacyToggle.setAttribute('title', privacyToggle.getAttribute('aria-label'));
    privacyToggle.setAttribute('aria-pressed', String(privacyMode));
  }
  setTheme();
}

function pageHeader(title, subtitle, actions = []) {
  return el('div', { class: 'page-header' },
    el('div', {}, el('h1', { class: 'page-title' }, title), el('p', { class: 'page-subtitle' }, subtitle)),
    actions.length ? el('div', { class: 'page-actions' }, ...actions) : null
  );
}

function actionButton(label, action, id = '', variant = 'secondary', iconName = null) {
  const inferredIcon = iconName || (action.startsWith('go-') ? 'arrowRight' : action.startsWith('add-') || action.startsWith('create-') ? 'plus' : null);
  const accessibleLabel = label || (action.startsWith('edit-') ? tr('edit') : action.startsWith('delete-') ? tr('delete') : action.startsWith('go-') ? tr('viewAll') : action);
  return button(label, { variant, iconName: inferredIcon, className: 'action-btn', title: accessibleLabel, 'aria-label': accessibleLabel, 'data-action': action, 'data-id': id });
}

function sectionPanel(title, subtitle = '', content = null, action = null) {
  return el('section', { class: 'panel' },
    el('div', { class: 'panel-header' },
      el('div', {}, el('h2', { class: 'panel-title' }, title), subtitle ? el('p', { class: 'panel-subtitle' }, subtitle) : null),
      action
    ),
    content
  );
}

function summaryCard(label, value, iconName, tone, caption = '', primary = false) {
  return el('article', { class: `summary-card${primary ? ' primary-card' : ''}` },
    el('div', { class: 'summary-top' },
      el('span', { class: 'summary-label' }, label),
      el('span', { class: `summary-icon ${tone || ''}` }, icon(iconName, 17))
    ),
    el('strong', { class: 'summary-value' }, value),
    caption ? el('div', { class: 'summary-caption' }, caption) : null
  );
}

function transactionIcon(tx) {
  const incomeIcons = { salary: 'briefcase', business: 'briefcase', freelance: 'briefcase', gift: 'gift', other: 'coins' };
  const categoryIcons = { food: 'utensils', transport: 'car', shopping: 'shoppingBag', bills: 'receipt', entertainment: 'music', health: 'heart', education: 'bookOpen', travel: 'plane', hotel: 'bed', activities: 'ticket', other: 'wallet' };
  return tx.type === 'income' ? (incomeIcons[tx.category] || 'arrowDown') : (categoryIcons[tx.category] || 'wallet');
}

function transactionRow(tx, compact = false) {
  const income = tx.type === 'income';
  const title = tx.description || categoryLabel(tx.category);
  const meta = `${categoryLabel(tx.category)} · ${formatDate(tx.date, lang())}`;
  return el('div', { class: 'transaction-row' },
    el('span', { class: `category-icon ${income ? 'income' : tx.category === 'food' ? 'expense-food' : tx.category === 'travel' ? 'expense-travel' : ''}` }, icon(transactionIcon(tx), 16)),
    el('div', { class: 'transaction-info' }, el('strong', { class: 'transaction-name', title }, title), el('div', { class: 'transaction-meta' }, compact ? categoryLabel(tx.category) : meta)),
    el('strong', { class: `transaction-amount ${income ? 'amount-income' : 'amount-expense'}` }, `${income ? '+' : '−'}${money(tx.amount)}`),
    compact ? null : el('span', { class: 'transaction-date' }, formatDate(tx.date, lang()))
  );
}

function drawTrendChart(canvas, data) {
  if (!canvas || !data?.length) return;
  const width = Math.max(260, canvas.clientWidth || 500);
  const height = Math.max(150, canvas.clientHeight || 220);
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  const styles = getComputedStyle(document.documentElement);
  const line = styles.getPropertyValue('--line').trim() || '#e8edf3';
  const muted = styles.getPropertyValue('--muted').trim() || '#7c8797';
  const blue = styles.getPropertyValue('--primary').trim() || '#0f827a';
  const green = styles.getPropertyValue('--green').trim() || '#20a879';
  const pad = { top: 14, right: 10, bottom: 29, left: 12 };
  const chartW = width - pad.left - pad.right;
  const chartH = height - pad.top - pad.bottom;
  const max = Math.max(1, ...data.flatMap(item => [item.income, item.expenses])) * 1.2;
  ctx.font = '10px DM Sans, sans-serif';
  ctx.strokeStyle = line;
  ctx.lineWidth = 1;
  for (let i = 0; i < 4; i++) {
    const y = pad.top + chartH * i / 3;
    ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(width - pad.right, y); ctx.stroke();
  }
  const groupW = chartW / data.length;
  const barW = Math.min(13, groupW * .23);
  data.forEach((item, index) => {
    const center = pad.left + groupW * (index + .5);
    const incomeH = item.income / max * chartH;
    const expenseH = item.expenses / max * chartH;
    ctx.fillStyle = blue;
    roundedBar(ctx, center - barW - 2, pad.top + chartH - incomeH, barW, incomeH, 4);
    ctx.fillStyle = green;
    roundedBar(ctx, center + 2, pad.top + chartH - expenseH, barW, expenseH, 4);
    ctx.fillStyle = muted;
    ctx.textAlign = 'center';
    ctx.fillText(item.label, center, height - 8);
  });
}

function roundedBar(ctx, x, y, w, h, radius) {
  if (h <= 0) return;
  const r = Math.min(radius, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath(); ctx.fill();
}

const CHART_COLORS = ['#0f827a', '#20a879', '#e1a03b', '#8a6ce0', '#e16e81', '#48a6b8', '#9aabbc', '#cf8f50'];
function drawDonutChart(canvas, rows) {
  if (!canvas) return;
  const width = Math.max(180, canvas.clientWidth || 220);
  const height = Math.max(150, canvas.clientHeight || 190);
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = width * dpr; canvas.height = height * dpr;
  const ctx = canvas.getContext('2d'); ctx.scale(dpr, dpr);
  const total = sum(rows.map(row => row.amount));
  const cx = width / 2, cy = height / 2, radius = Math.min(width, height) * .38, thickness = radius * .32;
  const styles = getComputedStyle(document.documentElement);
  const track = styles.getPropertyValue('--surface-hover').trim() || '#edf1f5';
  ctx.lineWidth = thickness; ctx.lineCap = 'butt'; ctx.strokeStyle = track;
  ctx.beginPath(); ctx.arc(cx, cy, radius, 0, Math.PI * 2); ctx.stroke();
  if (total > 0) {
    let angle = -Math.PI / 2;
    rows.forEach((row, i) => {
      const next = angle + row.amount / total * Math.PI * 2;
      ctx.strokeStyle = CHART_COLORS[i % CHART_COLORS.length];
      ctx.beginPath(); ctx.arc(cx, cy, radius, angle, next); ctx.stroke();
      angle = next;
    });
  }
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillStyle = styles.getPropertyValue('--muted').trim() || '#7c8797';
  ctx.font = '10px DM Sans, sans-serif'; ctx.fillText(lang() === 'km' ? 'សរុប' : 'Total', cx, cy - 9);
  ctx.fillStyle = styles.getPropertyValue('--text').trim() || '#17212f';
  ctx.font = '700 13px DM Sans, sans-serif';
  const short = total > 999999 ? `${(total / 1000000).toFixed(1)}M` : total > 9999 ? `${(total / 1000).toFixed(1)}k` : total.toFixed(state.settings.currency === 'KHR' ? 0 : 2);
  ctx.fillText(privacyMode ? '••••' : short, cx, cy + 10);
}

function renderDashboard() {
  const totalsNow = totals(state);
  const monthly = monthTotals(state, currentMonth());
  const budgetRows = budgetSummary(state);
  const overall = budgetRows.find(row => row.category === 'all');
  const budgetLimit = overall ? overall.amount : sum(budgetRows.map(row => row.amount));
  const spentThisMonth = monthly.expenses;
  const budgetPercent = budgetLimit > 0 ? spentThisMonth / budgetLimit * 100 : 0;
  const recent = [...state.transactions].sort((a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt).slice(0, 6);
  const goals = state.savingsGoals.slice(0, 3);
  const bills = state.bills.filter(item => !item.paid).sort((a, b) => a.dueDate.localeCompare(b.dueDate)).slice(0, 3);
  const trend = monthlyTrend(state, 6, lang());

  const top = pageHeader(lang() === 'km' ? `សួស្តី${state.settings.userName ? ` ${state.settings.userName}` : ''} 👋` : `Hello${state.settings.userName ? `, ${state.settings.userName}` : ''} 👋`, lang() === 'km' ? 'នេះជាស្ថានភាពហិរញ្ញវត្ថុរបស់អ្នកនៅថ្ងៃនេះ។' : 'Here is your financial snapshot for today.', [
    actionButton(tr('addIncome'), 'add-income', '', 'secondary', 'plus'),
    actionButton(tr('addExpense'), 'add-expense', '', 'primary', 'plus')
  ]);
  const summary = el('div', { class: 'grid summary-grid dashboard-summary-grid' },
    summaryCard(tr('available'), money(totalsNow.cashAvailable), 'wallet', '', lang() === 'km' ? 'សាច់ប្រាក់ដែលអាចប្រើបានឥឡូវនេះ' : 'Cash you can use right now', true),
    summaryCard(tr('totalMoney'), money(totalsNow.totalMoney), 'chart', 'purple', lang() === 'km' ? 'សាច់ប្រាក់ + ប្រាក់សន្សំ' : 'Available cash + savings'),
    summaryCard(tr('income'), money(monthly.income), 'arrowDown', 'green', tr('thisMonth')),
    summaryCard(tr('expenses'), money(monthly.expenses), 'arrowUp', 'red', tr('thisMonth')),
    summaryCard(tr('saved'), money(totalsNow.saved), 'piggy', 'green', lang() === 'km' ? 'ប្រាក់សន្សំសរុបបច្ចុប្បន្ន' : 'Current net savings')
  );

  const chartCanvas = el('canvas', { 'aria-label': tr('spendingOverview') });
  const chartPanel = sectionPanel(tr('spendingOverview'), lang() === 'km' ? 'ចំណូល និងចំណាយក្នុងរយៈពេល ៦ ខែ' : 'Income and expenses over the last 6 months', el('div', { class: 'chart-wrap' }, chartCanvas), el('span', { class: 'badge badge-neutral' }, tr('monthly')));
  chartPanel.append(el('div', { class: 'legend' },
    el('span', { class: 'legend-item' }, el('i', { class: 'legend-dot', style: { background: 'var(--primary)' } }), tr('income')),
    el('span', { class: 'legend-item' }, el('i', { class: 'legend-dot', style: { background: 'var(--green)' } }), tr('expenses'))
  ));

  const budgetContent = budgetLimit > 0 ? el('div', { class: 'budget-overview' },
    el('div', { class: 'budget-overview-top' }, el('strong', {}, money(spentThisMonth)), el('span', {}, `${money(budgetLimit)} ${lang() === 'km' ? 'ថវិកា' : 'budget'}`)),
    progressBar(budgetPercent, budgetPercent >= 100 ? 'red' : budgetPercent >= 80 ? 'amber' : 'blue'),
    el('div', { class: 'budget-foot' }, el('span', {}, `${Math.round(budgetPercent)}% ${tr('budgetUsed').toLowerCase()}`), el('span', {}, `${tr('remaining')}: ${money(budgetLimit - spentThisMonth)}`)),
    budgetPercent >= 80 ? el('div', { class: 'warning-note' }, icon('info', 15), tr('budgetWarning')) : null
  ) : el('div', { class: 'empty-state' }, icon('chart', 27), el('strong', {}, tr('noBudgetSet')), actionButton(tr('setNow'), 'add-budget', '', 'soft'));
  const budgetPanel = sectionPanel(tr('monthlyBudget'), tr('thisMonth'), budgetContent, actionButton(tr('viewAll'), 'go-budgets'));

  const recentContent = recent.length ? el('div', { class: 'transaction-list' }, ...recent.map(tx => transactionRow(tx, true))) : emptyState(tr('noTransactions'), tr('addFirst'), 'arrows');
  const recentPanel = sectionPanel(tr('recentTransactions'), '', recentContent, actionButton(tr('viewAll'), 'go-transactions'));

  const goalContent = goals.length ? el('div', { class: 'goal-list' }, ...goals.map(goal => {
    const balance = goalBalance(state, goal.id); const pct = goal.targetAmount > 0 ? balance / goal.targetAmount * 100 : 0;
    return el('div', { class: 'goal-item' },
      el('div', { class: 'goal-info' }, el('strong', { class: 'goal-name' }, goal.name), el('span', { class: 'goal-numbers' }, `${Math.round(pct)}%`)),
      progressBar(pct, 'green'),
      el('div', { class: 'goal-bottom' }, el('span', {}, money(balance)), el('span', {}, `${tr('goal')}: ${money(goal.targetAmount)}`))
    );
  })) : emptyState(tr('noGoals'), tr('addFirst'), 'piggy');
  const goalPanel = sectionPanel(tr('savingsGoals'), '', goalContent, actionButton(tr('viewAll'), 'go-savings'));

  const billContent = bills.length ? el('div', { class: 'bill-list' }, ...bills.map(bill => billRow(bill))) : emptyState(tr('noBills'), tr('addFirst'), 'receipt');
  const billPanel = sectionPanel(tr('upcomingBills'), '', billContent, actionButton(tr('viewAll'), 'go-bills'));

  const lower = el('div', { class: 'grid equal-columns' }, recentPanel, el('div', { class: 'page-body' }, goalPanel, billPanel));
  const upper = el('div', { class: 'grid two-column' }, chartPanel, budgetPanel);
  const body = el('div', { class: 'page-body' }, summary, upper, lower);
  requestAnimationFrame(() => drawTrendChart(chartCanvas, trend));
  return el('div', {}, top, body);
}

function getFilteredTransactions() {
  const selected = transactionFilters;
  let rows = [...state.transactions];
  if (selected.type !== 'all') rows = rows.filter(tx => tx.type === selected.type);
  if (selected.month !== 'all') rows = rows.filter(tx => monthKey(tx.date) === selected.month);
  if (selected.category !== 'all') rows = rows.filter(tx => tx.category === selected.category);
  if (selected.search.trim()) {
    const q = selected.search.trim().toLocaleLowerCase();
    rows = rows.filter(tx => `${tx.description} ${tx.category} ${tx.amount} ${tx.paymentMethod}`.toLocaleLowerCase().includes(q));
  }
  const dateOrder = (a, b) => a.date.localeCompare(b.date) || (a.createdAt || 0) - (b.createdAt || 0);
  switch (selected.sort) {
    case 'oldest': rows.sort(dateOrder); break;
    case 'highest': rows.sort((a, b) => b.amount - a.amount || dateOrder(b, a)); break;
    case 'lowest': rows.sort((a, b) => a.amount - b.amount || dateOrder(b, a)); break;
    default: rows.sort((a, b) => dateOrder(b, a));
  }
  return rows;
}

function csvCell(value) {
  let text = String(value ?? '');
  // Prefix potentially executable spreadsheet values to prevent CSV formula injection.
  if (/^[\s\u0000-\u001f]*[=+\-@]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
}

function exportTransactionsCsv() {
  const rows = getFilteredTransactions();
  if (!rows.length) {
    toast(lang() === 'km' ? 'មិនមានប្រតិបត្តិការសម្រាប់នាំចេញទេ។' : 'There are no transactions to export.', 'error');
    return;
  }
  const headers = ['date', 'type', 'category', 'description', 'amount', 'currency', 'paymentMethod', 'trip', 'bill'].map(tr);
  const lines = [headers.map(csvCell).join(',')];
  rows.forEach(tx => {
    const trip = state.trips.find(item => item.id === tx.tripId)?.name || '';
    const bill = state.bills.find(item => item.id === tx.billId)?.name || '';
    lines.push([
      tx.date,
      tx.type,
      categoryLabel(tx.category),
      tx.description || '',
      Number(tx.amount).toFixed(2),
      state.settings.currency,
      tr(tx.paymentMethod || 'cash'),
      trip,
      bill
    ].map(csvCell).join(','));
  });
  const blob = new Blob([`\uFEFF${lines.join('\r\n')}`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const anchor = el('a', { href: url, download: `monee-transactions-${todayISO()}.csv` });
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  toast(lang() === 'km' ? `បាននាំចេញ ${rows.length} ប្រតិបត្តិការ។` : `Exported ${rows.length} transactions.`);
}

function renderTransactions() {
  const months = [...new Set(state.transactions.map(tx => monthKey(tx.date)))].sort().reverse();
  const selected = transactionFilters;
  const rows = getFilteredTransactions();
  const search = makeInput('search', selected.search, { placeholder: tr('search'), 'aria-label': tr('search') });
  search.addEventListener('input', event => {
    const value = event.target.value;
    transactionFilters.search = value;
    render();
    const replacement = $('#content .search-box input');
    replacement?.focus();
    if (replacement && typeof replacement.setSelectionRange === 'function') replacement.setSelectionRange(value.length, value.length);
  });
  const type = makeSelect([{ value: 'all', label: tr('allTypes') }, { value: 'income', label: tr('incomeType') }, { value: 'expense', label: tr('expenseType') }], selected.type);
  type.classList.add('filter-select'); type.setAttribute('aria-label', tr('type'));
  type.addEventListener('change', event => { transactionFilters.type = event.target.value; render(); });
  const month = makeSelect([{ value: 'all', label: lang() === 'km' ? 'គ្រប់ខែ' : 'All months' }, ...months.map(value => ({ value, label: value }))], selected.month);
  month.classList.add('filter-select'); month.setAttribute('aria-label', tr('month'));
  month.addEventListener('change', event => { transactionFilters.month = event.target.value; render(); });
  const categories = [...new Set(state.transactions.map(tx => tx.category))].sort();
  const category = makeSelect([{ value: 'all', label: tr('allCategories') }, ...categories.map(key => ({ value: key, label: categoryLabel(key) }))], selected.category);
  category.classList.add('filter-select'); category.setAttribute('aria-label', tr('category'));
  category.addEventListener('change', event => { transactionFilters.category = event.target.value; render(); });
  const sort = makeSelect([
    { value: 'newest', label: tr('newestFirst') },
    { value: 'oldest', label: tr('oldestFirst') },
    { value: 'highest', label: tr('highestAmount') },
    { value: 'lowest', label: tr('lowestAmount') }
  ], selected.sort || 'newest');
  sort.classList.add('filter-select', 'sort-select'); sort.setAttribute('aria-label', tr('sortBy'));
  sort.addEventListener('change', event => { transactionFilters.sort = event.target.value; render(); });
  const hasFilters = Boolean(selected.search || selected.type !== 'all' || selected.month !== 'all' || selected.category !== 'all' || selected.sort !== 'newest');
  const filterActions = el('div', { class: 'filter-actions' },
    el('span', { class: 'result-count' }, `${rows.length} ${tr('transactionsCount')}`),
    hasFilters ? button(tr('clearFilters'), { variant: 'plain', className: 'clear-filters', iconName: 'close', 'data-action': 'clear-filters' }) : el('span', { class: 'shortcut-hint' }, tr('searchShortcut'))
  );
  const toolbar = el('div', { class: 'toolbar' }, el('div', { class: 'search-box' }, icon('search', 16), search), type, month, category, sort, filterActions);

  let table;
  if (rows.length) {
    const tbody = el('tbody');
    rows.forEach(tx => {
      const title = tx.description || categoryLabel(tx.category);
      const trNode = el('tr', {},
        el('td', {}, el('div', { class: 'table-title' }, el('strong', { class: 'table-title-heading' }, icon(transactionIcon(tx), 15), title), el('small', { class: 'text-muted' }, categoryLabel(tx.category)))),
        el('td', {}, formatDate(tx.date, lang())),
        el('td', {}, badge(tx.type === 'income' ? tr('incomeType') : tr('expenseType'), tx.type === 'income' ? 'success' : 'neutral')),
        el('td', {}, tx.paymentMethod ? tr(tx.paymentMethod) : '—'),
        el('td', {}, el('strong', { class: tx.type === 'income' ? 'amount-income' : '' }, `${tx.type === 'income' ? '+' : '−'}${money(tx.amount)}`)),
        el('td', {}, el('div', { class: 'table-actions' },
          actionButton('', 'edit-tx', tx.id, 'plain', 'edit'),
          actionButton('', 'delete-tx', tx.id, 'plain', 'trash')
        ))
      );
      tbody.append(trNode);
    });
    table = el('div', { class: 'panel table-card' }, el('div', { class: 'table-scroll' }, el('table', { class: 'data-table', 'aria-label': tr('transactions') },
      el('thead', {}, el('tr', {}, ...['Description', 'Date', 'Type', 'Payment', 'Amount', ''].map(label => el('th', {}, label === 'Description' ? tr('description') : label === 'Date' ? tr('date') : label === 'Type' ? tr('type') : label === 'Payment' ? tr('paymentMethod') : label === 'Amount' ? tr('amount') : tr('actions'))))), tbody
    )));
  } else table = el('div', { class: 'panel' }, emptyState(tr('noResults'), tr('addFirst'), 'search'));

  const visibleIncome = sum(rows.filter(tx => tx.type === 'income').map(tx => tx.amount));
  const visibleExpenses = sum(rows.filter(tx => tx.type === 'expense').map(tx => tx.amount));
  const summary = el('div', { class: 'grid summary-grid' },
    summaryCard(tr('income'), money(visibleIncome), 'arrowDown', 'green'),
    summaryCard(tr('expenses'), money(visibleExpenses), 'arrowUp', 'red'),
    summaryCard(tr('total'), String(rows.length), 'arrows', 'purple', tr('transactionsCount')),
    summaryCard(tr('available'), money(totals(state).cashAvailable), 'wallet', '')
  );
  return el('div', {},
    pageHeader(tr('transactions'), lang() === 'km' ? 'កត់ត្រា និងតាមដានចំណូលចំណាយទាំងអស់របស់អ្នក។' : 'Record and track all of your income and expenses.', [actionButton(tr('exportCsv'), 'export-csv', '', 'secondary', 'download'), actionButton(tr('addIncome'), 'add-income', '', 'secondary', 'plus'), actionButton(tr('addExpense'), 'add-expense', '', 'primary', 'plus')]),
    el('div', { class: 'page-body' }, summary, toolbar, table)
  );
}

function renderBudgets() {
  const month = currentMonth();
  const rows = budgetSummary(state, month);
  const allBudget = rows.find(item => item.category === 'all');
  const categoryBudgets = rows.filter(item => item.category !== 'all');
  const totalBudget = allBudget?.amount ?? sum(categoryBudgets.map(item => item.amount));
  const totalSpent = allBudget ? allBudget.spent : sum(categoryBudgets.map(item => item.spent));
  const cards = rows.length ? el('div', { class: 'grid budget-card-grid' }, ...rows.map(row => {
    const color = row.percent >= 100 ? 'red' : row.percent >= 80 ? 'amber' : 'blue';
    return el('article', { class: 'panel budget-card' },
      el('div', { class: 'budget-card-head' },
        el('div', { class: 'budget-card-title' }, el('span', { class: 'category-icon' }, icon(row.category === 'all' ? 'chart' : transactionIcon({ category: row.category, type: 'expense' }), 16)), categoryLabel(row.category)),
        el('div', { class: 'table-actions' }, actionButton('', 'edit-budget', row.id, 'plain', 'edit'), actionButton('', 'delete-budget', row.id, 'plain', 'trash'))
      ),
      el('div', { class: 'budget-card-value' }, money(row.spent), el('span', { class: 'text-muted small' }, ` / ${money(row.amount)}`)),
      progressBar(row.percent, color),
      el('div', { class: 'budget-card-meta' }, el('span', {}, `${Math.round(row.percent)}% ${tr('budgetUsed').toLowerCase()}`), el('span', {}, `${tr('remaining')}: ${money(row.remaining)}`)),
      row.percent >= 80 ? badge(row.percent >= 100 ? tr('overBudget') : tr('budgetWarning'), row.percent >= 100 ? 'danger' : 'warning') : null
    );
  })) : el('div', { class: 'panel' }, emptyState(tr('noBudgets'), tr('addFirst'), 'chart'));
  const overview = el('div', { class: 'panel' },
    el('div', { class: 'panel-header' }, el('div', {}, el('h2', { class: 'panel-title' }, `${tr('currentMonth')} · ${month}`), el('p', { class: 'panel-subtitle' }, tr('monthlyBudget'))), badge(`${rows.length} ${lang() === 'km' ? 'ថវិកា' : 'budgets'}`)),
    el('div', { class: 'grid equal-columns' },
      el('div', {}, el('div', { class: 'summary-label' }, tr('totalBudget')), el('strong', { class: 'budget-card-value' }, money(totalBudget))),
      el('div', {}, el('div', { class: 'summary-label' }, tr('budgetUsed')), el('strong', { class: 'budget-card-value' }, money(totalSpent)))
    ),
    el('div', { style: { marginTop: '15px' } }, progressBar(totalBudget > 0 ? totalSpent / totalBudget * 100 : 0, totalBudget > 0 && totalSpent > totalBudget ? 'red' : 'blue'))
  );
  return el('div', {}, pageHeader(tr('budgets'), lang() === 'km' ? 'កំណត់ដែនកំណត់ចំណាយ ដើម្បីរក្សាលុយឱ្យស្ថិតក្នុងផែនការ។' : 'Set spending limits to keep your money on track.', [actionButton(tr('setBudget'), 'add-budget', '', 'primary', 'plus')]), el('div', { class: 'page-body' }, overview, cards));
}

function renderSavings() {
  const total = totalSavings(state);
  const goals = state.savingsGoals;
  const goalCards = goals.length ? el('div', { class: 'grid budget-card-grid' }, ...goals.map(goal => {
    const balance = goalBalance(state, goal.id);
    const pct = goal.targetAmount > 0 ? balance / goal.targetAmount * 100 : 0;
    const complete = balance >= goal.targetAmount;
    return el('article', { class: 'panel savings-card' },
      el('div', { class: 'savings-card-top' },
        el('span', { class: 'goal-coin' }, icon('piggy', 19)),
        el('div', { class: 'table-actions' }, actionButton('', 'edit-goal', goal.id, 'plain', 'edit'), actionButton('', 'delete-goal', goal.id, 'plain', 'trash'))
      ),
      el('div', {}, el('h3', { class: 'panel-title' }, goal.name), el('div', { class: 'savings-target' }, goal.deadline ? `${tr('deadline')}: ${formatDate(goal.deadline, lang())}` : tr('active'))),
      el('div', {}, el('div', { class: 'savings-current' }, money(balance)), el('div', { class: 'savings-target' }, `${lang() === 'km' ? 'គោលដៅ' : 'Target'} · ${money(goal.targetAmount)}`)),
      progressBar(pct, complete ? 'green' : 'purple'),
      el('div', { class: 'goal-bottom' }, el('span', {}, `${Math.round(pct)}% ${tr('progress').toLowerCase()}`), complete ? badge(tr('completed'), 'success') : badge(tr('active'))),
      el('div', { class: 'savings-actions' }, actionButton(tr('addMoney'), 'deposit-goal', goal.id, 'soft', 'plus'), actionButton(tr('withdraw'), 'withdraw-goal', goal.id, 'secondary', 'arrowDown'))
    );
  })) : el('div', { class: 'panel' }, emptyState(tr('noGoals'), tr('addFirst'), 'piggy'));
  const movements = [...state.savingsMovements].sort((a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt).slice(0, 8);
  const history = movements.length ? el('div', { class: 'transaction-list' }, ...movements.map(item => {
    const goal = goals.find(g => g.id === item.goalId);
    return el('div', { class: 'transaction-row' },
      el('span', { class: `category-icon ${item.type === 'deposit' ? 'income' : ''}` }, icon(item.type === 'deposit' ? 'arrowDown' : 'arrowUp', 16)),
      el('div', { class: 'transaction-info' }, el('strong', { class: 'transaction-name' }, goal?.name || 'Saving goal'), el('div', { class: 'transaction-meta' }, `${item.type === 'deposit' ? tr('addMoney') : tr('withdraw')} · ${formatDate(item.date, lang())}${item.note ? ` · ${item.note}` : ''}`)),
      el('strong', { class: `transaction-amount ${item.type === 'deposit' ? 'amount-income' : ''}` }, `${item.type === 'deposit' ? '+' : '−'}${money(item.amount)}`)
    );
  })) : emptyState(tr('noData'), tr('addFirst'), 'piggy');
  return el('div', {}, pageHeader(tr('savings'), lang() === 'km' ? 'បង្កើតគោលដៅ និងតាមដានការសន្សំរបស់អ្នក។' : 'Create goals and keep track of your savings.', [actionButton(tr('createGoal'), 'add-goal', '', 'primary', 'plus')]),
    el('div', { class: 'page-body' },
      el('div', { class: 'grid summary-grid' }, summaryCard(tr('saved'), money(total), 'piggy', 'green'), summaryCard(tr('available'), money(totals(state).cashAvailable), 'wallet', ''), summaryCard(tr('savingsGoals'), String(goals.length), 'chart', 'purple')),
      goalCards,
      sectionPanel(tr('savingsHistory'), '', history)
    )
  );
}

function renderTrips() {
  const trips = [...state.trips].sort((a, b) => a.startDate.localeCompare(b.startDate));
  const cards = trips.length ? el('div', { class: 'grid budget-card-grid' }, ...trips.map(trip => {
    const spent = tripSpent(state, trip.id); const remaining = trip.budget - spent; const pct = trip.budget > 0 ? spent / trip.budget * 100 : 0;
    const categoryRows = Object.entries(trip.categories || {}).filter(([, amount]) => amount > 0);
    const categorySpend = new Map();
    for (const tx of state.transactions) if (tx.type === 'expense' && tx.tripId === trip.id) categorySpend.set(tx.category, (categorySpend.get(tx.category) || 0) + tx.amount);
    return el('article', { class: 'panel trip-card' },
      el('div', { class: 'trip-card-head' },
        el('div', {}, el('h3', { class: 'panel-title trip-title' }, icon('plane', 15), trip.name), el('div', { class: 'trip-destination' }, trip.destination || '—'), el('div', { class: 'trip-date' }, icon('calendar', 13), `${formatDate(trip.startDate, lang())} – ${formatDate(trip.endDate, lang())}`)),
        el('div', { class: 'table-actions' }, actionButton('', 'edit-trip', trip.id, 'plain', 'edit'), actionButton('', 'delete-trip', trip.id, 'plain', 'trash'))
      ),
      el('div', { class: 'trip-stats' },
        tripStat(tr('tripBudget'), money(trip.budget)), tripStat(tr('spent'), money(spent)), tripStat(tr('remaining'), money(remaining))
      ),
      progressBar(pct, pct >= 100 ? 'red' : 'purple'),
      categoryRows.length ? el('div', { class: 'goal-list' }, ...categoryRows.map(([key, amount]) => el('div', { class: 'budget-card-meta' }, el('span', { class: 'category-label-with-icon' }, icon(transactionIcon({ category: key, type: 'expense' }), 14), categoryLabel(key)), el('strong', {}, `${money(categorySpend.get(key) || 0)} / ${money(amount)}`)))) : null,
      el('div', { class: 'trip-actions' }, actionButton(tr('recordTripExpense'), 'trip-expense', trip.id, 'primary', 'plus'))
    );
  })) : el('div', { class: 'panel' }, emptyState(tr('noTrips'), tr('addFirst'), 'plane'));
  return el('div', {}, pageHeader(tr('trips'), lang() === 'km' ? 'រៀបចំថវិកាដំណើរ និងកត់ត្រាចំណាយតាមដំណើរ។' : 'Plan travel budgets and track expenses for each trip.', [actionButton(tr('createTrip'), 'add-trip', '', 'primary', 'plus')]), el('div', { class: 'page-body' }, cards));
}

function tripStat(label, value) { return el('div', { class: 'trip-stat' }, el('small', {}, label), el('strong', {}, value)); }

function billRow(bill, compact = false) {
  const due = new Date(`${bill.dueDate}T00:00:00`);
  const overdue = !bill.paid && bill.dueDate < todayISO();
  const monthLabel = new Intl.DateTimeFormat(lang() === 'km' ? 'km-KH' : 'en', { month: 'short' }).format(due);
  return el('div', { class: compact ? 'bill-row' : 'bill-card' },
    el('div', { class: 'bill-date-box' }, el('strong', {}, String(due.getDate()).padStart(2, '0')), el('small', {}, monthLabel)),
    el('div', { class: 'bill-info' }, el('strong', { class: 'bill-title' }, icon(transactionIcon({ category: bill.category, type: 'expense' }), 15), bill.name), el('small', {}, `${categoryLabel(bill.category)} · ${formatDate(bill.dueDate, lang())}`)),
    el('strong', { class: 'bill-amount' }, money(bill.amount)),
    compact ? (overdue ? badge(tr('overdue'), 'danger') : badge(tr('unpaid'), 'warning')) : el('div', { class: 'bill-card-actions' },
      bill.paid ? badge(tr('paid'), 'success') : actionButton(tr('markPaid'), 'pay-bill', bill.id, 'soft', 'check'),
      actionButton('', 'edit-bill', bill.id, 'plain', 'edit'),
      actionButton('', 'delete-bill', bill.id, 'plain', 'trash')
    )
  );
}

function renderBills() {
  const bills = [...state.bills].sort((a, b) => Number(a.paid) - Number(b.paid) || a.dueDate.localeCompare(b.dueDate));
  const unpaid = bills.filter(item => !item.paid);
  const paid = bills.filter(item => item.paid);
  return el('div', {}, pageHeader(tr('bills'), lang() === 'km' ? 'តាមដានថ្ងៃត្រូវបង់ និងកត់ត្រាការបង់ប្រាក់។' : 'Track due dates and record bill payments.', [actionButton(tr('addBill'), 'add-bill', '', 'primary', 'plus')]),
    el('div', { class: 'page-body' },
      el('div', { class: 'grid summary-grid' }, summaryCard(tr('unpaid'), money(sum(unpaid.map(item => item.amount))), 'receipt', 'red', `${unpaid.length} ${tr('payments').toLowerCase()}`), summaryCard(tr('paid'), money(sum(paid.map(item => item.amount))), 'check', 'green', `${paid.length} ${tr('payments').toLowerCase()}`)),
      sectionPanel(`${tr('upcoming')} (${unpaid.length})`, '', unpaid.length ? el('div', { class: 'goal-list' }, ...unpaid.map(bill => billRow(bill))) : emptyState(tr('noBillsList'), tr('addFirst'), 'receipt')),
      sectionPanel(`${tr('paid')} (${paid.length})`, '', paid.length ? el('div', { class: 'goal-list' }, ...paid.map(bill => billRow(bill))) : emptyState(tr('noData'), '', 'check'))
    )
  );
}

function renderReports() {
  const summary = reportTotals(state, reportPeriod);
  const categories = categoryTotals(summary.rows);
  const canvas = el('canvas', { 'aria-label': tr('spendingByCategory') });
  const legend = categories.length ? el('div', { class: 'category-legend' }, ...categories.slice(0, 7).map((row, index) => el('div', { class: 'category-legend-row' }, el('i', { class: 'legend-dot', style: { background: CHART_COLORS[index % CHART_COLORS.length] } }), el('span', {}, categoryLabel(row.category)), el('strong', {}, money(row.amount))))) : el('div', { class: 'empty-state' }, tr('noReportData'));
  const donutPanel = el('section', { class: 'panel' }, el('div', { class: 'panel-header' }, el('div', {}, el('h2', { class: 'panel-title' }, tr('spendingByCategory')), el('p', { class: 'panel-subtitle' }, `${formatDate(summary.start, lang())} – ${formatDate(summary.end, lang())}`))), el('div', { class: 'donut-layout' }, el('div', { class: 'donut-wrap' }, canvas), legend));
  const trendCanvas = el('canvas', { 'aria-label': tr('incomeVsExpenses') });
  const trendPanel = sectionPanel(tr('incomeVsExpenses'), lang() === 'km' ? 'ប្រវត្តិ ៦ ខែចុងក្រោយ' : 'Last six months', el('div', { class: 'chart-wrap' }, trendCanvas), null);
  const toggles = el('div', { class: 'report-toggle' }, ...['daily', 'weekly', 'monthly'].map(period => {
    const active = reportPeriod === period;
    const btn = el('button', { class: active ? 'active' : '', type: 'button', 'aria-pressed': String(active) }, tr(period));
    btn.addEventListener('click', () => { reportPeriod = period; render(); });
    return btn;
  }));
  const currentBudgets = budgetSummary(state);
  const budgetHistory = currentBudgets.length ? el('div', { class: 'goal-list' }, ...currentBudgets.map(row => el('div', { class: 'goal-item' },
    el('div', { class: 'goal-info' }, el('strong', { class: 'goal-name' }, categoryLabel(row.category)), el('span', { class: 'goal-numbers' }, `${money(row.spent)} / ${money(row.amount)}`)),
    progressBar(row.percent, row.percent >= 100 ? 'red' : row.percent >= 80 ? 'amber' : 'blue'),
    el('div', { class: 'goal-bottom' }, el('span', {}, `${Math.round(row.percent)}%`), el('span', {}, `${tr('remaining')}: ${money(row.remaining)}`))
  ))) : emptyState(tr('noBudgets'), tr('addFirst'), 'chart');
  const savingHistoryItems = [...state.savingsMovements].sort((a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt).slice(0, 6);
  const savingHistory = savingHistoryItems.length ? el('div', { class: 'transaction-list' }, ...savingHistoryItems.map(item => {
    const goal = state.savingsGoals.find(g => g.id === item.goalId);
    return el('div', { class: 'transaction-row' },
      el('span', { class: `category-icon ${item.type === 'deposit' ? 'income' : ''}` }, icon(item.type === 'deposit' ? 'arrowDown' : 'arrowUp', 16)),
      el('div', { class: 'transaction-info' }, el('strong', { class: 'transaction-name' }, goal?.name || tr('savings')), el('div', { class: 'transaction-meta' }, formatDate(item.date, lang()))),
      el('strong', { class: `transaction-amount ${item.type === 'deposit' ? 'amount-income' : ''}` }, `${item.type === 'deposit' ? '+' : '−'}${money(item.amount)}`)
    );
  })) : emptyState(tr('noData'), tr('addFirst'), 'piggy');
  const body = el('div', { class: 'page-body' },
    el('div', { class: 'toolbar' }, toggles),
    el('div', { class: 'grid summary-grid' }, summaryCard(tr('income'), money(summary.income), 'arrowDown', 'green'), summaryCard(tr('expenses'), money(summary.expenses), 'arrowUp', 'red'), summaryCard(tr('total'), money(summary.income - summary.expenses), 'chart', 'purple', lang() === 'km' ? 'សមតុល្យសុទ្ធ' : 'Net difference')),
    el('div', { class: 'grid two-column' }, donutPanel, trendPanel),
    el('div', { class: 'grid equal-columns' }, sectionPanel(tr('budgetPerformance'), currentMonth(), budgetHistory), sectionPanel(tr('savingsHistory'), '', savingHistory))
  );
  requestAnimationFrame(() => { drawDonutChart(canvas, categories); drawTrendChart(trendCanvas, monthlyTrend(state, 6, lang())); });
  return el('div', {}, pageHeader(tr('reports'), lang() === 'km' ? 'ស្វែងយល់ថាលុយរបស់អ្នកចូល និងចេញទៅណា។' : 'Understand where your money comes from and where it goes.'), body);
}

function renderSettings() {
  const name = makeInput('text', state.settings.userName, { name: 'userName', maxlength: '80', placeholder: tr('yourName') });
  const opening = makeInput('number', String(state.settings.openingBalance), { name: 'openingBalance', min: '0', step: '0.01', inputmode: 'decimal' });
  const currency = makeSelect([{ value: 'USD', label: 'USD — US Dollar' }, { value: 'KHR', label: 'KHR — Cambodian Riel' }], state.settings.currency, { name: 'currency' });
  const language = makeSelect([{ value: 'km', label: 'ភាសាខ្មែរ' }, { value: 'en', label: 'English' }], lang(), { name: 'language' });
  const theme = makeSelect([{ value: 'light', label: tr('light') }, { value: 'dark', label: tr('dark') }], state.settings.theme, { name: 'theme' });
  const profilePanel = el('section', { class: 'panel settings-section' },
    el('div', {}, el('h2', { class: 'settings-heading' }, tr('profile')), el('p', { class: 'settings-description' }, lang() === 'km' ? 'ប្ដូរព័ត៌មានផ្ទាល់ខ្លួន និងរបៀបបង្ហាញកម្មវិធី។' : 'Customize your personal details and app preferences.')),
    el('div', { class: 'settings-form-grid' }, field(tr('yourName'), name), field(tr('openingBalance'), opening), field(tr('currency'), currency), field(tr('language'), language), field(tr('theme'), theme)),
    el('div', { class: 'settings-actions' }, actionButton(tr('save'), 'save-settings', '', 'primary', 'check'))
  );
  const dataPanel = el('section', { class: 'panel settings-section' },
    el('div', {}, el('h2', { class: 'settings-heading' }, tr('dataTools')), el('p', { class: 'settings-description' }, tr('backupHint'))),
    el('div', { class: 'settings-actions' }, actionButton(tr('exportData'), 'export-data', '', 'secondary', 'download'), actionButton(tr('importData'), 'import-data', '', 'secondary', 'upload')),
    el('div', { class: 'warning-note' }, icon('info', 16), tr('displayCurrencyNote')),
    el('div', { class: 'warning-note' }, icon('info', 16), tr('resetHint')),
    el('div', { class: 'settings-actions' }, actionButton(tr('resetData'), 'reset-data', '', 'danger', 'trash'))
  );
  return el('div', {}, pageHeader(tr('settings'), lang() === 'km' ? 'គ្រប់គ្រងចំណង់ចំណូលចិត្ត និងទិន្នន័យរបស់អ្នក។' : 'Manage your preferences and local app data.'), el('div', { class: 'grid settings-layout' }, profilePanel, dataPanel));
}

function render() {
  updateChrome();
  const content = $('#content');
  content.replaceChildren();
  let page;
  switch (currentView) {
    case 'transactions': page = renderTransactions(); break;
    case 'budgets': page = renderBudgets(); break;
    case 'savings': page = renderSavings(); break;
    case 'trips': page = renderTrips(); break;
    case 'bills': page = renderBills(); break;
    case 'reports': page = renderReports(); break;
    case 'settings': page = renderSettings(); break;
    default: page = renderDashboard();
  }
  content.append(page);
  $$('.nav-link, .mobile-nav-link').forEach(node => {
    const active = node.dataset.view === currentView || (node.id === 'mobile-more' && ['trips', 'bills', 'reports', 'settings'].includes(currentView));
    node.classList.toggle('active', active);
    if (active) node.setAttribute('aria-current', 'page');
    else node.removeAttribute('aria-current');
  });
  decorateIcons(content);
}

function navigate(view) {
  if (!['dashboard', 'transactions', 'budgets', 'savings', 'trips', 'bills', 'reports', 'settings'].includes(view)) return;
  currentView = view;
  render();
  $('#sidebar').classList.remove('sidebar-open');
  $('.drawer-overlay')?.remove();
  $('#mobile-menu')?.setAttribute('aria-expanded', 'false');
  $('#mobile-menu')?.setAttribute('aria-label', tr('openNavigation'));
  $('#content').focus({ preventScroll: true });
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function openModal(title, formFields, onSubmit) {
  const returnFocus = document.activeElement;
  closeModal();
  modalReturnFocus = returnFocus;
  const root = $('#modal-root');
  const titleId = `modal-title-${uid('dialog')}`;
  const form = el('form', { class: 'modal', novalidate: true, role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': titleId, tabindex: '-1' });
  const heading = el('h2', { id: titleId }, title);
  const header = el('div', { class: 'modal-header' }, heading, button('', { variant: 'plain', iconName: 'close', className: 'close-modal', 'aria-label': tr('close') }));
  const body = el('div', { class: 'modal-body' }, ...formFields);
  const footer = el('div', { class: 'modal-footer' }, button(tr('cancel'), { variant: 'secondary', className: 'cancel-modal', iconName: 'close' }), button(tr('save'), { variant: 'primary', type: 'submit', iconName: 'check' }));
  form.append(header, body, footer);
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const data = Object.fromEntries(new FormData(form).entries());
    const result = onSubmit(data);
    if (result !== false) closeModal();
  });
  form.addEventListener('keydown', event => {
    if (event.key !== 'Tab') return;
    const focusable = [...form.querySelectorAll('button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')]
      .filter(node => !node.hidden && node.getAttribute('aria-hidden') !== 'true');
    if (!focusable.length) { event.preventDefault(); form.focus(); return; }
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (!form.contains(document.activeElement)) { event.preventDefault(); (event.shiftKey ? last : first).focus(); }
    else if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  });
  const backdrop = el('div', { class: 'modal-backdrop' }, form);
  backdrop.addEventListener('click', modalBackdropClick);
  root.append(backdrop);
  document.body.classList.add('modal-open');
  activeModal = form;
  form.querySelector('.close-modal').addEventListener('click', closeModal);
  form.querySelector('.cancel-modal').addEventListener('click', closeModal);
  const first = form.querySelector('input,select,textarea,button');
  if (first) first.focus({ preventScroll: true });
}

function modalBackdropClick(event) {
  if (event.target.classList.contains('modal-backdrop')) closeModal();
}

function closeModal() {
  const wasOpen = Boolean(activeModal);
  $('#modal-root').replaceChildren();
  activeModal = null;
  document.body.classList.remove('modal-open');
  if (wasOpen && modalReturnFocus?.isConnected) modalReturnFocus.focus({ preventScroll: true });
  modalReturnFocus = null;
}

function inputField(label, name, value = '', type = 'text', attrs = {}) {
  const input = makeInput(type, value, { name, ...attrs });
  return field(label, input);
}

function selectField(label, name, options, value) {
  return field(label, makeSelect(options.map(option => typeof option === 'string' ? ({ value: option, label: categoryLabel(option) }) : option), value, { name, required: true }));
}

function categoryOptions(keys) {
  return keys.map(key => ({ value: key, label: categoryLabel(key) }));
}

function openTransactionModal(type, id = null, tripId = null) {
  const existing = id ? state.transactions.find(item => item.id === id) : null;
  const initialType = existing?.type || type;
  const linkedExpense = Boolean(tripId || existing?.tripId || existing?.billId);
  const categories = (tripId || existing?.tripId) ? APP_CATEGORIES.trip : (APP_CATEGORIES[initialType] || APP_CATEGORIES.expense);
  const typeOptions = linkedExpense
    ? [{ value: 'expense', label: tr('expenseType') }]
    : [{ value: 'income', label: tr('incomeType') }, { value: 'expense', label: tr('expenseType') }];
  const fields = [
    el('div', { class: 'modal-grid' },
      selectField(tr('type'), 'type', typeOptions, initialType),
      inputField(tr('amount'), 'amount', existing?.amount ?? '', 'number', { min: '0.01', step: '0.01', required: true, inputmode: 'decimal' })
    ),
    selectField(tr('category'), 'category', categoryOptions(categories), existing?.category || categories[0]),
    el('div', { class: 'modal-grid' },
      inputField(tr('date'), 'date', existing?.date || todayISO(), 'date', { required: true }),
      selectField(tr('paymentMethod'), 'paymentMethod', ['cash', 'bank', 'card', 'mobile'].map(key => ({ value: key, label: tr(key) })), existing?.paymentMethod || 'cash')
    ),
    inputField(tr('description'), 'description', existing?.description || '', 'text', { maxlength: '180', placeholder: tr('noDescription') })
  ];
  if (tripId || existing?.tripId) {
    const trip = state.trips.find(item => item.id === (tripId || existing.tripId));
    if (trip) fields.push(field(tr('trip'), el('input', { class: 'input', value: trip.name, disabled: true })), el('input', { type: 'hidden', name: 'tripId', value: trip.id }));
  }
  openModal(existing ? tr('editTransaction') : (initialType === 'income' ? tr('addIncome') : tr('addExpense')), fields, data => {
    const amount = Number(data.amount);
    if (!Number.isFinite(amount) || amount <= 0) { toast(tr('invalidAmount'), 'error'); return false; }
    const txType = data.type;
    if (existing?.billId && txType !== 'expense') {
      toast(lang() === 'km' ? 'ចំណាយដែលភ្ជាប់នឹងវិក្កយបត្រត្រូវតែជាចំណាយ។' : 'A bill payment must remain an expense.', 'error');
      return false;
    }
    if ((tripId || existing?.tripId) && txType !== 'expense') {
      toast(lang() === 'km' ? 'ចំណាយដំណើរត្រូវតែជាប្រភេទចំណាយ។' : 'A trip record must remain an expense.', 'error');
      return false;
    }
    const projectedCash = projectedCashAfterTransactionChange(state, existing, txType, amount);
    if (projectedCash < 0 && !window.confirm(tr('insufficient'))) return false;
    const record = {
      type: txType, amount, category: data.category, date: data.date,
      description: data.description, paymentMethod: data.paymentMethod,
      tripId: tripId || existing?.tripId || null, billId: existing?.billId || null
    };
    if (existing) {
      Object.assign(existing, record);
      if (existing.billId) {
        const bill = state.bills.find(item => item.id === existing.billId);
        if (bill) { bill.amount = amount; bill.dueDate = data.date; bill.category = data.category; }
      }
    } else state.transactions.push(createTransaction(record));
    persist(); render(); toast(tr('savedMessage')); return true;
  });
  const typeSelect = activeModal?.querySelector('select[name="type"]');
  const categorySelect = activeModal?.querySelector('select[name="category"]');
  if (typeSelect && categorySelect) {
    typeSelect.addEventListener('change', () => {
      const nextKeys = linkedExpense ? ((tripId || existing?.tripId) ? APP_CATEGORIES.trip : APP_CATEGORIES.expense) : (APP_CATEGORIES[typeSelect.value] || APP_CATEGORIES.expense);
      categorySelect.replaceChildren(...categoryOptions(nextKeys).map(option => el('option', { value: option.value }, option.label)));
      categorySelect.value = nextKeys[0];
    });
  }
}

function openBudgetModal(id = null) {
  const existing = id ? state.budgets.find(item => item.id === id) : null;
  const month = existing?.month || currentMonth();
  const fields = [
    el('div', { class: 'modal-grid' }, inputField(tr('month'), 'month', month, 'month', { required: true }), inputField(tr('budgetAmount'), 'amount', existing?.amount ?? '', 'number', { min: '0.01', step: '0.01', required: true })),
    selectField(tr('category'), 'category', [{ value: 'all', label: tr('allCategories') }, ...categoryOptions(APP_CATEGORIES.expense)], existing?.category || 'all')
  ];
  openModal(existing ? tr('editBudget') : tr('setBudget'), fields, data => {
    const amount = Number(data.amount);
    if (!Number.isFinite(amount) || amount <= 0 || !/^\d{4}-\d{2}$/.test(data.month)) { toast(tr('invalidAmount'), 'error'); return false; }
    const duplicate = state.budgets.find(item => item.month === data.month && item.category === data.category && item.id !== existing?.id);
    if (duplicate) {
      duplicate.amount = amount;
      if (existing) state.budgets = state.budgets.filter(item => item.id !== existing.id);
    } else upsertBudget(state, { month: data.month, category: data.category, amount }, existing?.id);
    persist(); render(); return true;
  });
}

function openGoalModal(id = null) {
  const existing = id ? state.savingsGoals.find(item => item.id === id) : null;
  const fields = [
    inputField(tr('goalName'), 'name', existing?.name || '', 'text', { required: true, maxlength: '100' }),
    el('div', { class: 'modal-grid' }, inputField(tr('targetAmount'), 'targetAmount', existing?.targetAmount ?? '', 'number', { min: '0.01', step: '0.01', required: true }), inputField(tr('deadline'), 'deadline', existing?.deadline || '', 'date'))
  ];
  openModal(existing ? tr('editGoal') : tr('createGoal'), fields, data => {
    const target = Number(data.targetAmount);
    if (!Number.isFinite(target) || target <= 0 || !data.name.trim()) { toast(tr('required'), 'error'); return false; }
    addGoal(state, { name: data.name, targetAmount: target, deadline: data.deadline }, existing?.id);
    persist(); render(); return true;
  });
}

function openSavingMovement(goalId, type) {
  const goal = state.savingsGoals.find(item => item.id === goalId);
  if (!goal) return;
  const fields = [
    inputField(tr('amount'), 'amount', '', 'number', { min: '0.01', step: '0.01', required: true }),
    el('div', { class: 'modal-grid' }, inputField(tr('date'), 'date', todayISO(), 'date', { required: true }), inputField(tr('note'), 'note', '', 'text', { maxlength: '180' }))
  ];
  openModal(`${type === 'deposit' ? tr('addMoney') : tr('withdraw')} · ${goal.name}`, fields, data => {
    const amount = Number(data.amount);
    if (!Number.isFinite(amount) || amount <= 0) { toast(tr('invalidAmount'), 'error'); return false; }
    if (type === 'deposit' && amount > totals(state).cashAvailable) { toast(tr('insufficientDeposit'), 'error'); return false; }
    if (type === 'withdrawal' && amount > goalBalance(state, goalId)) { toast(tr('insufficientWithdraw'), 'error'); return false; }
    addMovement(state, { goalId, type, amount, date: data.date, note: data.note });
    persist(); render(); return true;
  });
}

function openTripModal(id = null) {
  const existing = id ? state.trips.find(item => item.id === id) : null;
  const c = existing?.categories || {};
  const categoryFields = ['transport', 'hotel', 'food', 'activities', 'shopping', 'other'].map(key => inputField(categoryLabel(key), `cat_${key}`, c[key] || '', 'number', { min: '0', step: '0.01' }));
  const fields = [
    el('div', { class: 'modal-grid' }, inputField(tr('tripName'), 'name', existing?.name || '', 'text', { required: true, maxlength: '100' }), inputField(tr('destination'), 'destination', existing?.destination || '', 'text', { maxlength: '120' })),
    el('div', { class: 'modal-grid' }, inputField(tr('startDate'), 'startDate', existing?.startDate || todayISO(), 'date', { required: true }), inputField(tr('endDate'), 'endDate', existing?.endDate || todayISO(), 'date', { required: true })),
    inputField(tr('tripBudget'), 'budget', existing?.budget ?? '', 'number', { min: '0.01', step: '0.01', required: true }),
    el('div', {}, el('div', { class: 'field-label', style: { marginBottom: '9px' } }, tr('tripCategories')), el('div', { class: 'modal-grid' }, ...categoryFields))
  ];
  openModal(existing ? tr('editTrip') : tr('createTrip'), fields, data => {
    const budget = Number(data.budget);
    if (!Number.isFinite(budget) || budget <= 0 || !data.name.trim() || data.endDate < data.startDate) { toast(tr('required'), 'error'); return false; }
    const categories = {};
    for (const key of ['transport', 'hotel', 'food', 'activities', 'shopping', 'other']) {
      const value = data[`cat_${key}`] === '' ? 0 : Number(data[`cat_${key}`]);
      if (!Number.isFinite(value) || value < 0) { toast(tr('invalidAmount'), 'error'); return false; }
      categories[key] = value;
    }
    if (sum(Object.values(categories)) > budget) { toast(lang() === 'km' ? 'ថវិកាតាមប្រភេទមិនអាចលើសថវិកាសរុបបានទេ។' : 'Category budgets cannot exceed the total trip budget.', 'error'); return false; }
    addTrip(state, { name: data.name, destination: data.destination, startDate: data.startDate, endDate: data.endDate, budget, categories }, existing?.id);
    persist(); render(); return true;
  });
}

function openBillModal(id = null) {
  const existing = id ? state.bills.find(item => item.id === id) : null;
  if (existing?.paid) { toast(lang() === 'km' ? 'វិក្កយបត្រដែលបានបង់រួចមិនអាចកែប្រែបានទេ។' : 'Paid bills cannot be edited.', 'error'); return; }
  const fields = [
    inputField(tr('billName'), 'name', existing?.name || '', 'text', { required: true, maxlength: '100' }),
    el('div', { class: 'modal-grid' }, inputField(tr('amount'), 'amount', existing?.amount ?? '', 'number', { min: '0.01', step: '0.01', required: true }), inputField(tr('dueDate'), 'dueDate', existing?.dueDate || todayISO(), 'date', { required: true })),
    selectField(tr('category'), 'category', categoryOptions(['bills', 'food', 'transport', 'education', 'health', 'other']), existing?.category || 'bills')
  ];
  openModal(existing ? tr('editBill') : tr('addBill'), fields, data => {
    const amount = Number(data.amount);
    if (!Number.isFinite(amount) || amount <= 0 || !data.name.trim()) { toast(tr('required'), 'error'); return false; }
    addBill(state, { name: data.name, amount, dueDate: data.dueDate, category: data.category }, existing?.id);
    persist(); render(); return true;
  });
}

function saveSettings() {
  const form = $('#content');
  const name = $('input[name="userName"]', form)?.value || '';
  const opening = Number($('input[name="openingBalance"]', form)?.value);
  const currency = $('select[name="currency"]', form)?.value || 'USD';
  const language = $('select[name="language"]', form)?.value || 'km';
  const theme = $('select[name="theme"]', form)?.value || 'light';
  if (!Number.isFinite(opening) || opening < 0) { toast(tr('invalidAmount'), 'error'); return; }
  state.settings = { ...state.settings, userName: name.trim(), openingBalance: opening, currency, language, theme };
  persist(); render(); toast(tr('savedMessage'));
}

function handleDelete(action, id) {
  if (!window.confirm(tr('confirmDelete'))) return;
  if (action === 'delete-tx') deleteTransaction(state, id);
  if (action === 'delete-budget') state.budgets = state.budgets.filter(item => item.id !== id);
  if (action === 'delete-goal') {
    if (goalBalance(state, id) > 0) { toast(tr('goalHasFunds'), 'error'); return; }
    state.savingsMovements = state.savingsMovements.filter(item => item.goalId !== id);
    state.savingsGoals = state.savingsGoals.filter(item => item.id !== id);
  }
  if (action === 'delete-trip') deleteTrip(state, id);
  if (action === 'delete-bill') deleteBill(state, id);
  persist(); render();
}

function handleAction(action, id = '') {
  switch (action) {
    case 'add-income': openTransactionModal('income'); break;
    case 'add-expense': openTransactionModal('expense'); break;
    case 'add-transaction': openTransactionModal('expense'); break;
    case 'edit-tx': openTransactionModal('expense', id); break;
    case 'delete-tx': case 'delete-budget': case 'delete-goal': case 'delete-trip': case 'delete-bill': handleDelete(action, id); break;
    case 'add-budget': openBudgetModal(); break;
    case 'edit-budget': openBudgetModal(id); break;
    case 'add-goal': openGoalModal(); break;
    case 'edit-goal': openGoalModal(id); break;
    case 'deposit-goal': openSavingMovement(id, 'deposit'); break;
    case 'withdraw-goal': openSavingMovement(id, 'withdrawal'); break;
    case 'add-trip': openTripModal(); break;
    case 'edit-trip': openTripModal(id); break;
    case 'trip-expense': openTransactionModal('expense', null, id); break;
    case 'add-bill': openBillModal(); break;
    case 'edit-bill': openBillModal(id); break;
    case 'pay-bill': {
      const bill = state.bills.find(item => item.id === id);
      if (!bill || bill.paid) break;
      if (bill.amount > totals(state).cashAvailable && !window.confirm(tr('insufficient'))) break;
      payBill(state, id); persist(); render(); break;
    }
    case 'clear-filters':
      transactionFilters = { search: '', type: 'all', month: 'all', category: 'all', sort: 'newest' };
      render();
      break;
    case 'export-csv': exportTransactionsCsv(); break;
    case 'save-settings': saveSettings(); break;
    case 'export-data': downloadBackup(state); toast(lang() === 'km' ? 'បាននាំចេញឯកសារបម្រុងទុក។' : 'Backup exported.'); break;
    case 'import-data': $('#backup-file-input')?.click(); break;
    case 'reset-data':
      if (window.confirm(tr('confirmReset'))) {
        const previousState = state;
        state = createDefaultState();
        if (persist()) {
          transactionFilters = { search: '', type: 'all', month: 'all', category: 'all', sort: 'newest' };
          navigate('dashboard');
          toast(lang() === 'km' ? 'បានកំណត់ទិន្នន័យឡើងវិញ។' : 'App data has been reset.');
        } else state = previousState;
      }
      break;
    case 'go-budgets': navigate('budgets'); break;
    case 'go-transactions': navigate('transactions'); break;
    case 'go-savings': navigate('savings'); break;
    case 'go-bills': navigate('bills'); break;
    default: break;
  }
}


function setupEvents() {
  let chartResizeFrame = null;
  window.addEventListener('resize', () => {
    if (chartResizeFrame !== null) cancelAnimationFrame(chartResizeFrame);
    chartResizeFrame = requestAnimationFrame(() => {
      chartResizeFrame = null;
      if (currentView === 'dashboard') {
        const canvas = $('#content .chart-wrap canvas');
        if (canvas) drawTrendChart(canvas, monthlyTrend(state, 6, lang()));
      } else if (currentView === 'reports') {
        const donut = $('#content .donut-wrap canvas');
        const trend = $('#content .chart-wrap canvas');
        const summary = reportTotals(state, reportPeriod);
        if (donut) drawDonutChart(donut, categoryTotals(summary.rows));
        if (trend) drawTrendChart(trend, monthlyTrend(state, 6, lang()));
      }
    });
  }, { passive: true });

  document.addEventListener('keydown', event => {
    const modifier = event.ctrlKey || event.metaKey;
    if (event.key === 'Escape' && activeModal) { closeModal(); return; }
    if (event.key === 'Escape' && $('#sidebar')?.classList.contains('sidebar-open')) {
      $('#sidebar').classList.remove('sidebar-open');
      $('.drawer-overlay')?.remove();
      $('#mobile-menu')?.setAttribute('aria-expanded', 'false');
      $('#mobile-menu')?.setAttribute('aria-label', tr('openNavigation'));
      $('#mobile-menu')?.focus({ preventScroll: true });
      return;
    }
    if (modifier && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      if (currentView !== 'transactions') navigate('transactions');
      requestAnimationFrame(() => $('#content .search-box input')?.focus());
    }
  });
  document.addEventListener('click', event => {
    const viewButton = event.target.closest('[data-view]');
    if (viewButton) { navigate(viewButton.dataset.view); return; }
    const actionButtonNode = event.target.closest('[data-action]');
    if (actionButtonNode) { handleAction(actionButtonNode.dataset.action, actionButtonNode.dataset.id || ''); return; }
  });

  $('#theme-toggle').addEventListener('click', () => {
    state.settings.theme = state.settings.theme === 'dark' ? 'light' : 'dark';
    persist(); render();
  });
  $('#privacy-toggle')?.addEventListener('click', () => {
    privacyMode = !privacyMode;
    render();
    toast(privacyMode ? (lang() === 'km' ? 'បានលាក់ចំនួនទឹកប្រាក់។' : 'Amounts are hidden.') : (lang() === 'km' ? 'បានបង្ហាញចំនួនទឹកប្រាក់។' : 'Amounts are visible.'));
  });
  $('#language-toggle').addEventListener('click', () => {
    state.settings.language = state.settings.language === 'km' ? 'en' : 'km';
    persist(); render();
  });
  $('#mobile-menu').addEventListener('click', () => {
    const sidebar = $('#sidebar');
    if (window.matchMedia('(max-width: 650px)').matches) {
      const opened = sidebar.classList.toggle('sidebar-open');
      $('#mobile-menu').setAttribute('aria-expanded', String(opened));
      let overlay = $('.drawer-overlay');
      if (opened && !overlay) {
        overlay = el('div', { class: 'drawer-overlay', 'aria-hidden': 'true' });
        overlay.addEventListener('click', () => {
          sidebar.classList.remove('sidebar-open');
          overlay.remove();
          $('#mobile-menu').setAttribute('aria-expanded', 'false');
          $('#mobile-menu').setAttribute('aria-label', tr('openNavigation'));
          $('#mobile-menu').focus({ preventScroll: true });
        });
        document.body.append(overlay);
      } else if (!opened && overlay) overlay.remove();
    } else sidebar.classList.toggle('sidebar-open');
  });
  $('#mobile-more').addEventListener('click', () => $('#mobile-menu').click());
  $('#install-button').addEventListener('click', async () => {
    if (deferredInstallPrompt) {
      const promptEvent = deferredInstallPrompt;
      deferredInstallPrompt = null;
      try {
        await promptEvent.prompt();
        const choice = await promptEvent.userChoice;
        $('#install-button').hidden = true;
        if (choice?.outcome !== 'accepted') toast(lang() === 'km' ? 'អ្នកអាចដំឡើងកម្មវិធីនៅពេលក្រោយបាន។' : 'You can install the app later.', 'error');
      } catch (error) {
        console.error('App installation prompt failed:', error);
        toast(tr('installUnavailable'), 'error');
      }
    } else if (/iphone|ipad|ipod/i.test(navigator.userAgent) && !window.navigator.standalone) {
      window.alert(tr('iosInstall'));
    } else if (/android/i.test(navigator.userAgent)) {
      window.alert(tr('androidInstall'));
    } else toast(tr('installUnavailable'), 'error');
  });
  $('#update-button').addEventListener('click', () => {
    if (serviceWorkerRegistration?.waiting) serviceWorkerRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
  });

  window.addEventListener('online', () => { updateChrome(); toast(tr('online')); });
  window.addEventListener('offline', () => { updateChrome(); toast(tr('offline'), 'error'); });
  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault(); deferredInstallPrompt = event; $('#install-button').hidden = false;
  });
  window.addEventListener('appinstalled', () => { deferredInstallPrompt = null; $('#install-button').hidden = true; });

  const fileInput = el('input', { id: 'backup-file-input', type: 'file', accept: 'application/json,.json', hidden: true });
  document.body.append(fileInput);
  fileInput.addEventListener('change', async () => {
    const file = fileInput.files?.[0];
    if (!file) return;
    try {
      const parsed = JSON.parse(await file.text());
      if (!window.confirm(tr('confirmImport'))) return;
      const importedState = validateBackup(parsed);
      const previousState = state;
      state = importedState;
      if (persist()) { render(); toast(tr('imported')); }
      else state = previousState;
    } catch (error) {
      console.error(error); toast(tr('importError'), 'error');
    } finally { fileInput.value = ''; }
  });
}

async function registerPWA() {
  if (!('serviceWorker' in navigator)) return;
  try {
    const swUrl = new URL('../service-worker.js', import.meta.url);
    const scopeUrl = new URL('../', import.meta.url);
    serviceWorkerRegistration = await navigator.serviceWorker.register(swUrl, { scope: scopeUrl.pathname });
    if (serviceWorkerRegistration.waiting) $('#update-banner').hidden = false;
    serviceWorkerRegistration.addEventListener('updatefound', () => {
      const worker = serviceWorkerRegistration.installing;
      worker?.addEventListener('statechange', () => {
        if (worker.state === 'installed' && navigator.serviceWorker.controller) $('#update-banner').hidden = false;
      });
    });
    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (refreshing) return;
      refreshing = true;
      window.location.reload();
    });
  } catch (error) {
    console.error('Service worker registration failed:', error);
  }
}

function start() {
  setupEvents();
  render();
  registerPWA();
  if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) $('#install-button').hidden = true;
  if (navigator.onLine === false) updateChrome();
}

start();
