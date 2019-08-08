var icon_canvas=document.getElementById("eye_canvas");
var context_icon=icon_canvas.getContext("2d");

var myCnt=setInterval(function(){icons_cntl()},100);

var blinkStatus, postureStatus;
var eyecolor;

function icons_cntl($scope) {
	$('#expend_arrow').click(function() {
	    setTimeout(chrome.app.window.current().hide);
	    var resotre_window = chrome.app.window.get('posture_eyecare');
	    resotre_window.show();
    });
    $('#min_close').click(function() {
    	chrome.app.window.current().close();
    });
    
	chrome.storage.local.get(['blink','posture'], function(result){
		blinkStatus = result.blink;
		postureStatus = result.posture;
    });

    if(blinkStatus == "good")
    {
        //eyecolor = "springgreen";
        eyecolor = "#FFFFFF";
    }
    /*if(blinkStatus == "normal"){
	    eyecolor = "deepskyblue";
    }*/
    if(blinkStatus == "caution"){
	    eyecolor = "gold";
    }if(blinkStatus == "warning"){
    	eyecolor = "crimson";
    }/*if(blinkStatus == "bd_fail"){
	    document.getElementById("eye_img").src="images/bd_fail.png";
	    eyecolor = "#FFFFFF";//document.getElementById("eye_canvas").style.opacity = "0";
    }else{*/
	document.getElementById("eye_img").src="images/min_eye.png";
    //}
    if(postureStatus == "LEFT"){
	    document.getElementById("posture_img").src="images/min_right.png";
    }if(postureStatus == "RIGHT"){
	    document.getElementById("posture_img").src="images/min_left.png";
    }if(postureStatus == "FORWARD"){
	    document.getElementById("posture_img").src="images/forward.png";
    }if(postureStatus == "NORMAL"){
	    document.getElementById("posture_img").src="images/min_front.png";
    }if(postureStatus == "DOWN"){
	    document.getElementById("posture_img").src="images/down.png";
    }if(postureStatus == "FD_FAIL"){
	    document.getElementById("posture_img").src="images/fd_fail_small.png";
    }     
    context_icon.lineWidth="10";
    context_icon.strokeStyle=eyecolor;
    context_icon.beginPath();
    context_icon.arc(24.5,24.5,6,0,2*Math.PI);
    context_icon.stroke();
}
addEventListener("DOMContentLoaded", icons_cntl);