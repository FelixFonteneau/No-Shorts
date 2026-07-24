# Installing No-Shorts

There are two ways to run the extension: a **temporary install** (quick, resets when Firefox restarts — best for trying it out or developing) and a **packaged install** (permanent).

## Option 1: Temporary install (development)

1. **Get the code**

   ```sh
   git clone https://github.com/FelixFonteneau/No-Shorts.git
   ```

   …or download the repository as a ZIP from GitHub and extract it.

2. **Open the Firefox debugging page**

   Type `about:debugging#/runtime/this-firefox` into the address bar and press Enter.

3. **Load the extension**

   Click **Load Temporary Add-on…**, navigate to the cloned folder, and select `manifest.json`.

4. **Verify it works**

   Open [youtube.com](https://www.youtube.com) — the **Shorts** tab should be gone from the sidebar and no Shorts should appear in the feed. On [facebook.com](https://www.facebook.com), Reels sections should be gone. On [instagram.com](https://www.instagram.com), the **Reels** sidebar button should be gone and no reel posts should appear in the feed.

> ⚠️ Temporary add-ons are unloaded every time Firefox closes. You'll need to repeat step 3 after a restart, or use a packaged install below.

### Reloading after code changes

While developing, edit `no-shorts.js`, then go back to `about:debugging#/runtime/this-firefox` and click **Reload** next to the extension. Refresh the YouTube/Facebook tab to pick up the new script.

## Option 2: Packaged install (permanent)

Firefox (regular release) only runs permanently-installed extensions if they are **signed by Mozilla**. Two routes:

### A. Sign via addons.mozilla.org (AMO)

1. Create the package — from the repository root, zip the extension files (not the folder itself):

   ```sh
   zip -r no-shorts.zip manifest.json no-shorts.js icons/
   ```

2. Sign in at [addons.mozilla.org/developers](https://addons.mozilla.org/developers/) and submit the ZIP.
   - Choose **"On your own"** (self-distribution) if you don't want it listed publicly on AMO.
3. Once reviewed/signed, download the signed `.xpi` and install it by opening it in Firefox (**File → Open File**, or drag it onto a Firefox window).

Alternatively, [`web-ext`](https://extensionworkshop.com/documentation/develop/getting-started-with-web-ext/) automates building and signing:

```sh
npm install -g web-ext
web-ext build                     # produces the zip in web-ext-artifacts/
web-ext sign --api-key=... --api-secret=...   # signs via AMO API credentials
```

### B. Firefox Developer Edition / Nightly (unsigned)

If you use [Firefox Developer Edition](https://www.mozilla.org/firefox/developer/) or Nightly:

1. Open `about:config` and set `xpinstall.signatures.required` to `false`.
2. Zip the extension as above, rename it to `no-shorts.xpi`, and open it in Firefox.

This is not possible in regular release Firefox, which enforces signing.

## Uninstalling

Open `about:addons` (**≡ menu → Add-ons and themes**), find **No-Shorts**, and click **Remove**. Temporary add-ons can also be removed from `about:debugging`.

## Troubleshooting

| Symptom | Likely cause / fix |
|---|---|
| Shorts still visible after install | Refresh the tab — content scripts only inject into pages loaded after the extension is active. |
| Extension gone after restarting Firefox | You used a temporary install; load it again or use a packaged install. |
| Some Shorts/Reels elements reappear | YouTube/Facebook/Instagram changed their markup; the selectors in `no-shorts.js` need updating — see [DEVELOPMENT.md](DEVELOPMENT.md). |
| `.xpi` won't install ("could not be verified") | The package isn't signed; use the AMO signing route or Developer Edition. |
