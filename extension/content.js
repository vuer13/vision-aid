chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch(message.action) {
        case "trigger_relax_mode":
            relaxOverlay();
            break;

        case "toggle_time":
            chrome.runtime.sendMessage({
                action: message.value ? "start_timer" : "stop_timer"
            });
            break;

        case "toggle_guideBar":
            // TODO
            break;

        case "toggle_dots":
            // TODO
            break;

        case "toggle_bionic":
            // TODO
            break;
        
        case "toggle_blink":
            // TODO
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
            // TODO
            break;
    }
});

function relaxOverlay() {
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
    }, message.duration * 1000);
}