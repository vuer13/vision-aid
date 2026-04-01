const features = ["guideBar", "timer", "bionic", "blink", "focus", "iso", "cursor"];

const DEFAULTS = {
    guideBar: false,
    timer: false,
    bionic: false,
    blink: false,
    focus: false,
    iso: false,
    cursor: false,
    relaxDuration: 20,
    blinkReminder: 10
};

document.getElementById("mainTab").addEventListener("click", () => {
    document.getElementById("mainPage").style.display = "block";
    document.getElementById("settingsPage").style.display = "none";
    document.getElementById("mainTab").classList.add("active");
    document.getElementById("settingsTab").classList.remove("active");
});

document.getElementById("settingsTab").addEventListener("click", () => {
    document.getElementById("mainPage").style.display = "none";
    document.getElementById("settingsPage").style.display = "block";
    document.getElementById("mainTab").classList.remove("active");
    document.getElementById("settingsTab").classList.add("active");
});

async function getActiveTab() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    return tab;
}

async function loadSavedState() {
    const saved = await chrome.storage.local.get(DEFAULTS);

    features.forEach((feature) => {
        const checkbox = document.getElementById(feature);
        if (checkbox) {
            checkbox.checked = saved[feature];
        }
    });

    const relaxInput = document.getElementById("relaxDuration");
    const blinkInput = document.getElementById("blinkReminder");

    if (relaxInput) {
        relaxInput.value = saved.relaxDuration;
    }

    if (blinkInput) {
        blinkInput.value = saved.blinkReminder;
    }
}

async function saveSetting(key, value) {
    await chrome.storage.local.set({ [key]: value });
}

async function sendFeatureState(feature, checked) {
    const tab = await getActiveTab();
    if (!tab || !tab.id) return;

    if (feature === "blink") {
        const blinkReminder =
            parseFloat(document.getElementById("blinkReminder")?.value) || 10;

        chrome.tabs.sendMessage(tab.id, {
            action: `toggle_${feature}`,
            value: checked,
            interval: blinkReminder
        });
    } else if (feature === "timer") {
        const relaxDuration =
            parseInt(document.getElementById("relaxDuration")?.value, 10) || 20;

        chrome.tabs.sendMessage(tab.id, {
            action: `toggle_${feature}`,
            value: checked,
            duration: relaxDuration
        });
    } else {
        chrome.tabs.sendMessage(tab.id, {
            action: `toggle_${feature}`,
            value: checked
        });
    }
}

features.forEach((feature) => {
    const checkbox = document.getElementById(feature);
    if (!checkbox) return;

    checkbox.addEventListener("change", async (e) => {
        const checked = e.target.checked;

        await saveSetting(feature, checked);
        await sendFeatureState(feature, checked);
    });
});

document.getElementById("relaxDuration").addEventListener("change", async (e) => {
    const value = parseInt(e.target.value, 10) || 20;
    await saveSetting("relaxDuration", value);

    const saved = await chrome.storage.local.get(DEFAULTS);
    if (saved.timer) {
        await sendFeatureState("timer", true);
    }
});

document.getElementById("blinkReminder").addEventListener("change", async (e) => {
    const value = parseFloat(e.target.value) || 10;
    await saveSetting("blinkReminder", value);

    const saved = await chrome.storage.local.get(DEFAULTS);
    if (saved.blink) {
        await sendFeatureState("blink", true);
    }
});

document.getElementById("relaxButton").addEventListener("click", async () => {
    const duration = parseInt(document.getElementById("relaxDuration").value, 10) || 20;
    const tab = await getActiveTab();

    if (!tab || !tab.id) return;

    chrome.tabs.sendMessage(tab.id, {
        action: "trigger_relax_mode",
        duration
    });
});

loadSavedState();