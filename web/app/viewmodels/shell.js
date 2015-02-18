define(['plugins/router', 
    'durandal/app',
    'singleton/session'], function (router, app, session) {
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
            session.set('region', data.key);
            app.trigger('regionUpdated', data.key);
        });
        self.router = router;

        self.activate = function() {
            var storedRegion = session.get('region');

            if (storedRegion) {
                var regionKeys = self.availableRegions.map(function(availableRegion) {
                    return availableRegion.key;
                });

                var regionIndex = regionKeys.indexOf(storedRegion);
                self.selectedRegion(self.availableRegions[regionIndex]);
            } else {
                session.set('region', self.availableRegions[0].key);
            }

            router.map([
                { route: '', title:'', moduleId: 'viewmodels/optimlol', nav: true, isActive: false },
                { route: 'faq(/:fromWhatIsThis)', title: 'FAQ', moduleId: 'viewmodels/faq', hash: "#faq", nav: true },
                { route: 'support', title:'Support', moduleId: 'viewmodels/support', nav: true }
            ]).buildNavigationModel();
            
            return router.activate();
        };
    };
});