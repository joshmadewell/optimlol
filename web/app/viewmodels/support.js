define([], function() {
	return function() {
		var self = this;

		self.activate = function() {
			if (window.ga && typeof window.ga === 'function') {
				window.ga('send', 'pageview', '/support');
			}
		};
	};
});

