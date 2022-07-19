const text = document.getElementById( 'notify-text' );
const notify = document.getElementById( 'notify-button' );
const reset = document.getElementById( 'notify-reset' );
const counter = document.getElementById( 'notify-count' );

chrome.storage.local.get( ['notifyCount'], data => {
	let value = data.notifyCount || 0;
	counter.innerHTML = value;
} );

chrome.storage.onChanged.addListener( ( changes, namespace ) => {
	if ( changes.notifyCount ) {
		let value = changes.notifyCount.newValue || 0;
		counter.innerHTML = value;
	}
});

reset.addEventListener( 'click', () => {
	chrome.storage.local.clear();
	text.innerText = '';
} );

notify.addEventListener( 'click', () => {
	chrome.runtime.sendMessage( '', {
		type: 'notification',
		message: text.value
	});
} );

if(document.readyState !== 'complete') {
	window.addEventListener('load', async function(evt) {
		let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
		chrome.scripting.executeScript({
			target: { tabId: tab.id},
			files: ['content.js']
		});
	});
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	if (request.type === 'get_text') {
		text.innerText = request.data;
		return true;
	  }
});