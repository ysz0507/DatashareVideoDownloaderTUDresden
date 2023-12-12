function DOMtoString(selector) {
    if (selector) {
        selector = document.querySelector(selector);
        if (!selector) return "ERROR: querySelector failed to find node"
    } else {
        selector = document.documentElement;
    }
    return selector.outerHTML;
}

function onWindowLoad() {
    var link = document.querySelector('#message');

    chrome.tabs.query({ active: true, currentWindow: true }).then(function (tabs) {
        var activeTab = tabs[0];
        var activeTabId = activeTab.id;

        return chrome.scripting.executeScript({
            target: { tabId: activeTabId },
            func: DOMtoString,
            args: ['body'] 
        });

    }).then(function (body) {
        var sourceCode = body[0].result;
        // Remove stuff before url
        var prefix = 'autoplay="autoplay" playsinline="true" src="'
        sourceCode = sourceCode.substring(sourceCode.indexOf(prefix) + prefix.length)

        // Remove stuff after url
        var postfix = '" preload="metadata"'
        sourceCode = sourceCode.substring(0, sourceCode.indexOf(postfix))
        
        if(sourceCode.length != 0) {
            // Make absolute path
            sourceCode = "https://datashare.tu-dresden.de" + sourceCode
            link.setAttribute("href", sourceCode)
            link.innerText = "Start Download"

            chrome.downloads.download({
                url: sourceCode,
                // Does not work but is also not important
                filename: "lecture.mp4" 
            });

        } else {
            link.setAttribute("href", "https://www.youtube.com/watch?v=dQw4w9WgXcQ")
            link.innerText = "Could not find video Id.\nMake sure to open the video on datashare first"
        }
    }).catch(function (error) {
        link.innerText = 'There was an error injecting script : \n' + error.message;
    });
}

window.onload = onWindowLoad;