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

define(['durandal/system', 'durandal/app', 'durandal/viewLocator', 'configuration/knockoutConfiguration'],  function (system, app, viewLocator, knockoutConfiguration) {
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

        knockoutConfiguration.configure();

        //Show the app by setting the root view model for our application with a transition.
        app.setRoot('viewmodels/shell', 'entrance');
    });
});