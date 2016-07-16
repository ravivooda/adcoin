from apns import APNs, Frame, Payload
apns = APNs(use_sandbox=True, cert_file='pushcert.pem', key_file='pushcert.pem')
device_token = "a2777ec7450d7c070da08bd821e39de019a0597995af539bff1ffdd227dc5ccf"
def send_message(message, silent):
	payload = Payload(alert=message, sound="default", badge=0)
	apns.gateway_server.send_notification(device_token, payload)

if __name__ == '__main__':
	send_message('Hello Ravi', True)
