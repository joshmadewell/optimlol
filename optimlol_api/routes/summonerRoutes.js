var logger = require('winston');

var SummonerController = require('../controllers/summonerController');
var summonerController = new SummonerController();

module.exports = function(router) {
	router.get('/summoner/by-name/:summonerName', function(req, res) {
		summonerController.verifySummoner(req.params.summonerName)
			.then(function(verified) {
				var result = {
					status: 'failed',
					summonerData: null
				}
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
	});
}