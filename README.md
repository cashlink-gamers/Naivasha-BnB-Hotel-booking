# Naivasha Stays — deploy to Vercel

Guests browse rooms with photos, request a booking, and pay you directly
via M-Pesa Paybill. You manage listings, payment details, revenue, and
your admin passcode — all from inside the site itself.

## What's in this folder
- `index.html` — the whole site (browse page + admin panel)
- `api/listings.js` — stores/reads your room listings
- `api/settings.js` — stores/reads your paybill + account number
- `api/bookings.js` — stores booking requests, lets you mark them paid
- `api/admin-auth.js` — passcode setup / login / change, hashed and
  stored in your database — never written anywhere in the code
- `lib/auth.js` — shared password-hashing helper

## 1. Create a free Vercel account
Go to vercel.com and sign up (GitHub sign-in is easiest).

## 2. Deploy this project
Without GitHub:
1. Install Node.js if needed (nodejs.org).
2. `npm install -g vercel`
3. Open a terminal in this folder and run `vercel`, follow the prompts.
4. Once it works, run `vercel --prod` for your permanent link.

With GitHub: push this folder to a new repo, then on vercel.com choose
"Add New Project" → "Import Git Repository" and select it.

## 3. Add storage (Vercel KV)
Listings, bookings, settings, and your passcode all live here — without
this step nothing will save.
1. In your Vercel project, open the **Storage** tab.
2. **Create Database** → **KV** → connect it to this project.
3. Redeploy (`vercel --prod` again, or Vercel will prompt you).

## 4. Set your admin passcode — no Vercel settings needed
1. Visit your live link and click **Admin**.
2. Since no passcode exists yet, you'll see **"Create your admin
   passcode"** right there on the page — type one in (8+ characters)
   and confirm it. That's it — you're in.
3. Anytime after that, you can change it from **Admin → Change
   passcode** at the bottom of the dashboard, using your current
   passcode plus a new one. It's stored as a salted hash in your
   database, never in plain text anywhere.

Pick something long and not guessable — a phrase only you'd know works
well, e.g. three unrelated words strung together.

## 5. Using it day to day
- **Payment settings** — your Paybill (545542) and account number
  (385091), editable any time.
- **Add a new listing** — name, price, location, description, up to 6
  photos.
- **Booking requests** — every submission shows name, phone, dates,
  and total. Tap **Mark as paid** once you've confirmed the M-Pesa
  payment against your statement.
- **Revenue by listing** — automatically totals, per Airbnb/hotel: how
  many bookings, amount requested, amount actually paid (only counts
  ones you've marked paid), your 10% commission, and what's owed to
  the host. A grand total row sits at the bottom.

## A note on payments
Guests pay your Paybill manually and submit the form — the site can't
auto-detect the payment landing, so "paid" only updates when you tap
the toggle after checking your M-Pesa statement. Automatic payment
confirmation would need Safaricom's Daraja API (STK push), which is a
separate, bigger integration on top of this.
