statusText = 'Loaded';
GestureNearModule = null;  // Global application object.
 
// Indicate load success.
function moduleDidLoad() {
    HciModule = document.getElementById('hci_app');
	document.addEventListener('keydown', function(event) {
	console.log("keydown %d", event.keyCode);
	}, false);
}
		
document.addEventListener('message', handleMessage, true);
document.addEventListener('load', moduleDidLoad, true);