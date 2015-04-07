define([], function() {
	return function() {
		var self = this;
		
		self.championStats = null;
		self.summonerName = null;

		var comify = function(number) {
		    var str = number.toString().split('.');
		    if (str[0].length >= 4) {
		        str[0] = str[0].replace(/(\d)(?=(\d{3})+$)/g, '$1,');
		    }
		    if (str[1] && str[1].length >= 4) {
		        str[1] = str[1].replace(/(\d{3})/g, '$1 ');
		    }
		    return str.join('.');
		}

		var _setChampionStatistics = function(type, fullChampionData) {
			self.championStats = {
				profile: {
					name: fullChampionData.championName,
					key: fullChampionData.championKey,
					wins: fullChampionData.wins,
					losses: fullChampionData.losses,
					percentage: ((fullChampionData.wins / (fullChampionData.wins + fullChampionData.losses)) * 100).toFixed(1)
				}
			};

			if (type === 'recent') {
				self.championStats.roles = fullChampionData.roles;
				self.championStats.stats = [
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
								value: comify((fullChampionData.goldEarned / ( fullChampionData.totalTimePlayed / 60 )).toFixed()),
								titleTooltip: 'Gold per minute.'
							},
							{
								name: "Wards",
								value: comify((fullChampionData.wardsPlaced / fullChampionData.count).toFixed())
							},
							{
								name: "CS",
								value: comify((fullChampionData.minionsKilled / fullChampionData.count).toFixed()),
								titleTooltip: 'Creep score.'
							},
							{
								name: "Length",
								value: comify(((fullChampionData.totalTimePlayed / 60) / fullChampionData.count).toFixed()) + "m",
								titleTooltip: 'Average game length (minutes).'
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
				];
			}

			if (type === 'total') { 
				self.championStats.optimlolScore = Math.ceil(fullChampionData.performance * 100);
				self.championStats.stats = [
					{
						title: "Performance",
						categories: [
							{
								name: "Kills",
								value: comify((fullChampionData.kills / fullChampionData.gamesPlayed).toFixed(2))
							},
							{
								name: "Deaths",
								value: comify((fullChampionData.deaths / fullChampionData.gamesPlayed).toFixed(2))
							},
							{
								name: "Assists",
								value: comify((fullChampionData.assists / fullChampionData.gamesPlayed).toFixed(2))
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
								name: "GPG",
								value: comify((fullChampionData.totalGoldEarned / fullChampionData.gamesPlayed).toFixed()),
								titleTooltip: "Average gold per game."
							},
							{
								name: "CS",
								value: comify((fullChampionData.totalMinionKills / fullChampionData.gamesPlayed).toFixed()),
								titleTooltip: "Average creep score per game."
							},
							{
								name: "DK",
								value: comify(fullChampionData.totalDoubleKills),
								titleTooltip: "Total double kills"
							},
							{
								name: "TK",
								value: comify(fullChampionData.totalTripleKills),
								titleTooltip: "Total triple kills"
							},
							{
								name: "QK",
								value: comify(fullChampionData.totalQuadraKills),
								titleTooltip: "Total quadra kills"
							},
							{
								name: "PK",
								value: comify(fullChampionData.totalPentaKills),
								titleTooltip: "Total penta kills"
							}
						]
					},
					{
						title: "Total Damage",
						categories: [
							{
								name: "Physical",
								value: comify((fullChampionData.totalPhysicalDamageDealt / fullChampionData.gamesPlayed).toFixed()),
								titleTooltip: "Average physical damage dealt."
							},
							{
								name: "Magic",
								value: comify((fullChampionData.totalMagicDamageDealt / fullChampionData.gamesPlayed).toFixed()),
								titleTooltip: "Average magical damage dealt."
							},
							{
								name: "Dealt",
								value: comify((fullChampionData.totalDamageDealt / fullChampionData.gamesPlayed).toFixed()),
								titleTooltip: "Average of all damage dealt."
							},
							{
								name: "Taken",
								value: comify((fullChampionData.totalDamageTaken / fullChampionData.gamesPlayed).toFixed()),
								titleTooltip: "Average damage taken."
							}
						]	
					}
				];
			}
		}

		self.activate = function(settings) {
			self.summonerName = settings.summonerName;
			self.type = settings.type;
			_setChampionStatistics(settings.type, settings.championData);
		}
	};
});