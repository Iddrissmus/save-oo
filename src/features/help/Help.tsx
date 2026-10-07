import { ChevronDown, ChevronLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

interface Section {
  title: string
  body: React.ReactNode
}

const SECTIONS: Section[] = [
  {
    title: 'Getting started',
    body: (
      <ol className="list-decimal space-y-1 pl-5">
        <li>
          Open <b>Settings</b> and set your <b>monthly budget</b> and <b>savings goal</b>.
        </li>
        <li>
          Tap the <b>+</b> button every time you spend money. Do it right away, while you remember.
        </li>
        <li>Add your income (salary, allowance, anything you receive) so Save-oo can show what you save.</li>
        <li>Check Home and Insights once a day. That one habit is what makes saving possible.</li>
      </ol>
    ),
  },
  {
    title: 'Adding an expense',
    body: (
      <ul className="list-disc space-y-1 pl-5">
        <li>
          Tap <b>+</b>, type the amount on the keypad, and pick a category.
        </li>
        <li>Add a short note if you like, for example "trotro to work". Notes help you remember later.</li>
        <li>The date defaults to today. Change it to log something you forgot (future dates are not allowed).</li>
        <li>Amounts are exact to the pesewa, for example 12.50.</li>
        <li>
          To fix a mistake, open <b>History</b>, tap the entry, then change it or tap <b>Delete</b>.
        </li>
      </ul>
    ),
  },
  {
    title: 'Adding income',
    body: (
      <ul className="list-disc space-y-1 pl-5">
        <li>
          Tap <b>+</b>, then switch the toggle at the top from <b>Expense</b> to <b>Income</b>.
        </li>
        <li>Choose where it came from (Salary, Allowance, Business, Gift, Other), then enter the amount.</li>
        <li>
          Income appears under <b>History → Income</b>, where you can edit or delete it.
        </li>
      </ul>
    ),
  },
  {
    title: 'Recurring expenses',
    body: (
      <ul className="list-disc space-y-1 pl-5">
        <li>
          For things you pay on a schedule (rent, data bundles, subscriptions), open{' '}
          <b>Settings → Recurring expenses</b> and add them once.
        </li>
        <li>Choose monthly or weekly and the first date. Save-oo then adds the expense for you on each due date.</li>
        <li>If you do not open the app for a while, the missed ones are added the next time you do.</li>
        <li>A day like the 31st falls on the last day of shorter months.</li>
        <li>
          Use <b>Pause</b> for a break (nothing is back-filled when you resume), or <b>Delete</b> to stop it. Expenses
          already created stay in your history, marked with a small repeat icon.
        </li>
        <li>Picking a first date in the past adds the missed ones straight away.</li>
      </ul>
    ),
  },
  {
    title: 'The Home screen',
    body: (
      <ul className="list-disc space-y-1 pl-5">
        <li>
          The teal card shows what you have <b>spent this month</b> and <b>today</b>.
        </li>
        <li>
          With a budget set, it shows how much is <b>left</b> and a <b>safe-to-spend amount per day</b> for the rest of the
          month.
        </li>
        <li>
          <b>Savings this month</b> shows income, spending and what you saved, plus progress to your savings goal.
        </li>
        <li>
          <b>For you</b> shows your most important tip. Open Insights for the rest.
        </li>
      </ul>
    ),
  },
  {
    title: 'History',
    body: (
      <ul className="list-disc space-y-1 pl-5">
        <li>Every entry, grouped by day with a daily total.</li>
        <li>
          Use the arrows to look at earlier months. Switch between <b>Expenses</b> and <b>Income</b> at the top.
        </li>
        <li>Tap any entry to edit or delete it.</li>
      </ul>
    ),
  },
  {
    title: 'Insights and smart tips',
    body: (
      <>
        <p className="mb-2">
          Insights shows your totals, average per day, a daily chart and a breakdown of where your money went. The{' '}
          <b>Smart tips</b> at the top are worked out from your own spending:
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <b>Overspending forecast:</b> whether your pace will break your budget by month end.
          </li>
          <li>
            <b>Running high:</b> a category that is well above your usual level.
          </li>
          <li>
            <b>Small spends:</b> lots of little purchases under GH₵10 that add up.
          </li>
          <li>
            <b>Biggest category:</b> where trimming 10% would free up the most.
          </li>
          <li>
            <b>Weekday pattern:</b> the day you spend most on.
          </li>
          <li>
            <b>Savings rate:</b> how much of your income you keep, against a 20% target.
          </li>
        </ul>
        <p className="mt-2 text-muted-foreground">
          Tips need a few days of entries to appear, and some need an earlier month or your income. They are calculated on
          your phone. Nothing is sent anywhere.
        </p>
      </>
    ),
  },
  {
    title: 'Budget and savings goal',
    body: (
      <ul className="list-disc space-y-1 pl-5">
        <li>
          Set both in <b>Settings → Budget &amp; savings</b>.
        </li>
        <li>The budget is the most you plan to spend in a month. The goal is how much you want to save each month.</li>
        <li>A realistic start: save 10 to 20% of your income, then raise it as it gets easier.</li>
      </ul>
    ),
  },
  {
    title: 'Categories',
    body: (
      <ul className="list-disc space-y-1 pl-5">
        <li>
          In <b>Settings → Categories</b> you can add your own, with a name, an icon and a colour.
        </li>
        <li>A category can only be deleted when no expenses use it.</li>
      </ul>
    ),
  },
  {
    title: 'Backup and restore (important)',
    body: (
      <ul className="list-disc space-y-1 pl-5">
        <li>
          <b>Your data is stored only on this device.</b> Clearing the browser's site data, or losing the phone, erases it.
        </li>
        <li>
          In <b>Settings → Your data</b>, tap <b>Backup</b> to save a file. Keep it somewhere safe, such as email or cloud
          storage.
        </li>
        <li>
          <b>Restore from backup</b> replaces everything on the device with the file, so use it on a new phone or after a
          reset.
        </li>
        <li>
          <b>CSV</b> exports a spreadsheet you can open in Excel or Google Sheets.
        </li>
        <li>Home reminds you if you have not backed up for a week.</li>
      </ul>
    ),
  },
  {
    title: 'Install on your phone',
    body: (
      <ul className="list-disc space-y-1 pl-5">
        <li>
          <b>Android (Chrome):</b> menu (⋮) → <b>Add to Home screen</b> or <b>Install app</b>.
        </li>
        <li>
          <b>iPhone (Safari):</b> Share button → <b>Add to Home Screen</b>. It must be Safari.
        </li>
        <li>Once installed it opens like an app and works without internet.</li>
      </ul>
    ),
  },
  {
    title: 'Tips for actually saving',
    body: (
      <ul className="list-disc space-y-1 pl-5">
        <li>Log every spend, even small ones. The small ones are usually where the money leaks.</li>
        <li>Set aside your savings on payday, before spending. Treat it like a bill.</li>
        <li>Check "safe to spend per day" in the morning, and aim to finish the day under it.</li>
        <li>Pick one category from your tips and trim it by 10% this month. Small changes you keep beat big ones you drop.</li>
      </ul>
    ),
  },
  {
    title: 'Privacy',
    body: (
      <p>
        There is no account and no server. Your entries stay in this browser's storage, and nothing is uploaded. That also
        means there is no cloud copy, which is why backups matter.
      </p>
    ),
  },
]

export default function Help() {
  return (
    <main className="space-y-4 p-5">
      <header className="space-y-1">
        <Link to="/settings" className="-ml-1 inline-flex items-center text-sm text-muted-foreground">
          <ChevronLeft className="size-4" /> Settings
        </Link>
        <h1 className="text-xl font-semibold">How to use Save-oo</h1>
        <p className="text-sm text-muted-foreground">Know where every pesewa goes. Tap a topic to read more.</p>
      </header>

      <div className="space-y-2">
        {SECTIONS.map((s, i) => (
          <details key={s.title} open={i === 0} className="group rounded-2xl bg-card shadow-sm">
            <summary className="flex cursor-pointer list-none items-center justify-between p-4 font-medium [&::-webkit-details-marker]:hidden">
              {s.title}
              <ChevronDown className="size-5 text-muted-foreground transition-transform group-open:rotate-180" />
            </summary>
            <div className="px-4 pb-4 text-sm leading-relaxed">{s.body}</div>
          </details>
        ))}
      </div>
    </main>
  )
}
