define([], function() {
	return function() {
		var self = this;
		
		self.championStats = null;
		self.summonerName = null;

		var _setChampionStatistics = function(type, fullChampionData) {
			self.championStats = {
				profile: {
					name: fullChampionData.championName,
					key: fullChampionData.championKey
				},
				lanes: fullChampionData.lanes,
				stats: [
					{
						categories: [
							{
								name: "Kills",
								value: (fullChampionData.kills / fullChampionData.count).toFixed(2)
							},
							{
								name: "Deaths",
								value: (fullChampionData.deaths / fullChampionData.count).toFixed(2)
							},
							{
								name: "Assists",
								value: (fullChampionData.assists / fullChampionData.count).toFixed(2)
							},
							{
								name: "KDA",
								value: ((fullChampionData.kills + fullChampionData.assists) / fullChampionData.deaths).toFixed(2)
							}
						]
					},
					{
						title: "Damage",
						categories: [
							{
								name: "Dealt",
								value: (fullChampionData.totalDamageDealt / fullChampionData.count).toFixed()
							},
							{
								name: "vs. Champs",
								value: (fullChampionData.totalDamageDealtToChampions / fullChampionData.count).toFixed()
							},
							{
								name: "Taken",
								value: (fullChampionData.totalDamageTaken / fullChampionData.count).toFixed()
							}
						]
					},
					{
						categories: [
							{
								name: "GPM",
								value: (fullChampionData.goldEarned / ( fullChampionData.totalTimePlayed / 60 )).toFixed()
							},
							{
								name: "Wards",
								value: (fullChampionData.wardsPlaced / fullChampionData.count).toFixed()
							},
							{
								name: "Game Length",
								value: ((fullChampionData.totalTimePlayed / 60) / fullChampionData.count).toFixed() + "m"
							}
						]
					}
				]
			};
		}

		self.activate = function(settings) {
			self.summonerName = settings.summonerName;
			_setChampionStatistics(settings.type, settings.championData);
			console.log(settings);
		}
	};
});