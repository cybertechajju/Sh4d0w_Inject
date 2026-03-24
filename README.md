<div align="center">
  <img src="assets/icon128.png" alt="Sh4d0w Inject Logo" width="128">

  <h1>Sh4d0w Inject</h1>
  <p><strong>Stealth Blind XSS Payload Injector & Recon Tool — KEEP LEARNING KEEP HACKING 💀</strong></p>

  <p>
    <a href="https://www.youtube.com/live/oSI7V8fkMHo?si=7c-36h3YrO0cBC6v"><img src="https://img.shields.io/badge/YouTube-Watch%20Tutorial-FF0000?style=for-the-badge&logo=youtube&logoColor=white" alt="Watch Tutorial on YouTube"></a>
    <img src="https://img.shields.io/badge/Version-3.2.0-00ff41?style=for-the-badge" alt="Version 3.2.0">
    <img src="https://img.shields.io/badge/Chrome-Supported-4285F4?style=for-the-badge&logo=google-chrome&logoColor=white" alt="Chrome Supported">
    <img src="https://img.shields.io/badge/Firefox-Supported-FF7139?style=for-the-badge&logo=firefox-browser&logoColor=white" alt="Firefox Supported">
</p>
</div>

---

## 🕷️ What is Sh4d0w Inject?

**Sh4d0w Inject** is a powerful, stealthy browser extension designed for Penetration Testers and Bug Bounty Hunters. It automates the process of finding **Blind Cross-Site Scripting (BXSS)** vulnerabilities by dynamically injecting advanced, WAF-bypassing payloads into web forms, input fields, and HTTP headers. 

It comes pre-loaded with a curated list of high-impact, context-breaking payloads (Polyglots, SVG vectors, encoding tricks) capable of bypassing modern security filters.

> **⚠️ Disclaimer:** This tool is strictly for educational purposes, authorized security testing, and bug bounty hunting on programs where you have explicit permission. Do not use it against targets without consent.

---

## 🔥 Key Features

- **⚡ 1-Click Mass Injection:** Identify and auto-fill all visible and hidden input fields (forms, textareas, search bars) with context-specific payloads.
- **🛡️ WAF Bypassing Payloads:** Includes custom Base64/atob, `fromCharCode`, SVG vectors, and deep HTML nesting payloads designed to evade WAFs.
- **🕵️ Header Injection:** Automatically injects payloads into HTTP headers such as `User-Agent`, `Referer`, `X-Forwarded-For`, etc.
- **🔍 Active Recon & Dorks:** Instantly generate Google Dorks for your target domain directly from the extension.
- **⚙️ Custom Callback Server:** Configure your own Blind XSS callback server (e.g., XSS Hunter, xss.report) in the settings and all payloads will dynamically use it.
- **🚫 Exclusion Rules:** Easily exclude specific domains where you don't want payloads to fire.

---

## 📺 Video Tutorial & Demo

Watch the full live stream tutorial on how to configure and use Sh4d0w Inject effectively during your bug bounty hunting sessions:

[![Sh4d0w Inject Tutorial](https://img.youtube.com/vi/oSI7V8fkMHo/0.jpg)](https://www.youtube.com/live/oSI7V8fkMHo?si=7c-36h3YrO0cBC6v)

---

## 🚀 Installation Guide

Since this extension is explicitly designed for security professional testing, it is currently side-loaded as an unpacked extension. 

### 🟢 Google Chrome, Brave, Edge (Chromium)

1. **Download the code:** Clone this repository or download it as a ZIP file and extract it.
2. Open Chrome and navigate to `chrome://extensions/`.
3. Enable **"Developer mode"** by toggling the switch in the top right corner.
4. Click on the **"Load unpacked"** button in the top left.
5. Select the extracted `shadow-inject-store` folder.
6. The extension is now installed! Don't forget to configure your callback URL in the Options page.

### 🦊 Mozilla Firefox

1. **Download the code:** Clone this repository or download it as a ZIP file and extract it.
2. Open Firefox and navigate to `about:debugging#/runtime/this-firefox`.
3. Click on the **"Load Temporary Add-on..."** button.
4. Navigate to the extracted folder and select the `manifest.json` file.
5. The extension is now temporarily loaded. 
*(Note: Firefox requires you to reload temporary extensions when you restart the browser. For permanent installation, the extension must be signed by Mozilla).*

---

## ⚙️ Initial Configuration

Before hunting, you must tell the extension where to send your Blind XSS pings:

1. Click the Sh4d0w Inject icon in your browser toolbar to open the popup.
2. Click the **Settings (⚙️)** gear icon in the top right corner.
3. In the Options page, enter your **Blind XSS Server URL** (e.g., `https://your-id.xss.ht` or `https://xss.report/c/your-id`).
4. Click **Save**. 
5. *(Optional)* Scroll down to see the pre-loaded payloads. You can also add your own custom payloads using the `{{SERVER}}` and `{{LOADER_B64}}` placeholders.

---

## 🖤 Credits

Developed for the bug bounty community. **KEEP LEARNING · KEEP HACKING**.
