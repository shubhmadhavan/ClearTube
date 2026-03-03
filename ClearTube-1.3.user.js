// ==UserScript==
// @name         ClearTube/ Shutube
// @namespace    http://tampermonkey.net/
// @version      1.3
// @description  To hide distracting elements in YouTube UI (Recommendations, Home Page Header, Shorts Sidebar, Chat, Donations, Comments.
// @author       Shubh Madhavan
// @match        *://www.youtube.com/*
// @grant        GM_registerMenuCommand
// @grant        GM_unregisterMenuCommand
// @icon         https://www.google.com/s2/favicons?sz=64&domain=youtube.com
// ==/UserScript==

(function () {
    'use strict';

    const STORAGE_KEY = 'unhook_toggles';

    const defaultToggles = {
        'Disable Home Page Recommendations': {
            selector: 'ytd-rich-grid-renderer.style-scope.ytd-two-column-browse-results-renderer[is-default-grid] #contents.style-scope.ytd-rich-grid-renderer',
            enabled: true
        },
        'Disable Videos Tab on Channel Pages': {
            selector: 'ytd-rich-grid-renderer.style-scope.ytd-two-column-browse-results-renderer[is-slim-grid] #contents.style-scope.ytd-rich-grid-renderer',
            enabled: false
        },
        'Disable Sidebar': {
            selector: '#guide-renderer',
            enabled: true
        },
        'Disable Tags/Categories':{
            selector: '.style-scope.ytd-browse.grid.grid-disabled > #primary.style-scope.ytd-two-column-browse-results-renderer > .style-scope.ytd-two-column-browse-results-renderer > #header .ytd-feed-filter-chip-bar-renderer',
            enabled: true
        },
        'Disable Live Chat': {
            selector: '#chat-container',
            enabled: false
        },
        'Disable Donations': {
            selector: '#donation-shelf',
            enabled: false
        },
        'Disable Recommendations': {
            selector: '#related, #secondary.style-scope.ytd-watch-flexy',
//            selector:  'ytd-item-section-renderer.style-scope.ytd-watch-next-secondary-results-renderer[lockup-container-type="3"][enable-anchored-panel][section-identifier="sid-wn-chips"][header-style=""]',
            enabled: false
        },
        'Disable Comments': {
            selector: '#comments',
            enabled: false
        },
        'Disable Shorts Sidebar Recommendations': {
            selector: '.style-scope ytd-reel-shelf-renderer',
            enabled: true
        }
    };

    const loadSettings = () => {
        try {
            const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
            if (saved && typeof saved === 'object') {
                for (const key in defaultToggles) {
                    if (saved.hasOwnProperty(key)) {
                        defaultToggles[key].enabled = saved[key].enabled;
                    }
                }
            }
        } catch (e) {
            console.error('Failed to load Unhook settings:', e);
        }
    };

    const saveSettings = () => {
        const toSave = {};
        for (const key in defaultToggles) {
            toSave[key] = { enabled: defaultToggles[key].enabled };
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    };

    const toggles = defaultToggles;
    let menuIDs = {};
    const styleTag = document.createElement('style');
    styleTag.id = 'unhook-style';
    document.head.appendChild(styleTag);

    const updateStyles = () => {
        let css = '';
        for (const key in toggles) {
            if (toggles[key].enabled) {
                css += `${toggles[key].selector} { display: none !important; }\n`;
            }
        }
        styleTag.textContent = css;
    };

    const refreshMenu = () => {
        for (const id in menuIDs) {
            GM_unregisterMenuCommand(menuIDs[id]);
        }
        menuIDs = {};
        for (const label in toggles) {
            const title = `${label}: ${toggles[label].enabled ? 'ON' : 'OFF'}`;
            const id = GM_registerMenuCommand(title, () => {
                toggles[label].enabled = !toggles[label].enabled;
                updateStyles();
                saveSettings();
                refreshMenu();
            });
            menuIDs[label] = id;
        }
    };

    loadSettings();
    updateStyles();
    refreshMenu();
})();
