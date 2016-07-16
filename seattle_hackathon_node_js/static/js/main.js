
;(function($, _, io) {
	'use strict';

	var tabContentTemplate = _.template([
		'<div role="tabpanel" class="tab-pane" id="<%= adId %>">',
		'	<div class="col-md-9">',
		'		<div class="graph"></div>',
		'	</div>',
		'	<div class="col-md-3 side-pane">',
		'		<div>',
		'			<p class="plays"><strong>Plays:</strong> <%= plays %></p>',
		'		</div>',
		'		<div>',
		'			<p class="skips"><strong>Skips:</strong> <%= skips %></p>',
		'		</div>',
		'		<div>',
		'			<p class="tweets"><strong>Tweets:</strong> <%= tweets %></p>',
		'		</div>',
		'	</div>',
		'</div>',
	].join(''));
	var tabTemplate = _.template('<li role="presentation"><a href="#<%= adId %>"><%= adId %></a></li>');
	
	$.ajax({
		method: 'GET',
		url: '/ads',
		success: function(response) {
			var adIds = response.adIds;
			$.each(adIds, function(index, adId) {
				$.ajax({
					method: 'GET',
					url: '/ad/' + adId + '/metrics',
					success: function(metrics) {
						var tab = $(tabTemplate({ adId: adId }));
						var tabPane = $(tabContentTemplate({ adId: adId, tweets: metrics.actions.tweets, skips: metrics.actions.skips, plays: metrics.actions.plays }));
						$('.nav-pills').append(tab);
						$('.tab-content').append(tabPane);
						if (index == 0) {
							tab.addClass('active');
							tabPane.addClass('active');
						}

						var series = [];
						for (var emotion in metrics.emotionMetrics) {
							if (metrics.emotionMetrics.hasOwnProperty(emotion)) {
								series.push({
									name: emotion,
									data: [metrics.emotionMetrics[emotion]],
								});
							}
						}

						$(tabPane).find('.graph').highcharts({
							chart: { type: 'column' },
							title: { text: 'Emotion Metrics' },
							xAxis: { categories: _.keys(metrics.emotionMetrics), title: 'Emotions' },
							yAxis: { min: 0 },
							series: series
						});
					}
				});
			});

			$(document).on('click', '.nav-pills a', function(event) {
				event.preventDefault();
				$(this).tab('show');
			});
		}
	});

	var adSkipsSocket = io('http://localhost:5000/ad_skips');
	adSkipsSocket.on('message', function(data) {
		console.log(data);
		$('.ad-skips').text(data.skips);
	});
})(jQuery, _, io);