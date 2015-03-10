define([], function() {
	return function() {
		var self = this;
		
		self.championStats = null;
		self.summonerName = null;

		var _setChampionStatistics = function(type, fullChampionData) {
			var championStats = {};
			championStats.profile = {
				name: fullChampionData.championName,
				key: fullChampionData.championKey,
				kills: (fullChampionData.kills / fullChampionData.count).toFixed(2),
				deaths: (fullChampionData.deaths / fullChampionData.count).toFixed(2),
				assists: (fullChampionData.assists / fullChampionData.count).toFixed(2),
				kda: ((fullChampionData.kills + fullChampionData.assists) / fullChampionData.deaths).toFixed(2)
			};

			championStats.lanes = fullChampionData.lanes;

			championStats.damage = [
				{
					name: "Dealt",
					data: (fullChampionData.totalDamageDealt / fullChampionData.count).toFixed()
				},
				{
					name: "To Champions",
					data: (fullChampionData.totalDamageDealtToChampions / fullChampionData.count).toFixed()
				},
				{
					name: "Taken",
					data: (fullChampionData.totalDamageTaken / fullChampionData.count).toFixed()
				}
			];

			championStats.noGroup = [
				{
					name: "GPM",
					data: (fullChampionData.goldEarned / ( fullChampionData.totalTimePlayed / 60 )).toFixed()
				},
				{
					name: "Wards",
					data: (fullChampionData.wardsPlaced / fullChampionData.count).toFixed()
				},
				{
					name: "Game Length",
					data: ((fullChampionData.totalTimePlayed / 60) / fullChampionData.count).toFixed() + "m"
				}
			];

			self.championStats = championStats;
		}

		self.activate = function(settings) {
			self.summonerName = settings.summonerName;
			_setChampionStatistics(settings.type, settings.championData);
		}
	};
});