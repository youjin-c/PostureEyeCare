var flag_registration = 'F';
var flag_autostart = 'F';
var flag_screenmode = 'F';
var flag_cloudsave = 'F';

function initHandlers() {
	$('#close').click(function() {
		chrome.app.window.current().close();
	});
	$('#minimize').click(function() {
		setTimeout(chrome.app.window.current().minimize);
	});

	// $('#expend_arrow').click(function() {
	// 	setTimeout(chrome.app.window.current().hide);

	// 	chrome.app.window.create('main.html', {
	// 		id:'posture_correction',
	// 		frame:"none",
	// 		bounds:{
	// 			width: 660,
	// 			height: 450
	// 		},
	// 		minWidth: 660,
	// 	    minHeight: 450,
	// 	    maxWidth: 660,
	// 	    maxHeight: 450
	// 	});
	// });
}

function init() {
	chrome.storage.sync.get(function(items) {
		/*flag_registration=items.flag_registration;
		flag_autostart=items.flag_autostart;
		flag_screenmode=items.flag_screenmode;
		flag_cloudsave=items.flag_cloudsave;
		if(!flag_registration)
		{
			flag_registration='F';
		}

		if(flag_registration=='T')
		{
			//miniwindow_button_active();
		}*/
	});
	initHandlers();
}

$(document).ready(function() {
  if (typeof cordova !== 'undefined') {
    document.addEventListener("deviceready", init);
  } else {
    init();
  }
});