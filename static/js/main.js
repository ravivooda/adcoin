;(function($) {
	var socket = new WebSocket("ws://localhost:5000/skips");
	socket.onmessage = function(event) {
		console.log(event.data);
	};
	// if (!!window.EventSource) {
	// 	var skipsSource = new EventSource('//localhost:5000/skips');
	// 	skipsSource.addEventListener('message', function(event) {
	// 		var data = JSON.parse(event.data);
	// 		$('.skips-value').text(data.skips);
	// 	}, false);
	// } else {
	// 	console.log('your browser does not support server side events');
	// }
})(jQuery);