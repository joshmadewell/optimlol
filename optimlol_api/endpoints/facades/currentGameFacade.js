var _dataProvider = null;

var PromiseFactoryConstructor = require('../../common/utilities/promiseFactory');
var _promiseFactory = new PromiseFactoryConstructor();

var _getCurrentGameData = function(region, summonerId) {
	return _promiseFactory.defer(function(deferredObject) {
		_dataProvider.getData('currentGame', {region: region, summonerId: summonerId})
			.then(function(currentGameData) {
				var optimlolCurrentGame = {
					blueTeam: [],
					redTeam: [],
					bannedChampions: null,
					gameFound: false
				}

				if (currentGameData.data !== null) {
					optimlolCurrentGame.gameFound = true;
					optimlolCurrentGame.bannedChampions = currentGameData.data.bannedChampions;

					currentGameData.data.participants.forEach(function(participant) {
						if (participant.teamId === 100) {
							optimlolCurrentGame.blueTeam.push(participant);
						} else if (participant.teamId === 200) {
							optimlolCurrentGame.redTeam.push(participant);
						}
					});
				}

				currentGameData.data = optimlolCurrentGame;
				deferredObject.resolve(currentGameData);
			})
			.then(function(error) {
				deferredObject.reject(error);
			});
	});
}

var _init = function() {
	var DataProviderConstructor = require('../../persistence/dataProvider');
	_dataProvider = new DataProviderConstructor();
	_dataProvider.init();
}

module.exports = function() {
	var self = this;
	self.init = _init;
	self.getCurrentGameData = _getCurrentGameData;
}