chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch(message.action) {
        case "trigger_relax_mode":
            // TODO, MAKE A FUNCTION OVERLAY
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