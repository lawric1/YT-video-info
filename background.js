var enable = false;

chrome.browserAction.onClicked.addListener(function (tab) {
    enable = enable ? false : true; //Switch to true or false everytime the extension is clicked.

    if(enable){
        chrome.browserAction.setBadgeText({text: "on", tabId: tab.id})
        chrome.tabs.executeScript({file: "script.js"});

    }else{
        // When extenision is disabled, send message to injected script to remove event listeners.
        chrome.tabs.sendMessage(tab.id,{
            status: "disabled"
        });

        chrome.browserAction.setBadgeText({text: "", tabId: tab.id})
    }
});

// Reloads extension when switching pages for quick debug.
chrome.tabs.onActivated.addListener(() => {
    chrome.runtime.reload()
});
