define(['plugins/http', 'durandal/system', 'settings'], function (http, system, settings) {
	return function() {
		var self = this;
		var apiUrl = "https://na.api.pvp.net/api/lol";
		var apiVersion = "v1.4";

		self.makeRequest = function(region, route, data) {
			var promise = system.defer();
			var url = apiUrl + '/' + region + '/' + apiVersion + '/' + route + '/' + data + '?api_key=' + settings.apiKey;
			console.log(url);
			http.get(url)
				.then(function(response) {
					promise.resolve(response);
				})
				.fail(function(error) {
					console.log("failed!!!! first point");
					promise.reject(error);
				})

			return promise;
		};
	};
});