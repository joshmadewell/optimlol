define(['knockout'], function (ko) {
	return function() {
		return {
			summonerName: ko.observable(""),
			summonerId: ko.observable(null),
			placeholder: "",
			isVerified: ko.observable(null),
			isVerifying: ko.observable(false),
			lolKingUrl: ko.observable(""),
			naOpGgUrl: ko.observable("")
		}
	}
})