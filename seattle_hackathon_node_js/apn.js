'use strict';

var apn = require('apn');

var device = apn.Device("f3e42b4dc9ce962753db75ea7733be106d856a84c8fdfe62a987d592144ce240");
var options = { cert: 'pushcert.pem', key: 'pushcert.pem', production: false };
var apnConnection = new apn.Connection(options);

var sendMessage = function(message) {
	var notification = new apn.Notification();
	notification.alert = message;
	notification.sound = 'default';
	notification.badge = 0;
	apnConnection.pushNotification(notification, device);
};

exports.sendMessage = sendMessage;