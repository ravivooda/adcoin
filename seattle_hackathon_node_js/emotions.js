'use strict'; 

var values = {
	angry: 'angry',
	haha: 'haha',
	love: 'love',
	sad: 'sad',
	wow: 'wow',
};

var valid = function(emotion) {
	return typeof values[emotion.toLowerCase()] != 'undefined';
};

var extract = function(emotion) {
	if (!valid(emotion)) {
		throw Exception('invalid emotion');
	}
	return values[emotion.toLowerCase()];
};

exports.valid = valid;
exports.extract = extract;
exports.values = values;