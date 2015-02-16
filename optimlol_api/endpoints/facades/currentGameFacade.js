var q = require('q');
var _currentGameDataProvider = null;

var TEAM_MAPPINGS = {
	100: "BLUE",
	200: "RED"
}

var _getCurrentGameData = function(region, summonerId) {
	var deferred = q.defer();
	_currentGameDataProvider.getCurrentGame(region, summonerId)
		.then(function(currentGameData) {
			var dataToReturn = { 
				playerInGame: false,
				playersTeam: null,
				RED: [],
				BLUE: []
			};

			if (currentGameData.data) {
				dataToReturn.playerInGame = true;
				currentGameData.data.participants.forEach(function(participant) {
					var participantId = participant.summonerId;

					if (participantId === summonerId) {
						dataToReturn.playersTeam = TEAM_MAPPINGS[participant.teamId];
					}

					switch (participant.teamId) {
						case 100: dataToReturn.BLUE.push(participant.summonerName); break;
						case 200: dataToReturn.RED.push(participant.summonerName); break;
					}
				});
			}

			deferred.resolve(dataToReturn);
		})
		.fail(function(error) {
			deferred.reject(error);
		});

	return deferred.promise;
}

var _init = function() {
	var CurrentGameDataProviderConstructor = require('../../persistence/dataProviders/currentGameDataProvider');
	_currentGameDataProvider = new CurrentGameDataProviderConstructor();
	_currentGameDataProvider.init();
}

module.exports = function() {
	var self = this;
	self.init = _init;
	self.getCurrentGameData = _getCurrentGameData;
}