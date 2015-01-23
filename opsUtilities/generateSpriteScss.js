// FOR THE LOVE OF GOD REFACTOR THIS GARBAGE

var request = require('request');
var fs = require('fs');
var q = require('q');
var config = require('../optimlol_api/config');

var envContent = fs.readFileSync(__dirname + '/../.env', 'utf8');
var envArray = envContent.split('\n');
var env = {};
envArray.forEach(function(variable) {
	var splitVariable = variable.split('=');
	env[splitVariable[0]] = splitVariable[1].replace(/'/g, '');
});

var RIOT_SPRITE_LOCATION = "http://ddragon.leagueoflegends.com/cdn/{{version}}/img/sprite/{{file_name}}";
var SPRITE_SAVE_PATH = __dirname + "/../web/appDependencies/sass/sprite_scss/";
var generationConfig = [
	{
		name: "champions",
		spriteName: "champions.png",
		prefix: "icon-champion-large-",
		extend: "icon-champion-large",
		riot_url: "https://na.api.pvp.net/api/lol/static-data/na/" + config.riot_api.versions.staticData + "/champion?champData=image&api_key=",
		xAxis: function(x, set) { return x * -1; }
		yAxis: function(y, set) { return set === 4 ? 0 : y * -1 - 48 - (144*set)}
	},
	{
		name: "summonerSpells",
		spriteName: "spells",
		prefix: "icon-summoner-spell-small-",
		extend: "icon-summoner-spell-small",
		riot_url: "https://na.api.pvp.net/api/lol/static-data/na/" + config.riot_api.versions.staticData + "/summoner-spell?spellData=image&api_key="
	}
]

var _sortComparator = function(a, b) {
	if (a.name < b.name) {
		return -1;
	} else if (a.name > b.name) {
		return 1;
	} else {
		return 0;
	}
};

var doWork = function() {
	var _version = null;
	var _filesToDownload = [];
	var _promises = [];

	generationConfig.forEach(function(spriteToGenerate) {
		var deferred = q.defer();
		request.get(spriteToGenerate.riot_url, function(error, result) {
			var spriteData = JSON.parse(result.body).data;
			var dataToWriteToFile = [];

			for (dataSet in spriteData) {
				var dataNeeded = {};
				var currentDataSet = spriteData[dataSet];

				dataNeeded.name = dataSet.key.toLowerCase();
				dataNeeded.sprite = dataSet.image.sprite;
				dataNeeded.x = dataSet.image.x;
				dataNeeded.y = dataSet.image.y;

				if (_sprites.indexOf(dataSet.image.sprite) === -1) {
					_filesToDownload.push(dataSet.image.sprite);
				}

				dataToWriteToFile.push(dataNeeded);
			}

			dataToWriteToFile.sort(_sortComparator);

			deferred.resolve();
		});

		_promises.push(deferred.promise);
	});

	q.allSettled(_promises)
		.then(function() {
			// download files
		});
}

var _champions = [];
var _sprites = [];

var _writeScssFile = function() {
	_champions.forEach(function(champion) {
		console.log(champion);
		var spriteGroup = parseInt(champion.sprite.match(/\d+/)[0]);
		var x = champion.x;
		var y = -1 * champion.y - 48 - (144 * spriteGroup);
		console.log(144 * spriteGroup);

		if (x !== 0) {
			x = x * -1;
		}

		if (spriteGroup === 4) {
			y = 0;
		}

		var data = ".icon-champion-large-" + champion.name +' {\n\t@extend .icon-champion-large;\n\tbackground-position: ' + x + "px " + y + "px;\n}\n";
		fs.appendFileSync(__dirname + '/../web/appDependencies/sass/champions.scss', data);
	});
}

var _downloadImages = function() {
	var download = function(uri, filename, callback){
		request.head(uri, function(err, res, body) {
		    request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
		});
	};

	_sprites.forEach(function(sprite) {
		var url = binaryImage.replace('{{version}}', _version).replace('{{file}}', sprite);
		download(url, __dirname + '/../web/appDependencies/img/' + sprite, function(){
		  	console.log('done');
		});
	});
}

request.get(versionUrl, function(error, result) {
	_version = JSON.parse(result.body)[0].toString();
	console.log(_version);

	request.get(imagesUrl, function(error, result) {
		var champions = JSON.parse(result.body).data;

		for(var champion in champions) {
			var dataNeeded = {};
			var currentChampion = champions[champion];

			dataNeeded.name = currentChampion.key.toLowerCase();
			dataNeeded.sprite = currentChampion.image.sprite;
			dataNeeded.x = currentChampion.image.x;
			dataNeeded.y = currentChampion.image.y;

			if (_sprites.indexOf(currentChampion.image.sprite) === -1) {
				_sprites.push(currentChampion.image.sprite);
			}

			_champions.push(dataNeeded);
		}

		var _sortComparator = function(a, b) {
			if (a.name < b.name) {
				return -1;
			} else if (a.name > b.name) {
				return 1;
			} else {
				return 0;
			}
		}
		_champions.sort(_sortComparator);


		_writeScssFile();
		_downloadImages();
	});
});
