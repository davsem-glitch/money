import { uid, todayISO, sum } from './utils.js';

export function goalBalance(state, goalId) {
  const movements = state.savingsMovements.filter(item => item.goalId === goalId);
  const deposits = sum(movements.filter(item => item.type === 'deposit').map(item => item.amount));
  const withdrawals = sum(movements.filter(item => item.type === 'withdrawal').map(item => item.amount));
  return deposits - withdrawals;
}

export function totalSavings(state) {
  return sum(state.savingsGoals.map(goal => goalBalance(state, goal.id)));
}

export function addGoal(state, data, id = null) {
  const existing = id ? state.savingsGoals.find(item => item.id === id) : null;
  const goal = {
    id: existing?.id || uid('goal'),
    name: String(data.name).trim(),
    targetAmount: Number(data.targetAmount),
    deadline: data.deadline || '',
    color: existing?.color || 'mint',
    createdAt: existing?.createdAt || Date.now()
  };
  if (existing) Object.assign(existing, goal);
  else state.savingsGoals.push(goal);
  return goal;
}

export function addMovement(state, data) {
  const movement = {
    id: uid('saving'),
    goalId: data.goalId,
    type: data.type === 'withdrawal' ? 'withdrawal' : 'deposit',
    amount: Number(data.amount),
    date: data.date || todayISO(),
    note: String(data.note || '').trim(),
    createdAt: Date.now()
  };
  state.savingsMovements.push(movement);
  return movement;
}
