// Version 0.1
// Script to retreive the watchlist from a friend's trakt account

const config = require('./config');

var request = require('request');

request({
  method: 'GET',
  url: 'https://api.trakt.tv/users/' + config.trakt.traktFriendID +'/watchlist/movies',
  headers: {
    'Content-Type': 'application/json',
    'trakt-api-version': '2',
    'trakt-api-key': config.trakt.traktClientID
  }}, function (error, response, body) {
    console.log('Status:', response.statusCode);
    console.log('Headers:', JSON.stringify(response.headers));
    console.log('Response:', JSON.parse(body));
  });
