ANGRY = 'angry'
HAHA = 'haha'
LOVE = 'love'
SAD = 'sad'
WOW = 'wow'

# angry, haha, love, sad, wow

_emotion = {
	'angry': ANGRY,
	'haha': HAHA,
	'love': LOVE,
	'sad': SAD,
	'wow': WOW,
}

def valid(emotion):
	emotion = emotion.lower()
	if emotion != ANGRY and emotion != HAHA and emotion != LOVE and emotion != SAD and emotion != WOW:
		return False
	return True

def extract(emotion):
	if not valid(emotion):
		raise Exception('invalid emotion')
	return _emotion[emotion.lower()]