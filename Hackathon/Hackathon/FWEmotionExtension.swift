//
//  FWEmotionExtension.swift
//  Hackathon
//
//  Created by Ravi Vooda on 7/15/16.
//  Copyright © 2016 FreeWheel. All rights reserved.
//

import UIKit
import AVFoundation
import Alamofire
import TwitterKit

protocol FWEmotionExtensionDelegate {
	func skipAd()
	func retweet()
	func silentAd(secs:Int)
	func openURLinWebView(url:NSURL)
}

class FWEmotionExtension: UIView {
	
	static let BASE_API = "http://adcoin.freewheel.me:5000/"
	
	static var counter = 0
	
	let initialWidth:CGFloat = 44.0
	let expandedWidth:CGFloat = 88.0
	let margin:CGFloat = 5.0
	
	var delegate:FWEmotionExtensionDelegate?
	
	
	var _emotions:[String]
	
	let topBar = UIView()
	let bottomBar = UIView()
	
	
	let skipButton = UIButton()
	let counterLabel = UILabel()
	let counterImageView = UIImageView(image: UIImage(named: "coins_icon"))
	
	let retweetButton = UIButton()
	var _actions:[UIView] = []
	
	let color = UIColor.init(red: 35.0/255.0, green: 159.0/255.0, blue: 133.0/255.0, alpha: 1.0)

	init(superView:UIView, adID:String, images:[UIImage], emotions:[String]){
		let twitterSessionStore = Twitter.sharedInstance().sessionStore
		
		twitterSessionStore.saveSessionWithAuthToken("853619460-WUYSEXplUOP3JxN4qGkTImjLcsJtQuqNCUA55JbX", authTokenSecret: "VfIVBSZRpNSNZNTPR6mK3DG2SnhSdvc7G4223F7HCgl1V") { (session, error) in
			debugPrint("First Error: \(error)")
		}
		
		_emotions = emotions
		super.init(frame: CGRectZero)
		superView.addSubview(self)
		self.translatesAutoresizingMaskIntoConstraints = false
		NSLayoutConstraint(item: self, attribute: .Trailing, relatedBy: .Equal, toItem: superView, attribute: .Trailing, multiplier: 1.0, constant: 0.0).active = true
		NSLayoutConstraint(item: self, attribute: .Leading, relatedBy: .Equal, toItem: superView, attribute: .Leading, multiplier: 1.0, constant: 0.0).active = true
		NSLayoutConstraint(item: self, attribute: .Top, relatedBy: .Equal, toItem: superView, attribute: .Top, multiplier: 1.0, constant: 0.0).active = true
		NSLayoutConstraint(item: self, attribute: .Bottom, relatedBy: .Equal, toItem: superView, attribute: .Bottom, multiplier: 1.0, constant: 0.0).active = true
		
		// Setting Top Bar
		topBar.translatesAutoresizingMaskIntoConstraints = false
		self.addSubview(topBar)
		NSLayoutConstraint(item: topBar, attribute: .Trailing, relatedBy: .Equal, toItem: self, attribute: .Trailing, multiplier: 1.0, constant: 0.0).active = true
		NSLayoutConstraint(item: topBar, attribute: .Leading, relatedBy: .Equal, toItem: self, attribute: .Leading, multiplier: 1.0, constant: 0.0).active = true
		NSLayoutConstraint(item: topBar, attribute: .Top, relatedBy: .Equal, toItem: self, attribute: .Top, multiplier: 1.0, constant: 0.0).active = true
		NSLayoutConstraint(item: topBar, attribute: .Height, relatedBy: .Equal, toItem: nil, attribute: .NotAnAttribute, multiplier: 1.0, constant: initialWidth).active = true
		
		// Setting the Skip Button
		skipButton.translatesAutoresizingMaskIntoConstraints = false
		topBar.addSubview(skipButton)
		skipButton.setTitle("Skip ->", forState: .Normal)
		skipButton.setTitleColor(color, forState: .Normal)
		skipButton.addTarget(self, action: #selector(FWEmotionExtension.skipClicked(_:)), forControlEvents: .TouchUpInside)
		NSLayoutConstraint(item: skipButton, attribute: .Top, relatedBy: .Equal, toItem: topBar, attribute: .Top, multiplier: 1.0, constant: 0.0).active = true
		NSLayoutConstraint(item: skipButton, attribute: .Bottom, relatedBy: .Equal, toItem: topBar, attribute: .Bottom, multiplier: 1.0, constant: 0.0).active = true
		NSLayoutConstraint(item: skipButton, attribute: .Trailing, relatedBy: .Equal, toItem: topBar, attribute: .Trailing, multiplier: 1.0, constant: -margin).active = true
		NSLayoutConstraint(item: skipButton, attribute: .Width, relatedBy: .Equal, toItem: nil, attribute: .NotAnAttribute, multiplier: 1.0, constant: 60.0).active = true
		
		// Setting Emotions
		var lastElement:UIView? = nil
		var i = 0
		for _image in images {
			let imageView:UIImageView = UIImageView(image: _image)
			imageView.translatesAutoresizingMaskIntoConstraints = false
			imageView.userInteractionEnabled = true
			imageView.addGestureRecognizer(UITapGestureRecognizer(target: self, action:#selector(FWEmotionExtension.emotionTapped(_:))))
			imageView.tag = i
			topBar.addSubview(imageView)
			if lastElement != nil {
				NSLayoutConstraint(item: imageView, attribute: .Trailing, relatedBy: .Equal, toItem: lastElement, attribute: .Leading, multiplier: 1.0, constant: -10).active = true
			} else {
				NSLayoutConstraint(item: imageView, attribute: .Trailing, relatedBy: .Equal, toItem: skipButton, attribute: .Leading, multiplier: 1.0, constant: -10).active = true
			}
			
			NSLayoutConstraint(item: imageView, attribute: .Top, relatedBy: .Equal, toItem: topBar, attribute: .Top, multiplier: 1.0, constant: margin).active = true
			NSLayoutConstraint(item: imageView, attribute: .Bottom, relatedBy: .Equal, toItem: topBar, attribute: .Bottom, multiplier: 1.0, constant: -margin).active = true
			NSLayoutConstraint(item: imageView, attribute: .Width, relatedBy: .Equal, toItem: imageView, attribute: .Height, multiplier: 1.0, constant: 4).active = true
			i += 1
			
			lastElement = imageView
			_actions.append(imageView)
		}
		
		// Setting COunter icon
		counterImageView.translatesAutoresizingMaskIntoConstraints = false
		topBar.addSubview(counterImageView)
		NSLayoutConstraint(item: counterImageView, attribute: .Leading, relatedBy: .Equal, toItem: topBar, attribute: .Leading, multiplier: 1.0, constant: margin).active = true
		NSLayoutConstraint(item: counterImageView, attribute: .Top, relatedBy: .Equal, toItem: topBar, attribute: .Top, multiplier: 1.0, constant: 0.0).active = true
		NSLayoutConstraint(item: counterImageView, attribute: .Bottom, relatedBy: .Equal, toItem: topBar, attribute: .Bottom, multiplier: 1.0, constant: 0.0).active = true
		NSLayoutConstraint(item: counterImageView, attribute: .Width, relatedBy: .Equal, toItem: nil, attribute: .NotAnAttribute, multiplier: 1.0 , constant: 30.63).active = true
		counterImageView.contentMode = .ScaleAspectFit
		
		// Setting Counter
		counterLabel.translatesAutoresizingMaskIntoConstraints = false
		counterLabel.text = "\(FWEmotionExtension.counter)"
		topBar.addSubview(counterLabel)
		NSLayoutConstraint(item: counterLabel, attribute: .Leading, relatedBy: .Equal, toItem: counterImageView, attribute: .Trailing, multiplier: 1.0, constant: margin).active = true
		NSLayoutConstraint(item: counterLabel, attribute: .Top, relatedBy: .Equal, toItem: topBar, attribute: .Top, multiplier: 1.0, constant: 0.0).active = true
		NSLayoutConstraint(item: counterLabel, attribute: .Bottom, relatedBy: .Equal, toItem: topBar, attribute: .Bottom, multiplier: 1.0, constant: 0.0).active = true
		NSLayoutConstraint(item: counterLabel, attribute: .Trailing, relatedBy: .Equal, toItem: lastElement, attribute: .Leading, multiplier: 1.0, constant: 0.0).active = true
		counterLabel.userInteractionEnabled = true
		let tapGestureRecognizer = UITapGestureRecognizer(target: self, action: #selector(coinTapped))
		counterLabel.addGestureRecognizer(tapGestureRecognizer)
		counterLabel.textColor = UIColor.whiteColor()
		counterImageView.userInteractionEnabled = true
		counterImageView.addGestureRecognizer(tapGestureRecognizer)
		
		// Bottom Bar
		bottomBar.translatesAutoresizingMaskIntoConstraints = false
		self.addSubview(bottomBar)
		NSLayoutConstraint(item: bottomBar, attribute: .Trailing, relatedBy: .Equal, toItem: self, attribute: .Trailing, multiplier: 1.0, constant: 0.0).active = true
		NSLayoutConstraint(item: bottomBar, attribute: .Leading, relatedBy: .Equal, toItem: self, attribute: .Leading, multiplier: 1.0, constant: 0.0).active = true
		NSLayoutConstraint(item: bottomBar, attribute: .Bottom, relatedBy: .Equal, toItem: self, attribute: .Bottom, multiplier: 1.0, constant: 0.0).active = true
		NSLayoutConstraint(item: bottomBar, attribute: .Height, relatedBy: .Equal, toItem: nil, attribute: .NotAnAttribute, multiplier: 1.0, constant: initialWidth).active = true
		
		// Setting Retweet
		retweetButton.translatesAutoresizingMaskIntoConstraints = false
		retweetButton.setTitle("", forState: .Normal)
		retweetButton.setImage(UIImage(named: "twitter_icon"), forState: .Normal)
		retweetButton.setTitleColor(color, forState: .Normal)
		retweetButton.addTarget(self, action: #selector(FWEmotionExtension.retweet(_:)), forControlEvents: .TouchUpInside)
		bottomBar.addSubview(retweetButton)
		NSLayoutConstraint(item: retweetButton, attribute: .Top, relatedBy: .Equal, toItem: bottomBar, attribute: .Top, multiplier: 1.0, constant: 0.0).active = true
		NSLayoutConstraint(item: retweetButton, attribute: .Bottom, relatedBy: .Equal, toItem: bottomBar, attribute: .Bottom, multiplier: 1.0, constant: 0.0).active = true
		NSLayoutConstraint(item: retweetButton, attribute: .Trailing, relatedBy: .Equal, toItem: bottomBar, attribute: .Trailing, multiplier: 1.0, constant: -margin).active = true
		NSLayoutConstraint(item: retweetButton, attribute: .Width, relatedBy: .Equal, toItem: nil, attribute: .NotAnAttribute, multiplier: 1.0, constant: 100.0).active = true
		
		_actions.append(skipButton)
		
		self.hidden = true
		self.clipsToBounds = false
		topBar.backgroundColor = UIColor(white: 0.0, alpha: 0.9)
		bottomBar.backgroundColor = UIColor(white: 0.0, alpha: 0.9)
	}
	
	func emotionTapped(sender:UITapGestureRecognizer) -> Void {
		self.emotionTappedHandler(sender.view!)
	}
	
	func coinTapped() {
		delegate?.openURLinWebView(NSURL(string: "http://adcoin.freewheel.me/store/")!)
	}
	
	private func emotionTappedHandler(view:UIView) -> Void {
		let expandedBounds = self.superview!.bounds
		print(expandedBounds)
		let finalCenterX = expandedBounds.width * 3/4 - view.center.x
		let finalCenterY = expandedBounds.height * 1/4 - view.center.y
		print("\(finalCenterX),\(finalCenterY)")
		view.userInteractionEnabled = false
		
		UIView.animateWithDuration(0.5, delay: 0.0, options: .CurveEaseIn, animations: { 
			view.transform = CGAffineTransformScale(CGAffineTransformTranslate(CGAffineTransformIdentity, finalCenterX, finalCenterY), self.expandedWidth/self.initialWidth, self.expandedWidth/self.initialWidth)
			for imageView in self._actions {
				if imageView != view {
					imageView.alpha = 0
				}
			}
			}) { (bool) in
				UIView.animateWithDuration(0.5, delay: 0.0, options: .CurveEaseOut, animations: {
					view.frame = CGRectMake(self.topBar.frame.width - 44 - self.margin, self.margin, 44-2*self.margin, 44-2*self.margin)
					self.incrementCounter(2)
					Alamofire.request(.POST, "\(FWEmotionExtension.BASE_API)ad/12345/emotion",parameters: ["user" : "test_user" , "emotion": self._emotions[view.tag]],encoding: .JSON).validate().responseJSON(completionHandler: { (response) in
						self.parseJSONResponse(response)
					})
					}, completion: nil)
		}
	}
	
	var appliedEmotion = false
	
	func applyEmotion(emotion:String) -> Bool {
		let j = _emotions.indexOf(emotion)
		if j != nil && !appliedEmotion {
			self.emotionTappedHandler(_actions[j!])
			appliedEmotion = true
			return true
		}
		return false
	}
	
	func retweet(sender:UIButton?) -> Void {
		retweetButton.removeFromSuperview()
		delegate?.retweet()
		
		if let userID = Twitter.sharedInstance().sessionStore.session()?.userID {
			let client = TWTRAPIClient(userID: userID)
			// make requests with client
			
			let statusesShowEndpoint = "https://api.twitter.com/1.1/statuses/retweet/754247500622471169.json"
			var clientError : NSError?
			
			let request = client.URLRequestWithMethod("POST", URL: statusesShowEndpoint, parameters: nil, error: &clientError)
			
			client.sendTwitterRequest(request) { (response, data, connectionError) -> Void in
				if connectionError != nil {
					UIAlertView.init(title: "Tweeting error", message: "Couldn't retweet!! Maybe already have?", delegate: nil, cancelButtonTitle: "Okay").show()
					print("Error: \(connectionError)")
					return
				}
				
				if data == nil {
					UIAlertView.init(title: "Tweeting error", message: "Couldn't retweet!! Maybe already have?", delegate: nil, cancelButtonTitle: "Okay").show()
					return
				}
				
				do {
					let json = try NSJSONSerialization.JSONObjectWithData(data!, options: [])
					print("json: \(json)")
				} catch let jsonError as NSError {
					print("json error: \(jsonError.localizedDescription)")
					return
				}
				
				if self.incrementCounter(20) {
					Alamofire.request(.POST, "\(FWEmotionExtension.BASE_API)user/test_user/tweet",parameters: ["ad_id" : "12345"],encoding: .JSON).validate().responseJSON(completionHandler: { (response) in
						self.parseJSONResponse(response)
					})
				}
			}
			
			debugPrint(clientError)
		}
	}
	
	func parseJSONResponse(response: Response<AnyObject, NSError>) -> Void {
		debugPrint(response)
		let json_response:[String: AnyObject]? = response.result.value as? [String: AnyObject]
		if json_response != nil && String(json_response!["status"]!) == "success" {
			self.incrementCounter((json_response!["coins"] as! Int) - FWEmotionExtension.counter,no_sound: true)
		}
	}
	
	func skipClicked(sender:UIButton?) -> Void {
		if self.incrementCounter(-1) {
			delegate?.skipAd()
			Alamofire.request(.PUT, "\(FWEmotionExtension.BASE_API)ad/12345",parameters: ["user" : "test_user"],encoding: .JSON).validate().responseJSON(completionHandler: { (response) in
				self.parseJSONResponse(response)
			})
		} else {
			UIAlertView(title: "Sorry! You need at least 1 coin to skip this content", message: nil, delegate: nil, cancelButtonTitle: "Okay").show()
		}
	}
	
	required init?(coder aDecoder: NSCoder) {
		_emotions = []
		super.init(coder: aDecoder)
	}
	
	func start() -> Void {
		self.hidden = false
		self.superview?.bringSubviewToFront(self)
		print(counterImageView)
	}
	
	func stop() -> Void {
		self.removeFromSuperview()
		self.hidden = true
	}

	func incrementCounter(count:Int, no_sound:Bool = false) -> Bool {
		let current_counter = FWEmotionExtension.counter
		if current_counter + count > 0 {
			FWEmotionExtension.counter = current_counter + count
			counterLabel.text = "\(FWEmotionExtension.counter)"
			if count > 0 && !no_sound {
				// Mute the ad sound
				delegate?.silentAd(5)
				var soundEffect: SystemSoundID = 0
				let path  = NSBundle.mainBundle().pathForResource("chaching", ofType: "mp3")!
				let pathURL = NSURL(fileURLWithPath: path)
				AudioServicesCreateSystemSoundID(pathURL as CFURLRef, &soundEffect)
				AudioServicesPlaySystemSound(soundEffect)
			} else {
				
			}
			return true
		}
		return false
	}
}
