var _validateParameters = function(given, required) {
	var allParametersExist = true;
	required.forEach(function(requiredParameter) {
		if (given[requiredParameter] === undefined) {
			allParametersExist = false;
		}
	});

	return allParametersExist;
};

module.exports = {
	validate: _validateParameters
}