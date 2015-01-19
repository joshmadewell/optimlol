var mongoose = require('mongoose');
var config = require('../config');

module.exports = function() {
	var self = this;

	self.init = function() {
		mongoose.connect(config.mongo.uri);

		var models = [
			'../persistence/mongo/models/championsModel',
			'../persistence/mongo/models/statsModel',
			'../persistence/mongo/models/summonersModel'
		];

		models.forEach(function(model) {
			require(model);
		});
	};
}