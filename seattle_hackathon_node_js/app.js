'use strict';

var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var emotions = require('./emotions');
var apn = require('./apn');
var _ = require('underscore');

var userEmotions = [
	{
		adId: 101,
		user: 'don',
		emotion: 'haha',
		createdAt: (new Date()).toString(),
	},
	{
		adId: 101,
		user: 'john',
		emotion: 'wow',
		createdAt: (new Date()).toString(),
	},
	{
		adId: 101,
		user: 'bob',
		emotion: 'wow',
		createdAt: (new Date()).toString(),
	},
	{
		adId: 101,
		user: 'jill',
		emotion: 'wow',
		createdAt: (new Date()).toString(),
	},
	{
		adId: 101,
		user: 'jill',
		emotion: 'sad',
		createdAt: (new Date()).toString(),
	},
	{
		adId: 202,
		user: 'bob',
		emotion: 'haha',
		createdAt: (new Date()).toString(),
	},
	{
		adId: 202,
		user: 'sean',
		emotion: 'angry',
		createdAt: (new Date()).toString(),
	},
	{
		adId: 202,
		user: 'harry',
		emotion: 'sad',
		createdAt: (new Date()).toString(),
	},
	{
		adId: 202,
		user: 'barry',
		emotion: 'sad',
		createdAt: (new Date()).toString(),
	},
];
var userSkips = [
	{
		adId: 101,
		user: 'bob',
		createdAt: (new Date()).toString(),
	},
	{
		adId: 101,
		user: 'jill',
		createdAt: (new Date()).toString(),
	},
	{
		adId: 202,
		user: 'bob',
		createdAt: (new Date()).toString(),
	},
];
var userTweets = [
	{
		adId: 101,
		user: 'bob',
		createdAt: (new Date()).toString(),
	},
	{
		adId: 101,
		user: 'jill',
		createdAt: (new Date()).toString(),
	},
];
var userPlays = [
	{
		adId: 101,
		user: 'bob',
		createdAt: (new Date()).toString(),
	},
	{
		adId: 101,
		user: 'jill',
		createdAt: (new Date()).toString(),
	},
	{
		adId: 101,
		user: 'don',
		createdAt: (new Date()).toString(),
	},
	{
		adId: 101,
		user: 'john',
		createdAt: (new Date()).toString(),
	},
	{
		adId: 101,
		user: 'bob',
		createdAt: (new Date()).toString(),
	},
	{
		adId: 101,
		user: 'jill',
		createdAt: (new Date()).toString(),
	},
	{
		adId: 202,
		user: 'bob',
		createdAt: (new Date()).toString(),
	},
	{
		adId: 101,
		user: 'bob',
		createdAt: (new Date()).toString(),
	},
	{
		adId: 101,
		user: 'jill',
		createdAt: (new Date()).toString(),
	},
	{
		adId: 202,
		user: 'bob',
		createdAt: (new Date()).toString(),
	},
];
var userCoins = {};

var calculateActions = function(adId) {
	var skips = _.filter(userSkips, function(val) { return val.adId == adId; }).length;
	var plays = _.filter(userPlays, function(val) { return val.adId == adId; }).length;
	var tweets = _.filter(userTweets, function(val) { return val.adId == adId; }).length;
	return {
		adId: adId,
		skips: skips,
		plays: plays,
		tweets: tweets,
	};
};

var calculateEmotionMetrics = function(adId) {
	var emotionMetrics = _.chain(userEmotions).
		filter(function(val) { return val.adId == adId; }).
		reduce(function(memo, val) {
			if (!memo[val.emotion]) {
				memo[val.emotion] = 0;
			}
			memo[val.emotion]++;
			return memo;
		}, {}).
	value();
	emotionMetrics.adId = adId;
	for (var emotion in emotions.values) {
		if (emotions.values.hasOwnProperty(emotion) && !emotionMetrics[emotion]) {
			emotionMetrics[emotion] = 0;
		}
	}
	return emotionMetrics;
};

var adSkips = io.of('/ad_skips').on('connection', function(socket) {
	console.log('a user has connected to /ad_skips');
});
var adEmotions = io.of('/ad_emotions').on('connection', function(socket) {
	console.log('a user has connected to /ad_emotions');
});
var adTweets = io.of('/ad_tweets').on('connection', function(socket) {
	console.log('a user has connected to /ad_tweets');
});

app.use('/', express.static('static'));
app.use(bodyParser.json());

app.get('/ads', function(req, res) {
	res.status(200).json({
		adIds: _.chain(userPlays).map(function(val) { return val.adId; }).uniq().value(),
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
	var tweeted = _.any(userTweets, function(tweet) {
		return tweet.adId == req.body.adId && tweet.user == req.params.user;
	});
	if (tweeted) {
		res.status(422).json({
			status: 'invalid',
			message: 'ad already retweeted',
		});
		return
	}
	userCoins[req.params.user] += 10;
	userTweets.push({
		adId: req.body.ad_id,
		user: req.params.user,
	});
	adTweets.emit('message', calculateActions(req.body.ad_id));
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
	adEmotions.emit('message', calculateEmotionMetrics(req.params.adId));

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

	userSkips.push({
		user: req.body.user,
		adId: req.params.adId,
		createdAt: (new Date()).toString(),
	});
	userCoins[req.body.user]--;

	adSkips.emit('message', calculateActions(req.params.adId));

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
		for (var user in userCoins) {
			if (userCoins.hasOwnProperty(user) && userCoins[user] > 0) {
				apn.sendMessage(req.body.action);
				break;
			}
		}
	} else {
		apn.sendMessage(req.body.action);
	}
});

console.log('app starting on ' + 5000);
server.listen(5000);
