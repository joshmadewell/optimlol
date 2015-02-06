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
                region: "Europe West",
                key: "euw"
            },
            {
                region: "Europe Nordic & East",
                key: "eune"
            },
            {
                region: "Brazil",
                key: "br"
            },
            {
                region: "Turkey",
                key: "tr"
            },
            {
                region: "Russia",
                key: "ru"
            },
            {
                region: "Latin America North",
                key: "lan"
            },
            {
                region: "Latin America South",
                key: "las"
            },
            {
                region: "Oceana",
                key: "oce"
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