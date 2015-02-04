requirejs.config({
    baseUrl: '/js/app/',
    paths: {
        'text': '../../lib/require/text',
        'durandal':'../../lib/durandal/js',
        'plugins' : '../../lib/durandal/js/plugins',
        'transitions' : '../../lib/durandal/js/transitions',
    }
});

define('knockout', ko);
define('jquery', function() { return jQuery });

define(['durandal/system', 'durandal/app', 'durandal/viewLocator'],  function (system, app, viewLocator) {
    system.debug(false);

    app.title = 'OptimLoL';

    app.configurePlugins({
        router:true,
        dialog: true
    });

    app.start().then(function() {
        //Replace 'viewmodels' in the moduleId with 'views' to locate the view.
        //Look for partial views in a 'views' folder in the root.
        viewLocator.useConvention();

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
            }
        };

        //Show the app by setting the root view model for our application with a transition.
        app.setRoot('viewmodels/shell', 'entrance');
    });
});