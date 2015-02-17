var apiStatusSingleton = function apiStatusSingleton(){
	//defining a var instead of this (works for variable & function) will create a private definition
	var _rateLimitExceeded = false;
	var _nextApiCallTime = new Date();

	this.isRateLimitExceeded = function() {
		return _rateLimitExceeded;
	};

	this.setRateLimitExceeded = function(isExceeded, timeout) {
		console.log("setRateLimitExceeded", isExceeded, timeout);
		_rateLimitExceeded = isExceeded;
		_nextApiCallTime = new Date();
		_nextApiCallTime.setSeconds(_nextApiCallTime.getSeconds() + timeout);
		console.log(_nextApiCallTime);
	};

	this.getNextApiCallTime = function() {
		return _nextApiCallTime;
	}

	this.isApiDown = function() {
		// TODO: Call Riot API status function to determine if it's down
	};

	if(apiStatusSingleton.caller !== apiStatusSingleton.getInstance){
		throw new Error("This object cannot be instantiated");
	}
}

/* ************************************************************************
SINGLETON CLASS DEFINITION
************************************************************************ */
apiStatusSingleton.instance = null;

/**
 * Singleton getInstance definition
 * @return singleton class
 */
apiStatusSingleton.getInstance = function(){
	if(this.instance === null){
		this.instance = new apiStatusSingleton();
	}
	return this.instance;
}

module.exports = apiStatusSingleton.getInstance();