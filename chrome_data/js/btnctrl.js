capturebtn_flag = false;
var BtnTextControl = function ($scope) {
	//var capturebtn_flag = false;
	var scanbtn_flag = false;

	$scope.captureBtnLabel = function() {
		if (!capturebtn_flag)
			return 'Capture';
		else
			return 'Re-Capture';
	};
	$scope.scanBtnLabel = function() {
		if (!scanbtn_flag)
			return 'Start Scanning';
		else
			return 'Stop Scanning';
	};
	$scope.recapture = function() {
		capturebtn_flag = true;
	}
}
