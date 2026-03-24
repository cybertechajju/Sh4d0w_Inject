/**
 * Sh4d0w Inject — Popup v3.1
 * State persistence via chrome.storage.local (direct, instant, reliable)
 * Multi-header toggles, excluded domains, on-demand fill
 */
document.addEventListener('DOMContentLoaded', async () => {
    const DB = window.BLINDXSS_PAYLOADS;
    let lastScanResult = null;
    let panelOpen = false;

    // =============================
    // INSTANT State Save — direct to storage.local
    // No message passing = no delays = survives popup close
    // =============================
    function saveState() {
        chrome.storage.local.set({
            popupState: {
                activeTab: document.querySelector('.tab.active')?.dataset.tab || 'fill',
                targetDomain: document.getElementById('targetDomain').value.trim(),
                lastScanResult,
                panelOpen
            }
        });
    }

    // Save on EVERY possible close event
    window.addEventListener('beforeunload', saveState);
    window.addEventListener('blur', saveState);
    window.addEventListener('pagehide', saveState);
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') saveState();
    });

    // =============================
    // Restore State (instant from storage.local)
    // =============================
    const stored = await chrome.storage.local.get(['popupState']);
    const s = stored.popupState || {};

    if (s.activeTab) switchTab(s.activeTab);
    if (s.targetDomain) document.getElementById('targetDomain').value = s.targetDomain;
    if (s.lastScanResult) {
        lastScanResult = s.lastScanResult;
        updateFieldSummary(s.lastScanResult);
    }
    if (s.activeTab === 'recon' && s.targetDomain) {
        generateDorks(s.targetDomain);
    }
    if (s.panelOpen) {
        panelOpen = true;
        document.getElementById('headerToggles').style.display = 'flex';
        document.getElementById('panelArrow').textContent = '▲';
    }

    // =============================
    // Server URL Setup
    // =============================
    chrome.storage.sync.get(['serverUrl'], (r) => {
        const url = r.serverUrl || '';
        document.getElementById('serverUrlInput').value = url;
        const status = document.getElementById('serverStatus');
        if (url) {
            status.textContent = '✅ Server configured';
            status.style.color = '#00ff41';
        } else {
            status.textContent = '⚠️ Set your blind XSS callback URL to get started';
            status.style.color = '#ff3e3e';
        }
    });

    document.getElementById('saveServerBtn').addEventListener('click', () => {
        const url = document.getElementById('serverUrlInput').value.trim();
        chrome.storage.sync.set({ serverUrl: url });
        const status = document.getElementById('serverStatus');
        if (url) {
            status.textContent = '✅ Server saved!';
            status.style.color = '#00ff41';
        } else {
            status.textContent = '⚠️ Server URL cleared';
            status.style.color = '#ff3e3e';
        }
    });

    document.getElementById('serverUrlInput').addEventListener('keypress', e => {
        if (e.key === 'Enter') document.getElementById('saveServerBtn').click();
    });

    // =============================
    // Tabs
    // =============================
    function switchTab(id) {
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        document.querySelector(`.tab[data-tab="${id}"]`)?.classList.add('active');
        document.getElementById(`tab-${id}`)?.classList.add('active');

        // Load tab-specific data
        if (id === 'history') loadHistory();
        if (id === 'exclude') loadExcludes();
    }

    document.querySelectorAll('.tab').forEach(t => {
        t.addEventListener('click', () => { switchTab(t.dataset.tab); saveState(); });
    });

    // =============================
    // Header Injection Panel
    // =============================
    const togglesEl = document.getElementById('headerToggles');
    const arrow = document.getElementById('panelArrow');

    document.getElementById('panelToggle').addEventListener('click', () => {
        panelOpen = !panelOpen;
        togglesEl.style.display = panelOpen ? 'flex' : 'none';
        arrow.textContent = panelOpen ? '▲' : '▼';
        saveState();
    });

    // Load header toggle states
    chrome.runtime.sendMessage({ action: 'getHeaderToggles' }, (r) => {
        updateHeaderUI(r?.toggles || {});
    });

    document.querySelectorAll('.ht-switch').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.dataset.header;
            const on = btn.querySelector('.ht-switch-text').textContent === 'OFF';
            btn.querySelector('.ht-switch-text').textContent = on ? '...' : 'OFF';
            chrome.runtime.sendMessage({ action: 'setHeaderToggle', headerId: id, enabled: on }, (r) => {
                if (r?.toggles) updateHeaderUI(r.toggles);
            });
        });
    });

    function updateHeaderUI(toggles) {
        let n = 0;
        document.querySelectorAll('.ht-switch').forEach(btn => {
            const id = btn.dataset.header;
            const on = toggles[id] || false;
            btn.querySelector('.ht-switch-text').textContent = on ? 'ON' : 'OFF';
            btn.classList.toggle('active', on);
            btn.closest('.header-toggle-item').classList.toggle('active', on);
            if (on) n++;
        });
        const ct = document.getElementById('headerCount');
        ct.textContent = n > 0 ? `${n} active` : '0 active';
        ct.style.color = n > 0 ? '#00ff41' : '';
        // Auto-expand if any active
        if (n > 0 && !panelOpen) {
            panelOpen = true;
            togglesEl.style.display = 'flex';
            arrow.textContent = '▲';
        }
    }

    // =============================
    // Scan
    // =============================
    document.getElementById('scanBtn').addEventListener('click', () => {
        const btn = document.getElementById('scanBtn');
        btn.disabled = true;
        btn.querySelector('.btn-text').textContent = 'Scanning...';
        chrome.runtime.sendMessage({ action: 'injectAndCount' }, (r) => {
            btn.disabled = false;
            btn.querySelector('.btn-text').textContent = 'Scan Page Fields';
            if (r && !r.error) {
                lastScanResult = r;
                updateFieldSummary(r);
                saveState(); // Save scan results immediately
            } else {
                document.getElementById('fieldSummary').innerHTML =
                    '<p class="hint-text err">⚠️ Cannot scan this page.</p>';
            }
        });
    });

    function updateFieldSummary(d) {
        const el = document.getElementById('fieldSummary');
        if (!d || d.total === 0) { el.innerHTML = '<p class="hint-text">No fields found.</p>'; return; }
        const icons = { name: '👤', email: '📧', phone: '📞', url: '🔗', subject: '📝', message: '💬', address: '📍', company: '🏢', search: '🔍', generic: '📋' };
        let h = `<div class="field-count-badge">${d.total} fields</div><div class="field-type-grid">`;
        for (const [t, c] of Object.entries(d.byType || {}))
            h += `<div class="field-type-item"><span>${icons[t] || '📋'} ${t}</span><span class="ftc">${c}</span></div>`;
        el.innerHTML = h + '</div>';
    }

    // =============================
    // Fill
    // =============================
    document.getElementById('fillAllBtn').addEventListener('click', () => {
        const btn = document.getElementById('fillAllBtn');
        const st = document.getElementById('fillStatus');
        const bar = document.getElementById('statusBarFill');
        const txt = document.getElementById('statusText');
        btn.disabled = true;
        btn.querySelector('.btn-text').textContent = 'Injecting...';
        btn.querySelector('.btn-icon').textContent = '⏳';
        st.style.display = 'block'; bar.style.width = '40%'; txt.textContent = 'Injecting payloads...';

        chrome.runtime.sendMessage({ action: 'injectAndFillAll' }, (r) => {
            bar.style.width = '100%';
            if (r?.filled > 0) {
                txt.textContent = `✅ ${r.filled} fields filled!`;
                btn.querySelector('.btn-text').textContent = `${r.filled} Filled! ✅`;
                btn.querySelector('.btn-icon').textContent = '✅';
            } else if (r?.total === 0) {
                txt.textContent = '⚠️ No fields found';
                btn.querySelector('.btn-icon').textContent = '⚠️';
            } else {
                txt.textContent = '❌ Cannot access page';
                btn.querySelector('.btn-icon').textContent = '❌';
            }
            setTimeout(() => {
                btn.disabled = false;
                btn.querySelector('.btn-text').textContent = 'Fill All Fields';
                btn.querySelector('.btn-icon').textContent = '⚡';
            }, 2500);
        });
    });

    // =============================
    // Settings
    // =============================
    document.getElementById('settingsBtn').addEventListener('click', () => chrome.runtime.openOptionsPage());

    // =============================
    // Recon
    // =============================
    document.getElementById('generateDorksBtn').addEventListener('click', () => {
        const d = document.getElementById('targetDomain').value.trim();
        if (!d) {
            document.getElementById('dorkResults').innerHTML = '<p class="hint-text err">⚠️ Enter a domain!</p>';
            return;
        }
        generateDorks(d.replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/$/, ''));
        saveState();
    });

    document.getElementById('targetDomain').addEventListener('keypress', e => {
        if (e.key === 'Enter') document.getElementById('generateDorksBtn').click();
    });
    // Save domain as user types (debounced)
    let typingTimer;
    document.getElementById('targetDomain').addEventListener('input', () => {
        clearTimeout(typingTimer);
        typingTimer = setTimeout(saveState, 500);
    });

    function generateDorks(domain) {
        const c = document.getElementById('dorkResults');
        let h = '';
        DB.dorkTemplates.forEach(t => {
            const dork = t.dork.replace(/\{\{DOMAIN\}\}/g, domain);
            const url = `https://www.google.com/search?q=${encodeURIComponent(dork)}`;
            h += `<a class="dork-item" href="${url}" target="_blank" title="${esc(dork)}">
        <span class="dork-label">${t.label}</span>
        <span class="dork-query">${esc(dork)}</span>
        <span class="dork-open-icon">↗</span>
      </a>`;
        });
        c.innerHTML = h;
        c.querySelectorAll('.dork-item').forEach(a => {
            a.addEventListener('click', e => { e.preventDefault(); chrome.tabs.create({ url: a.href }); });
        });
    }

    // =============================
    // Exclude Tab
    // =============================
    function loadExcludes() {
        chrome.runtime.sendMessage({ action: 'getExcludedDomains' }, (r) => {
            renderExcludes(r?.domains || []);
        });
    }

    function renderExcludes(domains) {
        const el = document.getElementById('excludeList');
        if (!domains.length) { el.innerHTML = '<p class="hint-text">No excluded domains.</p>'; return; }
        el.innerHTML = domains.map(d =>
            `<div class="exclude-item">
        <span class="exclude-domain">${esc(d)}</span>
        <button class="exclude-remove" data-domain="${esc(d)}" title="Remove">✕</button>
      </div>`
        ).join('');
        el.querySelectorAll('.exclude-remove').forEach(btn => {
            btn.addEventListener('click', () => {
                chrome.runtime.sendMessage({ action: 'removeExcludedDomain', domain: btn.dataset.domain }, (r) => {
                    renderExcludes(r?.domains || []);
                });
            });
        });
    }

    document.getElementById('addExcludeBtn').addEventListener('click', () => {
        const inp = document.getElementById('excludeDomainInput');
        const val = inp.value.trim().replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/$/, '').toLowerCase();
        if (!val) return;
        chrome.runtime.sendMessage({ action: 'addExcludedDomain', domain: val }, (r) => {
            renderExcludes(r?.domains || []);
            inp.value = '';
        });
    });

    document.getElementById('excludeDomainInput').addEventListener('keypress', e => {
        if (e.key === 'Enter') document.getElementById('addExcludeBtn').click();
    });

    document.getElementById('resetExcludesBtn').addEventListener('click', () => {
        chrome.runtime.sendMessage({ action: 'resetExcludedDomains' }, (r) => {
            renderExcludes(r?.domains || []);
        });
    });

    // =============================
    // History
    // =============================
    function loadHistory() {
        chrome.storage.sync.get(['fillHistory'], (r) => {
            const h = r.fillHistory || [];
            const el = document.getElementById('historyList');
            const btn = document.getElementById('clearHistoryBtn');
            if (!h.length) { el.innerHTML = '<p class="hint-text">No history yet.</p>'; btn.style.display = 'none'; return; }
            btn.style.display = 'block';
            el.innerHTML = h.map(i => {
                let host = '—'; try { host = new URL(i.url).hostname; } catch (e) { host = i.url || '—'; }
                return `<div class="history-item">
          <div class="history-info"><div class="history-title">${esc(i.title || 'Unknown')}</div><div class="history-url">${esc(host)}</div></div>
          <div class="history-meta"><div class="history-count">${i.fields >= 0 ? i.fields + ' fields' : '—'}</div><div class="history-time">${relTime(i.timestamp)}</div></div>
        </div>`;
            }).join('');
        });
    }

    document.getElementById('clearHistoryBtn').addEventListener('click', () => {
        chrome.storage.sync.set({ fillHistory: [] }, loadHistory);
    });

    // =============================
    // Utils
    // =============================
    function relTime(ts) {
        const d = Date.now() - ts, m = Math.floor(d / 60000);
        if (m < 1) return 'now'; if (m < 60) return m + 'm'; return Math.floor(d / 3600000) < 24 ? Math.floor(d / 3600000) + 'h' : Math.floor(d / 86400000) + 'd';
    }
    function esc(s) { const d = document.createElement('div'); d.textContent = s; return d.innerHTML; }

    // Init — load tab-specific data
    loadHistory();
    loadExcludes();
});
