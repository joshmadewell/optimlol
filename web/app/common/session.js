define('common/session', [], function() {
	var instance = null;

	var Session = (function() {
        function Session() {
            var self = this;

            self.get = function(key) {
                return $.cookie(key);
            };

            self.set = function(key, value) {
            	$.cookie(key, value, { expires: 365 });
            }
        };

        return Session;
    })();
           
    return Session;
});