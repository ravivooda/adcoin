'use strict';

var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var emotions = require('./emotions');
var apn = require('./apn');
var _ = require('underscore');

var userEmotions = [];
var userSkips = [];
var userTweets = [];
var userPlays = [];
var userCoins = {};

var calculateActions = function(adId) {
	var skips = _.chain(userSkips).
		filter(function(val) { return val.adId == adId; }).
		reduce(function(memo, val) { return memo + val }, 0).
	value();
	var plays = _.chain(userPlays).
		filter(function(val) { return val.adId == adId; }).
		reduce(function(memo, val) { return memo + val }, 0).
	value();

	return {
		skips: skips,
		plays: plays,
	};
};

var calculateEmotionMetrics = function(adId) {
	return _.chain(userEmotions).
		filter(function(val) { return val.adId = adId; }).
		reduce(function(memo, val) {
			if (!memo[val.emotion]) {
				memo[val.emotion] = 0;
			}
			memo[val.emotion]++;
			return memo;
		}, {}).
	value();
};

var adSkips = io.of('/ad_skips').on('connection', function(socket) {
	console.log('a user has connected to /ad_skips');
});

app.use('/', express.static('static'));
app.use(bodyParser.json());

app.get('/ads', function(req, res) {
	res.status(200).json({
		// adIds: _.chain(userPlays).map(function(val) { return val.adId; }).uniq().value(),
		adIds: _.chain(userEmotions).map(function(val) { return val.adId; }).uniq().value(),
	});
});
app.get('/ad/:adId/metrics', function(req, res) {
	res.status(200).json({
		actions: calculateActions(req.params.adId),
		emotionMetrics: calculateEmotionMetrics(req.params.adId),
	});
});

app.post('/user/:user/tweet', function(req, res) {
	if (!req.body.ad_id) {
		res.status(400).json({
			status: 'invalid',
			message: 'request sent without an ad_id',
		});
		return
	}
	if (!userCoins[req.params.user]) {
		userCoins[req.params.user] = 0;
	}
	userCoins[req.params.user] += 10;
	res.status(200).json({
		status: 'success',
		user: req.params.user,
		ad_id: req.params.ad_id,
		coins: userCoins[req.params.user],
	});
});

app.get('/user/:user', function(req, res) {
	res.status(200).json({
		status: 'success',
		user: req.params.user,
		coins: userCoins[req.params.user] ? userCoins[req.params.user] : 0,
	});
});

app.post('/ad/:adId/emotion', function(req, res) {
	if (!req.body.user) {
		res.status(400).json({
			status: 'invalid',
			message: 'request sent without an user',
		});
		return
	}
	if (!req.body.emotion) {
		res.status(400).json({
			status: 'invalid',
			message: 'request sent withot an emotion',
		});
		return
	}
	if (!emotions.valid(req.body.emotion)) {
		res.status(400).json({
			status: 'invalid',
			message: 'request send an invalid emotion',
		});
		return
	}
	userEmotions.push({
		adId: req.params.adId,
		user: req.body.user,
		emotion: emotions.extract(req.body.emotion),
		createdAt: (new Date()).toString(),
	});

	if (!userCoins[req.body.user]) {
		userCoins[req.body.user] = 0;
	}
	userCoins[req.body.user] += 2;

	res.status(201).json({
		status: 'success',
		coins: userCoins[req.body.user],
		user: req.body.user,
	});
});

app.put('/ad/:adId', function(req, res) {
	if (!req.body.user) {
		res.status(400).json({
			status: 'invalid',
			message: 'request sent without an user',
		});
		return
	}
	if (userCoins[req.body.user] - 1 < 0) {
		res.status(400).json({
			status: 'invalid',
			user: req.body.user,
			message: 'not enough coins',
			coins: userCoins[req.body.user],
		});
		return
	}

	if (!userSkips[req.body.user]) {
		userSkips[req.body.user] = { skips: [] };
	}
	userSkips.push({
		user: req.body.user,
		adId: req.params.adId,
		createdAt: (new Date()).toString(),
	});
	userCoins[req.body.user]--;

	adSkips.emit('message', calculateActions(adId));

	res.status(200).json({
		status: 'success',
		user: req.body.user,
		coins: userCoins[req.body.user] ? userCoins[req.body.user] : 0,
	});
});

app.post('/notifications', function(req, res) {
	if (!req.body.action) {
		res.status(400).json({
			status: 'invalid',
			message: 'request sent without an action',
		});
		return
	}
	if (req.body.action.toLowerCase() == 'skip') {
		// TODO: check if the coins is > 0
	}
	apn.sendMessage(req.body.action);
});

console.log('app starting on ' + 5000);
server.listen(5000);
