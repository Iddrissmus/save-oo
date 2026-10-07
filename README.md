# Save-oo

A simple, private expense tracker for people who struggle to see where their money goes and to save. Track every spend to the last pesewa, see where it went, and get practical tips to spend less.

It is a **PWA**: install it on your phone and it works offline. Everything is stored **on your device**. There is no account and no server.

**Live app:** https://iddrissmus.github.io/save-oo/

---

## User guide

### Getting started
1. Open **Settings** and set your **monthly budget** and **savings goal**.
2. Tap the **+** button every time you spend money, ideally right away.
3. Add your income so Save-oo can show what you save.
4. Check **Home** and **Insights** once a day.

The same guide is inside the app: **Settings → How to use Save-oo**.

### Adding an expense
- Tap **+**, type the amount on the keypad, pick a category. A note is optional.
- The date defaults to today. Change it to log something you forgot (no future dates).
- Amounts are exact to the pesewa, for example `12.50`.
- To fix a mistake, open **History**, tap the entry, then edit or delete it.

### Adding income
- Tap **+**, switch the toggle from **Expense** to **Income**.
- Pick a source (Salary, Allowance, Business, Gift, Other) and enter the amount.
- Income is listed under **History → Income**, where it can be edited or deleted.

### Search and filters
- In **History**, type in the search box to match notes, category names or amounts (for example `trotro` or `12.50`).
- The filter button narrows by category or an amount range. Tick **Search all months** to look beyond the current month.
- The count and total always reflect what is shown, so you can answer "how much did I spend on X?" quickly.

### Recurring expenses
- For rent, data bundles and subscriptions: **Settings → Recurring expenses → Add**.
- Choose monthly or weekly and a first date. Save-oo adds the expense on every due date.
- If the app was closed on a due date, the missed ones are added next time you open it.
- Day 31 falls on the last day of shorter months.
- **Pause** stops it without back-filling on resume. **Delete** stops it for good, and expenses it already created stay in History (marked with a repeat icon).
- A first date in the past adds the missed ones immediately.

### Screens
| Screen | What it does |
|---|---|
| **Home** | Spent this month and today, budget left, a safe-to-spend amount per day, savings progress, your top tip, recent expenses. |
| **History** | All entries grouped by day with daily totals. Switch month, and switch between Expenses and Income. |
| **Insights** | Totals, average per day, daily chart, spending by category, and smart tips. |
| **Settings** | Name, budget and savings goal, categories, dark mode, backup and restore. |

### Smart tips
Worked out on your phone from your own spending, with plain statistics (no data leaves the device):
- **Overspending forecast:** will your pace break your budget by month end?
- **Running high:** a category well above your usual level.
- **Small spends:** many purchases under GH₵10 that add up.
- **Biggest category:** where a 10% trim frees the most money.
- **Weekday pattern:** the day you spend most on.
- **Savings rate:** your savings against a 20% of income target.

Tips need a few days of entries. Some also need an earlier month of data or your income.

### Categories
Settings → Categories lets you add your own with a name, icon and colour. A category can be deleted only when no expense uses it.

### Backup and restore (important)
Your data lives only in your browser's storage. Clearing site data or losing the phone erases it.
- **Settings → Your data → Backup** saves a `.json` file. Keep it somewhere safe.
- **Restore from backup** replaces everything on the device with that file.
- **CSV** exports a spreadsheet for Excel or Google Sheets.
- Home reminds you if you have not backed up in 7 days.

### Install on your phone
- **Android (Chrome):** menu → *Add to Home screen* or *Install app*.
- **iPhone (Safari):** Share → *Add to Home Screen* (must be Safari).

### Tips for actually saving
- Log every spend, including the small ones.
- Save on payday, before you spend. Treat it like a bill.
- Check the safe-to-spend amount each morning.
- Trim one category by 10% this month and keep it.

---

## For developers

**Stack:** Vite, React, TypeScript, Tailwind CSS 4, shadcn/ui, Lucide icons, Dexie (IndexedDB), React Router (hash routing), vite-plugin-pwa, Vitest.

**Design decisions**
- Local-first, no backend. Data is in IndexedDB.
- Money is stored as **integer pesewas**, never floats (`src/lib/money.ts`).
- Dates are local `YYYY-MM-DD` strings so days never shift with timezones (`src/lib/dates.ts`).
- Tips are pure functions in `src/lib/insights.ts`, covered by tests.

**Commands**
```bash
npm install
npm run dev       # start the dev server
npm run test      # unit tests
npm run lint
npm run build     # type-check and production build
```

**Layout**
```
src/
  db/          Dexie schema, repository functions, live-query hooks
  lib/         money, dates, stats, insights, keypad, backup (pure, tested)
  components/  shared UI (ui/ holds shadcn components)
  features/    home, add, history, insights, settings, help, onboarding
```

**Deploy:** pushing to `main` runs `.github/workflows/deploy.yml`, which builds and publishes to GitHub Pages (Settings → Pages → Source: GitHub Actions).
