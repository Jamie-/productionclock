chrome.app.runtime.onLaunched.addListener(function() {
    chrome.app.window.create("window.html", {
        "outerBounds": {
            "width": 600,
            "height": 200
        },
    });
});

chrome.runtime.onInstalled.addListener(function() {
    // When the app gets installed, set up the context menus
    chrome.contextMenus.create({
        title: "Dark mode",
        type: "checkbox",
        id: "darkMode",
        contexts: ["all"]
    });
    chrome.contextMenus.create({
        title: "Always on top",
        type: "checkbox",
        id: "alwaysOnTop",
        contexts: ["all"]
    });
    chrome.contextMenus.create({
        title: "Enter fullscreen",
        id: "fullscreen",
        contexts: ["all"]
    });
});
