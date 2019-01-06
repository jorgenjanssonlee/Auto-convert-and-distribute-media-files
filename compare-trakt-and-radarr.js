// Version 0.1
// Script to retreive the watchlist from a friend's trakt account,
// compare it to movies in my radarr library and
// generate a symlink for matches into handbrake watch folder

const config = require('./config');

var request = require('request');
var fs = require('fs');

// TODO: add start time to log
main();

function main(){
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
    url: 'http://' + config.radarr.ip + ':' + config.radarr.port + '/api/movie',
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
	var movieMatches = []; // array of imdbID and file path

	// iterate through items in traktMovies and store the imdbIDs

	for (var i = 0; i < traktMovies.length; i++) {
    if (traktMovies[i].movie.ids.imdb != null) {

			// match traktImdbIDs to items in radarrMovies where downloaded = true
			// TODO: track already processed movies and exclude from matching (to avoid re-processing). Consider removing from trakt list?
			for (var j = 0; j < radarrMovies.length; j++) {
				if (traktMovies[i].movie.ids.imdb == radarrMovies[j].imdbId && radarrMovies[j].downloaded == true) {
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
}

function createSymlinkForHandbrake(movies){
	// create symlink in Handbrake watch folder with volume mapping substitution
  for (var i = 0; i < movies.length; i++) {
    var destFile = config.handbrake.hbWatchFolder + "/" + movies[i].fileName;
    var remappedSourceFile = movies[i].folderPath.replace(config.handbrake.hbVolumeMappingRadarr, config.handbrake.hbVolumeMappingHandbrake) + "/" + movies[i].fileName;
    fs.symlinkSync(remappedSourceFile, destFile);
    console.log("symlink created: " + destFile);
  };
}
