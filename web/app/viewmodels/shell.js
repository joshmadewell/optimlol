define(['plugins/router', 
    'durandal/app', 
    'knockout'], function (router, app, ko) {
    return function() {
        var self = this;

        self.availableRegions = [
            {
                region: "North America",
                key: "na"
            },
            {
                region: "EU West",
                key: "euw"
            }
        ];

        self.selectedRegion = ko.observable();
        self.selectedRegion.subscribe(function(data) {
            app.trigger('regionUpdated', data.key);
        });
        self.router = router;

        self.activate = function() {
            router.map([
                { route: '', title:'', moduleId: 'viewmodels/optimlol', nav: true, isActive: false },
                { route: 'support', title:'Support', moduleId: 'viewmodels/support', nav: true }
            ]).buildNavigationModel();
            
            return router.activate();
        };
    };
});