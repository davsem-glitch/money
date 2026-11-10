import { uid, todayISO } from './utils.js';

export const STORAGE_KEY = 'monee.personal-finance.v1';
export const DATA_VERSION = 1;

export function createDefaultState() {
  return {
    version: DATA_VERSION,
    settings: {
      language: 'km',
      currency: 'USD',
      theme: 'light',
      userName: '',
      openingBalance: 0
    },
    transactions: [],
    budgets: [],
    savingsGoals: [],
    savingsMovements: [],
    trips: [],
    bills: []
  };
}

function isRecord(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function sanitizeState(raw) {
  if (!isRecord(raw)) throw new Error('Invalid backup format');
  const state = createDefaultState();
  const version = Number(raw.version) || 0;
  if (version > DATA_VERSION) throw new Error('Backup was created by a newer app version');

  if (isRecord(raw.settings)) {
    state.settings = {
      ...state.settings,
      language: raw.settings.language === 'en' ? 'en' : 'km',
      currency: raw.settings.currency === 'KHR' ? 'KHR' : 'USD',
      theme: raw.settings.theme === 'dark' ? 'dark' : 'light',
      userName: typeof raw.settings.userName === 'string' ? raw.settings.userName.slice(0, 80) : '',
      openingBalance: Math.max(0, Number(raw.settings.openingBalance) || 0)
    };
  }

  const arrays = ['transactions', 'budgets', 'savingsGoals', 'savingsMovements', 'trips', 'bills'];
  for (const key of arrays) state[key] = Array.isArray(raw[key]) ? raw[key] : [];

  state.transactions = state.transactions.filter(isRecord).map(item => ({
    id: String(item.id || uid('tx')),
    type: item.type === 'income' ? 'income' : 'expense',
    amount: Math.max(0, Number(item.amount) || 0),
    category: String(item.category || 'other'),
    date: /^\d{4}-\d{2}-\d{2}$/.test(item.date) ? item.date : todayISO(),
    description: String(item.description || '').slice(0, 180),
    paymentMethod: String(item.paymentMethod || 'cash'),
    tripId: item.tripId ? String(item.tripId) : null,
    billId: item.billId ? String(item.billId) : null,
    createdAt: Number(item.createdAt) || Date.now()
  })).filter(item => item.amount > 0);

  state.budgets = state.budgets.filter(isRecord).map(item => ({
    id: String(item.id || uid('budget')),
    month: /^\d{4}-\d{2}$/.test(item.month) ? item.month : todayISO().slice(0, 7),
    category: String(item.category || 'all'),
    amount: Math.max(0, Number(item.amount) || 0)
  })).filter(item => item.amount > 0);

  state.savingsGoals = state.savingsGoals.filter(isRecord).map(item => ({
    id: String(item.id || uid('goal')),
    name: String(item.name || 'Saving goal').slice(0, 100),
    targetAmount: Math.max(0, Number(item.targetAmount) || 0),
    deadline: /^\d{4}-\d{2}-\d{2}$/.test(item.deadline) ? item.deadline : '',
    createdAt: Number(item.createdAt) || Date.now(),
    color: String(item.color || 'mint')
  })).filter(item => item.targetAmount > 0);

  state.savingsMovements = state.savingsMovements.filter(isRecord).map(item => ({
    id: String(item.id || uid('saving')),
    goalId: String(item.goalId || ''),
    type: item.type === 'withdrawal' ? 'withdrawal' : 'deposit',
    amount: Math.max(0, Number(item.amount) || 0),
    date: /^\d{4}-\d{2}-\d{2}$/.test(item.date) ? item.date : todayISO(),
    note: String(item.note || '').slice(0, 180),
    createdAt: Number(item.createdAt) || Date.now()
  })).filter(item => item.amount > 0 && state.savingsGoals.some(goal => goal.id === item.goalId));

  state.trips = state.trips.filter(isRecord).map(item => ({
    id: String(item.id || uid('trip')),
    name: String(item.name || 'Trip').slice(0, 100),
    destination: String(item.destination || '').slice(0, 120),
    startDate: /^\d{4}-\d{2}-\d{2}$/.test(item.startDate) ? item.startDate : todayISO(),
    endDate: /^\d{4}-\d{2}-\d{2}$/.test(item.endDate) ? item.endDate : todayISO(),
    budget: Math.max(0, Number(item.budget) || 0),
    categories: isRecord(item.categories) ? Object.fromEntries(['transport', 'hotel', 'food', 'activities', 'shopping', 'other'].map(key => [key, Math.max(0, Number(item.categories[key]) || 0)])) : {},
    createdAt: Number(item.createdAt) || Date.now()
  })).filter(item => item.budget > 0);

  state.bills = state.bills.filter(isRecord).map(item => ({
    id: String(item.id || uid('bill')),
    name: String(item.name || 'Bill').slice(0, 100),
    amount: Math.max(0, Number(item.amount) || 0),
    dueDate: /^\d{4}-\d{2}-\d{2}$/.test(item.dueDate) ? item.dueDate : todayISO(),
    category: String(item.category || 'bills'),
    paid: Boolean(item.paid),
    paidAt: item.paidAt ? String(item.paidAt) : null,
    transactionId: item.transactionId ? String(item.transactionId) : null
  })).filter(item => item.amount > 0);

  // Repair stale links in imported/older backups so deleted trips and bills do not
  // leave orphan references or a paid bill without its matching expense.
  const tripIds = new Set(state.trips.map(item => item.id));
  const billIds = new Set(state.bills.map(item => item.id));
  state.transactions.forEach(item => {
    if (item.tripId && !tripIds.has(item.tripId)) item.tripId = null;
    if (item.billId && !billIds.has(item.billId)) item.billId = null;
  });
  for (const bill of state.bills) {
    if (!bill.paid) {
      state.transactions.forEach(item => { if (item.billId === bill.id) item.billId = null; });
      bill.transactionId = null;
      continue;
    }
    const linked = state.transactions.find(item => item.id === bill.transactionId || item.billId === bill.id);
    if (!linked || linked.type !== 'expense') {
      state.transactions.forEach(item => { if (item.billId === bill.id) item.billId = null; });
      bill.paid = false;
      bill.paidAt = null;
      bill.transactionId = null;
      continue;
    }
    linked.billId = bill.id;
    bill.transactionId = linked.id;
  }

  state.version = DATA_VERSION;
  return state;
}

export function loadState() {
  try {
    const rawText = localStorage.getItem(STORAGE_KEY);
    if (!rawText) return createDefaultState();
    const parsed = JSON.parse(rawText);
    return sanitizeState(parsed);
  } catch (error) {
    console.error('Could not load saved data. Starting with a clean state.', error);
    return createDefaultState();
  }
}

export function saveState(state) {
  try {
    const normalized = { ...state, version: DATA_VERSION };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
    return true;
  } catch (error) {
    console.error('Could not save data to LocalStorage.', error);
    return false;
  }
}

export function validateBackup(raw) {
  if (!isRecord(raw)) throw new Error('Invalid backup format');
  const hasAppShape = isRecord(raw.settings) || ['transactions', 'budgets', 'savingsGoals', 'savingsMovements', 'trips', 'bills'].some(key => Array.isArray(raw[key]));
  if (!hasAppShape) throw new Error('Not a Monee backup');
  return sanitizeState(raw);
}

export function downloadBackup(state) {
  const blob = new Blob([JSON.stringify({ ...state, version: DATA_VERSION, exportedAt: new Date().toISOString() }, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `monee-backup-${todayISO()}.json`;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
