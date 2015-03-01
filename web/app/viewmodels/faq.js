define([], function() {
	return function() {
		var self = this;

		self.faqs = ko.observableArray([
			{
				whatIsThis: true,
				question: "What is OptimLoL?",
				answer: "OptimLoL is a website created for ranked solo/duo players to quickly see stats of " +
						"all the players in champion select so that they can determine who would fit each lane the best.",
				isVisible: ko.observable(false),
				chevronClass: ko.observable('fa fa-chevron-up collapse')
			},
			{
				whatIsThis: true,
				question: "How does this work?",
				answer: "You have two options when you get to OptimLoL.com. You can either type in all five summoner " +
						"names of the players in champion select or you can copy/paste the chat log from your champion " +
						"selection screen and hit the \"Parse Chat Log\" button. The second option is usually the quickest " +
						"but sometimes, you won't have a message that contains summoner names so you'll have to type all " +
						"the names in. I still find this much faster than opening five tabs in my browser and searching " +
						"individually on LoLKing. You can now click the \"Share With Team\" button to quickly share the " +
						"page with the other summoners in champion select, saving them the extra work!",
				isVisible: ko.observable(false),
				chevronClass: ko.observable('fa fa-chevron-up collapse')
			},
			{
				whatIsThis: false,
				question: "Why does it say there are two junglers on my team?",
				answer: "The lane tags (currently) only represent what each player has played the most in their last thirty " +
						"ranked games. As such, if you have two players on your team that have played jungle sixteen of the last " +
						"thirty games, they will be tagged as a Jungler.",
				isVisible: ko.observable(false),
				chevronClass: ko.observable('fa fa-chevron-up collapse')
			},
			{
				whatIsThis: false,
				question: "I don't main top but OptimLoL says I do. Help!?",
				answer: "It is important to note that the lane tags are NOT suggestions of what to play. They are simply " +
						"just a tag that represents what you have been playing. If you have played top lane the most in the last " +
						"thirty games, you will be tagged as a top laner.",
				isVisible: ko.observable(false),
				chevronClass: ko.observable('fa fa-chevron-up collapse')
			},
			{
				whatIsThis: false,
				question: "How are you determining champions best performance?",
				answer: "I am using an adaptation of the <a href=\"http://en.wikipedia.org/wiki/Binomial_proportion_confidence_interval#Wilson_score_interval\">" +
						"Wilson Score Interval.</a> This basically takes into consideration the amount of games you've played and the amount " +
						"you've won vs. lost to determine how well you perform on any given champion. However, it's important to note that " +
						"the \"Best Performance\" column contains the five champions you have played the most which are then sorted by this " +
						"calculated performance value in descending order. This is to make sure we're not showing you the champions someone " +
						"is 4-0 or 3-0 on instead of the ones they are 49-38 on because that's clearly not an accurate representation of what " +
						"champions that player plays.",
				isVisible: ko.observable(false),
				chevronClass: ko.observable('fa fa-chevron-up collapse')
			},
			{
				whatIsThis: false,
				question: "Are you going to add lane suggestions?",
				answer: "I plan on adding lane suggestions at some point but have, unfortunately, not gotten around to it. " +
						"Determining who would be the best fit is not as simple as it sounds. I used to have this feature but often " +
						"times, it would suggest that someone who has never gone mid/top should go mid/top which is definitely " +
						"not desirable in a ranked game. This is coming!! I promise.",
				isVisible: ko.observable(false),
				chevronClass: ko.observable('fa fa-chevron-up collapse')
			},
			{
				whatIsThis: false,
				question: "Where are you getting this data from?",
				answer: "Riot has an Application Program Interface (API) which provides all the data that I am showing on " +
						"the page. They have documentation on the API <a href=\"https://developer.riotgames.com/api/methods\">here</a>.",
				isVisible: ko.observable(false),
				chevronClass: ko.observable('fa fa-chevron-up collapse')
			},
			{
				whatIsThis: false,
				question: "Why does your website look so lame?",
				answer: "Funny you should ask!!! I'm actually looking for a web-designer. If you're interested in helping or have any " +
						"suggestions shoot me an <a href=\"mailto:optimloldotcom@gmail.com?Subject=Design%20Suggestions\">email</a>!",
				isVisible: ko.observable(false),
				chevronClass: ko.observable('fa fa-chevron-up collapse')
			}
		]);

		self.toggleCollapse = function(value) {
			if (value.isVisible() === false) {
				value.isVisible(true);
				value.chevronClass('fa fa-chevron-down collapse');
			} else {
				value.isVisible(false);
				value.chevronClass('fa fa-chevron-up collapse');
			}
		}

		self.activate = function(fromWhatIsThis) {
			if (window.__gaTracker && typeof window.__gaTracker === 'function') {
				window.__gaTracker('send', 'pageview', '/faq');
			}

			if (fromWhatIsThis === 'explain') {
				self.faqs().forEach(function(faq) {
					if (faq.whatIsThis) {
						faq.isVisible(true);
						faq.chevronClass('fa fa-chevron-down collapse');
					}
				})
			};
		};
	};
});