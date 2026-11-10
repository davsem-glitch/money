# Monee — Personal Money Management PWA

A Khmer-first personal finance app built with HTML, CSS, vanilla JavaScript modules, LocalStorage, and a service worker. No frontend framework or backend is required.

## Run locally

PWA features require `localhost` or HTTPS. Do not open `index.html` directly with `file://`.

Using Python:

```bash
cd money-management-app
python -m http.server 8000
```

Then visit <http://localhost:8000>.

Or use any static file server that serves the project directory over localhost/HTTPS.

## New usability features

- Export the currently filtered transaction list to CSV from the Transactions page. The CSV includes date, type, category, description, amount, currency, payment method, trip and bill details.
- Sort transactions by newest, oldest, highest amount or lowest amount.
- Use **Ctrl/Cmd + K** to jump to transaction search from anywhere in the app.
- Toggle privacy mode from the top bar to temporarily hide visible money amounts while viewing the app. This is a screen-privacy aid, not encryption.
- Clear all transaction filters with one click.
- Use the teal color theme, clearer category icons, and icon labels for important actions.
- Switch between Khmer and English; the language control shows the active language and all connection/storage labels are localized.
- Navigation refreshes the selected page correctly and closes the mobile drawer after a selection.

## Install

- **Android / desktop Chromium browsers:** open the app over localhost or HTTPS. Use the **Install app** button when the browser exposes the install prompt. If it does not, open the browser menu and choose **Install app** or **Add to Home screen**.
- **iPhone / iPad:** open the app in Safari, tap Share, then **Add to Home Screen**.
- The app shell is cached after the first successful load. Previously saved data is kept in that browser's LocalStorage.

## Data and currency notes

- Data is stored locally in the current browser profile on the current device. There is no cloud sync or automatic cross-device sync.
- Use Settings → Export backup (JSON) regularly. Import replaces the current local data after confirmation.
- Changing USD/KHR changes the display currency only. It does not convert saved amounts using an exchange rate. Keep one currency for a dataset, or export a backup before changing the label.
- LocalStorage is not encrypted. Do not treat this as a bank account or store highly sensitive financial credentials.

## Financial rules used

- Cash available = opening balance + income − expenses − savings deposits + savings withdrawals.
- Total saved = savings deposits − savings withdrawals.
- Total money = cash available + total saved.
- Savings deposits and withdrawals are tracked separately and are not counted as expenses.
- Paying a bill creates one linked expense transaction. Deleting the transaction reopens the bill; deleting a paid bill keeps the historical expense unlinked.
- Trip expenses are ordinary expense transactions with a trip ID, so they are included once in total expenses and also counted in the trip's actual spend.

## Manual test checklist

1. Add income and confirm total income, cash available, and total money increase.
2. Add an expense and confirm cash available and total money decrease.
3. Create a savings goal, deposit money, and confirm cash available decreases while total saved rises and total money stays unchanged.
4. Withdraw from a goal and confirm cash available rises while total saved falls and total money stays unchanged.
5. Create a monthly/category budget; add an expense in that category and verify progress and 80%/100% warnings.
6. Create a trip; add a trip expense and verify the trip's spent amount and overall expenses both rise once.
7. Create a bill and mark it paid; verify it creates one expense. Delete that expense and confirm the bill becomes unpaid.
8. Edit and delete transactions, budgets, goals, trips, and bills.
9. Switch Khmer/English and light/dark themes.
10. Export JSON, reset data, then import the backup and verify records return.
11. Refresh the page and verify LocalStorage data remains.
12. Load once online, then switch offline and verify the app shell still opens.
13. Install from a supported browser and verify standalone launch.

## Version 1.3 improvements

- Correctly calculate projected cash when an existing income or expense is edited, including converting income to expense.
- Keep bill-paid records linked to their matching expense when importing a backup; repair stale trip/bill references safely.
- Improve modal accessibility with dialog semantics, keyboard focus trapping, Escape support and focus restoration.
- Improve mobile navigation state, keyboard feedback, responsive spacing and reduced-motion support.
- Localize report month labels to match the selected language.
- Keep the install button state accurate when a user dismisses the browser install prompt.
- Add automated regression tests for balances, budgets, savings, trips, bills and backup integrity.

## Version 1.4 improvements

- Replace the placeholder launcher artwork with a recognizable wallet icon and provide clear Android and iPhone installation steps.
- Bump the service-worker cache so existing installs receive the updated app shell.

## Version 1.5 improvements

- Refresh the launcher and browser icons with a brighter blue wallet mark and align the sidebar brand with the app icon.
- Version the icon files so browsers fetch the refreshed artwork.

Run the automated tests with:

```bash
npm test
```

## Important limitations

Monee is a local-first personal money tracker, not a bank application. It does not provide accounts, authentication, server-side storage, encryption at rest or cross-device synchronization. LocalStorage data can be viewed or cleared by anyone with access to the same browser profile. Use a device lock, keep JSON backups in a safe place, and do not store bank passwords, card numbers or other credentials in the app.

## Updating the app

When changing the app shell, increment `CACHE_NAME` in `service-worker.js` (for example `monee-shell-v2`) so clients receive a new cached version.
