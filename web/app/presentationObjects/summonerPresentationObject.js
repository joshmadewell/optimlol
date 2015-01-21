define(['knockout'], function (ko) {
	return function() {
		return {
			summonerName: ko.observable(""),
			displayName: "",
			summonerId: ko.observable(null),
			placeholder: "",
			status: ko.observable("unset"),
			lolKingUrl: ko.observable(""),
			naOpGgUrl: ko.observable(""),
			totalStats: {},
			championStats: []
		}
	}
});