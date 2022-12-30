/* Prerequisites
Trakt API App: https://trakt.tv/oauth/applications/new
Radarr API key: https://wiki.servarr.com/radarr/settings#security
Handbrake container with automated watch folder: https://hub.docker.com/r/jlesage/handbrake/: 
Slack Webhook (optional): https://api.slack.com/messaging/webhooks
*/

/*  Docker run command
	docker run -d --name compare-trakt-and-radarr \
	-v "<host path to app config location>":"/config" \
	-v "<host path of watch folder from Handbrake container>":"/watch" \
	-e traktFriendID="<friends trakt ID>" \
	-e traktClientID="<from Trakt API App>" \
	-e radarrIP="<http://radarr.ip.address>" \
	-e radarrPort="<7878>" \
	-e radarrApiKey="<Radarr API Key>" \
	-e hbVolumeMappingHandbrake="<Media storage path from Handbrake container>" \
	-e hbVolumeMappingRadarr="<Media storage path from Radarr container>" \
	-e slackWebhookUrl="https://hooks.slack.com/services/RANDOMCHARS" \
	compare-trakt-and-radarr
*/

const request = require('request');
const fs = require('fs');
const SlackNotify = require('slack-notify');
const slack = SlackNotify(process.env.slackWebhookUrl); // Configure Slack notifications

// Allow for Dev folder mapping if script is running outside docker container
var NODE_ENV = process.env.NODE_ENV;
var configFolder = "/config";
var watchFolder = "/watch";
if (NODE_ENV == "Dev") {
	configFolder = process.env.configFolder;
	watchFolder = process.env.watchFolder;
};
const movieHistoryFile = configFolder + "/moviehistory.txt";

// Check that all mandatory docker environment variables are configured
if (process.env.traktFriendID
	&& process.env.traktClientID
	&& process.env.radarrIP
	&& process.env.radarrPort
	&& process.env.radarrApiKey
	&& process.env.hbVolumeMappingHandbrake
	&& process.env.hbVolumeMappingRadarr
	&& fs.existsSync(configFolder)
	&& fs.existsSync(watchFolder)
	) {
		console.log("All required env variables and volume mappings are present, starting script");
		if (process.env.slackWebhookUrl) {
			console.log('Slack notifications enabled');
		};
		try {
			main();
		} catch (error) {
			console.log(error);
			return;
		}
		
} else {
	console.log("Environment variables or volume mappings are missing, aborting. Check your docker run command");
	return;
};



function main() {
	console.log("Starting movie processing " + new Date(new Date() + 3600 * 1000 * 10).toISOString());
	try {
		getTraktMovies((traktMovies) => {
			getRadarrMovies((radarrMovies) => {
				compareResults(traktMovies, radarrMovies, (movieMatches) => {
					createSymlinkForHandbrake(movieMatches);
					console.log("Movie processing completed " + new Date(new Date() + 3600 * 1000 * 10).toISOString());
				});
			});
		});
	} catch (error) {
		console.log(error);
		return;
	}
}



function getTraktMovies(callback) {
	console.log("Starting getTraktMovies");
	request({
		method: 'GET',
		url: 'https://api.trakt.tv/users/' + process.env.traktFriendID + '/watchlist/movies',
		headers: {
			'Content-Type': 'application/json',
			'trakt-api-version': '2',
			'trakt-api-key': process.env.traktClientID
		}
	}, function (error, response, body) {
		console.log('Status:', response.statusCode);
		if (response.statusCode != '200') {
			callback(new Error('Trakt API error'));
			return;
		}
		callback(JSON.parse(body));
	});
}


function getRadarrMovies(callback) {
	console.log("Starting getRadarrMovies");
	request({
		method: 'GET',
		url: process.env.radarrIP + ':' + process.env.radarrPort + '/api/v3/movie',
		headers: {
			'Content-Type': 'application/json',
			'X-API-Key': process.env.radarrApiKey
		}
	}, function (error, response, body) {
		console.log('Status:', response.statusCode);
		if (response.statusCode != '200') {
			callback(new Error('Radarr API error'));
			return;
		}
		callback(JSON.parse(body));
	});
}


function compareResults(traktMovies, radarrMovies, callback) {
	console.log("Starting compareResults");
	var movieMatches = []; // array of imdbID and file path for movies matches between trakt and radarr that has not been previously processed
	// get array of previously processed movies to avoid double-processing
	if (!fs.existsSync(movieHistoryFile)) {
		try {
			fs.appendFileSync(movieHistoryFile, "These movies have already been processed and will be ignored" + "\n");
		} catch (err) {
			console.log(err);
			return;
		}
	}
	if (fs.existsSync(movieHistoryFile)) {
		try {
			console.log("movieHistoryFile exists");
			var data = fs.readFileSync(movieHistoryFile);
			var movieHistory = data.toString().split("\n");
			movieHistory.splice(-1, 1);

			// iterate through items in traktMovies that have not been previously processed and store the imdbIDs
			for (var i = 0; i < traktMovies.length; i++) {
				if (traktMovies[i].movie.ids.imdb != null && !(movieHistory.indexOf(traktMovies[i].movie.ids.imdb) > -1)) {

					// match traktImdbIDs to items in radarrMovies where downloaded = true
					for (var j = 0; j < radarrMovies.length; j++) {
						if (traktMovies[i].movie.ids.imdb == radarrMovies[j].imdbId && radarrMovies[j].hasFile == true) {
							var movieDetails = {};
							movieDetails["imdbId"] = traktMovies[i].movie.ids.imdb;
							movieDetails["folderPath"] = radarrMovies[j].folderName;
							movieDetails["fileName"] = radarrMovies[j].movieFile.relativePath;
							movieMatches.push(movieDetails);
						}
					}
				}
			};
			console.log("Matching movies " + JSON.stringify(movieMatches, null, 2));
			callback(movieMatches);
		} catch (err) {
			console.error(err);
			return;
		}
	}
}


function createSymlinkForHandbrake(movies) {
	// create symlink in Handbrake watch folder with volume mapping substitution
	// then add imdb of movie to history log to prevent re-processing
	// Node docker needs the exact same /watch folder mapping as Handbrake is using
	var completedSymlinks = "";
	for (var i = 0; i < movies.length; i++) {
		try {
			var destFile = watchFolder + "/" + movies[i].fileName;
			var remappedSourceFile = movies[i].folderPath.replace(process.env.hbVolumeMappingRadarr, process.env.hbVolumeMappingHandbrake) + "/" + movies[i].fileName;
			fs.symlinkSync(remappedSourceFile, destFile);
			console.log("symlink created: " + destFile);
			completedSymlinks += destFile + "\n";
			fs.appendFileSync(movieHistoryFile, movies[i].imdbId + "\n"); // log processed movies to file
		} catch (err) {
			console.log(err);
		}
	};
	if (process.env.slackWebhookUrl) {
		if (completedSymlinks == "") {
			var notificationMessage = "Compare trakt and radarr complete, no movies to process";
		} else {
			var notificationMessage = 'Compare trakt and radarr complete, Symlinks created for Handbrake processing: \n' + completedSymlinks;
		};
		slack.send(notificationMessage)
			.then(() => {
				console.log('Sent Slack notification');
			}).catch((err) => {
				console.error(err);
			});
	}
}