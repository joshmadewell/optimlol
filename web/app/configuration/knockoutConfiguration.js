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

        ko.bindingHandlers.changeTip = {
            init: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
                (function(document,script,id) {
                    var js,
                        r=document.getElementsByTagName(script)[0],
                        protocol=/^http:/.test(document.location)?'http':'https';

                    if(!document.getElementById(id)){
                        js=document.createElement(script);
                        js.id=id;
                        js.src=protocol+'://widgets.changetip.com/public/js/widgets.js';
                        r.parentNode.insertBefore(js,r)
                    }
                }(document,'script','changetip_w_0'));
            }
        }
	};

	return {
		configure: _configureKnockout
	}
});