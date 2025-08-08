let timerInterval = null;
let blinkTimer = null;

chrome.runtime.onInstalled.addListener(() => {
    console.log("Background script running");
});

chrome.runtime.onMessage.addListener((message, sender) => {
    if (message.action === "start_timer") {
        if (timerInterval) {
            clearInterval(timerInterval);
        };
        const duration = message.duration || 20;
        timerInterval = setInterval(() => {
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                if (tabs.length > 0) {
                    chrome.tabs.sendMessage(tabs[0].id, {
                        action: "trigger_relax_mode",
                        duration
                    });
                }
            });
        }, 20 * 60 * 1000); // Every 20 minutes
    }

    if (message.action === "stop_timer") {
        clearInterval(timerInterval);
        timerInterval = null;
    }

    if (message.action === "start_blink_timer") {
        const interval = message.interval || 10;

        if (blinkTimer) {
            clearInterval(blinkTimer);
        }

        blinkTimer = setInterval(() => {
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                if (tabs.length > 0) {
                    chrome.tabs.sendMessage(tabs[0].id, {
                        action: "trigger_blink_overlay"
                    });
                }
            });
        }, interval * 60 * 1000); // Every whatever minutes the user defines
    }

    if (message.action === "stop_blink_timer") {
        clearInterval(blinkTimer);
        blinkTimer = null;
    }
});