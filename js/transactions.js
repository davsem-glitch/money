import { uid, todayISO, monthKey, sum } from './utils.js';

export function createTransaction(data) {
  return {
    id: uid('tx'),
    type: data.type === 'income' ? 'income' : 'expense',
    amount: Number(data.amount),
    category: data.category || 'other',
    date: data.date || todayISO(),
    description: String(data.description || '').trim(),
    paymentMethod: data.paymentMethod || 'cash',
    tripId: data.tripId || null,
    billId: data.billId || null,
    createdAt: Date.now()
  };
}

export function projectedCashAfterTransactionChange(state, existing, nextType, nextAmount) {
  const cashNow = totals(state).cashAvailable;
  const previousEffect = existing ? (existing.type === 'income' ? Number(existing.amount) : -Number(existing.amount)) : 0;
  const nextEffect = nextType === 'income' ? Number(nextAmount) : -Number(nextAmount);
  return cashNow - previousEffect + nextEffect;
}

export function totals(state, month = null) {
  const entries = month ? state.transactions.filter(tx => monthKey(tx.date) === month) : state.transactions;
  const income = sum(entries.filter(tx => tx.type === 'income').map(tx => tx.amount));
  const expenses = sum(entries.filter(tx => tx.type === 'expense').map(tx => tx.amount));
  const allIncome = sum(state.transactions.filter(tx => tx.type === 'income').map(tx => tx.amount));
  const allExpenses = sum(state.transactions.filter(tx => tx.type === 'expense').map(tx => tx.amount));
  const deposits = sum(state.savingsMovements.filter(item => item.type === 'deposit').map(item => item.amount));
  const withdrawals = sum(state.savingsMovements.filter(item => item.type === 'withdrawal').map(item => item.amount));
  const saved = deposits - withdrawals;
  const cashAvailable = Number(state.settings.openingBalance || 0) + allIncome - allExpenses - deposits + withdrawals;
  return {
    income,
    expenses,
    allIncome,
    allExpenses,
    deposits,
    withdrawals,
    saved,
    cashAvailable,
    totalMoney: cashAvailable + saved
  };
}

export function transactionsForMonth(state, month) {
  return state.transactions.filter(tx => monthKey(tx.date) === month).sort((a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt);
}

export function categorySpending(state, month = monthKey()) {
  const data = new Map();
  for (const tx of state.transactions) {
    if (tx.type !== 'expense' || monthKey(tx.date) !== month) continue;
    data.set(tx.category, (data.get(tx.category) || 0) + tx.amount);
  }
  return [...data.entries()].map(([category, amount]) => ({ category, amount })).sort((a, b) => b.amount - a.amount);
}

export function monthTotals(state, month) {
  const items = transactionsForMonth(state, month);
  return {
    income: sum(items.filter(tx => tx.type === 'income').map(tx => tx.amount)),
    expenses: sum(items.filter(tx => tx.type === 'expense').map(tx => tx.amount))
  };
}

export function deleteTransaction(state, transactionId) {
  const tx = state.transactions.find(item => item.id === transactionId);
  if (!tx) return;
  if (tx.billId) {
    const bill = state.bills.find(item => item.id === tx.billId);
    if (bill) {
      bill.paid = false;
      bill.paidAt = null;
      bill.transactionId = null;
    }
  }
  state.transactions = state.transactions.filter(item => item.id !== transactionId);
}
