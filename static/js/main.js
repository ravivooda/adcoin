;(function($) {
	if (!!window.EventSource) {
		var source = new EventSource('//localhost:5000/skips');
		// source.addEventListener('open', function(e) {
		// 	console.log('connection was opened', e);
		// }, false);
		// source.addEventListener('error', function(e) {
		// 	console.log('connection received an error', e);
		// 	if (e.readyState == EventSource.CLOSED) {
		// 		console.log('connection was closed due to an error');
		// 	}
		// }, false);
			source.addEventListener('message', function(event) {
				console.log(event.data);
				$('.skips-value').html(event.data.skips);
		}, false);
	} else {
		console.log('your browser does not support server side events');
	}
})(jQuery);