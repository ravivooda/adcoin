'use strict';

var apn = require('apn');

var device = apn.Device("a2777ec7450d7c070da08bd821e39de019a0597995af539bff1ffdd227dc5ccf");
var options = { cert: 'pushcert.pem', key: 'pushcert.pem', production: false };
var apnConnection = new apn.Connection(options);

var sendMessage = function(message) {
	var notification = apn.Notification();
	notification.alert = message;
	notification.sound = 'default';
	notification.badge = 0;
	apnConnection.pushNotification(notification, device);
};

exports.sendMessage = sendMessage;