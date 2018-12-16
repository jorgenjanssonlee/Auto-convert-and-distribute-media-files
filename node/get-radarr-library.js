// Version 0.1
// Script to retreive the watchlist from a friend's trakt account

const config = require('./config');
// config.radarr.ip
// config.radarr.port
// config.radarr.apikey

var request = require('request');

request({
  method: 'GET',
  url: 'http://' + config.radarr.ip + ':' + config.radarr.port + '/api/movie',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': config.radarr.apikey
  }}, function (error, response, body) {
    console.log('Status:', response.statusCode);
    console.log('Headers:', JSON.stringify(response.headers));
    console.log('Response:', body);
  });
