// Version 0.1
// Script to retreive the watchlist from a friend's trakt account,
// compare it to movies in my radarr library and
// generate a symlink for matches into handbrake watch folder

const config = require('./config');

var request = require('request');

main();

function main(){
	getTraktMovies( (traktMovies) => {
		getRadarrMovies( (radarrMovies) => {
      compareResults(traktMovies, radarrMovies, (movieMatches) => {
        console.log(movieMatches);
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
  	  callback(body);
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
      callback(body);
    });
}

function compareResults(traktMovies, radarrMovies, callback){
	// iterate through items in traktMovies
	// and match imdbId to items in radarrMovies
	// for each matchs, if downloaded = true (and imdbId has not been processed previously, remove from trakt.tv?)
	// return path and relativePath
	console.log(traktMovies);
  console.log(radarrMovies);
  var movieMatches = "matches goes here";
  callback(movieMatches);
}
