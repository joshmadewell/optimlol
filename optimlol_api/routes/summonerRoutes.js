var logger = require('winston');

var SummonerController = require('../controllers/summonerController');
var summonerController = new SummonerController();

module.exports = function(router) {
	router.get(':region/summoner/by-name/:summonerName', function(req, res) {
		var region = req.params.region;
		var summonerName = req.params.summonerName;
		var result = {
			status: 'failed',
			summonerData: null
		}

		summonerController.verifySummoner(region, summonerName)
			.then(function(verified) {
				if (verified) {
					summonerController.generateOptimlolProperties()
						.then(function(optimlolResponse) {
							result.status = "success";
							res.send(optimlolResponse);
						})
						.fail(function(error) {
							res.send(result);
						});
				} else {
					res.send(result);
				}
			})
			.fail(function() {
				res.send(result);
			})
	});
}