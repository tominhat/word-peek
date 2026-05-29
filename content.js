document.addEventListener("mouseup", async (event) => {
  const settings = await getSettings();

  if (!settings.enabled) {
    removeWordPopup();
    return;
  }

  const selectedWord = window.getSelection().toString().trim();

  if (!selectedWord) return;
  if (selectedWord.includes(" ")) return;

  const wordInfo = await getWordInfo(selectedWord);

  showWordPopup(
    selectedWord,
    wordInfo,
    event.pageX,
    event.pageY,
    settings.displayMode
  );
});

function showWordPopup(word, wordInfo, x, y, displayMode) {
  removeWordPopup();

  const popup = document.createElement("div");
  popup.id = "wordpeek-popup";
  popup.innerText = buildPopupText(word, wordInfo, displayMode);

  popup.style.position = "absolute";
  popup.style.left = `${x}px`;
  popup.style.top = `${y + 10}px`;
  popup.style.background = "white";
  popup.style.border = "1px solid #ccc";
  popup.style.padding = "8px 12px";
  popup.style.borderRadius = "8px";
  popup.style.boxShadow = "0 2px 8px rgba(0,0,0,0.2)";
  popup.style.zIndex = "999999";
  popup.style.fontSize = "14px";
  popup.style.color = "black";
  popup.style.whiteSpace = "pre-line";

  document.body.appendChild(popup);
}

function buildPopupText(word, wordInfo, displayMode) {
  if (!wordInfo) {
    return `${word}\n\nNo meaning found.`;
  }

  const pronunciation = wordInfo.phonetic || "No pronunciation";
  const firstMeaning = wordInfo.meanings?.[0];
  const partOfSpeech = firstMeaning?.partOfSpeech || "Unknown";
  const definition =
    firstMeaning?.definitions?.[0]?.definition || "No definition";

  if (displayMode === "phoneticOnly") {
    return `${word}\n\n${pronunciation}`;
  }

  if (displayMode === "full") {
    return `${word}\n\n${pronunciation}\n\n${partOfSpeech}\n\n${definition}`;
  }

    if (displayMode === "phoneticVietnamese") {
        const vietnameseMeaning =
            wordInfo.vietnameseMeaning || "No Vietnamese meaning";

        return `${word}\n\n${pronunciation}\n\n${vietnameseMeaning}`;
    }   

  return word;
}

function getSettings() {
  return new Promise((resolve) => {
    try {
      chrome.storage.sync.get(
        {
          enabled: true,
          displayMode: "phoneticOnly"
        },
        resolve
      );
    } catch (error) {
      console.error(error);

      resolve({
        enabled: true,
        displayMode: "phoneticOnly"
      });
    }
  });
}

async function getWordInfo(word) {
  try {
    const response = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`
    );

    if (!response.ok) {
      return null;
    }
    const data = await response.json();
    const wordInfo = data[0];

    wordInfo.vietnameseMeaning =
    await translateToVietnamese(word);

    return wordInfo;

  } catch (error) {
    console.error(error);
    return null;
  }
}

document.addEventListener("mousedown", (event) => {
  const popup = document.getElementById("wordpeek-popup");

  if (!popup) return;
  if (popup.contains(event.target)) return;

  setTimeout(() => {
    const selectedText = window.getSelection().toString().trim();

    if (!selectedText) {
      removeWordPopup();
    }
  }, 100);
});

function removeWordPopup() {
  const popup = document.getElementById("wordpeek-popup");

  if (popup) {
    popup.remove();
  }
}

async function translateToVietnamese(word) {
  try {
    const response = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(word)}&langpair=en|vi`
    );

    if (!response.ok) {
      return "No Vietnamese translation";
    }

    const data = await response.json();

    return data.responseData?.translatedText || "No Vietnamese translation";
  } catch (error) {
    console.error(error);
    return "No Vietnamese translation";
  }
}