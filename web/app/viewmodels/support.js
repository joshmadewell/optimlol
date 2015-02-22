define([], function() {
	return function() {
		var self = this;

		self.activate = function() {
			if (window.__gaTracker && typeof window.__gaTracker === 'function') {
				window.__gaTracker('send', 'pageview', '/support');
			}
		};
	};
});

