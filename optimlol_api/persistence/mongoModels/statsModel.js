var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PromiseFactoryConstructor = require('../../common/utilities/promiseFactory');
var _promiseFactory = new PromiseFactoryConstructor();

var StatsSchema = new Schema({
	summonerId: { type: Number, required: true },
	region: { type: String, required: true },
	expiredTimeMinutes: { type: Number, default: 60 },
	returnDataOnExpired: { type: Boolean, required: true, default: false },
	data: Schema.Types.Mixed,
	created_at: { type: Date },
	updated_at: { type: Date }
});

// every model should have a retrieve function that does any
// special things necessary to get the proper data.
// most of the time...this isn't an issue so really, we're using retrieve
// so we can always have a promise :)
StatsSchema.statics.retrieve = function(identifiers) {
	return _promiseFactory.defer(function(deferredObject) {
		this.model('stats').findOne(identifiers, function(error, result) {
			if (error) deferred.reject(error);
			else {
				deferred.resolve(result);
			}
		});
	});
}

StatsSchema.pre('save', function(next) {
	var now = new Date();
	this.updated_at = now;
	if (!this.created_at) {
		this.created_at = now;
	}
	next();
});

// mongoose makes collections plural if we don't specify an name in third parameter :[
// this one is already plural but I like consistency.
module.exports = mongoose.model('stats', StatsSchema, 'stats');