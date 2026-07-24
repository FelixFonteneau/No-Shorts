# No-Shorts

A lightweight Firefox extension that removes short-form video feeds — **YouTube Shorts** and **Facebook Reels** — so you can browse without the infinite-scroll bait.

No settings, no background processes, no data collection. It's a single content script that hides short-form content and redirects you away from it.

## Features

**On YouTube** (`*.youtube.com`):
- Removes Shorts from the homepage, search results, and watch history
- Removes the **Shorts** tab from the sidebar
- Removes the Shorts shelf (the horizontal scrolling row)
- Removes the Shorts panel from the watch page
- Blocks clicks on links to `/shorts/...`
- Redirects any `/shorts/...` URL back to the YouTube homepage — even if opened directly

**On Facebook** (`*.facebook.com`):
- Removes Reels sections from the feed
- Removes the Reels entries from the sidebar and top navigation
- Redirects any `/reel/...` URL back to the Facebook homepage

Because YouTube and Facebook are single-page apps that load content dynamically, the extension watches the page with a [`MutationObserver`](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver) and re-applies the cleanup whenever new content appears.

## Installation

See [INSTALL.md](INSTALL.md) for the full step-by-step guide. The short version:

1. Clone or download this repository
2. Open `about:debugging#/runtime/this-firefox` in Firefox
3. Click **Load Temporary Add-on…** and select `manifest.json`

> **Note:** Temporary add-ons are removed when Firefox restarts. For a permanent install, see the packaging section in [INSTALL.md](INSTALL.md).

## How it works

The entire extension is one content script, [`no-shorts.js`](no-shorts.js), injected into YouTube and Facebook pages. It finds short-form UI elements by their DOM selectors and removes them, and rewrites Shorts/Reels URLs back to each site's homepage.

For a detailed walkthrough of the code and how to extend it, see [DEVELOPMENT.md](DEVELOPMENT.md).

## Limitations

- **Selector fragility** — YouTube and Facebook change their markup regularly. When they do, some elements may reappear until the selectors are updated. Bug reports and PRs welcome.
- **Manifest V2** — the extension currently targets Manifest V2, which Firefox still supports but is deprecated ecosystem-wide. A Manifest V3 migration is a known TODO.
- **Desktop layouts** — selectors target the desktop sites (`www.youtube.com`, `www.facebook.com`); mobile web layouts (`m.youtube.com`) are not fully covered.

## Privacy

No-Shorts collects nothing, stores nothing, and talks to no servers. It runs entirely in your browser and only touches pages on `youtube.com` and `facebook.com`.

## License

[MIT](LICENSE) © 2025 Félix Fonteneau
