define([], function() {
	var _configureKnockout = function() {
		ko.bindingHandlers.tooltip = {
            init: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
                var tooltipConfig = valueAccessor();

                if (typeof(tooltipConfig) === 'object') {
                    if (tooltipConfig.position) {
                        $(element).attr("data-placement", tooltipConfig.position);
                    }

                    if (tooltipConfig.text) {
                        $(element).attr("title", tooltipConfig.text)
                    }
                } else {
                    $(element).attr("title", valueAccessor);
                }

                $(element).attr("data-container", 'body');
                $(element).tooltip();

                ko.utils.domNodeDisposal.addDisposeCallback(element, function() {
                    $(element).tooltip('destroy');
                });
            }
        };
	};

	return {
		configure: _configureKnockout
	}
});