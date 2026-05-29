const enabledToggle = document.getElementById("enabledToggle");
const displayModeSelect = document.getElementById("displayMode");

chrome.storage.sync.get(
  {
    enabled: true,
    displayMode: "phoneticOnly"
  },
  (settings) => {
    enabledToggle.checked = settings.enabled;
    displayModeSelect.value = settings.displayMode;
  }
);

enabledToggle.addEventListener("change", () => {
  chrome.storage.sync.set({
    enabled: enabledToggle.checked
  });
});

displayModeSelect.addEventListener("change", () => {
  chrome.storage.sync.set({
    displayMode: displayModeSelect.value
  });
});