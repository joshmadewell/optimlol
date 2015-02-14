define([], function() {
	return function() {
		var self = this;

		self.activate = function(settings) {
			self.settings = settings;
		}
	}
});