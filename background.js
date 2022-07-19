chrome.runtime.onMessage.addListener( data => {
	if ( data.type === 'notification' ) {
		notify( data.message );
	}
});

chrome.runtime.onInstalled.addListener( () => {
	chrome.contextMenus.create({
		id: 'notify',
		title: "Notify!: %s", 
		contexts:[ "selection" ]
	});
});

chrome.contextMenus.onClicked.addListener( ( info, tab ) => {
	if ( 'notify' === info.menuItemId ) {
		notify( info.selectionText );
	}
} );

const notify = message => {
	var urlBase = 'https://8r9rond8o8.execute-api.us-west-2.amazonaws.com/Prod/comprehend-api?';
	fetch(urlBase + 'message="' + message + '"')
		.then(r => r.text())
		.then(response => {
			// update notification count
			chrome.storage.local.get( ['notifyCount'], data => {
				let value = data.notifyCount || 0;
				chrome.storage.local.set({ 'notifyCount': Number( value ) + 1 });
			} );

			// transform response to result
			var parsed = JSON.parse(response);
			result = parsed.Classes[0].Name;
			
			if ( result === 'suicide' ) {
                result = "CONTENT WARNING: Text may contain suicidal content";
            }
            else {
                result = "All clear!"
			}
			//returns "May contain suicidal content" if suicidal rate > nonsuicidal rate
			//returns "All clear" else

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
};

console.log(notify.message);