import { uid, monthKey, sum } from './utils.js';

export function budgetSpent(state, budget) {
  return sum(state.transactions.filter(tx => tx.type === 'expense' && monthKey(tx.date) === budget.month && (budget.category === 'all' || tx.category === budget.category)).map(tx => tx.amount));
}

export function budgetSummary(state, month = monthKey()) {
  const budgets = state.budgets.filter(item => item.month === month);
  return budgets.map(budget => {
    const spent = budgetSpent(state, budget);
    return { ...budget, spent, remaining: budget.amount - spent, percent: budget.amount > 0 ? spent / budget.amount * 100 : 0 };
  });
}

export function upsertBudget(state, data, id = null) {
  const existing = id ? state.budgets.find(item => item.id === id) : null;
  const budget = {
    id: existing?.id || uid('budget'),
    month: data.month,
    category: data.category,
    amount: Number(data.amount)
  };
  if (existing) Object.assign(existing, budget);
  else state.budgets.push(budget);
  return budget;
}
