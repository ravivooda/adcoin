
;(function($, _, io, Highcharts) {
	'use strict';

	// var charts = {};
	var chart;
	// var tabContentTemplate = _.template([
	// 	'<div role="tabpanel" class="tab-pane" id="<%= adId %>">',
	// 	'	<div class="col-md-9">',
	// 	'		<div class="graph"></div>',
	// 	'	</div>',
	// 	'	<div class="col-md-3 side-pane">',
	// 	'		<div>',
	// 	'			<p class="plays"><strong>Plays:</strong> <span class="value"><%= plays %></span></p>',
	// 	'		</div>',
	// 	'		<div>',
	// 	'			<p class="skips"><strong>Skips:</strong> <span class="value"><%= skips %></span></p>',
	// 	'		</div>',
	// 	'		<div>',
	// 	'			<p class="tweets"><strong>Tweets:</strong> <span class="value"><%= tweets %></span></p>',
	// 	'		</div>',
	// 	'	</div>',
	// 	'</div>',
	// ].join(''));
	var tabContentTemplate = _.template([
		'<div role="tabpanel">',
		'	<div class="col-md-9">',
		'		<div class="graph"></div>',
		'	</div>',
		'	<div class="col-md-3 side-pane">',
		'		<div>',
		'			<p class="skips"><strong>Skips:</strong> <span class="value"><%= skips %></span></p>',
		'		</div>',
		'		<div>',
		'			<p class="tweets"><strong>Tweets:</strong> <span class="value"><%= tweets %></span></p>',
		'		</div>',
		'	</div>',
		'</div>',
	].join(''));
	
	$.ajax({
		method: 'GET',
		url: '/ad/metrics',
		success: function(metrics) {
			var tabPane = $(tabContentTemplate({ tweets: metrics.actions.tweets, skips: metrics.actions.skips, plays: metrics.actions.plays }));
			$('.tab-content').append(tabPane);

			var series = [];
			for (var emotion in metrics.emotionMetrics) {
				if (metrics.emotionMetrics.hasOwnProperty(emotion)) {
					series.push({
						name: emotion,
						data: [metrics.emotionMetrics[emotion]],
					});
				}
			}

			var options = {
				chart: {
					renderTo: $(tabPane).find('.graph')[0],
					type: 'column',
				},
				title: { text: 'Emotion Metrics' },
				xAxis: { categories: ['Emotions'], title: 'Emotions' },
				yAxis: { min: 0 },
				series: series,
				plotOptions: {
					column: {
						dataLabels: { enabled: true }
					}
				}
			};

			chart = new Highcharts.Chart(options);
			chart.redraw();
		}
	});

	var adSkipsSocket = io('http://localhost:5000/ad_skips');
	var adEmotions = io('http://localhost:5000/ad_emotions');
	var adTweets = io('http://localhost:5000/ad_tweets');
	adSkipsSocket.on('message', function(data) {
		$('.skips .value').text(data.skips);
	});
	adEmotions.on('message', function(data) {
		_.each(data, function(value, emotion) {
			if (emotion != 'adId') {
				var series = _.find(chart.series, function(series) {
					return series.name == emotion;
				});
				series.setData([data[emotion]], true);
			}
		});
	});
	adTweets.on('message', function(data) {
		$('.tweets .value').text(data.tweets);
	});
})(jQuery, _, io, Highcharts);
