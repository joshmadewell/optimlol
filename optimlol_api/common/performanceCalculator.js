var _calculatePerformance = function(wins, losses, options) {
	if (wins === 0 && losses === 0) {
		return 0;
	}
	var withModifier = options ? options.withModifier || false : false;
	var n = wins + losses;
	var phat = wins / n;
	var z = options ? options.confidence || 1.28 : 1.28; // 80% confidence
	var modifier = .0009*n; //custom modifier to pad scores.

	// Wilson Score Interval
	var performance = (phat + z*z/(2*n) - z * Math.sqrt((phat*(1-phat)+z*z/(4*n))/n))/(1+z*z/n);

	if (withModifier) {
		return (performance + modifier).toFixed(2)/1;
	} else {
		return performance.toFixed(2)/1;
	}
};

module.exports = {
	calculate: _calculatePerformance
}