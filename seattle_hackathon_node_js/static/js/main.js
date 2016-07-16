
;(function($, _, io, Highcharts) {
	'use strict';

	var charts = {};
	var tabContentTemplate = _.template([
		'<div role="tabpanel" class="tab-pane" id="<%= adId %>">',
		'	<div class="col-md-9">',
		'		<div class="graph"></div>',
		'	</div>',
		'	<div class="col-md-3 side-pane">',
		'		<div>',
		'			<p class="plays"><strong>Plays:</strong> <span class="value"><%= plays %></span></p>',
		'		</div>',
		'		<div>',
		'			<p class="skips"><strong>Skips:</strong> <span class="value"><%= skips %></span></p>',
		'		</div>',
		'		<div>',
		'			<p class="tweets"><strong>Tweets:</strong> <span class="value"><%= tweets %></span></p>',
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
							if (metrics.emotionMetrics.hasOwnProperty(emotion) && emotion != 'adId') {
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
							series: series
						};

						charts[adId] = new Highcharts.Chart(options);
						charts[adId].redraw();
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
	var adEmotions = io('http://localhost:5000/ad_emotions');
	adSkipsSocket.on('message', function(data) {
		$('#' + data.adId + ' .skips .value').text(data.skips);
	});
	adEmotions.on('message', function(data) {
		var chart = _.find(charts, function(chart, adId) {
			return adId == data.adId;
		});

		_.each(data, function(value, emotion) {
			if (emotion != 'adId') {
				var series = _.find(chart.series, function(series) {
					return series.name == emotion;
				});
				series.setData([data[emotion]], true);
			}
		});
	});
})(jQuery, _, io, Highcharts);