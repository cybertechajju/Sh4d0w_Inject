<div align="center">
  <img src="assets/icon128.png" alt="Sh4d0w Inject Logo" width="128">

  <h1>🕷️ Sh4d0w Inject</h1>
  <p><strong>Advanced Blind XSS Payload Injector & Recon Toolkit for Bug Bounty Hunters & Pentesters</strong></p>

  <p>
    <img src="https://img.shields.io/badge/Version-4.0.1-00ff41?style=for-the-badge&labelColor=0a0e17" alt="Version 4.0.1">
    <img src="https://img.shields.io/badge/Payloads-200+-00d4ff?style=for-the-badge&labelColor=0a0e17" alt="200+ Payloads">
    <img src="https://img.shields.io/badge/Headers-15-a855f7?style=for-the-badge&labelColor=0a0e17" alt="15 Headers">
    <img src="https://img.shields.io/badge/Chrome-Supported-4285F4?style=for-the-badge&logo=google-chrome&logoColor=white" alt="Chrome">
    <img src="https://img.shields.io/badge/Firefox-Supported-FF7139?style=for-the-badge&logo=firefox-browser&logoColor=white" alt="Firefox">
  </p>

  <p>
    <a href="https://www.youtube.com/live/oSI7V8fkMHo?si=7c-36h3YrO0cBC6v"><img src="https://img.shields.io/badge/YouTube-Watch%20Tutorial-FF0000?style=for-the-badge&logo=youtube&logoColor=white" alt="Watch Tutorial"></a>
  </p>
</div>

---

## 💀 What is Sh4d0w Inject?

**Sh4d0w Inject** is an advanced, stealthy browser extension built for **Bug Bounty Hunters** and **Penetration Testers**. It automates the discovery of **Blind Cross-Site Scripting (BXSS)** vulnerabilities by injecting intelligent, WAF-bypassing payloads into web forms, hidden inputs, chatbot widgets, and HTTP headers — all in real-time.

Where manual testing takes **hours**, Sh4d0w Inject does it in **seconds**.

### 🎯 Real-World Impact

This tool has been used to discover critical vulnerabilities in production environments:

- **Admin Account Takeover** — on a platform with **4 million+ customers**, a single header toggle + page refresh exposed session cookies, granting full admin dashboard access
- **Blind XSS in Admin Panels** — payloads injected via hidden inputs fired when admins viewed form submissions
- **WAF Bypass** — custom encoding payloads bypassed Cloudflare, Akamai, and ModSecurity rulesets

> **⚠️ Legal Disclaimer:** This tool is strictly for **authorized security testing**, **educational purposes**, and **bug bounty programs** where you have explicit written permission. Unauthorized use against targets without consent is **illegal** and **unethical**. The developer is not responsible for misuse.

---

## 🔥 Feature Overview

### Core Capabilities

| Feature | Description |
|---|---|
| ⚡ **1-Click Mass Injection** | Auto-detects and fills all visible + hidden input fields with context-specific payloads |
| 🛡️ **200+ WAF Bypass Payloads** | mXSS, DOM Clobbering, ES6 Template Literals, Null Byte tricks, CSP bypass vectors |
| 🔀 **15 Injectable Headers** | Simultaneous payload injection into 15 HTTP headers per request |
| 👻 **Hidden Input Injection** | Fills `type="hidden"` fields — server-side Blind XSS goldmines that devs never sanitize |
| 🤖 **Chatbot Widget Detection** | Auto-detects and injects into Intercom, Drift, Zendesk, Tawk.to, LiveChat, Crisp, Freshdesk, HubSpot |
| 🔍 **Google Dork Recon** | 30 pre-built dork templates targeting admin panels, dashboards, debug pages, APIs |
| 🌐 **Shadow DOM Scanning** | Recursively scans Web Components (React, Angular, LitElement) for hidden form fields |
| 👁️ **MutationObserver (SPA)** | Auto-fills dynamically loaded fields in React/Vue/Angular single-page apps |
| 🥷 **Stealth Fill Mode** | Human-like 2-8 second delays between field fills — bypasses bot detection |
| 🎲 **Randomized Rotation** | Header payloads rotate every 2-10 seconds with random intervals — harder to fingerprint |
| 🚫 **Wildcard Exclusions** | Skip domains with `*.domain.com` pattern matching |

### 🔀 All 15 Injectable Headers

<table>
<tr><th>#</th><th>Header</th><th>Why It's Deadly</th></tr>
<tr><td>1</td><td><code>User-Agent</code></td><td>Logged everywhere — analytics, WAFs, admin panels</td></tr>
<tr><td>2</td><td><code>Referer</code></td><td>Previous page URL — often rendered in logs unsanitized</td></tr>
<tr><td>3</td><td><code>Origin</code></td><td>CORS errors reflect this header in error pages</td></tr>
<tr><td>4</td><td><code>Cookie</code></td><td>Session data — logged in admin debugging tools</td></tr>
<tr><td>5</td><td><code>Accept</code></td><td>Content negotiation — rarely sanitized by backends</td></tr>
<tr><td>6</td><td><code>X-Forwarded-For</code></td><td>Client IP header — logged in analytics dashboards</td></tr>
<tr><td>7</td><td><code>Content-Encoding</code></td><td>WAF Bypass — gzip encoding confuses inspection engines</td></tr>
<tr><td colspan="3" align="center"><strong>— v4.0 New Headers —</strong></td></tr>
<tr><td>8</td><td><code>X-Real-IP</code></td><td>Nginx internal — admin panels blindly log it</td></tr>
<tr><td>9</td><td><code>True-Client-IP</code></td><td>Cloudflare/Akamai CDN — trusted without sanitization</td></tr>
<tr><td>10</td><td><code>X-Client-IP</code></td><td>Load balancers — backend directly trusts this</td></tr>
<tr><td>11</td><td><code>X-Originating-IP</code></td><td>Email gateways & legacy apps — rarely sanitized</td></tr>
<tr><td>12</td><td><code>Contact</code></td><td>HTTP spec header — monitoring tools log it raw</td></tr>
<tr><td>13</td><td><code>From</code></td><td>RFC 7231 email header — rendered in admin views</td></tr>
<tr><td>14</td><td><code>X-Wap-Profile</code></td><td>Mobile WAP — almost NEVER sanitized anywhere</td></tr>
<tr><td>15</td><td><code>X-Custom-IP-Authorization</code></td><td>Custom auth — misconfigured reverse proxies trust it</td></tr>
</table>

### 💉 Payload Categories (200+)

```
├── Direct Script Injection        ├── DOM Clobbering Payloads
├── Event Handler Chains (10+)     ├── Mutation XSS (mXSS)
├── SVG/MathML Vectors             ├── ES6 Template Literals
├── Encoding Bypass (Base64/atob)  ├── Null Byte Tricks
├── Recursive Tag Confusion        ├── CSP Bypass Vectors
├── Polyglot Payloads              ├── Window/Top/Parent Tricks
├── URL-Encoded Double Bypass      ├── Hidden Input Payloads (12)
├── Header-Specific Pools (15)     └── Navigator Beacon (fire on close)
```

---

## 🖥️ UI Preview

The extension features a **premium cyberpunk dark theme** with:

- **JetBrains Mono** typography throughout
- **Neon green/cyan/purple** accent colors with glow effects
- **Scanline overlay** for authentic hacker aesthetic
- **Animated logo pulse** and gradient borders
- **Collapsible header panel** with dot indicators
- **Master Switch** (⚡ ALL ON / 🚫 ALL OFF)
- **Live stats bar** — active headers, total payloads, sites injected, fills count

---

## 🚀 Installation

### Google Chrome / Brave / Edge (Chromium)

```bash
# 1. Clone the repository
git clone https://github.com/YOUR_USERNAME/Sh4d0w_Inject.git

# 2. Open Chrome Extensions
#    Navigate to: chrome://extensions/

# 3. Enable Developer Mode (toggle in top-right corner)

# 4. Click "Load unpacked" → Select the Sh4d0w_Inject folder

# 5. Configure your callback URL in the popup
```

### Mozilla Firefox

```bash
# 1. Navigate to: about:debugging#/runtime/this-firefox
# 2. Click "Load Temporary Add-on..."
# 3. Select the manifest.json file from the project folder
```

> **Note:** Firefox temporary extensions reset on browser restart. For permanent installation, the extension must be signed by Mozilla.

---

## ⚙️ Quick Start

1. **Set your callback server** — Click the extension icon → Enter your Blind XSS callback URL (e.g., `https://your-id.xss.ht`)
2. **Enable headers** — Click "HEADER INJECTION" → Toggle individual headers or use ⚡ **ALL ON**
3. **Browse normally** — Payloads are automatically injected into HTTP headers on every request
4. **Fill forms** — Visit a target page → Click **SCAN FIELDS** → Click **INJECT ALL**
5. **Recon** — Switch to RECON tab → Enter target domain → Click **DORK IT**
6. **Scope control** — Use the SCOPE tab to exclude domains from header injection

---

## 🏗️ Architecture

```
Sh4d0w_Inject/
├── manifest.json              # Extension manifest (MV3)
├── background/
│   └── background.js          # Service worker — header injection, rule management,
│                               #   payload rotation, stats tracking, badge counter
├── content/
│   └── content.js             # Content script — field detection, Shadow DOM scanning,
│                               #   MutationObserver, stealth fill, chatbot detection
├── lib/
│   └── payloads.js            # Payload database — 200+ payloads, field patterns,
│                               #   header pools, dork templates, random data generators
├── popup/
│   ├── popup.html             # Popup UI — stats bar, header toggles, tabs
│   ├── popup.js               # Popup logic — state management, master switch
│   └── popup.css              # Cyberpunk dark theme — JetBrains Mono, neon accents
├── options/
│   ├── options.html           # Settings page
│   └── options.js             # Configuration management
├── assets/
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── test-page.html             # Local test page for payload testing
```

### Tech Stack

| Component | Technology |
|---|---|
| **Platform** | Chrome Extension Manifest V3 |
| **Header Injection** | `declarativeNetRequest` API — session-wide dynamic rules |
| **State Management** | `chrome.storage.sync` + `chrome.storage.local` |
| **Content Injection** | `chrome.scripting.executeScript` with isolated world |
| **UI Framework** | Vanilla JS + CSS with custom design system |
| **Typography** | JetBrains Mono (code) + Inter (UI) |

---

## 🔬 How It Works

### Header Injection Flow
```
Browser Request → Service Worker intercepts
    → declarativeNetRequest adds payload headers
    → Payloads rotate every 2-10s (randomized)
    → Server receives request with injected headers
    → If admin views logs → Blind XSS fires! 💥
```

### Form Injection Flow
```
User clicks "INJECT ALL" → Content script activates
    → Scans DOM recursively (including Shadow DOMs)
    → Detects field types (name, email, phone, url, message, hidden...)
    → Selects context-appropriate payload per field
    → Fills using native setters (bypasses React/Vue watchers)
    → Dispatches input/change/compositionend events
    → MutationObserver watches for dynamically added fields
```

### Chatbot Detection
```
Page loads → Content script scans for known chatbot iframes
    → Intercom, Drift, Zendesk, Tawk.to, LiveChat, Crisp, Freshdesk, HubSpot
    → Same-origin iframes → directly scans and fills
    → Cross-origin iframes → headers already injected via background
```

---

## 🛣️ Roadmap

- [x] 15 injectable HTTP headers
- [x] 200+ WAF bypass payloads
- [x] Shadow DOM recursive scanning
- [x] MutationObserver for SPAs
- [x] Stealth fill mode
- [x] Hidden input injection
- [x] Chatbot widget detection (8 platforms)
- [x] Master switch (ALL ON/OFF)
- [x] Live stats dashboard
- [x] Wildcard domain exclusions
- [ ] Custom payload editor in popup
- [ ] Export/import configuration profiles
- [ ] Payload success callback notifications
- [ ] Burp Suite integration
- [ ] Browser DevTools panel

---

## 🤝 Contributing

Contributions are welcome! If you have new payload ideas, header suggestions, or feature requests:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-payload`)
3. Commit your changes (`git commit -m 'Add amazing payload'`)
4. Push to the branch (`git push origin feature/amazing-payload`)
5. Open a Pull Request

---

## 📜 License

This project is open source and available for educational and authorized security testing purposes.

---

<div align="center">
  <br>
  <img src="assets/icon48.png" alt="Sh4d0w" width="48">
  <br><br>
  <strong>SH4D0W INJECT v4.0 — BORN IN THE SHADOWS</strong>
  <br>
  <sub>Built for the Bug Bounty Community 🖤</sub>
  <br><br>
  <code>KEEP LEARNING · KEEP HACKING · STAY ETHICAL</code>
</div>
