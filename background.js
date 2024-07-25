function isTimestamp(text) {
  return /^\d{10,13}$/.test(text);
}

function formatDate(date) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${day}.${month}.${year} ${hours}:${minutes}:${seconds}`;
}

function convertTimestamp(timestamp) {
  const len = timestamp.length;
  let date;
  if (len === 10) {
    date = new Date(parseInt(timestamp, 10) * 1000);
  } else if (len === 13) {
    date = new Date(parseInt(timestamp, 10));
  } else {
    return null;
  }
  return formatDate(date);
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    console.log(`Converted Time: ${text} (copied to clipboard)`);
  }).catch(err => {
    console.log(`Error copying to clipboard: ${err}`);
  });
}

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "context-menu-selection",
    title: "Convert Timestamp",
    contexts: ["selection"]
  });
});

chrome.runtime.onMessage.addListener((message, sender) => {
  if (message.action === "updateContextMenu" && sender.tab) {
    const selectedText = message.selectionText.trim();
    if (isTimestamp(selectedText)) {
      const convertedTime = convertTimestamp(selectedText);
      chrome.contextMenus.update("context-menu-selection", {
        title: convertedTime,
        contexts: ["selection"],
        visible: true
      });
    } else {
      chrome.contextMenus.update("context-menu-selection", {
        title: "Not a valid timestamp",
        contexts: ["selection"],
        visible: true
      });
    }
  }
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "context-menu-selection") {
    const selectedText = info.selectionText.trim();
    if (isTimestamp(selectedText)) {
      const convertedTime = convertTimestamp(selectedText);
      if (convertedTime) {
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: copyToClipboard,
          args: [convertedTime]
        });
      } else {
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: () => console.log("Invalid timestamp format.")
        });
      }
    } else {
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => console.log("Selected text is not a valid timestamp.")
      });
    }
  }
});
