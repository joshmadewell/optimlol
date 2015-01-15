define(['knockout'], function(ko) {
	return function() {
		return {
			summonerName: ko.observable(""),
			summonerId: null,
			placeholder: "",
			isVerified: ko.observable(null),
			isVerifying: false,
			lolKingUrl: "",
			lolNexusUrl: "",
			naOpGgUrl: ""
		}
	}
})