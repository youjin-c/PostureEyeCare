var posture_eyecare = angular.module('posture_eyecare', ['ui.bootstrap']);

posture_eyecare.factory('gdocsEx', function() {
  return new GDocsExtends();
});

setImages();
function setImages() {
    document.getElementById("sideBtn_1_img").src="images/posture_20px.png";
    document.getElementById("sideBtn_2_img").src="images/eye_20px.png";
    document.getElementById("sideBtn_3_img").src="images/posture_20px.png";
    document.getElementById("sideBtn_4_img").src="images/eye_20px.png";
}

function SidebarCtrl($scope) {
  $scope.oneAtATime = true;

  $scope.groups = [
    {
      title: 'Register',
      content1: 'Posture',
      content2: 'Eye care',
      images: 'images/register.png'
    },
    {
      title: 'Results',
      images: 'images/results.png'
    },
    {
      title: 'Settings',
      images: 'images/settings.png'
    }
  ];

  $scope.status = {
    isFirstOpen: true,
    isFirstDisabled: false
  };

  $scope.register_posture = function() {
    console.log("register_posture");
    $('#main-content > div').addClass('hidden');
    $('#page_posture_capture').removeClass('hidden');
    draw();

    $('#sidebar .sidebtn').removeClass('sidebtn-click');
    $('#sideBtn_1').addClass('sidebtn-click');
    setImages();
    document.getElementById("sideBtn_1_img").src="images/posture_20px_grey.png";

    $('.progress-bar').progressbar({display_text: 'fill'});
  };
  $scope.register_eyecare = function() {
    console.log("register_eyecare");
    $('#main-content > div').addClass('hidden');
    $('#page_eye_capture').removeClass('hidden');
    draw();

    $('#sidebar .sidebtn').removeClass('sidebtn-click');
    $('#sideBtn_2').addClass('sidebtn-click');
    setImages();
    document.getElementById("sideBtn_2_img").src="images/eye_20px_grey.png";
  };
  $scope.results_posture = function() {
    console.log("results_posture");
    $('#main-content > div').addClass('hidden');
    $('#page_posture_graph').removeClass('hidden');

    $('#sidebar .sidebtn').removeClass('sidebtn-click');
    $('#sideBtn_3').addClass('sidebtn-click');
    setImages();
    document.getElementById("sideBtn_3_img").src="images/posture_20px_grey.png";
  };
  $scope.results_eyecare = function() {
    console.log("results_eyecare");
    $('#main-content > div').addClass('hidden');
    $('#page_eyecare_graph').removeClass('hidden');

    $('#sidebar .sidebtn').removeClass('sidebtn-click');
    $('#sideBtn_4').addClass('sidebtn-click');
    setImages();
    document.getElementById("sideBtn_4_img").src="images/eye_20px_grey.png";
  };
  $scope.settings = function() {
    console.log("settings");
    $('#main-content > div').addClass('hidden');
    $('#page_setting').removeClass('hidden');

    $('#sidebar .sidebtn').removeClass('sidebtn-click');
    setImages();
  };

  $scope.minimize = function() {
    setTimeout(chrome.app.window.current().hide);

    var minimize_window = chrome.app.window.get('minimize');
    if(!minimize_window){
    	chrome.app.window.create('minimize.html', {
	      	id:'minimize',
	     	frame:"none",
	     	bounds:{
	        	width: 122,
	        	height:60
	      	},
	     	minWidth: 122,
	        minHeight: 60,
	        maxWidth: 122,
	        maxHeight: 60
    	});
    }
    minimize_window.show();
    icons_cntl();
  	};
}

function IntroButtonCtrl($scope) {
  $scope.oneAtATime = true;

  $scope.groups = [
    {
      title: 'Register',
      content1: 'Posture',
      content2: 'Eye care',
      images: 'images/register.png'
    },
    {
      title: 'Results',
      images: 'images/results.png'
    },
    {
      title: 'Settings',
      images: 'images/settings.png'
    }
  ];

  $scope.status = {
    isFirstOpen: true,
    isFirstDisabled: false
  };
  $scope.go_register_settings = function() {
    console.log("go_register_settings");
    $('#intro').addClass('hidden');
    $('#main').removeClass('hidden');
    $('#main-content > div').addClass('hidden');
    $('#page_posture_capture').removeClass('hidden');
    draw();

    //$('#sidebar .sidebtn').removeClass('sidebtn-click');
    //$('#sideBtn_1').addClass('sidebtn-click');
    //$('#sideBtn_2').addClass('sidebtn-click');
    setImages();
    document.getElementById("sideBtn_1_img").src="images/posture_20px_grey.png";
  };

  $scope.setting_minimize = function() {
    setTimeout(chrome.app.window.current().hide);

    var minimize_window = chrome.app.window.get('minimize');
    if(!minimize_window){
    	chrome.app.window.create('minimize.html', {
	      	id:'minimize',
	     	frame:"none",
	     	bounds:{
	        	width: 122,
	        	height:60
	      	},
	     	minWidth: 122,
	        minHeight: 60,
	        maxWidth: 122,
	        maxHeight: 60
    	});
    }
    minimize_window.show();
    icons_cntl();
  	};
    /*setTimeout(chrome.app.window.current().hide);

    chrome.app.window.create('minimize.html', {
      id:'setting_minimize',
      frame:"none",
      bounds:{
        width: 122,
        height:60
      },
      minWidth: 122,
        minHeight: 60,
        maxWidth: 122,
        maxHeight: 60
    });
    icons_cntl();
  };*/
}

function SltChckbxCntrl($scope){
  var check_flag = false;

  $scope.SltChckbxCntrl = function(){
    if(!check_flag){//added
      check_flag = true;
      document.getElementById("recommended_option").selected = "true";
    }else{
      check_flag = false;
    }
  };
  $scope.SltbxCntl = function(){
    document.getElementById("EB_rcmmd_chk").checked = false;
    check_flag = false;
  };
}