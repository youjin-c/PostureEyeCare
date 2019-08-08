var postureArryScope = window.logArryPosture;
var blinkArryScope = window.logArryBlink;

Array.max = function(array){
	return Math.max.apply(Math, array);
}
Array.min = function(array){
	return Math.min.apply(Math, array);
}
var GraphControl = function ($scope) {
  $scope.dateOptions = {
	formatYear: 'yy',
	startingDay: 1
  };

  $scope.setDefaultDay = function() {
	$scope.beginDate = new Date();
	$scope.endDate = new Date();
	$scope.beginDate.setDate($scope.endDate.getDate() - 60);
  };

  $scope.clear = function () {
	$scope.beginDate = null;
	$scope.endDate = null;
  };

  $scope.open = function($event, index) {
	$event.preventDefault();
	$event.stopPropagation();

	$scope[index] = true;
  };


function datetoarray(datapoint){
	var today = new Date();
	var DTA = Math.floor((today - datapoint) / (1000*60*60*24));
	
	return 199-DTA;
}

function generateData(begin, end, type) {
	var result = [], cur = begin; //- begin % 1000*60*60*24; //1000*60*60
	var days = (end - begin) / (1000*60*60*24);
	//var DBSltDiff = Math.ceil((begin - window.dateInfoStart) / (1000*60*60*24));
	var dtGraph = new Date();
	var DBSltDiff_end = Math.floor((dtGraph - end) / (1000*60*60*24));

	var arrySum, arryAverage;
	//may can not overload two different sized array to one variable
	if (type === 'posture'){
		for (var i = 0; i<= days; i++) {//for (cur = 0 ; cur < diffDate.getDate(); cur ++) {
			arrySum = 0;
			for(var j = 0; j<4; j++){
				arrySum += postureArryScope[199+i-days-DBSltDiff_end][j];//should access by index
			}
			//console.log('index'+(i+200-days-DBSltDiff_end)+'value'+arrySum);
			result.push([cur, arrySum]);
			cur += 1000*60*60*24;
		}
	}else{
		for (i = 0; i <= days; i++){
			arrySum = 0;
			for(j = 0; j<2; j++){
				arrySum += blinkArryScope[199+i-days-DBSltDiff_end][j];
			}
			result.push([cur, arrySum]);
			cur += 1000*60*60*24;
		}
	}
	return result;
}

  function convertUTCtoClockTime(utc) {
	d = new Date(utc);
	nday   = d.getDay();
	nmonth = d.getMonth() + 1;
	ndate  = d.getDate();
	nyear = d.getYear();
	nhour  = d.getHours();
	nmin   = d.getMinutes();
	nsec   = d.getSeconds();
	ap = " AM";

	if (nyear < 1000) nyear += 1900;

	if (nhour ===  0) nhour = 12;
	else if (nhour === 12) ap = " PM";
	else if (nhour >= 13) {ap = " PM"; nhour -= 12;}

	if (nmin <= 9) {nmin = "0" + nmin;}
	if (nsec <= 9) {nsec = "0" + nsec;}

	return "" + nmonth + "/" + ndate + "/" + nyear + " " + nhour +
		  ":" + nmin + ":" + nsec + ap + "";
  }

  $scope.drawGraph = function(type) {
	// TODO: remove this later
	var rowData = generateData($scope.beginDate.getTime(), $scope.endDate.getTime(), type);
	var options = {
	  xaxis: {
		mode: "time",
	  },
	  grid: {hoverable: true, clickable: true},
	};
	var poltData = {};
	var extStr = 'times';

	if (type === 'posture') {
	 	plotData = {
			data: rowData,
			color: "#d9534f", //red
			threshold: { color: "#5cb85c", below: 20 }, //green
			bars: { show : true, barWidth : 1000*60*60*20  },//barWidth : 40*60*1000 
			yaxis: { min: 0},
			label : 'number of times',
			labelColor : "#5cb85c"};
	}
	else {
		plotData = {
			data: rowData,
			color: "#d9534f",
			threshold: [{ color: "gold", below: 17 },
						{ color: "#5cb85c", below: 10 }],
			bars: { show : true, barWidth : 20*60*60*1000 },
			yaxis: { min: 0 },
			label : 'blinks'};
	}

	$("<div id='tooltip'></div>").css({
	  position: "absolute",
	  display: "none", //here
	  border: "1px solid #fdd",
	  padding: "2px",
	  "background-color": "#fee",
	  opacity: 0.80
	}).appendTo("body");
	//$("#postureplaceholder.legend table").css({background-color: "#5cb85c"});

	$.plot("#" + type + "placeholder", [plotData], options);

	$("#" + type + "placeholder").bind("plothover", function (event, pos, item) {
	  if (item) {
		var x = item.datapoint[0],
			y = item.datapoint[1];

		$("#tooltip")
		  .html("<strong>" + y + "</strong>" + extStr + " : <small>" +
			  convertUTCtoClockTime(x) + "</small>")
		  .css({top: item.pageY + 5, left: item.pageX + 5})
		  .fadeIn(10);
	  } else {
		$("#tooltip").hide();
	  }
	});
	$("#postureplaceholder").on('plotclick',function(event,pos,item){
		if(item){
			var date = item.datapoint[0];
			var index = datetoarray(date);
			//console.log('date'+date);
			$scope.drawInbody(postureArryScope[index]);
			$scope.setPostureComment(postureArryScope[index]);
			$scope.readImages(date);
		}
	});
	$("#eyeplaceholder").on('plotclick',function(event,pos,item){
		if(item){
			var date = item.datapoint[0];
			var index = datetoarray(date);
			$scope.drawEyeAlarm(blinkArryScope[index]);
			$scope.setEyeComment(blinkArryScope[index]);
		}
	});
  };
  $scope.drawInbody= function(inputarray){
  	var maxIndex = inputarray.indexOf(Array.max(inputarray));
  	var minIndex = inputarray.indexOf(Array.min(inputarray));

	var rawData = [];
	for(var i=0;i<4;i++){
		if(inputarray[i]<3){
			rawData.push({data: [[inputarray[i],i]], color : "#5cb85c"});
		}
		else{
			if(i == maxIndex){
		 		rawData.push({data: [[inputarray[i],i]], color : "#d9534f"});
		 	}else{
		 		rawData.push({data: [[inputarray[i],i]], color : "gold"});
		 	}
		}
	 	/*if(i == maxIndex){
	 		rawData.push({data: [[inputarray[i],i]], color : "#d9534f"});
	 	}else if(i == minIndex){
	 		rawData.push({data: [[inputarray[i],i]], color : "#5cb85c"});
	 	}else{
	 		rawData.push({data: [[inputarray[i],i]], color : "gold"});
	 	}*/
	};
	var inbodyticks = [[0,"down"],[1,"forward"],[2,"right"],[3,"left"]];
	var inbodyoptions = {
	bars: {
		align:"center",
		barWidth: 0.5,
		show: true,
		horizontal: true,
	  },
	  grid: {
		hoverable: true,
		clickable: true, 
		autoHighlight: true
	  },
	  xaxis: {
		ticks: 0,
		max: 12
	  },
	  yaxis: {
		axisLabel: "Postures",
		ticks: inbodyticks,
	  }
	};
	$.plot($("#inbodyplaceholder"), rawData, inbodyoptions);//[inbodyData]

	$("#inbodyplaceholder").bind("plothover", function (event, pos, item) {
	  if (item) {
		var x = item.datapoint[0],
			y = item.datapoint[1];

		$("#tooltip")
		  .html("<strong>" + x + "</strong>")
		  .css({top: item.pageY + 5, left: item.pageX + 5})
		  .fadeIn(10);
	  }else {
		$("#tooltip").hide();
	  }
	});
  };
  $scope.drawEyeAlarm= function(inputarray){
	var rawData = [{data: [[inputarray[0],0]],  color :"#d9534f" }, 
				   {data: [[inputarray[1],1]],  color :"gold" }];
	var inbodyoptions = {
	  bars: {
		align:"center",
		barWidth: 0.4,
		show: true,
		horizontal: true,
	  },
	  grid: {
		hoverable: true,
		clickable: true,
	  },
	  xaxis: {
		ticks: 0,
		max: 12,
	  },
	  yaxis: {
		ticks: [[0,"warning"],[1,"caution"]]
	  }
	};
	$.plot($("#eyealarmplaceholder"), rawData, inbodyoptions);

	$("#eyealarmplaceholder").bind("plothover", function (event, pos, item) {
	  if (item) {
		var x = item.datapoint[0],
			y = item.datapoint[1];

		$("#tooltip")
		  .html("<strong>" + x + "</strong>")
		  .css({top: item.pageY + 5, left: item.pageX + 5})
		  .fadeIn(10);
	  } else {
		$("#tooltip").hide();
	  }
	});
  };
  $scope.setPostureComment = function(inputarray) {
  var maxIndex = inputarray.indexOf(Array.max(inputarray));
  var postureComment = document.getElementById('postureComment');
  
  switch(maxIndex) {
  	case 0: //down
  		postureComment.innerHTML = '눕는 자세를 하는 경우가 많습니다.';
  		break;
  	case 1: //forward
  		postureComment.innerHTML = '거북목 증후군의 위험성이 있습니다.<br>턱을 당기고 가슴을 펴 몸의 중심을 뒤로 가져가세요!';
  		break;
  	case 2: //right
  		postureComment.innerHTML = '자세가 오른쪽으로 치우친 경향이 있습니다.';
  		break;
  	case 3: //left
  		postureComment.innerHTML = '자세가 왼쪽으로 치우친 경향이 있습니다.';
  		break;
  	}
  };
  $scope.setEyeComment = function(inputarray) {
	var arraySum = 0;
  	var eyeComment = document.getElementById('eyeComment');

  	for(var i = 0; i < 2 ;i++){
  		arraySum += inputarray[i];
  	}
	if(arraySum>=0&&arraySum<12){
		eyeComment.innerHTML = '안구 건조증의 위험성이 있습니다.<br>습도와 눈의 휴식에 신경 써 주세요!';
	}
	else if(arraySum>=12&&arraySum<=20){
	    eyeComment.innerHTML = '안구 건조증이 의심됩니다.<br>습도와 눈의 휴식에 신경 써 주세요!';
	}
};
	$scope.readImages = function(date) {
		var d = new Date();
		var returnDir = null;
		
		if (!fs) {
			return;
		}
		
		d.setTime(date);
		//console.log('d is '+d);
		img_folderName = calDate(d, 'year')+calDate(d,'month')+calDate(d,'date');
		//console.log('folder name is'+img_folderName);
		returnDir = fs.root.getDirectory(img_folderName,{create: false},function(dirEntry){//'PosturePictures'
			//console.log('folder :'+img_folderName+'dirEntry : '+dirEntry);
			var dirReader = dirEntry.createReader();//fs.root.createReader();dirEntry.createReader();
			dirReader.readEntries(function (entries) {
				imgIndex = 0;
				imgSearchableIndex = 0;
				for (var i = 0, entry; entry = entries[i]; ++i) {
				    imgArray[imgIndex++] = '/'+img_folderName+'/'+entry.name;
				}
				totalImgs = imgArray.length;
				CallImageFile();
				//console.log('entries'+entries);
			}, errorHandler);
		});
		//console.log('folder :'+img_folderName+'returnDir : '+returnDir);
		if(!returnDir){//dirReader
			ctx_result.clearRect ( 0 , 0 , 640, 480 );	//CLEAR CANVAS HERE
		}
	};

  $scope.setDefaultDay();
};
