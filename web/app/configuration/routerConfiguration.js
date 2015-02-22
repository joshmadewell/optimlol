define(['plugins/router'],
function(router) {
	var _configureRouter = function() {
		router.convertRouteToTitle = function() {
            return "";
        }
	};

	return {
		configure: _configureRouter
	}
});