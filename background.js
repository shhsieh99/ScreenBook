async function getCurrentTab() {
	let queryOptions = { active: true, lastFocusedWindow: true };
	// `tab` will either be a `tabs.Tab` instance or `undefined`.
	let [tab] = await chrome.tabs.query(queryOptions);
	return tab;
  }

var current_tab = getCurrentTab();
chrome.tabs.onActivated.addListener( function(activeInfo){
	chrome.tabs.get(activeInfo.tabId, function(tab){
		current_tab = tab.id;
		// console.log("you are here: "+ current_tab);
	});
});

function blurring() {
	// console.log("entered blurring function");
    document.querySelector("body").style.filter = "blur(10px)";
	// console.log("ran blurring");
	window.requestAnimationFrame(() => {
		window.requestAnimationFrame(() => {
			if (window.confirm("May contain suicidal content. View anyway?") ) {
				// console.log("created popup");
				document.querySelector("body").style.filter = "blur(0px)";
				// console.log("unblurred");
			}
		});
	});
}

// function unblur() {
// 	if (window.confirm("May contain suicidal content. View anyway?") ) {
// 		document.querySelector("*").style.WebkitFilter = "blur(0px)";
// 	}
// }

// console.log("You should see me once.");

chrome.webNavigation.onCompleted.addListener(function(details) {
    if(details.frameId === 0) {
        // Fires only when details.url === currentTab.url
        chrome.tabs.get(details.tabId, function(tab) {
            if(tab.url === details.url) {
                // console.log('You should see me once.');
				chrome.scripting.executeScript({
					target: { tabId: current_tab},
					files: ['content.js']
				});
            }
        });
    }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	if (request.type === 'get_text') {
		var urlBase = 'https://8r9rond8o8.execute-api.us-west-2.amazonaws.com/Prod/comprehend-api?';
		fetch(urlBase + 'message="' + request.data + '"')
			.then(r => r.text())
			.then(response => {
				var parsed = JSON.parse(response);
				result = parsed.Classes[0].Name;

				if ( result === 'suicide' ) {
					result = "CONTENT WARNING: Text may contain suicidal content"
					chrome.scripting.executeScript({
						target: { tabId: current_tab},
						function: blurring
					});
					// chrome.scripting.executeScript({
					// 	target: {tabId: current_tab},
					// 	function: unblur
					// });
				}
				else {
					result = "All clear!"
				}

				// console.log('You should see me once.');

				// create notification with result
				return chrome.notifications.create(
					'',
					{
						type: 'basic',
						title: 'ScreenBook',
						message: result || 'ScreenBook',
						iconUrl: './assets/icons/128.png',
					}
				);
		})
	}
});
