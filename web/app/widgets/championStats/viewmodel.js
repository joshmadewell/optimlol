define([], function() {
	return function() {
		var self = this;
		
		self.championStats = null;
		self.summonerName = null;

		var comify = function(number) {
		    var str = number.toString().split('.');
		    if (str[0].length >= 5) {
		        str[0] = str[0].replace(/(\d)(?=(\d{3})+$)/g, '$1,');
		    }
		    if (str[1] && str[1].length >= 5) {
		        str[1] = str[1].replace(/(\d{3})/g, '$1 ');
		    }
		    return str.join('.');
		}

		var _setChampionStatistics = function(type, fullChampionData) {
			self.championStats = {
				profile: {
					name: fullChampionData.championName,
					key: fullChampionData.championKey
				},
				lanes: fullChampionData.lanes,
				stats: [
					{
						title: "Performance",
						categories: [
							{
								name: "Kills",
								value: comify((fullChampionData.kills / fullChampionData.count).toFixed(2))
							},
							{
								name: "Deaths",
								value: comify((fullChampionData.deaths / fullChampionData.count).toFixed(2))
							},
							{
								name: "Assists",
								value: comify((fullChampionData.assists / fullChampionData.count).toFixed(2))
							},
							{
								name: "KDA",
								value: comify(((fullChampionData.kills + fullChampionData.assists) / fullChampionData.deaths).toFixed(2))
							}
						]
					},
					{
						title: "Game Stats",
						categories: [
							{
								name: "GPM",
								value: comify((fullChampionData.goldEarned / ( fullChampionData.totalTimePlayed / 60 )).toFixed())
							},
							{
								name: "Wards",
								value: comify((fullChampionData.wardsPlaced / fullChampionData.count).toFixed())
							},
							{
								name: "CS",
								value: comify((fullChampionData.minionsKilled / fullChampionData.count).toFixed())
							},
							{
								name: "Length",
								value: comify(((fullChampionData.totalTimePlayed / 60) / fullChampionData.count).toFixed()) + "m"
							}
						]
					},
					{
						title: "Damage",
						categories: [
							{
								name: "Dealt",
								value: comify((fullChampionData.totalDamageDealt / fullChampionData.count).toFixed())
							},
							{
								name: "v. Champs",
								value: comify((fullChampionData.totalDamageDealtToChampions / fullChampionData.count).toFixed())
							},
							{
								name: "Taken",
								value: comify((fullChampionData.totalDamageTaken / fullChampionData.count).toFixed())
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