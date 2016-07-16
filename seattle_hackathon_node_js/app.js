'use strict';

var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var emotions = require('./emotions');
var apn = require('./apn');

var userEmotions = {};
var userSkips = {};
var userCoins = {};

var adSkips = io.of('/ad_skips').on('connection', function(socket) {
	console.log('a user has connected to /ad_skips');
	socket.emit('message', { skips: 0 });
});

var tweets = io.of('/tweets').on('connection', function(socket) {
	console.log('a user has connected to /tweets');
	socket.emit('message', { tweets: 0 });
})

app.use('/', express.static('static'));
app.use(bodyParser.json());

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
	userCoins[req.params.user]++;
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
	if (!req.params.user) {
		res.status(400).json({
			status: 'invalid',
			message: 'request sent without an user',
		});
		return
	}
	if (!req.params.emotion) {
		res.status(400).json({
			status: 'invalid',
			message: 'request sent withot an emotion',
		});
		return
	}
	if (!emotion.valid(req.params.emotion)) {
		res.status(400).json({
			status: 'invalid',
			message: 'request send an invalid emotion',
		});
		return
	}
	if (!userEmotions[req.body.user]) {
		userEmotions[req.body.user] = { emotions: [] };
	}

	userEmotions[req.body.user].push({
		adId: req.params.adId,
		emotion: emotions.extract(emotion),
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
	userSkips[req.body.user].push({
		adId: req.params.adId,
		createdAt: (new Date()).toString(),
	});
	userCoins[req.body.user]--;

	// TODO: publish to websockets about emotion changes
	// ...

	res.status(200).json({
		status: 'success',
		user: req.body.user,
		coins: userCoins[req.body.user],
	});
});

app.post('/notifications', function(req, res) {
	if (!req.body.action) {
		res.status(400).json({
			status: 'invalid',
			message: 'request sent without an action',
		})
		return
	}
	apn.sendMessage(req.body.action);
});

console.log('app starting on ' + 5000);
server.listen(5000);
