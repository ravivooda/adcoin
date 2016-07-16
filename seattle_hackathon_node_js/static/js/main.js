;(function($, io) {
	var socket = io('http://localhost:5001/ad_skips');
	socket.on('message', function(data) {
		console.log(data);
		$('.ad-skips').text(data.skips);
	});
})(jQuery, io);