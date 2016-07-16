'use strict'; 

var emotions = {
	angry: 'angry',
	haha: 'haha',
	love: 'love',
	sad: 'sad',
	wow: 'wow',
};

var valid = function(emotion) {
	return typeof emotions[emotion.toLowerCase()] != 'undefined';
};

var extract = function(emotion) {
	if (!valid(emotion)) {
		throw Exception('invalid emotion');
	}
	return emotions[emotion.toLowerCase()];
};

exports.valid = valid;
exports.extract = extract;