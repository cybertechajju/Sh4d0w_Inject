/**
 * BlindXSS Hunter — Options Page Logic
 * Server URL config, payload type toggles, custom payloads, import/export
 */

document.addEventListener('DOMContentLoaded', () => {
    const DB = window.BLINDXSS_PAYLOADS;

    // =============================
    // Server URL
    // =============================
    const serverUrlInput = document.getElementById('serverUrl');
    const saveServerBtn = document.getElementById('saveServerBtn');
    const serverSaveStatus = document.getElementById('serverSaveStatus');

    // Load current server URL
    chrome.storage.sync.get(['serverUrl'], (result) => {
        serverUrlInput.value = result.serverUrl || DB.defaultServerUrl;
    });

    saveServerBtn.addEventListener('click', () => {
        const url = serverUrlInput.value.trim();
        if (!url) {
            serverSaveStatus.textContent = '❌ URL cannot be empty';
            serverSaveStatus.className = 'save-status error';
            return;
        }

        chrome.storage.sync.set({ serverUrl: url }, () => {
            serverSaveStatus.textContent = '✅ Server URL saved successfully!';
            serverSaveStatus.className = 'save-status success';
            setTimeout(() => { serverSaveStatus.textContent = ''; }, 3000);
        });
    });

    // =============================
    // Payload Type Toggles
    // =============================
    const toggleGrid = document.getElementById('toggleGrid');
    const typeIcons = {
        name: '👤', email: '📧', phone: '📞', url: '🔗',
        subject: '📝', message: '💬', address: '📍', company: '🏢',
        search: '🔍', generic: '📋'
    };

    function loadToggles() {
        chrome.storage.sync.get(['enabledTypes'], (result) => {
            const enabled = result.enabledTypes || {};
            toggleGrid.innerHTML = '';

            Object.keys(typeIcons).forEach(type => {
                const isActive = enabled[type] !== false; // Default to true
                const item = document.createElement('div');
                item.className = `toggle-item ${isActive ? 'active' : ''}`;
                item.innerHTML = `
          <div class="toggle-switch"></div>
          <span class="toggle-label">${typeIcons[type]} ${type}</span>
        `;
                item.addEventListener('click', () => {
                    item.classList.toggle('active');
                    saveToggles();
                });
                toggleGrid.appendChild(item);
            });
        });
    }

    function saveToggles() {
        const items = toggleGrid.querySelectorAll('.toggle-item');
        const enabledTypes = {};
        items.forEach(item => {
            const type = item.querySelector('.toggle-label').textContent.trim().split(' ').pop();
            enabledTypes[type] = item.classList.contains('active');
        });
        chrome.storage.sync.set({ enabledTypes });
    }

    // =============================
    // Custom Payloads
    // =============================
    const payloadTypeSelect = document.getElementById('payloadType');
    const customPayloadInput = document.getElementById('customPayload');
    const addPayloadBtn = document.getElementById('addPayloadBtn');
    const customPayloadsList = document.getElementById('customPayloadsList');

    function loadCustomPayloads() {
        chrome.storage.sync.get(['customPayloads'], (result) => {
            const payloads = result.customPayloads || [];
            renderCustomPayloads(payloads);
        });
    }

    function renderCustomPayloads(payloads) {
        if (payloads.length === 0) {
            customPayloadsList.innerHTML = '<p style="color: var(--text-muted); font-size: 12px; padding: 10px;">No custom payloads added yet.</p>';
            return;
        }

        customPayloadsList.innerHTML = payloads.map((p, i) => `
      <div class="custom-payload-item">
        <span class="custom-payload-type">${p.type}</span>
        <span class="custom-payload-text" title="${escapeHtml(p.payload)}">${escapeHtml(p.payload)}</span>
        <button class="delete-payload-btn" data-index="${i}" title="Delete">✕</button>
      </div>
    `).join('');

        // Delete handlers
        customPayloadsList.querySelectorAll('.delete-payload-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const index = parseInt(btn.dataset.index);
                chrome.storage.sync.get(['customPayloads'], (result) => {
                    const payloads = result.customPayloads || [];
                    payloads.splice(index, 1);
                    chrome.storage.sync.set({ customPayloads: payloads }, () => {
                        renderCustomPayloads(payloads);
                    });
                });
            });
        });
    }

    addPayloadBtn.addEventListener('click', () => {
        const type = payloadTypeSelect.value;
        const payload = customPayloadInput.value.trim();

        if (!payload) return;

        chrome.storage.sync.get(['customPayloads'], (result) => {
            const payloads = result.customPayloads || [];
            payloads.push({ type, payload });
            chrome.storage.sync.set({ customPayloads: payloads }, () => {
                customPayloadInput.value = '';
                renderCustomPayloads(payloads);
            });
        });
    });

    // =============================
    // Payload Preview (Built-in)
    // =============================
    function loadPayloadPreview() {
        const container = document.getElementById('payloadPreview');
        let html = '';

        Object.entries(DB.payloadsByType).forEach(([type, payloads]) => {
            html += `
        <div class="payload-category">
          <div class="payload-category-title" data-type="${type}">
            <span class="arrow">▼</span>
            ${typeIcons[type] || '📋'} ${type} (${payloads.length} payloads)
          </div>
          <div class="payload-list" id="list-${type}">
            ${payloads.map(p => `<div class="payload-item" title="${escapeHtml(p)}">${escapeHtml(truncate(p, 100))}</div>`).join('')}
          </div>
        </div>`;
        });

        container.innerHTML = html;

        // Toggle collapse
        container.querySelectorAll('.payload-category-title').forEach(title => {
            title.addEventListener('click', () => {
                title.classList.toggle('collapsed');
                const list = document.getElementById(`list-${title.dataset.type}`);
                list.classList.toggle('collapsed');
            });
        });
    }

    // =============================
    // Import / Export
    // =============================
    document.getElementById('exportBtn').addEventListener('click', () => {
        chrome.storage.sync.get(null, (data) => {
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `blindxss-config-${new Date().toISOString().slice(0, 10)}.json`;
            a.click();
            URL.revokeObjectURL(url);
        });
    });

    document.getElementById('importBtn').addEventListener('click', () => {
        document.getElementById('importFile').click();
    });

    document.getElementById('importFile').addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target.result);
                chrome.storage.sync.set(data, () => {
                    alert('✅ Configuration imported successfully!');
                    location.reload();
                });
            } catch (err) {
                alert('❌ Invalid JSON file');
            }
        };
        reader.readAsText(file);
    });

    // =============================
    // Reset
    // =============================
    document.getElementById('resetBtn').addEventListener('click', () => {
        if (confirm('Are you sure you want to reset ALL settings? This will delete your custom payloads and server URL.')) {
            chrome.storage.sync.clear(() => {
                alert('✅ All settings have been reset.');
                location.reload();
            });
        }
    });

    // =============================
    // Utilities
    // =============================
    function escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    function truncate(str, len) {
        return str.length > len ? str.substring(0, len) + '...' : str;
    }

    // =============================
    // Initialize
    // =============================
    loadToggles();
    loadCustomPayloads();
    loadPayloadPreview();
});
