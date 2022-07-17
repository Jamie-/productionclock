$(document).ready(function() {
    chrome.storage.local.get(["options"], function (result) {
        console.log("Restored options: ", result);
        window.options = result["options"] || {};
        applyStartConfig(window.options);
        window.clock = new Clock("#clock", window.options);
        window.clock.startTick();
        fitClock();
    });
});

function fitClock() {
    fitFont("#clock", ".container", 20);
}

function fitFont(srcSelector, tgtSelector, padding) {
    let src = $(srcSelector);
    let tgt = $(tgtSelector);
    src.hide();

    let size = 50;  // start font size
    let delta = 30;  // initial delta
    const minDelta = 8;

    const width = tgt.width() - padding;
    const height = tgt.height() - padding;
    let counter = 0;

    while (true) {
        counter++;
        src.css("fontSize", size);
        if (src.width() > width || src.height() > height) {
            size -= delta;
            if (delta <= minDelta) {
                src.css("fontSize", size);
                break;
            }
            delta /= 2;
            if (delta < minDelta) delta = minDelta;
        }
        size += delta;
    }
    src.show();
    console.log("Resizing done, font size: " + size + ", took " + counter + " iterations");
}

// Set config in local storage
function setConfig(key, value) {
    window.options[key] = value;
    chrome.storage.local.set({options: window.options});
}

// Apply loaded config at app startup
function applyStartConfig(options) {
    setDarkMode(options["darkMode"] || false);
    // Update checkboxes in context menu
    if (options["12hr"] === true) {
        chrome.contextMenus.update("12hr", {checked: true});
    }
    if (options["darkMode"] === true) {
        chrome.contextMenus.update("darkMode", {checked: true});
    }
}

// Set dark mode enabled/disabled
function setDarkMode(enabled) {
    if (enabled) {
        $("body").addClass("theme-dark");
    } else {
        $("body").removeClass("theme-dark");
    }
    setConfig("darkMode", enabled);
}

$(window).resize(function () {
    if (window.resizeTimer !== undefined) {
        // If we already have a window resize timer set, clear it before creating a new one.
        clearTimeout(window.resizeTimer);
    }
    window.resizeTimer = setTimeout(fitClock, 100);
});

// Context menu handler
chrome.contextMenus.onClicked.addListener(function(event) {
    if (!document.hasFocus()) {
        console.log("Ignoring context menu click that happened in another window");
        return;
    }
    switch (event.menuItemId) {
        case "alwaysOnTop":
            chrome.app.window.current().setAlwaysOnTop(event.checked);
            setConfig("alwaysOnTop", event.checked);
            break;
        case "darkMode":
            setDarkMode(event.checked);
            break;
        case "12hr":
            setConfig("12hr", event.checked);
            window.clock.tick(true);
            fitClock();
            break;
        case "fullscreen":
            chrome.app.window.current().fullscreen();
            break;
        default:
            console.log("Unrecognised context menu event:");
            console.log(event);
    }
});
