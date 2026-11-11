export const APP_CATEGORIES = {
  income: ['salary', 'business', 'freelance', 'gift', 'other'],
  expense: ['food', 'transport', 'shopping', 'bills', 'entertainment', 'health', 'education', 'travel', 'other'],
  trip: ['transport', 'hotel', 'food', 'activities', 'shopping', 'other']
};

const DICT = {
  en: {
    more: 'More',
    appName: 'Monee', tagline: 'Your money, in balance', dashboard: 'Dashboard', transactions: 'Transactions', budgets: 'Budgets', savings: 'Savings', trips: 'Trip planner', bills: 'Bills & payments', reports: 'Reports', settings: 'Settings',
    overview: 'Overview', manage: 'Manage', onlineStatus: 'Online', localStorage: 'Local storage', onThisDevice: 'On this device', switchToEnglish: 'Switch to English', switchToKhmer: 'Switch to Khmer', switchToLightTheme: 'Switch to light theme', switchToDarkTheme: 'Switch to dark theme', hideAmounts: 'Hide amounts', showAmounts: 'Show amounts', openNavigation: 'Open navigation', mainNavigation: 'Main navigation', searchShortcut: 'Ctrl / Cmd + K · Search', totalMoney: 'Total money', available: 'Available to spend', income: 'Income', expenses: 'Expenses', saved: 'Total saved', thisMonth: 'This month', monthlyBudget: 'Monthly budget', recentTransactions: 'Recent transactions', viewAll: 'View all', savingsGoals: 'Savings goals', upcomingBills: 'Upcoming payments', spendingOverview: 'Spending overview', noTransactions: 'No transactions yet', noGoals: 'No savings goals yet', noBills: 'No upcoming payments', addFirst: 'Add your first one to get started.',
    addIncome: 'Add income', addExpense: 'Add expense', addTransaction: 'Add transaction', editTransaction: 'Edit transaction', amount: 'Amount', category: 'Category', date: 'Date', description: 'Description', paymentMethod: 'Payment method', type: 'Type', search: 'Search transactions…', allTypes: 'All types', allCategories: 'All categories', incomeType: 'Income', expenseType: 'Expense', save: 'Save', cancel: 'Cancel', delete: 'Delete', edit: 'Edit', actions: 'Actions',
    setBudget: 'Set budget', editBudget: 'Edit budget', month: 'Month', budgetAmount: 'Budget amount', budgetUsed: 'Used', remaining: 'Remaining', overBudget: 'Over budget', budgetWarning: 'You have used more than 80% of this budget.', noBudgets: 'No budgets for this month',
    createGoal: 'Create saving goal', editGoal: 'Edit goal', goalName: 'Goal name', targetAmount: 'Target amount', deadline: 'Target date', addMoney: 'Add money', withdraw: 'Withdraw', progress: 'Progress', active: 'Active', completed: 'Completed', note: 'Note',
    createTrip: 'Create trip', editTrip: 'Edit trip', tripName: 'Trip name', destination: 'Destination', startDate: 'Start date', endDate: 'End date', tripBudget: 'Trip budget', tripExpenses: 'Trip expenses', spent: 'Spent', tripCategories: 'Budget by category', recordTripExpense: 'Add trip expense', noTrips: 'No trips planned yet',
    addBill: 'Add bill', editBill: 'Edit bill', billName: 'Bill name', dueDate: 'Due date', paid: 'Paid', unpaid: 'Unpaid', markPaid: 'Mark as paid', overdue: 'Overdue', upcoming: 'Upcoming', noBillsList: 'No bills added yet',
    daily: 'Daily', weekly: 'Weekly', monthly: 'Monthly', incomeVsExpenses: 'Income vs expenses', spendingByCategory: 'Spending by category', budgetPerformance: 'Budget performance', savingsHistory: 'Savings history', noReportData: 'Not enough data to show this report yet.',
    profile: 'Profile', yourName: 'Your name', currency: 'Currency', language: 'Language', theme: 'Appearance', light: 'Light', dark: 'Dark', openingBalance: 'Opening balance', dataTools: 'Data & backup', exportData: 'Export backup (JSON)', importData: 'Import backup (JSON)', resetData: 'Reset all data', displayCurrencyNote: 'Changing currency changes the display symbol only. It does not convert existing amounts.',
    installApp: 'Install app', offline: 'You are offline', online: 'Back online', iosInstall: 'On iPhone/iPad, open this page in Safari, tap Share, then “Add to Home Screen”.', androidInstall: 'On Android, open your browser menu (⋮) and choose “Install app” or “Add to Home screen”.', installHelp: 'Install this app on your device for quick access.', updateReady: 'An app update is ready.', update: 'Update now',
    confirmDelete: 'Delete this item? This action cannot be undone.', confirmReset: 'This will permanently delete all app data on this device. Continue?', confirmImport: 'Replace current app data with this backup?', insufficient: 'This expense is more than your available cash. Record it anyway?', insufficientDeposit: 'You do not have enough available cash for this savings deposit.', insufficientWithdraw: 'This goal does not have enough saved money for that withdrawal.', goalHasFunds: 'Withdraw the remaining goal balance before deleting this goal.', invalidAmount: 'Enter an amount greater than zero.', required: 'Please complete the required fields.', savedMessage: 'Changes saved.', imported: 'Backup imported successfully.', importError: 'This backup file is not valid for this app.',
    all: 'All categories', salary: 'Salary', business: 'Business', freelance: 'Freelance', gift: 'Gift', other: 'Other', food: 'Food', transport: 'Transport', shopping: 'Shopping', billsCat: 'Bills', entertainment: 'Entertainment', health: 'Health', education: 'Education', travel: 'Travel', hotel: 'Hotel', activities: 'Activities',
    cash: 'Cash', bank: 'Bank transfer', card: 'Card', mobile: 'Mobile payment', today: 'Today', yesterday: 'Yesterday', thisWeek: 'This week', noResults: 'No matching records', deleteGoal: 'Delete goal', deleteTrip: 'Delete trip', deleteBill: 'Delete bill', totalBudget: 'Total budget', add: 'Add', close: 'Close', showing: 'Showing', transactionsCount: 'transactions', noBudgetSet: 'No monthly budget set', setNow: 'Set one now', payments: 'Payments', trip: 'Trip', noDescription: 'No description', selectCategory: 'Select category', selectDate: 'Select date', paidExpense: 'Paid bill expense', installUnavailable: 'Install option is not available in this browser.', backupHint: 'Your data is stored only on this device/browser. Export backups regularly.', resetHint: 'Reset removes all locally stored data.',
    confirm: 'Confirm', filter: 'Filter', clear: 'Clear', currentMonth: 'Current month', goal: 'Goal', tripBudgetRemaining: 'Trip budget remaining', total: 'Total', average: 'Average', noData: 'No data yet', exportCsv: 'Export CSV', clearFilters: 'Clear filters', sortBy: 'Sort by', newestFirst: 'Newest first', oldestFirst: 'Oldest first', highestAmount: 'Highest amount', lowestAmount: 'Lowest amount'
  },
  km: {
    more: 'ផ្សេងៗ',
    appName: 'Monee', tagline: 'គ្រប់គ្រងលុយឱ្យមានតុល្យភាព', dashboard: 'ផ្ទាំងសង្ខេប', transactions: 'ប្រតិបត្តិការ', budgets: 'ថវិកា', savings: 'ការសន្សំ', trips: 'ផែនការដំណើរ', bills: 'វិក្កយបត្រ', reports: 'របាយការណ៍', settings: 'ការកំណត់',
    overview: 'ទិដ្ឋភាពទូទៅ', manage: 'ការគ្រប់គ្រង', onlineStatus: 'កំពុងភ្ជាប់អ៊ីនធឺណិត', localStorage: 'ការផ្ទុកក្នុងឧបករណ៍', onThisDevice: 'នៅលើឧបករណ៍នេះ', switchToEnglish: 'ប្តូរទៅភាសាអង់គ្លេស', switchToKhmer: 'ប្តូរទៅភាសាខ្មែរ', switchToLightTheme: 'ប្តូរទៅរូបរាងភ្លឺ', switchToDarkTheme: 'ប្តូរទៅរូបរាងងងឹត', hideAmounts: 'លាក់ចំនួនទឹកប្រាក់', showAmounts: 'បង្ហាញចំនួនទឹកប្រាក់', openNavigation: 'បើកម៉ឺនុយ', mainNavigation: 'ម៉ឺនុយមេ', searchShortcut: 'Ctrl / Cmd + K · ស្វែងរក', totalMoney: 'ទឹកប្រាក់សរុប', available: 'ប្រាក់អាចចំណាយបាន', income: 'ចំណូល', expenses: 'ចំណាយ', saved: 'ប្រាក់សន្សំសរុប', thisMonth: 'ខែនេះ', monthlyBudget: 'ថវិកាប្រចាំខែ', recentTransactions: 'ប្រតិបត្តិការថ្មីៗ', viewAll: 'មើលទាំងអស់', savingsGoals: 'គោលដៅសន្សំ', upcomingBills: 'ការបង់ប្រាក់ខាងមុខ', spendingOverview: 'ទិដ្ឋភាពចំណាយ', noTransactions: 'មិនទាន់មានប្រតិបត្តិការទេ', noGoals: 'មិនទាន់មានគោលដៅសន្សំទេ', noBills: 'មិនមានការបង់ប្រាក់ខាងមុខទេ', addFirst: 'បន្ថែមធាតុដំបូងដើម្បីចាប់ផ្តើម។',
    addIncome: 'បន្ថែមចំណូល', addExpense: 'បន្ថែមចំណាយ', addTransaction: 'បន្ថែមប្រតិបត្តិការ', editTransaction: 'កែប្រែប្រតិបត្តិការ', amount: 'ចំនួនទឹកប្រាក់', category: 'ប្រភេទ', date: 'កាលបរិច្ឆេទ', description: 'ការពិពណ៌នា', paymentMethod: 'វិធីបង់ប្រាក់', type: 'ប្រភេទ', search: 'ស្វែងរកប្រតិបត្តិការ…', allTypes: 'គ្រប់ប្រភេទ', allCategories: 'គ្រប់ប្រភេទ', incomeType: 'ចំណូល', expenseType: 'ចំណាយ', save: 'រក្សាទុក', cancel: 'បោះបង់', delete: 'លុប', edit: 'កែប្រែ', actions: 'សកម្មភាព',
    setBudget: 'កំណត់ថវិកា', editBudget: 'កែប្រែថវិកា', month: 'ខែ', budgetAmount: 'ចំនួនថវិកា', budgetUsed: 'បានប្រើ', remaining: 'នៅសល់', overBudget: 'លើសថវិកា', budgetWarning: 'អ្នកបានប្រើប្រាស់លើសពី ៨០% នៃថវិកានេះ។', noBudgets: 'មិនទាន់មានថវិកាសម្រាប់ខែនេះទេ',
    createGoal: 'បង្កើតគោលដៅសន្សំ', editGoal: 'កែប្រែគោលដៅ', goalName: 'ឈ្មោះគោលដៅ', targetAmount: 'ចំនួនគោលដៅ', deadline: 'កាលបរិច្ឆេទកំណត់', addMoney: 'ដាក់ប្រាក់សន្សំ', withdraw: 'ដកប្រាក់', progress: 'វឌ្ឍនភាព', active: 'កំពុងដំណើរការ', completed: 'សម្រេចបាន', note: 'កំណត់ចំណាំ',
    createTrip: 'បង្កើតដំណើរកម្សាន្ត', editTrip: 'កែប្រែដំណើរ', tripName: 'ឈ្មោះដំណើរ', destination: 'គោលដៅ', startDate: 'ថ្ងៃចាប់ផ្តើម', endDate: 'ថ្ងៃបញ្ចប់', tripBudget: 'ថវិកាដំណើរ', tripExpenses: 'ចំណាយដំណើរ', spent: 'បានចំណាយ', tripCategories: 'ថវិកាតាមប្រភេទ', recordTripExpense: 'បន្ថែមចំណាយដំណើរ', noTrips: 'មិនទាន់មានគម្រោងដំណើរទេ',
    addBill: 'បន្ថែមវិក្កយបត្រ', editBill: 'កែប្រែវិក្កយបត្រ', billName: 'ឈ្មោះវិក្កយបត្រ', dueDate: 'ថ្ងៃត្រូវបង់', paid: 'បានបង់', unpaid: 'មិនទាន់បង់', markPaid: 'សម្គាល់ថាបានបង់', overdue: 'ហួសកំណត់', upcoming: 'ជិតដល់ថ្ងៃបង់', noBillsList: 'មិនទាន់មានវិក្កយបត្រទេ',
    daily: 'ប្រចាំថ្ងៃ', weekly: 'ប្រចាំសប្តាហ៍', monthly: 'ប្រចាំខែ', incomeVsExpenses: 'ចំណូលធៀបនឹងចំណាយ', spendingByCategory: 'ចំណាយតាមប្រភេទ', budgetPerformance: 'លទ្ធផលថវិកា', savingsHistory: 'ប្រវត្តិការសន្សំ', noReportData: 'មិនទាន់មានទិន្នន័យគ្រប់គ្រាន់សម្រាប់របាយការណ៍នេះទេ។',
    profile: 'ប្រវត្តិរូប', yourName: 'ឈ្មោះរបស់អ្នក', currency: 'រូបិយប័ណ្ណ', language: 'ភាសា', theme: 'រូបរាង', light: 'ភ្លឺ', dark: 'ងងឹត', openingBalance: 'សមតុល្យដើម', dataTools: 'ទិន្នន័យ និងការបម្រុងទុក', exportData: 'នាំចេញទិន្នន័យ (JSON)', importData: 'នាំចូលទិន្នន័យ (JSON)', resetData: 'កំណត់ទិន្នន័យឡើងវិញ', displayCurrencyNote: 'ការប្តូររូបិយប័ណ្ណប្តូរតែនិមិត្តសញ្ញាបង្ហាញប៉ុណ្ណោះ មិនបម្លែងចំនួនទឹកប្រាក់ដែលមានស្រាប់ទេ។',
    installApp: 'ដំឡើងកម្មវិធី', offline: 'អ្នកកំពុង Offline', online: 'បានភ្ជាប់អ៊ីនធឺណិតវិញ', iosInstall: 'នៅលើ iPhone/iPad សូមបើកទំព័រនេះក្នុង Safari ចុច Share រួចជ្រើស “Add to Home Screen”។', androidInstall: 'នៅលើ Android សូមបើកម៉ឺនុយ Browser (⋮) រួចជ្រើស “Install app” ឬ “Add to Home screen”។', installHelp: 'ដំឡើងកម្មវិធីនេះលើឧបករណ៍របស់អ្នក ដើម្បីងាយស្រួលប្រើ។', updateReady: 'មានកំណែថ្មីរួចរាល់។', update: 'ធ្វើបច្ចុប្បន្នភាព',
    confirmDelete: 'តើអ្នកចង់លុបធាតុនេះមែនទេ? សកម្មភាពនេះមិនអាចត្រឡប់វិញបានទេ។', confirmReset: 'សកម្មភាពនេះនឹងលុបទិន្នន័យកម្មវិធីទាំងអស់នៅលើឧបករណ៍នេះជាអចិន្ត្រៃយ៍។ តើបន្តទេ?', confirmImport: 'តើជំនួសទិន្នន័យបច្ចុប្បន្នដោយឯកសារបម្រុងទុកនេះមែនទេ?', insufficient: 'ចំណាយនេះលើសពីសាច់ប្រាក់ដែលអាចប្រើបាន។ តើនៅតែចង់កត់ត្រាទេ?', insufficientDeposit: 'អ្នកមិនមានសាច់ប្រាក់គ្រប់គ្រាន់សម្រាប់ដាក់សន្សំទេ។', insufficientWithdraw: 'គោលដៅនេះមិនមានប្រាក់សន្សំគ្រប់គ្រាន់សម្រាប់ដកទេ។', goalHasFunds: 'សូមដកប្រាក់ដែលនៅសល់ចេញពីគោលដៅនេះសិន មុនពេលលុប។', invalidAmount: 'សូមបញ្ចូលចំនួនទឹកប្រាក់ធំជាងសូន្យ។', required: 'សូមបំពេញព័ត៌មានដែលត្រូវការ។', savedMessage: 'បានរក្សាទុកការផ្លាស់ប្តូរ។', imported: 'បាននាំចូលឯកសារបម្រុងទុកដោយជោគជ័យ។', importError: 'ឯកសារបម្រុងទុកនេះមិនត្រឹមត្រូវសម្រាប់កម្មវិធីនេះទេ។',
    all: 'ទាំងអស់', salary: 'ប្រាក់ខែ', business: 'អាជីវកម្ម', freelance: 'ការងារឯករាជ្យ', gift: 'អំណោយ', other: 'ផ្សេងៗ', food: 'អាហារ', transport: 'ដឹកជញ្ជូន', shopping: 'ទិញទំនិញ', billsCat: 'វិក្កយបត្រ', entertainment: 'កម្សាន្ត', health: 'សុខភាព', education: 'ការអប់រំ', travel: 'ដំណើរកម្សាន្ត', hotel: 'សណ្ឋាគារ', activities: 'សកម្មភាព',
    cash: 'សាច់ប្រាក់', bank: 'ផ្ទេរធនាគារ', card: 'កាត', mobile: 'ទូទាត់តាមទូរស័ព្ទ', today: 'ថ្ងៃនេះ', yesterday: 'ម្សិលមិញ', thisWeek: 'សប្តាហ៍នេះ', noResults: 'មិនមានទិន្នន័យដែលត្រូវគ្នាទេ', deleteGoal: 'លុបគោលដៅ', deleteTrip: 'លុបដំណើរ', deleteBill: 'លុបវិក្កយបត្រ', totalBudget: 'ថវិកាសរុប', add: 'បន្ថែម', close: 'បិទ', showing: 'បង្ហាញ', transactionsCount: 'ប្រតិបត្តិការ', noBudgetSet: 'មិនទាន់កំណត់ថវិកាប្រចាំខែទេ', setNow: 'កំណត់ឥឡូវនេះ', payments: 'ការបង់ប្រាក់', trip: 'ដំណើរ', noDescription: 'មិនមានការពិពណ៌នា', selectCategory: 'ជ្រើសរើសប្រភេទ', selectDate: 'ជ្រើសរើសកាលបរិច្ឆេទ', paidExpense: 'ចំណាយពីការបង់វិក្កយបត្រ', installUnavailable: 'កម្មវិធីរុករកនេះមិនគាំទ្រជម្រើសដំឡើងទេ។', backupHint: 'ទិន្នន័យរបស់អ្នកត្រូវបានរក្សាទុកតែនៅលើឧបករណ៍/Browser នេះប៉ុណ្ណោះ។ សូមនាំចេញឯកសារបម្រុងទុកជាប្រចាំ។', resetHint: 'ការកំណត់ឡើងវិញនឹងលុបទិន្នន័យដែលរក្សាទុកក្នុងឧបករណ៍នេះ។',
    confirm: 'បញ្ជាក់', filter: 'តម្រង', clear: 'សម្អាត', currentMonth: 'ខែបច្ចុប្បន្ន', goal: 'គោលដៅ', tripBudgetRemaining: 'ថវិកាដំណើរនៅសល់', total: 'សរុប', average: 'មធ្យម', noData: 'មិនទាន់មានទិន្នន័យ', exportCsv: 'នាំចេញ CSV', clearFilters: 'សម្អាតតម្រង', sortBy: 'តម្រៀបតាម', newestFirst: 'ថ្មីបំផុតមុន', oldestFirst: 'ចាស់បំផុតមុន', highestAmount: 'ចំនួនច្រើនជាងគេ', lowestAmount: 'ចំនួនតិចជាងគេ'
  }
};

export function t(key, language = 'km') {
  return DICT[language]?.[key] ?? DICT.en[key] ?? key;
}

export function uid(prefix = 'id') {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;
}

export function todayISO() {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
}

export function monthKey(date = todayISO()) {
  return String(date).slice(0, 7);
}

export function formatMoney(value, currency = 'USD', language = 'km') {
  const amount = Number(value) || 0;
  const locale = language === 'km' ? 'km-KH' : 'en-US';
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency', currency,
      maximumFractionDigits: currency === 'KHR' ? 0 : 2,
      minimumFractionDigits: currency === 'KHR' ? 0 : 2
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

export function formatDate(value, language = 'km', options = {}) {
  if (!value) return '—';
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat(language === 'km' ? 'km-KH' : 'en-GB', {
    day: 'numeric', month: 'short', year: 'numeric', ...options
  }).format(date);
}

export function sum(values) {
  return values.reduce((total, value) => total + (Number(value) || 0), 0);
}

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs || {})) {
    if (value === undefined || value === null || value === false) continue;
    if (key === 'class') node.className = value;
    else if (key === 'text') node.textContent = value;
    else if (key === 'dataset' && typeof value === 'object') Object.assign(node.dataset, value);
    else if (key === 'style' && typeof value === 'object') Object.assign(node.style, value);
    else if (key === 'checked' || key === 'disabled' || key === 'selected' || key === 'multiple' || key === 'required') node[key] = Boolean(value);
    else if (key === 'value') node.value = value;
    else if (key.startsWith('aria-') || key.startsWith('data-') || key === 'role' || key === 'type' || key === 'name' || key === 'min' || key === 'max' || key === 'step' || key === 'placeholder' || key === 'for' || key === 'id' || key === 'title' || key === 'accept' || key === 'autocomplete' || key === 'inputmode' || key === 'colspan') node.setAttribute(key, String(value));
    else if (key === 'htmlFor') node.htmlFor = value;
    else if (key === 'tabIndex') node.tabIndex = value;
    else if (key === 'onClick' && typeof value === 'function') node.addEventListener('click', value);
    else if (key === 'onChange' && typeof value === 'function') node.addEventListener('change', value);
    else if (key === 'onInput' && typeof value === 'function') node.addEventListener('input', value);
    else node.setAttribute(key, String(value));
  }
  for (const child of children.flat(Infinity)) {
    if (child === null || child === undefined || child === false) continue;
    node.append(child instanceof Node ? child : document.createTextNode(String(child)));
  }
  return node;
}

const ICONS = {
  dashboard: 'M3 3h8v8H3z M13 3h8v5h-8z M13 10h8v11h-8z M3 13h8v8H3z',
  wallet: 'M3 6.5A2.5 2.5 0 0 1 5.5 4H20v16H5.5A2.5 2.5 0 0 1 3 17.5z M3 7h17 M16 12h4',
  briefcase: 'M3 7h18v13H3z M8 7V4h8v3 M3 12h18 M10 12v2h4v-2',
  gift: 'M3 10h18v11H3z M2 7h20v3H2z M12 7v14 M12 7H7.5a2.5 2.5 0 1 1 2.5-2.5V7 M12 7h4.5A2.5 2.5 0 1 0 14 4.5V7',
  utensils: 'M4 3v7 M8 3v7 M4 6h4 M6 10v11 M16 3v18 M16 3c3 2 4 5 4 8h-4',
  car: 'M5 11l1.5-5h11L19 11 M3 11h18v8H3z M6 19v2 M18 19v2 M6 15h.01 M18 15h.01',
  shoppingBag: 'M5 8h14l1 13H4z M9 8a3 3 0 0 1 6 0',
  music: 'M9 18V5l12-2v13 M9 18a3 2 0 1 1-6 0 3 2 0 0 1 6 0 M21 16a3 2 0 1 1-6 0 3 2 0 0 1 6 0',
  heart: 'M20.8 8.8c0 5-8.8 11-8.8 11s-8.8-6-8.8-11A4.8 4.8 0 0 1 12 6.2a4.8 4.8 0 0 1 8.8 2.6z M12 8v7 M8.5 11.5h7',
  bookOpen: 'M3 5.5A2.5 2.5 0 0 1 5.5 3H12v17H5.5A2.5 2.5 0 0 0 3 22z M21 5.5A2.5 2.5 0 0 0 18.5 3H12v17h6.5A2.5 2.5 0 0 1 21 22z',
  bed: 'M3 18V6 M3 15h18v6 M3 11h7a3 3 0 0 1 3 3v1 M13 15V9h5a3 3 0 0 1 3 3v3',
  ticket: 'M3 7a2 2 0 0 0 0 4v2a2 2 0 0 0 0 4v2h18v-2a2 2 0 0 1 0-4v-2a2 2 0 0 1 0-4V7z M12 7v2 M12 12v2 M12 17v1',
  coins: 'M12 7c4.4 0 8-1.6 8-3.5S16.4 0 12 0 4 1.6 4 3.5 7.6 7 12 7z M4 3.5v5C4 10.4 7.6 12 12 12s8-1.6 8-3.5v-5 M4 8.5v5C4 15.4 7.6 17 12 17 M4 13.5v5C4 20.4 7.6 22 12 22 M20 12v7 M16 15v4',
  arrowRight: 'M5 12h14 M13 6l6 6-6 6',
  languages: 'M4 5h12 M10 3v2 M7 5c0 5-2 8-5 10 M4 9c1 2 3 4 5 5 M14 21l4-10 4 10 M15.5 18h5',
  arrows: 'M7 7h13l-3-3 M20 7l-3 3 M17 17H4l3 3 M4 17l3-3',
  chart: 'M3 3v18h18 M7 14l4-4 4 3 6-7',
  piggy: 'M19 9c-1.5-3-5-4-8-3.5C7 6 5 8 5 11v4l-2 2v-5l2-2 M8 14h.01 M15 9h.01 M18 6l2-2 M6 17v2 M16 17v2 M5 12h14a2 2 0 0 0 2-2V9',
  plane: 'M2 12l20-8-6 17-3-7-7-2z M13 14l5-5',
  receipt: 'M5 3l2 2 2-2 2 2 2-2 2 2 2-2v18l-2-2-2 2-2-2-2 2-2-2-2 2z M8 9h8 M8 13h8 M8 17h5',
  settings: 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-1.7 2.9-.2-.1a1.7 1.7 0 0 0-1.8.2l-.2.1h-3.4l-.1-.2a1.7 1.7 0 0 0-1.5-1l-.2-.1-2.9-1.7.1-.2a1.7 1.7 0 0 0-.2-1.8l-.1-.2v-3.4l.2-.1a1.7 1.7 0 0 0 1-1.5l.1-.2 1.7-2.9.2.1a1.7 1.7 0 0 0 1.8-.2l.2-.1h3.4l.1.2a1.7 1.7 0 0 0 1.5 1l.2.1 2.9 1.7-.1.2a1.7 1.7 0 0 0 .2 1.8l.1.2z',
  plus: 'M12 5v14 M5 12h14',
  search: 'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z M21 21l-4.4-4.4',
  bell: 'M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9 M10 21h4',
  download: 'M12 3v12 M7 10l5 5 5-5 M4 20h16',
  upload: 'M12 15V3 M7 8l5-5 5 5 M4 20h16',
  edit: 'M12 20h9 M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4z',
  trash: 'M3 6h18 M8 6V4h8v2 M19 6l-1 15H6L5 6 M10 11v6 M14 11v6',
  chevron: 'M9 18l6-6-6-6',
  calendar: 'M4 5h16v16H4z M8 3v4 M16 3v4 M4 10h16',
  menu: 'M4 6h16 M4 12h16 M4 18h16',
  close: 'M18 6L6 18 M6 6l12 12',
  check: 'M5 12l4 4L19 6',
  moon: 'M20 14.5A8.5 8.5 0 0 1 9.5 4 8.5 8.5 0 1 0 20 14.5z',
  sun: 'M12 3v2 M12 19v2 M3 12h2 M19 12h2 M5.6 5.6L7 7 M17 17l1.4 1.4 M18.4 5.6 17 7 M7 17l-1.4 1.4 M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z',
  info: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z M12 11v6 M12 7h.01',
  arrowUp: 'M12 19V5 M5 12l7-7 7 7',
  arrowDown: 'M12 5v14 M5 12l7 7 7-7',
  filter: 'M4 5h16l-6 7v6l-4 2v-8z',
  globe: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z M2 12h20 M12 2a15 15 0 0 1 0 20 M12 2a15 15 0 0 0 0 20',
  cloud: 'M7 18a4 4 0 1 1 .7-7.9A5.5 5.5 0 0 1 18.5 9 4.5 4.5 0 1 1 18 18z',
  eye: 'M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z',
  eyeOff: 'M3 3l18 18 M10.6 10.6a2 2 0 0 0 2.8 2.8 M9.9 5.2A10.8 10.8 0 0 1 12 5c6.4 0 10 7 10 7a16 16 0 0 1-3.1 3.9 M6.2 6.2C3.6 8 2 12 2 12s3.6 7 10 7c1.4 0 2.7-.3 3.8-.8'
};

export function icon(name, size = 18, className = '') {
  const aliases = { 'arrow-down': 'arrowDown', 'arrow-up': 'arrowUp', 'shopping-bag': 'shoppingBag', 'book-open': 'bookOpen' };
  name = aliases[name] || name;

  // SVG elements must be created in the SVG namespace. document.createElement()
  // creates HTML elements, which causes browsers not to render the icon paths.
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  const attrs = {
    class: `icon ${className}`.trim(),
    viewBox: '0 0 24 24',
    width: size,
    height: size,
    fill: 'none',
    stroke: 'currentColor',
    'stroke-width': '1.8',
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round',
    'aria-hidden': 'true'
  };
  for (const [key, value] of Object.entries(attrs)) svg.setAttribute(key, String(value));

  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', ICONS[name] || ICONS.info);
  svg.append(path);
  return svg;
}

export function button(label, { variant = 'secondary', iconName, className = '', type = 'button', ...attrs } = {}) {
  const content = [];
  if (iconName) content.push(icon(iconName, 16));
  content.push(el('span', {}, label));
  return el('button', { class: `btn btn-${variant} ${className}`.trim(), type, ...attrs }, ...content);
}

export function badge(label, type = 'neutral') {
  return el('span', { class: `badge badge-${type}` }, label);
}

export function progressBar(percent, color = 'green') {
  const fill = el('span', { class: `progress-fill progress-${color}`, style: { width: `${clamp(percent, 0, 100)}%` } });
  return el('div', { class: 'progress-track', role: 'progressbar', 'aria-valuenow': Math.round(clamp(percent, 0, 100)), 'aria-valuemin': '0', 'aria-valuemax': '100' }, fill);
}

export function emptyState(title, message, iconName = 'wallet') {
  return el('div', { class: 'empty-state' }, icon(iconName, 30), el('strong', {}, title), el('p', {}, message));
}

export function field(label, input, hint = '') {
  return el('label', { class: 'field' }, el('span', { class: 'field-label' }, label), input, hint ? el('small', { class: 'field-hint' }, hint) : null);
}

export function makeInput(type, value = '', attrs = {}) {
  return el('input', { class: 'input', type, value, ...attrs });
}

export function makeSelect(options, value, attrs = {}) {
  const select = el('select', { class: 'input select', ...attrs });
  for (const option of options) {
    const item = el('option', { value: option.value, selected: option.value === value }, option.label);
    select.append(item);
  }
  return select;
}

export function safeNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}
