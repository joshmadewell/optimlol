define([], function() {
	return function() {
		var self = this;

		self.activate = function(settings) {
			console.log(settings);
			self.settings = settings;
		}
	}
});