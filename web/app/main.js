requirejs.config({
    baseUrl: '/js/app/',
    paths: {
        'text': '../../lib/require/text',
        'durandal':'../../lib/durandal/js',
        'plugins' : '../../lib/durandal/js/plugins',
        'widgets' : 'widgets'
    }
});

define('knockout', ko);
define('jquery', function() { return jQuery; });
define('singleton/session', ['common/session'], function(Session) {
    return new Session();
});

define(['durandal/system',
    'durandal/app',
    'durandal/viewLocator',
    'configuration/knockoutConfiguration',
    'configuration/routerConfiguration'],
function (system, app, viewLocator, knockoutConfiguration, routerConfiguration) {
    system.debug(false);

    app.title = 'OptimLoL | Champion Selection Optimization';

    app.configurePlugins({
        router:true,
        dialog: true,
        widget: {
            kinds: ['championStats', 'summonerTable']
        }
    });

    app.start().then(function() {
        //Replace 'viewmodels' in the moduleId with 'views' to locate the view.
        //Look for partial views in a 'views' folder in the root.
        viewLocator.useConvention();

        knockoutConfiguration.configure();
        routerConfiguration.configure();

        //Show the app by setting the root view model for our application with a transition.
        app.setRoot('viewmodels/shell');
    });
});