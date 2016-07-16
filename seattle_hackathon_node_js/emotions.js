'use strict'; 

var emotions = {
	angry: 'angry',
	haha: 'haha',
	love: 'love',
	sad: 'sad',
	wow: 'wow',
};

var valid = function(emotion) {
	return !emotions[emotion.toLowerCase()];
};

var extract = function(emotion) {
	if (!valid(emotion)) {
		throw Exception('invalid emotion');
	}
	return emotions[emotion.toLowerCase()];
};

exports.valid = valid;
exports.extract = extract;