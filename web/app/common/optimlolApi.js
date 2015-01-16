define(['plugins/http', 'durandal/system', 'settings'], function (http, system, settings) {
	return function() {
		var self = this;

		self.makeRequest = function(region, path) {
			var url = settings.optimlolUrl + "/" + region + "/" + path; 
			var promise = system.defer();
			http.get(url + route)
				.then(function(response) {
					promise.resolve(response);
				})
				.fail(function(error) {
					promise.reject(error);
				})

			return promise;
		};
	};
});