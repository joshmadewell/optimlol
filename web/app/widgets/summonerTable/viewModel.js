define([], function() {
	return function() {
		var self = this;

		self.activate = function(settings) {
			self.validSummoners = settings.validSummoners;
			self.leagueStats = settings.leagueStats;
			self.totalStats = settings.totalStats;
			self.recentHistory = settings.recentHistory;
		}
	}
});