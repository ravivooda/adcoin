from collections import defaultdict
from datetime import datetime
import json

from flask import Flask, Response, make_response, request, abort, jsonify, send_from_directory
from flask_sockets import Sockets

from gevent import pywsgi
from gevent.queue import Queue
from geventwebsocket.handler import WebSocketHandler

import emotions.enum
import apn_push_notification as apn

app = Flask(__name__)
sockets = Sockets(app)

emotions_q = Queue()
skips_q = Queue()

user_emotions = defaultdict(lambda: defaultdict(lambda: []))
user_skips = defaultdict(lambda: defaultdict(lambda: []))
user_tweets = defaultdict(lambda: defaultdict(lambda: []))
user_coins = defaultdict(lambda: 20)

api_endpoints = ['add_emotion', 'skip_ad']

@app.before_request
def only_json():
	if request.endpoint in api_endpoints and not request.is_json:
		abort(400)

@app.route("/")
def dashboard():
	return app.send_static_file('index.html')

@app.route("/css/<path:path>")
def css(path):
	return send_from_directory('static/css', path)

@app.route("/js/<path:path>")
def javascript(path):
	return send_from_directory('static/js', path)

@app.route("/bower_components/<path:path>")
def bower_components(path):
	return send_from_directory('static/bower_components', path)

@sockets.route("/emotions")
def get_emotions(ws):
	while not emotions_q.empty():
		ws.send(json.dumps(emotions_q.get()))

@sockets.route("/skips")
def get_skips(ws):
	while not ws.closed and not skips_q.empty():
		ws.send(json.dumps(skips_q.get()))

@app.route("/notifications", methods=["POST"])
def notificaitons():
	if 'action' not request.json:
		return make_response(jsonify({
			'status': 'invalid',
			'message': 'request send without an action',
		}), 200)
	apn.send_message(request.json['action'])

@app.route("/user/<user>/tweet", methods=["POST"])
def tweet(user):
	if 'ad_id' not in request.json:
		return make_response(jsonify({
			'status': 'invalid',
			'message': 'request sent without an ad_id',
		}))
	user_coins[user] += 10
	return make_response(jsonify({
		'status': 'success',
		'user': user,
		'ad_id': request.json['ad_id'],
		'coins': user_coins[user],
	}))

@app.route("/user/<user>", methods=["GET"])
def get_coins(user):
	return make_response(jsonify({
		'status': 'success',
		'user': user,
		'coins': user_coins[user],
	}))

@app.route("/ad/<ad_id>/emotion", methods=["POST"])
def add_emotion(ad_id):
	if 'user' not in request.json:
		return make_response(jsonify({
			'status': 'invalid',
			'message': 'request sent without an user',
		}), 400)
	if 'emotion' not in request.json:
		return make_response(jsonify({
			'status': 'invalid',
			'message': 'request sent without an emotion',
		}), 400)
	if not emotions.enum.valid(request.json['emotion']):
		return make_response(jsonify({
			'status': 'invalid',
			'message': 'request sent an invalid emotion',
		}), 400)

	emotion_event = {
		'ad_id': ad_id,
		'emotion': emotions.enum.extract(request.json['emotion']),
		'created_at': str(datetime.now()),
	}
	user_emotions[request.json['user']]['emotions'].append(emotion_event)
	user_coins[request.json['user']] += 2

	response = make_response(jsonify({
		'status': 'success',
		'coins': user_coins[request.json['user']],
		'user': request.json['user'],
	}), 201)
	response.headers['Content-Type'] = 'application/json'
	return response

@app.route("/ad/<ad_id>", methods=["PUT"])
def skip_ad(ad_id):
	if 'user' not in request.json:
		return make_response({'status': 'invalid', 'message': 'request send without an user'}, 400)
	if user_coins[request.json['user']] - 1 < 0:
		return make_response(jsonify({
			'status': 'invalid',
			'user': request.json['user'],
			'message': 'not enough coins',
			'coins': user_coins[request.json['user']],
		}), 400)

	skip_event = {'id': ad_id, 'created_at': str(datetime.now())}
	user_skips[request.json['user']]['skips'].append(skip_event)
	user_coins[request.json['user']] -= 1

	skips_q.put({
		'status': 'success',
		'skips': sum([len(value['skips']) for _, value in user_skips.items()]),
	})
	
	return make_response(jsonify({
		'status': 'success',
		'user': request.json['user'],
		'coins': user_coins[request.json['user']],
	}), 200)

if __name__ == "__main__":
	# TODO: set up the data with the data that is available for the ad in case validation logic is required in the future
	# TODO: persist the data records to some source
	app.debug = True
	server = pywsgi.WSGIServer(('', 5000), app, handler_class=WebSocketHandler)
	server.serve_forever()
