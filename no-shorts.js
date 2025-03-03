function removeYouTubeShorts() {
    // Remove shorts from homepage/search results
    const shortElements = document.querySelectorAll('ytd-video-renderer');
    shortElements.forEach(element => {
        const href = element.querySelector('a#thumbnail')?.href;
        if (href && href.includes('/shorts/')) {
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
    // Prevent opening YouTube Shorts URLs
    const shortsRedirect = document.querySelector('a[href*="/shorts/"]');
    if (shortsRedirect) {
        shortsRedirect.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
        });
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

    // Remove reels button from top navigation
    const reelsNav = document.querySelector('a[href="/reel/"]')?.parentElement;
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
