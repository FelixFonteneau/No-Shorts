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


// Run initially and set up observer for dynamic content
removeYouTubeShorts();
removeFacebookReels();

const observer = new MutationObserver(() => {
    if (window.location.hostname === 'www.youtube.com') {
        removeYouTubeShorts();
    } else if (window.location.hostname === 'www.facebook.com') {
        removeFacebookReels();
    }
});

observer.observe(document.body, {
    childList: true,
    subtree: true
});
