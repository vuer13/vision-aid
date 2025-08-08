chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch (message.action) {
        case "trigger_relax_mode":
            relaxOverlay(message.duration);
            break;

        case "toggle_time":
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

        case "toggle_dots":
            // TODO
            break;

        case "toggle_bionic":
            // TODO
            break;

        case "trigger_blink":
            chrome.runtime.sendMessage({
                action: message.value ? "start_blink_timer" : "stop_blink_timer"
            });
            break;

        case "trigger_blink_overlay":
            showBlinkOverlay();
            break;

        case "toggle_magnification":
            // TODO
            break;

        case "toggle_lazy":
            // TODO?? unsure if I will keep
            break;

        case "toggle_focus":
            // TODO
            break;

        case "toggle_iso":
            // TODO
            break;

        case "toggle_syllables":
            // TODO
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

let guideBar = null;
let guideBarMouseMoveListener = null;

function enableGuideBar() {
    guideBar = document.createElement("div");
    guideBar.id = 'guideBar';
    guideBarElement.style.cssText = `
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