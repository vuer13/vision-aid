let timerInterval = null;

chrome.runtime.onInstalled.addListener(() => {
    console.log("Background script running");
});

chrome.runtime.onMessage.addListener((message, sender) =>{
    if (message.action === "start_timer") {
        if (timerInterval) {
            clearInterval(timerInterval);
        };
        timerInterval = setInterval(() => {
            chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
                if (tabs.length > 0) {
                    chrome.tabs.sendMessage(tabs[0].id, {
                        action: "trigger_relax_mode"
                    });
                }
            });
        }, 20 * 60 * 1000);
    }

    if (message.action === "stop_timer") {
        clearInterval(timerInterval);
        timerInterval = null;
    }
});