// Version 1.0
// Script to retreive the watchlist from a friend's trakt account,
// compare it to movies in my radarr library and
// generate a symlink for matches into handbrake watch folder

const config = require('./config');

var { exec } = require('child_process');
var request = require('request');
var fs = require('fs');

main();

function main(){
	console.log("Starting movie processing " + new Date(new Date()+3600*1000*10).toISOString());
	getTraktMovies( (traktMovies) => {
		getRadarrMovies( (radarrMovies) => {
      compareResults(traktMovies, radarrMovies, (movieMatches) => { // TODO: add count of files to process
				createSymlinkForHandbrake(movieMatches);
				console.log("Movie processing completed");
				});
      });
		});
	}



function getTraktMovies(callback){
  request({
    method: 'GET',
    url: 'https://api.trakt.tv/users/' + config.trakt.traktFriendID +'/watchlist/movies',
    headers: {
      'Content-Type': 'application/json',
      'trakt-api-version': '2',
      'trakt-api-key': config.trakt.traktClientID
    }}, function (error, response, body) {
      // console.log('Status:', response.statusCode);
      // console.log('Headers:', JSON.stringify(response.headers));
      // console.log('Response:', body);
  	  callback(JSON.parse(body));
    });
}


function getRadarrMovies(callback){
  request({
    method: 'GET',
    url: 'http://' + config.radarr.ip + ':' + config.radarr.port + '/api/v3/movie',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': config.radarr.apikey
    }}, function (error, response, body) {
      // console.log('Status:', response.statusCode);
      // console.log('Headers:', JSON.stringify(response.headers));
      // console.log('Response:', body);
      // callback(new Error('bad resp.'));
      callback(JSON.parse(body));
    });
}


function compareResults(traktMovies, radarrMovies, callback){
	var movieMatches = []; // array of imdbID and file path for movies matches between trakt and radarr that has not been previously processed
	// get array of previously processed movies to avoid double-processing
	if (fs.existsSync(config.script.movieHistory)) {
		try {
			var data = fs.readFileSync(config.script.movieHistory);
			var movieHistory = data.toString().split("\n");
			movieHistory.splice(-1,1);

			// iterate through items in traktMovies that have not been previously processed and store the imdbIDs
			for (var i = 0; i < traktMovies.length; i++) {
				if (traktMovies[i].movie.ids.imdb != null && !(movieHistory.indexOf(traktMovies[i].movie.ids.imdb) > -1)) {

					// match traktImdbIDs to items in radarrMovies where downloaded = true
					for (var j = 0; j < radarrMovies.length; j++) {
						if ( traktMovies[i].movie.ids.imdb == radarrMovies[j].imdbId && radarrMovies[j].hasFile == true) {
							var movieDetails = {};
							movieDetails["imdbId"] = traktMovies[i].movie.ids.imdb;
							movieDetails["folderPath"] = radarrMovies[j].folderName;
							movieDetails["fileName"] = radarrMovies[j].movieFile.relativePath;
							movieMatches.push(movieDetails);
						}
					}
				}
			};
			callback(movieMatches);
		} catch (err) {
			console.error(err);
		}
	}
}


function createSymlinkForHandbrake(movies){
	// create symlink in Handbrake watch folder with volume mapping substitution
	// then add imdb of movie to history log to prevent re-processing
	var completedSymlinks = "";
  for (var i = 0; i < movies.length; i++) {
		try {
			var destFile = config.handbrake.hbWatchFolder + "/" + movies[i].fileName;
	    var remappedSourceFile = movies[i].folderPath.replace(config.handbrake.hbVolumeMappingRadarr, config.handbrake.hbVolumeMappingHandbrake) + "/" + movies[i].fileName;
	    fs.symlinkSync(remappedSourceFile, destFile);
			console.log("symlink created: " + destFile);
			completedSymlinks += destFile + "\n";
			fs.appendFileSync(config.script.movieHistory, movies[i].imdbId + "\n"); // log processed movies to file
		} catch (err) {
			console.log(err);
		}
  };
	// send unraid notification with list of created symlinks
	if (completedSymlinks) {
		var unraidNotification = "/usr/local/emhttp/webGui/scripts/notify -e 'unRAID Server Notice' -s 'Handbrake Symlink creation' -d '" + completedSymlinks + "' -i 'normal'";
		exec(unraidNotification, (err, stdout, stderr) => {
			if (err) {
				console.log(err);
				return;
			}
			// the *entire* stdout and stderr (buffered)
	    // console.log(`stdout: ${stdout}`);
	    // console.log(`stderr: ${stderr}`);
		});
	}
}
