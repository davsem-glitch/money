import { uid, todayISO } from './utils.js';
import { createTransaction } from './transactions.js';

export function addBill(state, data, id = null) {
  const existing = id ? state.bills.find(item => item.id === id) : null;
  const bill = {
    id: existing?.id || uid('bill'),
    name: String(data.name).trim(),
    amount: Number(data.amount),
    dueDate: data.dueDate,
    category: data.category || 'bills',
    paid: Boolean(existing?.paid),
    paidAt: existing?.paidAt || null,
    transactionId: existing?.transactionId || null
  };
  if (existing) {
    Object.assign(existing, bill);
    if (existing.paid && existing.transactionId) {
      const tx = state.transactions.find(item => item.id === existing.transactionId);
      if (tx) {
        tx.amount = bill.amount;
        tx.category = bill.category;
        tx.date = bill.dueDate;
        tx.description = `Bill: ${bill.name}`;
      }
    }
  } else state.bills.push(bill);
  return bill;
}

export function payBill(state, billId) {
  const bill = state.bills.find(item => item.id === billId);
  if (!bill || bill.paid) return null;
  const tx = createTransaction({
    type: 'expense', amount: bill.amount, category: bill.category,
    date: todayISO(), description: `Bill: ${bill.name}`,
    paymentMethod: 'bank', billId: bill.id
  });
  state.transactions.push(tx);
  bill.paid = true;
  bill.paidAt = todayISO();
  bill.transactionId = tx.id;
  return tx;
}

export function deleteBill(state, billId) {
  const bill = state.bills.find(item => item.id === billId);
  if (!bill) return;
  if (bill.transactionId) {
    const tx = state.transactions.find(item => item.id === bill.transactionId);
    if (tx) tx.billId = null;
  }
  state.bills = state.bills.filter(item => item.id !== billId);
}
