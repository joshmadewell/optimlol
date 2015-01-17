var logger = require('winston');

var SummonerController = require('../controllers/summonerController');
var summonerController = new SummonerController();

module.exports = function(router) {
	router.get('/:region/summoner/by-name/:summonerName', function(req, res) {
		var region = req.params.region;
		var summonerName = req.params.summonerName;
		var result = {
			status: 'failed',
			summonerData: null
		}

		summonerController.verifySummoner(region, summonerName)
			.then(function(summoner) {
				res.status(200).send(summoner);
			})
			.fail(function() {
				res.send(result);
			})
	});
}