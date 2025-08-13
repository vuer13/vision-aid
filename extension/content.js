console.log("Vision Aid content.js loaded");

let focusOverlay = null;
let focusActive = false;
let guideBar = null;
let guideBarMouseMoveListener = null;
let textIsolationEnabled = false;
let textIsolationOverlay = null;
let mouseMoveListener = null;

let lemOverlay = null;
let lemTimerId = null;
let lemRunning = false;
let lemSide = "left";
let lemIntervalMs = 15000;
let lemColor = "rgba(0, 0, 0, 0.35)";

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

        case "toggle_lazy":
            if (message.value) {
                startLazyEye();
            } else {
                stopLazyEye()
            }
            break;

        case "toggle_focus":
            if (message.value) {
                enableFocusMode();
            } else {
                disableFocusMode()
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
                document.body.classList.add("visionaid-large-cursor");
            } else {
                document.body.classList.remove("visionaid-large-cursor");
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
    focusActive = true;
    document.addEventListener("click", selectFocusElement, { once: true });
    alert("Click on what you want to focus on");
}

function selectFocusElement(e) {
    e.preventDefault();
    e.stopPropagation();

    const target = e.target.getBoundingClientRect();

    if (focusOverlay) {
        focusOverlay.remove();
    }

    focusOverlay = document.createElement("div");
    focusOverlay.id = "focus-overlay";
    focusOverlay.style.cssText = `
        position: fixed;
        top: 0; left: 0;
        width: 100vw; height: 100vh;
        background-color: rgba(0, 0, 0, 0.7);
        pointer-events: none;
        z-index: 9999;
        clip-path: inset(${target.top}px ${window.innerWidth - target.right}px ${window.innerHeight - target.bottom}px ${target.left}px);
    `;

    document.body.appendChild(focusOverlay);
}

function disableFocusMode() {
    focusActive = false;
    if (focusOverlay) {
        focusOverlay.remove();
        focusOverlay = null;
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
        height: 1.5em;
        background-color: rgba(255, 255, 0, 0.3);
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

function startLazyEye() {
    if (lemRunning) {
        return;
    }

    lemRunning = true;
    ensureLazyOverlay();

    if (lemOverlay) {
        lemOverlay.style.display = "block";
    }
    if (lemTimerId) {
        clearInterval(lemTimerId);
    }
    lemTimerId = setInterval(flipLazySide, lemIntervalMs);
}

function stopLazyEye() {
    lemRunning = false;
    if (lemTimerId) {
        clearInterval(lemTimerId);
        lemTimerId = null;
    }

    if (lemOverlay) {
        lemOverlay.style.display = "none";
    }
}

function ensureLazyOverlay() {
    if (lemOverlay && document.body.contains(lemOverlay)) {
        return;
    }

    lemOverlay = document.createElement("div");
    lemOverlay.id = "lem-overlay";
    lemOverlay.style.cssText = `
      position: fixed;
      top: 0; left: 0;
      width: 50vw; 
      height: 100vh;
      pointer-events: none;
      z-index: 2147483647;
      background: ${lemColor};
      mix-blend-mode: multiply;
      transform: translateX(0);
      transition: transform 200ms ease;
    `;
    document.documentElement.appendChild(lemOverlay);
    setLazySide(lemSide);
}

function flipLazySide() {
    setLazySide(lemSide === "left" ? "right" : "left");
}

function setLazySide(side) {
    lemSide = side === "right" ? "right" : "left";
    if (!lemOverlay) {
        return;
    }
    lemOverlay.style.transform = lemSide === "right" ? "translateX(50vw)" : "translateX(0)";
}

const lemObserver = new MutationObserver(() => {
    if (lemRunning && lemOverlay && !document.body.contains(lemOverlay)) {
        document.documentElement.appendChild(lemOverlay);
    }
});
lemObserver.observe(document.documentElement, { childList: true, subtree: true });