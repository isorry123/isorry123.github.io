# Watchbill Maker

A browser-based tool for building and rotating a watch, quarter & station bill. Manage your roster, track qualifications and under-instruction status, auto-rotate the watch schedule, swap out sick or incapacitated personnel, and print/save the bill as a PDF.

## Your data never leaves your device

This app has no server, no database, and no login. Everything you type — names, qualifications, the watchbill itself — is saved using your browser's built-in **local storage**, a small storage space every website has that only that website, in that specific browser, can read.

Concretely, that means:

- **Nothing is transmitted anywhere.** The app makes zero network requests once the page has loaded — not to us, not to any analytics service, not to any third party. You can disconnect from the internet entirely and the app keeps working.
- **Even hosted on GitHub Pages, this holds true.** GitHub Pages is just serving static files (the same HTML/CSS/JS you could run from your own computer) — it has no backend that could receive or store your roster data. GitHub's servers see the same thing any web host sees for any page load (basic access logs like your IP address and the fact that you requested the page), but they never see your crew names, qualifications, or watchbill contents, because that data is never sent in a request in the first place.
- **Your data stays on this device, in this browser.** It won't show up if you open the app on your phone, on a different computer, or even in a different browser on the same computer (Chrome and Safari, for example, don't share storage). It's tied to one browser profile on one device.
- **Clearing your browser data will erase it.** If you clear your browsing data/cookies/site data for this page, or use a private/incognito window, your watchbill and roster will be wiped or won't persist. Use the **Export Backup (JSON)** button in the sidebar regularly if you've built out a roster you care about — see below.

## Backing up and restoring your data

Since your data lives only in this one browser, it's worth backing it up:

- **Export Backup (JSON)** (in the sidebar) downloads a single `.json` file containing your entire roster, stations, watch periods, and current watchbill assignments. Keep this file somewhere safe — email it to yourself, save it to a cloud drive, whatever you'd normally do with an important file.
- **Import Backup (JSON)** loads a previously exported file back into the app. This **replaces everything currently in the app**, so use it to restore a backup or to move your data to a different browser/device, not to merge two rosters together.

This export file is also the way to move your data between the GitHub Pages version and your own offline copy (see below) — they don't share storage, so export from one and import into the other.

## Getting your own offline copy

Yes — this is a plain HTML/CSS/JS app with no build step and no dependencies, so downloading your own copy is genuinely simple:

1. On the GitHub repo page, click the green **Code** button, then **Download ZIP**.
2. Unzip it anywhere on your computer.
3. Open `index.html` by double-clicking it. It opens in your default browser and just works — no server, no install, no internet connection required.

That local copy is completely independent from the GitHub Pages version — they don't share data (different browser storage, tied to the file's location), so think of the GitHub Pages link as the "always up to date, share with anyone" version, and your downloaded copy as your own private, fully offline instance.

## What this means for shared or public computers

Because the data lives in browser storage tied to that machine, anyone who uses the same browser profile on the same computer after you could open the page and see what you entered. If you're using this on a shared or public computer, use a private/incognito window (which won't save anything after you close it) or clear site data when you're done.
