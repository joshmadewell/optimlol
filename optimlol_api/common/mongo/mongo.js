var mongoose = require('mongoose');
var config = require('../../config');

module.exports = function() {
	var self = this;

	self.init = function() {
		mongoose.connect(process.env.MONGOLAB_URI);

		var models = [
			'../../persistence/mongoModels/staticDataModel',
			'../../persistence/mongoModels/statsModel',
			'../../persistence/mongoModels/summonersModel'
		];

		models.forEach(function(model) {
			require(model);
		});
	};
};
