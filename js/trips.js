import { uid, sum } from './utils.js';

const TRIP_KEYS = ['transport', 'hotel', 'food', 'activities', 'shopping', 'other'];

export function tripSpent(state, tripId) {
  return sum(state.transactions.filter(tx => tx.type === 'expense' && tx.tripId === tripId).map(tx => tx.amount));
}

export function addTrip(state, data, id = null) {
  const existing = id ? state.trips.find(item => item.id === id) : null;
  const categories = {};
  for (const key of TRIP_KEYS) categories[key] = Math.max(0, Number(data.categories?.[key]) || 0);
  const trip = {
    id: existing?.id || uid('trip'),
    name: String(data.name).trim(),
    destination: String(data.destination || '').trim(),
    startDate: data.startDate,
    endDate: data.endDate,
    budget: Number(data.budget),
    categories,
    createdAt: existing?.createdAt || Date.now()
  };
  if (existing) Object.assign(existing, trip);
  else state.trips.push(trip);
  return trip;
}

export function deleteTrip(state, tripId) {
  const linked = state.transactions.filter(tx => tx.tripId === tripId);
  for (const tx of linked) tx.tripId = null;
  state.trips = state.trips.filter(item => item.id !== tripId);
}
