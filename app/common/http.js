define(['plugins/http', 'durandal/system'], function (http, system) {
	return function() {
		var self = this;
		var apiKey = "?api_key=21479026-9dec-4bb3-922d-7e5ea2dcc600";
		var apiUrl = "https://na.api.pvp.net/api/lol";
		var apiVersion = "v1.4";

		self.makeRequest = function(region, route, data) {
			var promise = system.defer();
			var url = apiUrl + '/' + region + '/' + apiVersion + '/' + route + '/' + data + apiKey;
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