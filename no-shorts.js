function removeYouTubeShorts() {
    // Remove shorts from homepage/search results
    const shortElements = document.querySelectorAll('ytd-video-renderer');
    shortElements.forEach(element => {
        const href = element.querySelector('a#thumbnail')?.href;
        if (href && href.includes('/shorts')) {
            element.remove();
        }
    });

    // Remove shorts tab from sidebar
    const shortsTab = document.querySelector('ytd-guide-entry-renderer a[title="Shorts"]')?.closest('ytd-guide-entry-renderer');
    if (shortsTab) {
        shortsTab.remove();
    }

    // Remove shorts shelf (horizontal scrolling shorts)
    const shortsShelf = document.querySelector('ytd-rich-shelf-renderer[is-shorts]');
    if (shortsShelf) {
        shortsShelf.remove();
    }

    // Remove shorts from history page
    const historyShorts = document.querySelectorAll('ytd-video-renderer');
    historyShorts.forEach(element => {
        const href = element.querySelector('a#thumbnail')?.href;
        if (href && href.includes('/shorts')) {
            element.remove();
        }
    });

    // Remove shorts panel from watch page
    const shortsPanel = document.querySelector('ytd-reel-shelf-renderer h2 span#title');
    if (shortsPanel?.textContent.trim() === 'Shorts') {
        shortsPanel.closest('ytd-reel-shelf-renderer').remove();
    }

    // Prevent opening YouTube Shorts URLs
    const shortsRedirect = document.querySelector('a[href*="/shorts/"]');
    if (shortsRedirect) {
        shortsRedirect.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
        });
    }

    // Redirect YouTube Shorts URLs to main YouTube page
    if (window.location.pathname.startsWith('/shorts/')) {
        window.history.pushState({}, '', 'https://www.youtube.com');
        window.location.reload();
    }
}


function removeFacebookReels() {
    // Remove reels sections
    const reelsElements = document.querySelectorAll('[aria-label="Reels"]');
    reelsElements.forEach(element => {
        element.remove();
    });

    // Remove reels from sidebar
    const reelsSidebar = document.querySelector('a[href="/reel/?tab="]')?.parentElement;
    if (reelsSidebar) {
        reelsSidebar.remove();
    }

    // Redirect Facebook Reels URLs to main Facebook page
    if (window.location.pathname.startsWith('/reel/')) {
        window.history.pushState({}, '', 'https://www.facebook.com');
        window.location.reload();
    }

    // Remove reels button from top navigation
    const reelsNav = document.querySelector('a[href="/reel"]')?.parentElement;
    if (reelsNav) {
        reelsNav.remove();
    }
}


function removeInstagramReels() {
    // Redirect reels URLs (/reels/..., /reels, legacy /reel/...) to the main Instagram page
    const path = window.location.pathname;
    if (path.startsWith('/reels') || path.startsWith('/reel/')) {
        window.history.pushState({}, '', 'https://www.instagram.com');
        window.location.reload();
        return;
    }

    // Redirect a profile's reels tab URL (/<user>/reels/) to the profile itself
    const profileReels = path.match(/^\/([^/]+)\/reels\/?$/);
    if (profileReels) {
        window.history.pushState({}, '', 'https://www.instagram.com/' + profileReels[1] + '/');
        window.location.reload();
        return;
    }

    // Remove reel posts from the feed: their thumbnail anchor links to /reels/<id>
    // (regular posts link to /p/<id>). closest('article') is the post container.
    document.querySelectorAll('a[href^="/reels/"], a[href^="/reel/"]').forEach(link => {
        const post = link.closest('article');
        if (post) {
            post.remove();
        } else if (path.startsWith('/explore')) {
            // Explore grid: reel tiles are bare anchors with no article wrapper
            link.remove();
        }
    });

    // Remove the reels button from the sidebar navigation
    const reelsNav = document.querySelector('a[href="/reels/"]')?.parentElement;
    if (reelsNav) {
        reelsNav.remove();
    }

    // Remove the reels tab from profile pages (/<user>/reels/ tab link)
    const profileReelsTabs = document.querySelectorAll('a[href$="/reels/"]:not([href="/reels/"])');
    profileReelsTabs.forEach(tab => {
        tab.remove();
    });
}


// Dispatch to the right site's cleanup. Facebook and Instagram both use /reel/
// URLs, so cleanups must never run cross-site (a hostname mismatch would
// redirect to the wrong site).
function removeShortFormContent() {
    if (window.location.hostname.endsWith('youtube.com')) {
        removeYouTubeShorts();
    } else if (window.location.hostname.endsWith('facebook.com')) {
        removeFacebookReels();
    } else if (window.location.hostname.endsWith('instagram.com')) {
        removeInstagramReels();
    }
}

// Run initially and set up observer for dynamic content
removeShortFormContent();

const observer = new MutationObserver(removeShortFormContent);

observer.observe(document.body, {
    childList: true,
    subtree: true
});
