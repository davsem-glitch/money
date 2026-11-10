import { monthKey, sum } from './utils.js';

export function getRangeForPeriod(period, referenceDate = new Date()) {
  const end = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), referenceDate.getDate());
  let start = new Date(end);
  if (period === 'daily') start = new Date(end);
  else if (period === 'weekly') {
    const day = (end.getDay() + 6) % 7;
    start.setDate(end.getDate() - day);
  } else start = new Date(end.getFullYear(), end.getMonth(), 1);
  return { start: toISO(start), end: toISO(end) };
}

function toISO(date) {
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
}

export function reportTotals(state, period) {
  const { start, end } = getRangeForPeriod(period);
  const rows = state.transactions.filter(tx => tx.date >= start && tx.date <= end);
  return {
    start, end,
    income: sum(rows.filter(tx => tx.type === 'income').map(tx => tx.amount)),
    expenses: sum(rows.filter(tx => tx.type === 'expense').map(tx => tx.amount)),
    rows
  };
}

export function categoryTotals(rows) {
  const map = new Map();
  for (const tx of rows) if (tx.type === 'expense') map.set(tx.category, (map.get(tx.category) || 0) + tx.amount);
  return [...map.entries()].map(([category, amount]) => ({ category, amount })).sort((a, b) => b.amount - a.amount);
}

export function monthlyTrend(state, count = 6, language = 'en') {
  const result = [];
  const today = new Date();
  for (let i = count - 1; i >= 0; i--) {
    const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const rows = state.transactions.filter(tx => monthKey(tx.date) === key);
    result.push({
      key,
      label: new Intl.DateTimeFormat(language === 'km' ? 'km-KH' : 'en', { month: 'short' }).format(date),
      income: sum(rows.filter(tx => tx.type === 'income').map(tx => tx.amount)),
      expenses: sum(rows.filter(tx => tx.type === 'expense').map(tx => tx.amount))
    });
  }
  return result;
}
