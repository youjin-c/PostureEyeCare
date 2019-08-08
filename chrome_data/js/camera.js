navigator.getUserMedia = navigator.getUserMedia ||
						 navigator.webkitGetUserMedia ||
						 navigator.mozGetUserMedia;
window.requestFileSystem = window.requestFileSystem ||
							 window.webkitRequestFileSystem;
var fs = null;
var video, frame, width, height, context, context_pstr, th;
var framenum=0;
var xTrajectory;
var yTrajectory;
var xPeakValue;
var yPeakValue;
var xTravelDistanceHistory;
var motionDistanceTh=0;
var skipFrameAfterEventFired=0;
var pageNumber=1;
frameIndex=0;
var guideline_x;
var guideline_y;
var canvas, result_canvas;
var ctx_result;
var dt;
var constraints = {
	audio: false,
	video: {
			mandatory: {
				maxWidth: 640, //320
				maxHeight: 480 //240
			}
		}
};
var linecolor = "gray";
var imgArray;
var imgIndex, imgSearchableIndex, totalImgs;
var img_path, img_fileName, img_folderName;

var rgbData, jsonObj_FD, jsonObj_BD, jsonObj_LD;
var workerURL = chrome.runtime.getURL("./chrome_data/js/pixels.js");
var worker;
//posture judgement variables
var starttime = 0, starttime_blink = 0,endtime;
var CRTRleft = null,CRTRright = null,CRTRtop = null,CRTRbottom = null;
var CRTRArry;
var postureStatus;
//blink judgement variables
var formerEye, latterEye;
var blinkCnt = 0;
var blinkStatus;
//log text variables
var logArryPosture = new Array(200);  //var
for(var j = 0; j < 200; j++){
	logArryPosture[j] = new Array(4);
	/*for(var k = 0; k < 4; k++){
		logArryPosture[j][k] = 0;
	}*/
}
var logArryBlink = new Array(200);
for(var j = 0; j < 200; j++){
	logArryBlink[j] = new Array(2);
}

var testArry = new Array(200);
for(var j = 0; j < 200; j++){
	testArry[j] = new Array(4);
	for(var k = 0; k < 4; k++){
		testArry[j][k] = 0; //Math.ceil(Math.random()*10);
	}
}
var testArry_blink = new Array(200);
for(var j = 0; j < 200; j++){
	testArry_blink[j] = new Array(2);
	for(var k = 0; k < 2; k++){
		testArry_blink[j][k] = 0; //Math.ceil(Math.random()*10);
	}
}
var readFlag = null;
var logStrgPostrue = "";
var logStrgBlink = "";
//file exists
var fileDir = null;
var dateInfo = null , startDate;
var fpsCount = 0, fpsStart, fpsEnd,oddflag=0 ;
var dateInfoStart =  new Date(); 

function initialize() {
	initFS();//secure virtual volume.
	video = document.createElement("video");
	canvas         = document.createElement("canvas");
	result_canvas = document.getElementById("result_cam");

	var posture_canvas = document.getElementById("posture_cam");
	var eyecare_canvas = document.getElementById("eyecare_cam");

	dt = new Date();
	
	imgArray = new Array([]);
	xTrajectory = new Array([]);
	yTrajectory = new Array([]);
	xPeakValue = new Array([]);
	yPeakValue = new Array([]);
	xTravelDistanceHistory = new Array([]);

	width = 640;
	height = 480;

	motionDistanceTh= width/4;
	
	canvas.width = width;
	canvas.height = height;

	context = canvas.getContext("2d");

	context_pstr = posture_canvas.getContext("2d");
	context_eycr = eyecare_canvas.getContext("2d");
	ctx_result = result_canvas.getContext('2d');

	navigator.getUserMedia(constraints, successCallback, errorCallback);

	if(worker !== undefined) { //terminate existing worker and restart new one.
		worker.terminate();
	}
	worker = new Worker(workerURL);
}

function initFS() {
	console.log("initFS : function");
		window.requestFileSystem(window.TEMPORARY, 1024*1024, function(filesystem) {
			fs = filesystem;
			console.log("filesystem created : "+fs);
			readlog();
		}, errorHandler);
}
function CallImageFile(){
	if (!fs || !imgIndex) {
		return;
	}
	fs.root.getFile(imgArray[imgSearchableIndex], {}, function (fileEntry) {//img_path.img_searchable_path
				fileEntry.file(function (blob) {
						var img_reader = new FileReader();
						img_reader.onloadend = function (e) {
								var img_result = document.createElement('IMG');
									//ctx_result = result_canvas.getContext('2d');
								img_result.src = img_reader.result;//imgArray[totalImgs].src;
								//img_result.width = 160;
								//img_result.height = 120;
								ctx_result.drawImage(img_result, 0, 0);
						};
						img_reader.readAsDataURL(blob);
				}, errorHandler);
		}, errorHandler);
}

document.getElementById("right_btn").addEventListener("click", function() {
	if(imgSearchableIndex<=0){
		imgSearchableIndex = 0;
	}
	else{
		imgSearchableIndex--;
	}
	CallImageFile();
	});
document.getElementById("left_btn").addEventListener("click", function() {
	if(imgSearchableIndex>=totalImgs-1){
		imgSearchableIndex = totalImgs-1;
	}
	else{
		imgSearchableIndex++;
	}
	CallImageFile();
	 
	});
document.getElementById("re_capture").addEventListener("click",function() {
	if (!fs) {
				return;
		}
	CRTRleft   =CRTRArry[0];
	CRTRtop    =CRTRArry[1];
	CRTRright  =CRTRArry[2];
	CRTRbottom =CRTRArry[3];
	//ctx_result.clearRect ( 0 , 0 , 640, 480 );
});
function captureImg() {
	if (!fs) {
				return;
		}
	console.log('captureImg called');
	img_fileName= calDate(dt,'date')+'_'+calDate(dt,'hour')+calDate(dt,'min')+calDate(dt,'sec');
	img_folderName = calDate(dt, 'year')+calDate(dt,'month')+calDate(dt,'date');
	img_path= '/'+img_folderName+'/'+img_fileName+'.png';
	fs.root.getDirectory(img_folderName, {create: true}, null, errorHandler);//'PosturePictures'없어도 될 것 같음.
	fs.root.getFile(img_path, {create: true}, function (fileEntry) {//'/PosturePictures/' 'image.png'
			fileEntry.createWriter(function (fileWriter) {
					var blob = canvas.toBlob(function (blob) {
						fileWriter.write(blob);
					});
			}, errorHandler);
	}, errorHandler);
}
function errorHandler(e) {
	console.log(e.name+ ": " + e.message);
}

function savelog() {
	if (!fs) {
		return;
	}
	fs.root.getFile('posture.txt', {create: true, exclusive: false}, function(fileEntry) {//posture
		//console.log("save-posture");
		fileEntry.createWriter(function(writer) {  // writer is a FileWriter object.
			var blob = new Blob([logArryPosture], {type: 'text/plain'});//logArryPosture
			writer.write(blob);
		}, errorHandler);
	}, errorHandler);
	fs.root.getFile('blink.txt', {create: true, exclusive: false}, function(fileEntry) {//eyeblinking
		//console.log("save-blink");
		fileEntry.createWriter(function(writer) {  // writer is a FileWriter object.
			var blob = new Blob([logArryBlink], {type: 'text/plain'});
			writer.write(blob);
		}, errorHandler);
	}, errorHandler);
}
function clearlog(){
	if (!fs){
		return;
	}
	fs.root.getFile('posture.txt', {create: false}, function(fileEntry){
		//console.log("clear-posture");
		fileEntry.remove(function(){
			//console.log('posture.txt removed.');
		},null);
	}, null);
	fs.root.getFile('blink.txt', {create: false}, function(fileEntry){
		//console.log("clear-blink");
		fileEntry.remove(function(){
			//console.log('blink.txt removed.');
		},null);
	}, null);
}
function readlog(){
	if (!fs) {
		console.log("readlog : no fs");
		return;
	}
	console.log("FUNCTION : readlog");
	fs.root.getFile('posture.txt', {create:false}, function(fileEntry) {
		console.log("read-posture");
		fileEntry.file(function(file) {
			var reader = new FileReader();
			var k = 0;
			reader.onloadend = function(e) {
				//var txtArea = document.getElementById('logtest');
				//txtArea.value = this.result;
				resultArry = this.result.split(',');
				for(var i=0; i<200; i++){
					for(var j=0; j<4; j++){
						logArryPosture[i][j]=resultArry[k++]*1;
					}
				}
				readFlag = true;
			};
			reader.readAsText(file);
		}, errorHandler);
	}, errorHandler);
	fs.root.getFile('blink.txt', {create:false}, function(fileEntry) {
		console.log("read-blink");
		fileEntry.file(function(file) {
			 var reader = new FileReader();
			 var k = 0;
			reader.onloadend = function(e) {
				//var txtArea = document.getElementById('logtest');
				//txtArea.value = this.result;
				resultArry_blink = this.result.split(',');
				for(var i=0; i<200; i++){
					for(var j=0; j<2; j++){
						logArryBlink[i][j]=resultArry_blink[k++]*1;
					}
				}
			};
			reader.readAsText(file);
		}, errorHandler);
	}, errorHandler);

	var startDate = calDate(dt, 'year')+calDate(dt,'month')+calDate(dt,'date');
	var yearStart, monStart, dayStart, dateDiff; 
	var newStartDate = new Date();
	var newStartDateString;

	fs.root.getFile('dateInfo.txt', {create : true, exclusive: false}, function(fileEntry) {
		fileEntry.file(function(file) {
			var reader = new FileReader();
			reader.onloadend = function(e) {
				dateInfo = this.result;
				console.log("dateInfo : "+dateInfo);
				if(!dateInfo){
					console.log("no dateInfo yet.");
					fileEntry.createWriter(function(writer) {  // writer is a FileWriter object.
						var blob = new Blob([startDate], {type: 'text/plain'});//startDate //["20140917"]
						console.log("startDate : " + startDate);
						writer.write(blob);
					}, errorHandler);
				}else{
					console.log("there's datainfo : " + dateInfo);
					yearStart = dateInfo.substr(0,4);
					monStart = dateInfo.substr(4,2);
					dayStart = dateInfo.substr(6,2);
					dateInfoStart = new Date(yearStart,monStart-1,dayStart);

					dateDiff =Math.floor( (dt.getTime()-dateInfoStart.getTime())/(1000*60*60*24) );
					console.log("dateDiff : "+dateDiff);

					if(dateDiff>=200){//# of DB
						newStartDate.setTime(dateInfoStart.getTime() - 200*(1000*60*60*24) );
						newStartDateString = calDate(newStartDate, 'year')+calDate(newStartDate,'month')+calDate(newStartDate,'date');
						for(var i =0;i<=dateDiff-199;i++){
							logArryPosture.shift();
							logArryBlink.shift();
							logArryPosture.push( [0,0,0,0]);
							logArryBlink.push([0,0]);
						}

						fileEntry.createWriter(function(writer) {  // writer is a FileWriter object.
							var blob = new Blob([newStartDateString], {type: 'text/plain'});//startDate
							writer.write(blob);
						}, errorHandler);
						//console.log(newStartDate);
						//console.log(newStartDateString);
					}
				}
			};
		reader.readAsText(file);
		}, errorHandler);//errorHandler
	//readFlag = true;
	}, null);
	
}
function calDate(dt, cond) {
	var tyear = dt.getFullYear();
	var temMonth = dt.getMonth() +1 ;
	var tmonth = ("0" + (temMonth)).slice(-2);
	var tdate = ("0" + (dt.getDate())).slice(-2);
	var thour = ("0" + (dt.getHours())).slice(-2);
	var tmin = ("0" + (dt.getMinutes())).slice(-2);
	var tsec = ("0" + (dt.getSeconds())).slice(-2);
	var calTime = null;

	switch (cond) {
		case 'year':
			calTime = tyear;
			break;
		case 'month':
			calTime = tmonth;
			break;
		case 'date':
			calTime = tdate;
			break;
		case 'hour':
			calTime = thour;
			break;
		case 'min':
			calTime = tmin;
			break;
		case 'sec':
			calTime = tsec;
			break;
	}
	return calTime;
}

function successCallback(stream) {
	video.src = URL.createObjectURL(stream);
	video.play();
	requestAnimationFrame(draw);
}


function readFrame() {
	 try {
	 	//context.scale(-1,1);
		context.drawImage(video, 0, 0, width, height);
	 } catch (e) {
		 return null;
	 }
	 return context.getImageData(0, 0, width, height);
}

function errorCallback(error){
	console.log("navigator.getUserMedia error: ", error);
}



function handleMessage(message_event){
	var dtm = new Date();
	endtime = dtm.getTime();
	try {
		jsonObj = JSON.parse(message_event.data);
		if(jsonObj.fild == 0) {
			if (jsonObj.command == 'START') {
				console.log("START");
				streamImg();
			} else {
				console.log(jsonObj.command);
			}
		} else {//if(jsonObj.fild != 0) 
			if(worker != undefined) {
				if(jsonObj.outName == "FD_Output") {
					jsonObj_FD = jsonObj;
					if(jsonObj.message == "sucess") {
						context_pstr.beginPath();
						context_pstr.rect(jsonObj.data[0].left,jsonObj.data[0].top,jsonObj.data[0].right-jsonObj.data[0].left,jsonObj.data[0].bottom-jsonObj.data[0].top);
						context_pstr.lineWidth = 2;
						context_pstr.strokeStyle = 'gray';
						context_pstr.stroke();
						context_pstr.closePath();
						CRTRArry = new Array(jsonObj.data[0].left,jsonObj.data[0].top,jsonObj.data[0].right,jsonObj.data[0].bottom);
						if(CRTRleft){
							if(jsonObj.data[0].right<(CRTRleft+CRTRright)/2){
								//time = 0 start time end time - 10  trigger and start time = 0
								if(starttime == 0){
									starttime = dtm.getTime();
								}
								if(endtime - starttime >= 15*60*1000){
									postureStatus='LEFT';
									//captureImg();
									logArryPosture[199][3] += 1;
									starttime = 0;
									//console.log('left'+logArryPosture[199][0]);
								}
							}else if(jsonObj.data[0].left>(CRTRleft+CRTRright)/2){
								if(starttime == 0){
									starttime = dtm.getTime();
								}
								//dtime = dt.getTime();
								if(endtime - starttime >= 15*60*1000){
									postureStatus='RIGHT';
									//captureImg();
									logArryPosture[199][2] += 1;
									starttime = 0;
								}
							}else if(jsonObj.data[0].right-jsonObj.data[0].left>(CRTRright-CRTRleft)*1.15){
								if(starttime == 0){
									starttime = dtm.getTime();
								}
								//dtime = dt.getTime();
								if(endtime - starttime >= 15*60*1000){
									postureStatus='FORWARD';
									//captureImg();
									logArryPosture[199][1] += 1;
									starttime = 0;
								}
							}else if(jsonObj.data[0].top< (CRTRtop - CRTRbottom)/2){
								if(starttime == 0){
									starttime = dtm.getTime();
								}
								//endtime = dt.getTime();
								if(endtime - starttime >= 15*60*1000){
									postureStatus='DOWN';
									//captureImg();
									logArryPosture[199][0] += 1;
									starttime = 0;
								}
							}else{
								postureStatus='NORMAL';
							}
						}//
						/*if(!CRTRleft){
							postureStatus='FD_FAIL';
						}*/
						// //before set the criteria
					} else {//if(jsonObj.message != "sucess")
						context_pstr.fillstyle = 'green';
						context_eycr.strokeStyle = 'green';
						context_pstr.font ='italic bold 16px sans-serif';
						context_pstr.textBaseline = 'bottom';
						//context_pstr.fillText("FAIL!",130,240);
						postureStatus='FD_FAIL'; //face detection fail.
					}
				} else if(jsonObj.outName == "LD_Output") { //Eye Lid Detection
					jsonObj_LD = jsonObj;
					/*if(jsonObj.message == "sucess") {
					}*/
				} else if (jsonObj.outName == "BD_Output") {//Blink Detection
					jsonObj_BD = jsonObj;
					context_eycr.fillStyle = 'green';
					context_eycr.font ='italic bold 16px sans-serif';
					//context_eycr.textBaseline = 'bottom';
					//context_eycr.fillText(jsonObj.blink,130,205);
					streamImg();
					//check blink event
					if(starttime_blink == 0){
						starttime_blink = dtm.getTime();
					}
					if(jsonObj_BD.blink == "BD_RES_TRIGGER"){
						blinkCnt++;
					}
					if(endtime - starttime_blink >= 60*1000){
						if(blinkCnt>13){
							blinkStatus = "good";
						}else if(blinkCnt<=13 && blinkCnt>6){
							//blinkStatus = "normal";
							blinkStatus = "caution";
						    logArryBlink[199][1] += 1;
						}
						/*else if(blinkCnt<=6 && blinkCnt>1){
							blinkStatus = "caution";
						    logArryBlink[199][1] += 1;
							//console.log('caution'+logArryBlink[199][1]);
						}*/
						else if(blinkCnt<=6){
							blinkStatus = "warning";
							logArryBlink[199][0] += 1;
							//console.log('caution'+logArryBlink[0][0]);
						}

						blinkCnt = 0;
						starttime_blink = 0;
					}
				}
			}//End of Worker Defined
			/*oddflag++;
			if(oddflag%2){
				fpsCount++;
				if(fpsCount == 1){
					fpsStart = RunTimer();
				}
				if(fpsCount == 30){
					fpsEnd = RunTimer();
					console.log("fps : " + 1000/((fpsEnd - fpsStart)/30)+"fps"+"/t"+"spf : " + (fpsEnd - fpsStart)/30 + "ms");
					fpsCount = 0;
				}
			}*/
		}//end of if(jsonObj.fild != 0) 
	}catch(e) {
	console.log(message_event.data);
	}
	//clearlog();
	savelog();
	if(readFlag){
		clearlog();
		readFlag = false;
	}
	chrome.storage.local.set({
	'blink' : blinkStatus,
	'posture' : postureStatus
	});
}
function streamImg() {
	if(worker != undefined) {
		context_pstr.putImageData(frame, 0, 0);
		context_eycr.putImageData(frame, 0, 0);
		rgbData = readFrame();//context.getImageData(0, 0,  context.width, context.height);
		worker.postMessage(rgbData);
		if(jsonObj_FD != null){
			if(jsonObj_FD.message == "sucess") {
			 context_pstr.beginPath();
			 context_pstr.rect(jsonObj_FD.data[0].left,jsonObj_FD.data[0].top,jsonObj_FD.data[0].right-jsonObj_FD.data[0].left,jsonObj_FD.data[0].bottom-jsonObj_FD.data[0].top);
			 context_pstr.lineWidth = 4;
			 context_pstr.strokeStyle = 'gray';
			 context_pstr.stroke();
			 context_pstr.closePath();

				if(postureStatus != undefined){
				context_pstr.fillstyle = 'gray';
				context_pstr.font ='blod 50px Arial';
				context_pstr.textBaseline = 'bottom';
				//context_pstr.fillText(postureStatus,0,50);
		}
			} else {
				context_pstr.fillsytle = 'green';//'#f00';
				context_pstr.font ='bold 50px Arial';
				context_pstr.textBaseline = 'bottom';
				//context_pstr.fillText("FAIL!",0,50);
			}
		}
		if(jsonObj_LD != null){
			 if(jsonObj.message == "sucess") {
			}
		}

		if(jsonObj_BD != null) {//Blink Detection
			context_eycr.fillStyle = 'green';
			context_eycr.font ='bold 50px Arial';//'italic bold 16px sans-serif';
			context_eycr.textBaseline = 'bottom';
				//if(jsonObj.blink == "BD_RET_NOBLINK"){ context_eycr.fillText("NOT BLINK",0,50); }
			//if(jsonObj.blink == "BD_RET_BLINK"){ context_eycr.fillText("BLINK",0,50); }
			//if(blinkStatus != undefined){ context_eycr.fillText(blinkStatus+blinkCnt,0,450); }
		 }

	} else {
		context_pstr.clearRect(0, 0, posture_canvas.width, posture_canvas.height);
		context_pstr.beginPath();
	}

	worker.onmessage = function(event) {
		HciModule.postMessage(event.data);
	}
		//guide line drawing
		if(postureStatus == 'NORMAL'){
			context_pstr.strokeStyle = 'green';
		}else{
			context_pstr.strokeStyle = 'red';
		}
		context_pstr.beginPath();
	context_pstr.rect(CRTRleft,CRTRtop,CRTRright-CRTRleft,CRTRbottom-CRTRtop);
	context_pstr.lineWidth = 4;
	context_pstr.stroke();
	context_pstr.closePath();

	//console.log('posture : '+logArryPosture[199][3]+' random : '+testArry[199][3]+' blink : '+logArryBlink[199][1]+' random : '+testArry_blink[199][1]);
	//readlog();
}

function draw() {
	frame = readFrame();
	frameIndex++;
	// Wait for the next frame.
	if (frameIndex %2==0)
	{
		if ((GestureNearModule!=null) && (frame))
		{
			GestureNearModule.postMessage({'keycode': 0, 'width' : width,
										'height' : height,
										'data' : frame.data.buffer, 'debug': 0});
		}
	}
	requestAnimationFrame(draw);
}
addEventListener("DOMContentLoaded", initialize);

function RunTimer(){
	var now = new Date();
	var RunTime = now.getTime();
	return RunTime;
}
