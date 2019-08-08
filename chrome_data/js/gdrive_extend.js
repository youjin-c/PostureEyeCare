
function DocsController($scope, $http, gdocsEx) {
	// Toggles the authorization state.
	$scope.gdriveAuth = function(interactive) {
		if (!gdocsEx.accessToken) {
			gdocsEx.auth(interactive, function() {
				gdocsEx.fetchDocLists(
					$http,
					function() {},
					function(resp, status, headers, config) { // error callback
						console.log("Error:", resp.items);
					});
			});
		} else {
			gdocsEx.revokeAuthToken(function() {});
		}
	}

	// when upload button is clicked,
	// uploads the local log file to server
	$scope.uploadLogs = function() {
		myFsUtils.fEntry.file(function(file) {
			gdocsEx.upload(file, function() {}, true);
		});
	};
}

DocsController.$inject = ['$scope', '$http', 'gdocsEx']; // For code minifiers.

function GDocsExtends() {}

GDocsExtends.prototype = new GDocs();

GDocsExtends.prototype.downloadDoc = function(url, onloadCB, onerrorCB) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    xhr.setRequestHeader('Authorization', 'Bearer ' + this.accessToken);
    xhr.onload = function() {
    	onloadCB(xhr.responseText);
    };
    xhr.onerror = function() {
    	onerrorCB(xhr.responseText);
    };
    xhr.send();
};

GDocsExtends.prototype.fetchDocLists = function(http, successCB, failCB) {
    var config = {
        params: {'alt': 'json'},
        headers: {'Authorization': 'Bearer ' + this.accessToken}
    };

    http.get(this.DOCLIST_FEED, config).success(successCB).error(failCB);
};
