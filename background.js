chrome.runtime.onMessage.addListener( data => {
	if ( data.type === 'notification' ) {
		notify( data.message );
	}
});

// chrome.runtime.onInstalled.addListener( () => {
// 	chrome.contextMenus.create({
// 		id: 'notify',
// 		title: "Notify!: %s", 
// 		contexts:[ "selection" ]
// 	});
// });


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
		  console.log("you are here: "+ current_tab);
	  });
  });

// chrome.contextMenus.onClicked.addListener( ( info, tab ) => {
// 	if ( 'notify' === info.menuItemId ) {
// 		notify( info.selectionText );
// 	}
// } );

function blurring() {
    function toggleElementBlur(elm) {
        var elmBlurLevel = "10px";
        elm.style.WebkitFilter = "blur(" + elmBlurLevel + ")";
    };
    toggleElementBlur(document.querySelector("*"));
}

function unblur() {
	function toggleElementUnblur(elm) {
        var elmBlurLevel = "0px";
        elm.style.WebkitFilter = "blur(" + elmBlurLevel + ")";
    };
	if ( window.confirm("May contain suicidal content. View anyway?") ) {
		toggleElementUnblur(document.querySelector("*"));
	}
}

chrome.tabs.onUpdated.addListener(function(tabId, info) {
	if (info.status === "complete") {
		// let [tab] = chrome.tabs.query({ active: true, currentWindow: true });
		chrome.scripting.executeScript({
			target: { tabId: current_tab},
			files: ['content.js']
		})
	}
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	if (request.type === 'get_text') {
		var urlBase = 'https://8r9rond8o8.execute-api.us-west-2.amazonaws.com/Prod/comprehend-api?';
		fetch(urlBase + 'message="' + request.data + '"')
			.then(r => r.text())
			.then(response => {
				// update notification count
				// chrome.storage.local.get( ['notifyCount'], data => {
				// 	let value = data.notifyCount || 0;
				// 	chrome.storage.local.set({ 'notifyCount': Number( value ) + 1 });
				// } );

				// transform response to result
				var parsed = JSON.parse(response);
				result = parsed.Classes[0].Name;
				if ( result === 'suicide' ) {
					result = "CONTENT WARNING: Text may contain suicidal content"
					chrome.scripting.executeScript({
						target: { tabId: current_tab},
						function: blurring
					});
					chrome.scripting.executeScript({
						target: {tabId: current_tab},
						function: unblur
					});
				}
				else {
					result = "All clear!"
				}

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
		return true;
	  }
});
