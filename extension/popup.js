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

const features = ["guideBar", "dots", "timer", "bionic", "blink", "magnification", "lazy", "focus", "iso", "syllables", "cursor"];

features.forEach((feature) => {
    const checkbox = document.getElementById(feature);
    checkbox.addEventListener('change', async (e) =>{
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true});
        chrome.tabs.sendMessage(tab.id, {
            action: `toggle_${feature}`,
            value: e.target.checked
          });
    });
});

document.getElementById('relaxButton').addEventListener('click', async () => {
    const duration = parseInt(document.getElementById('relaxDuration'). value, 10) || 20;
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true});
    chrome.tabs.sendMessage(tab.id, {
        action: 'trigger_relax_mode',
        duration
    });
});