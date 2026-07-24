# Development guide

Technical documentation for working on No-Shorts: how the code is structured, how each removal works, and how to update selectors or add support for a new site.

## Project layout

```
No-Shorts/
├── manifest.json     # WebExtension manifest (Manifest V2)
├── no-shorts.js      # The entire extension: one content script
├── icons/
│   └── icon-48.png   # Extension icon
├── reelInFeed.html   # Reference fixture: captured markup of an Instagram reel post in the feed
├── README.md         # User-facing overview
├── INSTALL.md        # Install & packaging guide
└── DEVELOPMENT.md    # This file
```

There is no build step, no dependencies, and no background script. `manifest.json` declares a single content script injected into all pages on `*.youtube.com`, `*.facebook.com`, and `*.instagram.com`.

## Architecture

`no-shorts.js` has three parts:

1. **One removal function per site** — `removeYouTubeShorts()`, `removeFacebookReels()`, `removeInstagramReels()`
2. **`removeShortFormContent()`** — a dispatcher that picks the removal function matching `location.hostname`
3. **A `MutationObserver`** — re-runs the dispatcher whenever the DOM changes

The observer is the key piece: all three sites are single-page apps that render content asynchronously and re-render on in-app navigation, so running the cleanup once at injection time isn't enough. The observer watches `document.body` with `{ childList: true, subtree: true }` and calls the dispatcher on every mutation batch. All removal functions are therefore written to be **idempotent** — safe to call repeatedly, whether or not their targets exist.

The hostname dispatch is not just an optimization — it's a correctness requirement: Facebook and Instagram both use `/reel/` URL paths, so running a cleanup on the wrong site would redirect the user to the wrong domain.

### The removal pattern

Every removal follows the same shape: *find element(s) by selector → remove if present*. Optional chaining (`?.`) keeps each block safe when the target isn't on the current page:

```js
const shortsTab = document.querySelector('ytd-guide-entry-renderer a[title="Shorts"]')
    ?.closest('ytd-guide-entry-renderer');
if (shortsTab) {
    shortsTab.remove();
}
```

## What each block does

### YouTube (`removeYouTubeShorts`)

| Target | Selector strategy |
|---|---|
| Shorts in feed / search / history | Every `ytd-video-renderer` whose `a#thumbnail` href contains `/shorts` |
| Sidebar "Shorts" tab | `ytd-guide-entry-renderer a[title="Shorts"]`, then `closest()` to remove the whole entry |
| Shorts shelf (horizontal row) | `ytd-rich-shelf-renderer[is-shorts]` attribute |
| Shorts panel on watch pages | `ytd-reel-shelf-renderer` whose `h2 span#title` text is exactly `Shorts` |
| Clicking a shorts link | Adds a click handler to an `a[href*="/shorts/"]` that calls `preventDefault()` |
| Direct navigation to `/shorts/...` | If `location.pathname` starts with `/shorts/`, pushes `https://www.youtube.com` into history and reloads |

Notes:
- YouTube uses custom elements (`ytd-*` tags), which are relatively stable identifiers compared to class names.
- The watch-page panel check matches on the **English** heading text `Shorts`; the attribute-based `[is-shorts]` selector is language-independent and preferred where available.

### Facebook (`removeFacebookReels`)

| Target | Selector strategy |
|---|---|
| Reels sections in the feed | `[aria-label="Reels"]` |
| Sidebar Reels entry | `a[href="/reel/?tab="]`, then `.parentElement` |
| Top-nav Reels button | `a[href="/reel"]`, then `.parentElement` |
| Direct navigation to `/reel/...` | Same pushState-and-reload redirect as YouTube |

Notes:
- Facebook's class names are obfuscated and change constantly, so selectors rely on **`aria-label` attributes and `href` patterns** — the only stable hooks available. `aria-label` values are locale-dependent (`"Reels"` is the English label).

### Instagram (`removeInstagramReels`)

| Target | Selector strategy |
|---|---|
| Direct navigation to `/reels/...`, `/reels`, or legacy `/reel/...` | `location.pathname` prefix check → redirect to the homepage |
| Direct navigation to a profile's Reels tab (`/<user>/reels/`) | Regex `^\/([^/]+)\/reels\/?$` → redirect to the profile (`/<user>/`) |
| Reel posts in the home feed | Any `a[href^="/reels/"]` or `a[href^="/reel/"]`, then `closest('article')` to remove the whole post |
| Reel tiles in the Explore grid | Same anchors, but no `article` wrapper exists there — remove the anchor itself (only when on `/explore`) |
| Sidebar "Reels" nav button | `a[href="/reels/"]`, then `.parentElement` (href-based → locale-independent) |
| Reels tab on profile pages | `a[href$="/reels/"]:not([href="/reels/"])` — ends-with matches the profile tab, the `:not` excludes the sidebar link |

Notes:
- Instagram's class names are obfuscated (`x78zum5`-style) exactly like Facebook's — selectors rely entirely on `href` patterns.
- The discriminator between a reel post and a regular post in the feed: the media thumbnail anchor links to `/reels/<id>/` for reels vs `/p/<id>/` for regular posts. See `reelInFeed.html` for a captured example.
- Reel posts also contain an `/reels/audio/...` "Original audio" link; it lives inside the same `article`, so the feed loop removes it along with the post.
- Hrefs in the DOM are relative and carry query params (e.g. `/reels/DYxWuMMpyXb/?hl=en`). Attribute selectors (`[href^=...]`) match the raw attribute value, which is what we want — don't compare against the `element.href` property, which is absolutized.

### The redirect trick

```js
if (window.location.pathname.startsWith('/shorts/')) {
    window.history.pushState({}, '', 'https://www.youtube.com');
    window.location.reload();
}
```

Directly setting `window.location.href` can be raced/overridden by the site's own router. Pushing the new URL into history first, then reloading, forces a clean full-page load of the homepage. It runs both at injection time (catches URLs opened directly) and from the observer (catches in-app navigation to a short).

## Fixing broken selectors

This is the most common maintenance task — YouTube and Facebook change their markup regularly.

1. Load the extension temporarily (see [INSTALL.md](INSTALL.md)) and open the affected page.
2. Right-click the element that should have been removed → **Inspect**.
3. Find a stable hook, in order of preference:
   - **Custom element tag names** (`ytd-…`) on YouTube — most stable
   - **Attributes** like `[is-shorts]`, `aria-label`, or `href` patterns
   - **Never** obfuscated class names (`.x1n2onr6`-style on Facebook/Instagram) — they rotate
4. Update the selector in `no-shorts.js`, click **Reload** in `about:debugging`, and refresh the page.
5. Test on: YouTube homepage, search results, a watch page, the history page, and a direct `/shorts/<id>` URL. For Facebook: the feed, and a direct `/reel/<id>` URL. For Instagram: the home feed, the sidebar, the Explore page, a profile page, and direct `/reels/<id>` and `/<user>/reels/` URLs.

Debugging tip: content-script `console.log` output appears in the page's regular devtools console (the script runs in the page context's isolated world).

## Adding support for a new site

1. Add the match pattern to `manifest.json`:

   ```json
   "matches": ["*://*.youtube.com/*", "*://*.facebook.com/*", "*://*.newsite.com/*"]
   ```

2. Write a `removeNewSiteShorts()` function in `no-shorts.js` following the same idempotent find-and-remove pattern.
3. Add a hostname branch for it in `removeShortFormContent()` — never call it unconditionally; URL paths collide across sites (Facebook and Instagram both use `/reel/`), so a cleanup running on the wrong site can redirect to the wrong domain.

## Known issues / TODOs

- **No debouncing** — the observer callback runs the full removal pass on every mutation batch. Fine in practice, but a `requestIdleCallback`/debounce wrapper would reduce overhead on busy pages.
- **Click-blocking only binds one link** — the `a[href*="/shorts/"]` click handler uses `querySelector` (first match only) and can attach duplicate listeners across observer runs. The URL redirect acts as the safety net.
- **Locale sensitivity** — the `Shorts` heading text and `Reels` aria-label checks assume English UI.
- **Manifest V2** — still supported by Firefox but deprecated; migrating to Manifest V3 mostly means bumping `manifest_version` and re-testing (content scripts carry over largely unchanged).

## Release checklist

1. Bump `"version"` in `manifest.json`
2. Manually test the full checklist in [Fixing broken selectors](#fixing-broken-selectors) step 5
3. Package and sign (see [INSTALL.md](INSTALL.md))
