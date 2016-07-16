;(function($, _, io) {
	var tabContentTemplate = _.template([
		'<div role="tabpanel" class="tab-pane">',
		'	<div class="col-md-8">',
		'		<img src="http://placehold.it/640x480">',
		'	</div>',
		'	<div class="col-md-4">',
		'		<div>',
		'			<h4>Number of Tweets</h4>',
		'			<p class="tweets"><%= tweets %></p>',
		'		</div>',
		'		<div>',
		'			<h4>Number of Skips</h4>',
		'			<p class="ad-skips"><%= skips %></p>',
		'		</div>',
		'	</div>',
		'</div>',
	].join(''));
	var tabTemplate = _.template('<li role="presentation"><a href="#<%= adId %>"><%= adId %></a></li>');
	
	$.ajax({
		method: 'GET',
		url: '/ads',
		success: function(response) {
			if (response.adIds.length > 0) {
				var activeTab = $(tabTemplate({ adId: response.adIds[0] })).addClass('active');
				var activeTabPane = $(tabContentTemplate({ tweets: 0, skips: 0 })).addClass('active');
				$('.nav-pills').append(activeTab);
				$('.tab-content').append(activeTabPane);
			}
			$.each(response.adIds.slice(1), function(index, adId) {
				$('.nav-pills').append(tabTemplate({ adId: adId }));
				$('.tab-content').append(tabContentTemplate({ tweets: 0, skips: 0 }));
			});

			$('.nav-pills a').tab('show');
		}
	});
	$.ajax({

	})


	var adSkipsSocket = io('http://localhost:5000/ad_skips');
	adSkipsSocket.on('message', function(data) {
		console.log(data);
		$('.ad-skips').text(data.skips);
	});
})(jQuery, _, io);