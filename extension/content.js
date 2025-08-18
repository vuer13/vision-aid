console.log("Vision Aid content.js loaded");

let focusOverlay = null;
let focusActive = false;
let focusKeydownHandler = null;
let focusPickHandler = null;

let guideBar = null;
let guideBarMouseMoveListener = null;
let textIsolationEnabled = false;
let textIsolationOverlay = null;
let mouseMoveListener = null;
let largeCursorEl = null;
let largeCursorMoveListener = null;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("Vision Aid received:", message);
    switch (message.action) {
        case "trigger_relax_mode":
            relaxOverlay(message.duration);
            break;

        case "toggle_timer":
            chrome.runtime.sendMessage({
                action: message.value ? "start_timer" : "stop_timer"
            });
            break;

        case "toggle_guideBar":
            if (message.value) {
                enableGuideBar();
            } else {
                disableGuideBar();
            }
            break;

        case "toggle_bionic":
            if (message.value) {
                toggleBionicMode();
            } else {
                location.reload();
            }
            break;

        case "toggle_blink":
            chrome.runtime.sendMessage({
                action: message.value ? "start_blink_timer" : "stop_blink_timer",
                periodMinutes: message.periodMinutes
            });
            break;

        case "trigger_blink_overlay":
            showBlinkOverlay();
            break;

        case "toggle_focus":
            if (message.value) {
                enableFocusMode();
            } else {
                disableFocusMode();
            }
            break;

        case "toggle_iso":
            if (message.value) {
                enableTextIsolation();
            } else {
                disableTextIsolation();
            }
            break;

        case "toggle_cursor":
            if (message.value) {
                enableLargeCursor();
            } else {
                disableLargeCursor();
            }
            break;
    }
});

function relaxOverlay(num) {
    if (document.getElementById('relax-overlay')) {
        return;
    }

    const overlay = document.createElement('div');
    overlay.id = "relax-overlay";
    overlay.innerText = "Time to relax your eyes \n Look at something 20 feet away";
    overlay.style.cssText = `
        position: fixed;
        top: 0; left: 0;
        width: 100vw; height: 100vh;
        background-color: rgba(0, 0, 0, 0.9);
        color: white;
        font-size: 2rem;
        text-align: center;
        padding-top: 40vh;
        z-index: 9999;
    `;
    document.body.appendChild(overlay);

    setTimeout(() => {
        overlay.remove();
    }, num * 1000);
}

function showBlinkOverlay() {
    if (document.getElementById('blink-box')) {
        return;
    }

    const box = document.createElement('div');
    box.id = "blink-box";
    box.innerText = "Time to blink!!!";
    box.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background-color: #222;
        color: white;
        padding: 15px 20px;
        font-size: 1.2rem;
        border-radius: 10px;
        z-index: 9999;
        box-shadow: 0 0 10px rgba(0,0,0,0.5);
        font-family: sans-serif;
    `;
    document.body.appendChild(box);

    setTimeout(() => {
        box.remove();
    }, 15 * 1000);
}

function enableGuideBar() {
    guideBar = document.createElement("div");
    guideBar.id = 'guideBar';
    guideBar.style.cssText = `
        position: fixed;
        left: 0;
        width: 100vw;
        height: 2px;
        background-color: red;
        pointer-events: none;
        z-index: 9999;
    `;
    document.body.appendChild(guideBar);

    guideBarMouseMoveListener = (e) => {
        guideBar.style.top = `${e.clientY}px`;
    };
    document.addEventListener("mousemove", guideBarMouseMoveListener);
}

function disableGuideBar() {
    if (guideBar) {
        guideBar.remove();
        guideBar = null;
    }
    if (guideBarMouseMoveListener) {
        document.removeEventListener("mousemove", guideBarMouseMoveListener);
        guideBarMouseMoveListener = null;
    }
}

function ensureBionicCSS() {
    if (document.getElementById("va-bionic-style")) return;
    const s = document.createElement("style");
    s.id = "va-bionic-style";
    s.textContent = `
      .va-bionic-strong { font-weight: 700 !important; }
    `;
    document.documentElement.appendChild(s);
}

function applyBionicText(node) {
    if (!node || !node.nodeValue) {
        return;
    }
    const parent = node.parentNode;
    if (!parent) {
        return;
    }

    const tag = parent.tagName;
    if (tag === "STYLE" || tag === "SCRIPT" || tag === "NOSCRIPT" || tag === "CODE" || tag === "PRE" || tag === "TEXTAREA" || tag === "INPUT" || parent.isContentEditable) {
        return;
    }

    const text = node.nodeValue;
    const words = text.split(/(\s+)/);
    if (words.length === 0) {
        return;
    }
    const fragment = document.createDocumentFragment();

    for (let i = 0; i < words.length; i++) {
        const token = words[i];

        if (/^\s+$/.test(token)) {
            fragment.appendChild(document.createTextNode(token));
            continue;
        }

        const boldLen = Math.ceil(token.length / 2);
        const boldPart = token.slice(0, boldLen);
        const normalPart = token.slice(boldLen);

        const strong = document.createElement("span");
        strong.className = "va-bionic-strong";
        strong.appendChild(document.createTextNode(boldPart));

        fragment.appendChild(strong);
        if (normalPart) {
            fragment.appendChild(document.createTextNode(normalPart));
        }
    }

    parent.replaceChild(fragment, node);
}

function toggleBionicMode() {
    ensureBionicCSS();

    const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
        {
            acceptNode(n) {
                if (!n.nodeValue || !n.nodeValue.trim()) {
                    return NodeFilter.FILTER_REJECT;
                }
                if (n.parentNode && n.parentNode.classList && n.parentNode.classList.contains("va-bionic-strong")) {
                    return NodeFilter.FILTER_REJECT;
                }
                return NodeFilter.FILTER_ACCEPT;
            }
        }
    );

    let node;
    const batch = [];
    while ((node = walker.nextNode())) batch.push(node);

    for (const textNode of batch) {
        applyBionicText(textNode);
    }
}

function enableFocusMode() {
    if (focusActive) {
        return;
    }

    focusActive = true;

    focusPickHandler = (e) => selectFocusElement(e);
    document.addEventListener("click", focusPickHandler, { once: true, capture: true });

    focusKeydownHandler = (e) => { if (e.key === "Escape") disableFocusMode(); };
    document.addEventListener("keydown", focusKeydownHandler, true);
}

function selectFocusElement(e) {
    e.preventDefault();
    e.stopPropagation();

    const el = document.elementFromPoint(e.clientX, e.clientY) || e.target;
    let r = el.getBoundingClientRect();

    if (r.width < 240 || r.height < 120) {
        const W = Math.min(720, Math.max(360, window.innerWidth * 0.7));
        const H = Math.min(480, Math.max(240, window.innerHeight * 0.5));
        const left = Math.max(0, Math.min(window.innerWidth - W, e.clientX - W / 2));
        const top = Math.max(0, Math.min(window.innerHeight - H, e.clientY - H / 2));
        r = { left, top, right: left + W, bottom: top + H };
    }

    if (focusOverlay) focusOverlay.remove();

    const topInset = Math.max(0, r.top - 8);
    const leftInset = Math.max(0, r.left - 8);
    const bottomInset = Math.max(0, window.innerHeight - (r.bottom + 8));
    const rightInset = Math.max(0, window.innerWidth - (r.right + 8));

    focusOverlay = document.createElement("div");
    focusOverlay.id = "focus-overlay";
    focusOverlay.style.cssText = `
      position: fixed; inset: 0;
      background: rgba(0,0,0,0.7);
      pointer-events: none;
      z-index: 2147483646;
      clip-path: inset(${topInset}px ${rightInset}px ${bottomInset}px ${leftInset}px);
      transition: clip-path 120ms ease;
    `;
    document.documentElement.appendChild(focusOverlay);
}

function disableFocusMode() {
    if (!focusActive) {
        return;
    }

    focusActive = false;

    if (focusOverlay) {
        focusOverlay.remove(); focusOverlay = null;
    }

    if (focusPickHandler) {
        document.removeEventListener("click", focusPickHandler, true);
        focusPickHandler = null;
    }
    if (focusKeydownHandler) {
        document.removeEventListener("keydown", focusKeydownHandler, true);
        focusKeydownHandler = null;
    }
}

function enableTextIsolation() {
    if (textIsolationEnabled) {
        return;
    }

    textIsolationEnabled = true;

    textIsolationOverlay = document.createElement("div");
    textIsolationOverlay.id = "text-isolation-overlay";
    textIsolationOverlay.style.cssText = `
        position: fixed;
        left: 0;
        width: 100%;
        height: 5em;
        background-color: rgba(250, 0, 0, 0.3);
        pointer-events: none;
        z-index: 9999;
        display: none;
    `;
    document.body.appendChild(textIsolationOverlay);

    mouseMoveListener = (e) => {
        const lineHeight = parseFloat(getComputedStyle(document.body).lineHeight) || 20;
        const y = e.clientY - (lineHeight / 2);

        textIsolationOverlay.style.top = `${y}px`;
        textIsolationOverlay.style.height = `${lineHeight}px`;
        textIsolationOverlay.style.display = "block";
    }

    document.addEventListener("mousemove", mouseMoveListener);
}

function disableTextIsolation() {
    if (!textIsolationEnabled) {
        return;
    }

    textIsolationEnabled = false;

    if (textIsolationOverlay) {
        textIsolationOverlay.remove();
        textIsolationOverlay = null;
    }

    if (mouseMoveListener) {
        document.removeEventListener("mousemove", mouseMoveListener);
        mouseMoveListener = null;
    }
}

function enableLargeCursor() {
    if (largeCursorEl) {
        return;
    }

    largeCursorEl = document.createElement("div");
    largeCursorEl.id = "va-large-cursor";
    largeCursorEl.style.cssText = `
      position: fixed;
      width: 36px; height: 36px;
      border-radius: 50%;
      border: 2px solid rgba(0,0,0,0.85);
      background: rgba(255,255,255,0.6);
      pointer-events: none;
      z-index: 2147483647;
      transform: translate(-50%, -50%);
      box-shadow: 0 0 6px rgba(0,0,0,0.25);
    `;
    document.documentElement.appendChild(largeCursorEl);

    largeCursorMoveListener = (e) => {
        largeCursorEl.style.left = e.clientX + "px";
        largeCursorEl.style.top = e.clientY + "px";
    };
    document.addEventListener("mousemove", largeCursorMoveListener, { passive: true });
}

function disableLargeCursor() {
    if (largeCursorMoveListener) {
        document.removeEventListener("mousemove", largeCursorMoveListener);
        largeCursorMoveListener = null;
    }
    if (largeCursorEl) {
        largeCursorEl.remove();
        largeCursorEl = null;
    }
}

function hardResetVisionAid() {
    document.querySelectorAll('#focus-overlay,#relax-overlay,#lem-overlay,#text-isolation-overlay,#guideBar,#va-large-cursor,#blink-box')
        .forEach(el => el.remove());
    focusActive = false;

    if (guideBarMouseMoveListener) { document.removeEventListener('mousemove', guideBarMouseMoveListener); guideBarMouseMoveListener = null; }
    if (mouseMoveListener) { document.removeEventListener('mousemove', mouseMoveListener); mouseMoveListener = null; }
    if (largeCursorMoveListener) { document.removeEventListener('mousemove', largeCursorMoveListener); largeCursorMoveListener = null; }
    if (focusKeydownHandler) { document.removeEventListener('keydown', focusKeydownHandler, true); focusKeydownHandler = null; }
    if (focusDismissClickHandler) { document.removeEventListener('mousedown', focusDismissClickHandler, true); focusDismissClickHandler = null; }
    if (focusToolbar) { focusToolbar.remove(); focusToolbar = null; }
}

document.addEventListener('keydown', e => {
    if (e.altKey && e.shiftKey && (e.key === '0' || e.code === 'Digit0')) {
        hardResetVisionAid();
    }
});