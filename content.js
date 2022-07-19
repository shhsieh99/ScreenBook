// Send a message containing the page details back to the event page
chrome.runtime.sendMessage({
    type: "get_text",
    data : document.body.innerText
});
