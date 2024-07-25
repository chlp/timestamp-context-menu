document.addEventListener('selectionchange', () => {
  const selection = window.getSelection().toString();
  chrome.runtime.sendMessage({
    action: "updateContextMenu",
    selectionText: selection
  });
});