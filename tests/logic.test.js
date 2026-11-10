import test from 'node:test';
import assert from 'node:assert/strict';
import { createDefaultState, validateBackup } from '../js/storage.js';
import { createTransaction, totals, projectedCashAfterTransactionChange, deleteTransaction } from '../js/transactions.js';
import { upsertBudget, budgetSummary } from '../js/budget.js';
import { addGoal, addMovement, goalBalance, totalSavings } from '../js/savings.js';
import { addTrip, tripSpent, deleteTrip } from '../js/trips.js';
import { addBill, payBill, deleteBill } from '../js/bills.js';

const fixedDate = '2026-11-03';

function freshState() {
  const state = createDefaultState();
  state.settings.openingBalance = 500;
  return state;
}

test('cash and total money follow income, expenses and savings movements', () => {
  const state = freshState();
  state.transactions.push(
    createTransaction({ type: 'income', amount: 200, date: fixedDate }),
    createTransaction({ type: 'expense', amount: 100, date: fixedDate })
  );
  state.savingsMovements.push(
    { id: 's1', goalId: 'g1', type: 'deposit', amount: 50 },
    { id: 's2', goalId: 'g1', type: 'withdrawal', amount: 10 }
  );
  const summary = totals(state);
  assert.equal(summary.cashAvailable, 560);
  assert.equal(summary.saved, 40);
  assert.equal(summary.totalMoney, 600);
});

test('projected cash correctly replaces existing income or expense', () => {
  const state = createDefaultState();
  const income = createTransaction({ type: 'income', amount: 100, date: fixedDate });
  state.transactions.push(income);
  // Replacing the only income with an expense would make cash negative.
  assert.equal(projectedCashAfterTransactionChange(state, income, 'expense', 80), -80);
  assert.equal(projectedCashAfterTransactionChange(state, income, 'income', 200), 200);

  state.settings.openingBalance = 100;
  const expense = createTransaction({ type: 'expense', amount: 80, date: fixedDate });
  state.transactions.push(expense);
  assert.equal(projectedCashAfterTransactionChange(state, expense, 'expense', 30), 170);
});

test('deleting a bill-linked transaction reopens the bill', () => {
  const state = freshState();
  const bill = addBill(state, { name: 'Internet', amount: 25, dueDate: fixedDate, category: 'bills' });
  const expense = payBill(state, bill.id);
  assert.equal(bill.paid, true);
  assert.equal(state.transactions.length, 1);
  deleteTransaction(state, expense.id);
  assert.equal(bill.paid, false);
  assert.equal(bill.transactionId, null);
  assert.equal(state.transactions.length, 0);
});

test('deleting a bill keeps its historic expense but removes the relation', () => {
  const state = freshState();
  const bill = addBill(state, { name: 'Water', amount: 12, dueDate: fixedDate, category: 'bills' });
  const expense = payBill(state, bill.id);
  deleteBill(state, bill.id);
  assert.equal(state.transactions.length, 1);
  assert.equal(state.transactions[0].id, expense.id);
  assert.equal(state.transactions[0].billId, null);
});

test('budget progress uses only matching monthly expense records', () => {
  const state = freshState();
  upsertBudget(state, { month: '2026-11', category: 'food', amount: 150 });
  state.transactions.push(
    createTransaction({ type: 'expense', category: 'food', amount: 45, date: fixedDate }),
    createTransaction({ type: 'expense', category: 'transport', amount: 30, date: fixedDate }),
    createTransaction({ type: 'expense', category: 'food', amount: 20, date: '2026-10-15' })
  );
  const [budget] = budgetSummary(state, '2026-11');
  assert.equal(budget.spent, 45);
  assert.equal(budget.remaining, 105);
  assert.equal(budget.percent, 30);
});

test('savings deposits and withdrawals maintain a non-negative goal balance', () => {
  const state = freshState();
  const goal = addGoal(state, { name: 'Laptop', targetAmount: 600 });
  addMovement(state, { goalId: goal.id, type: 'deposit', amount: 80, date: fixedDate });
  addMovement(state, { goalId: goal.id, type: 'withdrawal', amount: 20, date: fixedDate });
  assert.equal(goalBalance(state, goal.id), 60);
  assert.equal(totalSavings(state), 60);
});

test('trip expense is counted once and remains an ordinary expense after trip deletion', () => {
  const state = freshState();
  const trip = addTrip(state, {
    name: 'Siem Reap', destination: 'Siem Reap', startDate: fixedDate, endDate: '2026-11-06', budget: 300,
    categories: { food: 100 }
  });
  const expense = createTransaction({ type: 'expense', amount: 35, date: fixedDate, tripId: trip.id });
  state.transactions.push(expense);
  assert.equal(tripSpent(state, trip.id), 35);
  assert.equal(totals(state).allExpenses, 35);
  deleteTrip(state, trip.id);
  assert.equal(state.transactions[0].tripId, null);
  assert.equal(totals(state).allExpenses, 35);
});

test('backup import repairs stale trip and bill links and reopens unsupported paid bills', () => {
  const imported = validateBackup({
    version: 1,
    settings: { language: 'en', currency: 'USD', theme: 'light', openingBalance: 100 },
    transactions: [
      { id: 'tx1', type: 'expense', amount: 40, date: fixedDate, tripId: 'missing-trip', billId: 'missing-bill' }
    ],
    trips: [],
    bills: [{ id: 'bill1', name: 'Electricity', amount: 40, dueDate: fixedDate, paid: true, transactionId: 'missing-tx' }],
    budgets: [], savingsGoals: [], savingsMovements: []
  });
  assert.equal(imported.transactions[0].tripId, null);
  assert.equal(imported.transactions[0].billId, null);
  assert.equal(imported.bills[0].paid, false);
  assert.equal(imported.bills[0].transactionId, null);
});
