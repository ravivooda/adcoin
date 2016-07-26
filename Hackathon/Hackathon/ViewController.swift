//
//  ViewController.swift
//  Hackathon
//
//  Created by Ravi Vooda on 7/15/16.
//  Copyright © 2016 FreeWheel. All rights reserved.
//

import UIKit
import MediaPlayer
import Alamofire
import TOWebViewController

class ViewController: UIViewController, FWEmotionExtensionDelegate {
	
	let moviePlayer:MPMoviePlayerController = MPMoviePlayerController()
	var fwextension:FWEmotionExtension?
	
	let playerView = UIView()
	
	var current_playback = 0
	var hard_stop = false
	
	let adStringURLs = ["https://freewheel.box.com/shared/static/xen2cldr97uqbo8vuuasc5s8fid111oo.mp4",
	                    "https://freewheel.box.com/shared/static/zc7wybi9am0ioark4p7j7bzzvapu4ppz.mp4",
	                    "https://freewheel.box.com/shared/static/ytho73ec9yo3guv9oa3b610pzfj2nc9z.mp4",
	                    "http://m1.fwmrm.net/m/1/375934/37/2312485/5599355/Doritos%20Ultrasound%20Commercial_1468609458.mp4"]
	let contentStringURLs = ["https://freewheel.box.com/shared/static/rnzwce142upd71n959j6l8d3rrwc5mzo.mp4",
	                         "https://freewheel.box.com/shared/static/unnt2q9j73bxkyi37ob7x7fl5j1g9j1r.mp4",
	                         "https://freewheel.box.com/shared/static/9fj1x1tl1gct90nl1br7dv0ovkd2rp1b.mp4",
	                         "https://freewheel.box.com/shared/static/ep0qrkpll6e8ozjddbiace3lrb0sgfd2.mp4"]
	let adIDs = ["1468609764","1468609799","1468609925","1468609458"]
	
	
	override func viewDidLoad() {
		super.viewDidLoad()
		// Do any additional setup after loading the view, typically from a nib.
		
		// Setting Player View
		self.view.addSubview(playerView)
		playerView.translatesAutoresizingMaskIntoConstraints = false
		NSLayoutConstraint(item: playerView, attribute: .Top, relatedBy: .Equal, toItem: self.view, attribute: .Top, multiplier: 1.0, constant: 0.0).active = true
		NSLayoutConstraint(item: playerView, attribute: .Leading, relatedBy: .Equal, toItem: self.view, attribute: .Leading, multiplier: 1.0, constant: 0.0).active = true
		NSLayoutConstraint(item: playerView, attribute: .Trailing, relatedBy: .Equal, toItem: self.view, attribute: .Trailing, multiplier: 1.0, constant: 0.0).active = true
		NSLayoutConstraint(item: playerView, attribute: .Bottom, relatedBy: .Equal, toItem: self.view, attribute: .Bottom, multiplier: 1.0, constant: 0.0).active = true
		
		// Setting Movie Player
		playerView.addSubview(moviePlayer.view)
		moviePlayer.view.translatesAutoresizingMaskIntoConstraints = false
		NSLayoutConstraint(item: moviePlayer.view, attribute: .Top, relatedBy: .Equal, toItem: playerView, attribute: .Top, multiplier: 1.0, constant: 44.0).active = true
		NSLayoutConstraint(item: moviePlayer.view, attribute: .Leading, relatedBy: .Equal, toItem: playerView, attribute: .Leading, multiplier: 1.0, constant: 0.0).active = true
		NSLayoutConstraint(item: moviePlayer.view, attribute: .Trailing, relatedBy: .Equal, toItem: playerView, attribute: .Trailing, multiplier: 1.0, constant: 0.0).active = true
		NSLayoutConstraint(item: moviePlayer.view, attribute: .Bottom, relatedBy: .Equal, toItem: playerView, attribute: .Bottom, multiplier: 1.0, constant: -44.0).active = true
		
		moviePlayer.scalingMode = MPMovieScalingMode.AspectFit
		moviePlayer.controlStyle = MPMovieControlStyle.None
		moviePlayer.movieSourceType = MPMovieSourceType.File
		moviePlayer.repeatMode = MPMovieRepeatMode.None
		
		NSNotificationCenter.defaultCenter().addObserver(self, selector: #selector(ViewController.movieFinishedCallback), name: MPMoviePlayerPlaybackDidFinishNotification, object: nil)
		
		restart()
		
		Alamofire.request(.GET, "\(FWEmotionExtension.BASE_API)user/test_user").responseJSON { (response) in
			debugPrint(response)
			self.fwextension?.parseJSONResponse(response)
		}
		
		// Register for push notifications
		registerForPushNotifications(UIApplication.sharedApplication())
		
		AppDelegate.viewController = self
	}
	
	func registerForPushNotifications(application: UIApplication) {
		let notificationSettings = UIUserNotificationSettings(
			forTypes: [.Badge, .Sound, .Alert], categories: nil)
		application.registerUserNotificationSettings(notificationSettings)
		application.registerForRemoteNotifications()
	}
	
	func skipAd() {
		current_playback += 1
		playContent(current_playback/2)
	}
	
	func retweet() {
		let tweetWebView = UIWebView()
		self.view.addSubview(tweetWebView)
		tweetWebView.frame = CGRectMake(-self.view.frame.size.width, playerView.frame.origin.y + playerView.frame.height, self.view.frame.size.width, 150)
		//https://media.giphy.com/media/k4ZItrTKDPnSU/giphy.gif
		tweetWebView.loadRequest(NSURLRequest(URL: NSURL(string: "https://media.giphy.com/media/k4ZItrTKDPnSU/giphy.gif")!))
		UIView.animateWithDuration(1.0, animations: {
			tweetWebView.transform = CGAffineTransformMakeTranslation(self.view.frame.size.width, 0)
		}) { (sort) in
			print(tweetWebView)
			dispatch_after(5, dispatch_get_main_queue()) {
				UIView.animateWithDuration(1.0, animations: {
					tweetWebView.transform = CGAffineTransformMakeTranslation(2 * self.view.frame.size.width, 0)
					}, completion: { (arbit) in
						tweetWebView.removeFromSuperview()
				})
			}
		}
	}
	
	func movieFinishedCallback() -> Void {
		fwextension?.stop()
		fwextension = nil
		if hard_stop {
			return
		}
		
		if current_playback % 2 == 1 {
			// This is content. So play next ad
			playAd((current_playback + 1)/2)
		} else {
			playContent((current_playback + 1)/2)
		}
		
		current_playback = (current_playback + 1) % 8
	}
	
	var postRollWebView:UIWebView?;
	
	func showPostroll() -> Void {
		postRollWebView = UIWebView(frame: self.playerView.bounds)
		playerView.addSubview(postRollWebView!)
	}
	
	func playAd(_value:Int) -> Void {
		hard_stop = true
		moviePlayer.stop()
		let value = _value % 4
		moviePlayer.contentURL = NSURL(string: adStringURLs[value])
		moviePlayer.play()
		fwextension?.stop()
		fwextension = FWEmotionExtension(superView: playerView, adID:adIDs[value], images:[UIImage(named:"haha_icon")!, UIImage(named:"sad_icon")!, UIImage(named:"wow_icon")!, UIImage(named: "love_icon")!, UIImage(named: "angry_icon")!], emotions:["haha","sad", "wow", "love", "angry"])
		fwextension?.delegate = self
		fwextension?.start()
		hard_stop = false
	}
	
	func playContent(_value:Int) -> Void {
		hard_stop = true
		moviePlayer.stop()
		let value = _value % 4
		print(contentStringURLs[value])
		moviePlayer.contentURL = NSURL(string: contentStringURLs[value])
		moviePlayer.play()
		hard_stop = false
	}
	
	func restart() -> Void {
		hard_stop = true
		moviePlayer.stop()
		current_playback = 0
		playAd(current_playback)
		hard_stop = false
	}
	
	func replayLastAd() -> Void {
		hard_stop = true
		if current_playback % 2 == 1 {
			if current_playback - 1 >= 0 {
				// repeat last ad
				playAd((current_playback - 1)/2)
				current_playback = current_playback - 1
			} else {
				self.restart()
			}
		} else {
			if current_playback - 2 >= 0 {
				playAd((current_playback - 2)/2)
				current_playback = current_playback - 2
			} else {
				self.restart()
			}
		}
		hard_stop = false
	}
	
	func silentAd(secs: Int) {
		
	}
	
	func openURLinWebView(url: NSURL) {
		let webViewController = TOWebViewController(URL: url)
		let navigationController = UINavigationController(rootViewController: webViewController)
		self.presentViewController(navigationController, animated: true, completion: nil)
		moviePlayer.pause()
	}
	
	override func viewDidAppear(animated: Bool) {
		super.viewDidAppear(animated)
		if moviePlayer.playbackState == .Paused {
			moviePlayer.play()
		}
	}
}

