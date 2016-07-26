//
//  AppDelegate.swift
//  Hackathon
//
//  Created by Ravi Vooda on 7/15/16.
//  Copyright © 2016 FreeWheel. All rights reserved.
//

import UIKit
import Fabric
import TwitterKit

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {
	
	var window: UIWindow?
	
	static var viewController:ViewController?
	
	func application(application: UIApplication, didFinishLaunchingWithOptions launchOptions: [NSObject: AnyObject]?) -> Bool {
		// Override point for customization after application launch.
		Fabric.with([Twitter.self])
		return true
		
		/*
<key>Fabric</key>
<dict>
<key>APIKey</key>
<string>f5429a30a5bdc6ae7e3acddbc5301efcd686f97e</string>
<key>Kits</key>
<array>
<dict>
<key>KitInfo</key>
<dict>
<key>consumerKey</key>
<string>LWwVCJ15EQ8uvOJkaBEDyB2Gw</string>
<key>consumerSecret</key>
<string>S5TIVlXfaHgCJ1Qf6tWKMimLuDoghoV3YrJuP82R4CQHhCY3Fl</string>
</dict>
<key>KitName</key>
<string>Twitter</string>
</dict>
</array>
</dict>
*/
		Twitter.sharedInstance().startWithConsumerKey("853619460-WUYSEXplUOP3JxN4qGkTImjLcsJtQuqNCUA55JbX", consumerSecret: "VfIVBSZRpNSNZNTPR6mK3DG2SnhSdvc7G4223F7HCgl1V")
		
		Twitter.sharedInstance().sessionStore.saveSessionWithAuthToken("853619460-WUYSEXplUOP3JxN4qGkTImjLcsJtQuqNCUA55JbX", authTokenSecret: "VfIVBSZRpNSNZNTPR6mK3DG2SnhSdvc7G4223F7HCgl1V") { (session, error) in
			debugPrint("\(session)\n\(error)")
		}
	}

	func application(application: UIApplication, didRegisterForRemoteNotificationsWithDeviceToken deviceToken: NSData) {
		let tokenChars = UnsafePointer<CChar>(deviceToken.bytes)
		var tokenString = ""
		
		for i in 0..<deviceToken.length {
			tokenString += String(format: "%02.2hhx", arguments: [tokenChars[i]])
		}
		
		print("Device Token:", tokenString)
	}
	
	func application(application: UIApplication, didRegisterUserNotificationSettings notificationSettings: UIUserNotificationSettings) {
		if notificationSettings.types != .None {
			application.registerForRemoteNotifications()
		}
	}
	
	func application(application: UIApplication, didFailToRegisterForRemoteNotificationsWithError error: NSError) {
		print("Failed to register:", error)
	}
	
	func application(application: UIApplication, didReceiveRemoteNotification userInfo: [NSObject : AnyObject], fetchCompletionHandler completionHandler: (UIBackgroundFetchResult) -> Void) {
		
		// 1
		let aps = userInfo["aps"] as! [String: AnyObject]
		debugPrint(aps)
		
		// 2
		let intent = String(aps["alert"]!)
		if intent == "repeat" {
			AppDelegate.viewController?.replayLastAd()
		} else if AppDelegate.viewController!.fwextension != nil && AppDelegate.viewController!.fwextension!.applyEmotion(intent) {
			
		} else if intent == "retweet" && AppDelegate.viewController!.fwextension != nil {
			AppDelegate.viewController!.fwextension!.retweet(nil)
		} else if intent == "skip" && AppDelegate.viewController!.fwextension != nil {
			AppDelegate.viewController!.fwextension?.skipClicked(nil)
		} else if intent == "check later" && AppDelegate.viewController!.fwextension != nil {
			
		}
		
		// 4
		completionHandler(.NoData)
	}
	
}

