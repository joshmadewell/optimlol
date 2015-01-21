var mongoose = require('mongoose');
var q = require('q');

var Schema = mongoose.Schema;

var StaticDataSchema = new Schema({
	staticType: { type: String, required: true },
	region: { type: String, required: true },
	expiredTimeMinutes: { type: Number, default: 60 * 24 * 7 },
	data: Schema.Types.Mixed,
	created_at: { type: Date },
	updated_at: { type: Date }
});

StaticDataSchema.statics.retrieve = function(identifiers) {
	var deferred = q.defer();
	this.model('static_data').findOne(identifiers, function(error, result) {
		if (error) deferred.reject(error);
		else {
			deferred.resolve(result);
		}
	});

	return deferred.promise;
}

StaticDataSchema.pre('save', function(next) {
	var now = new Date();
	this.updated_at = now;
	if (!this.created_at) {
		this.created_at = now;
	}
	next();
});

module.exports = mongoose.model('static_data', StaticDataSchema);