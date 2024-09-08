/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#import "AppDelegate.h"

#import <React/RCTBridge.h>
#import <React/RCTBundleURLProvider.h>
#import <React/RCTRootView.h>
#import <RNFBDynamicLinksAppDelegateInterceptor.h>
#import <FBSDKCoreKit/FBSDKCoreKit.h>
#import <RNBranch/RNBranch.h>

#import <Firebase.h>
// #import "RNFirebaseNotifications.h"
// #import "RNFirebaseMessaging.h"
#import "RNSplashScreen.h"
#import <GoogleMaps/GoogleMaps.h>

#import "RNBraintreeDropin.h"
#import <React/RCTLinkingManager.h>

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  [RNBranch initSessionWithLaunchOptions:launchOptions isReferrable:YES];
   // for ios version 15.0 and latest one/
  if (@available(iOS 15.0, *)) {
          [[Branch getInstance] checkPasteboardOnInstall];
      }
  
  // listener for Branch Deep Link data
  [[Branch getInstance] initSessionWithLaunchOptions:launchOptions andRegisterDeepLinkHandler:^(NSDictionary * _Nonnull params, NSError * _Nullable error) {
      // do stuff with deep link data (nav to page, display content, etc)
          NSLog(@"%@", params);
  }];
  [RNFBDynamicLinksAppDelegateInterceptor sharedInstance];
  [GMSServices provideAPIKey:@"AIzaSyAEe-vcJ-r8w9FQdVEskAozi1v9cWy6YAA"];
  [FIRApp configure];
  // [RNFirebaseNotifications configure];
  RCTBridge *bridge = [[RCTBridge alloc] initWithDelegate:self launchOptions:launchOptions];
  RCTRootView *rootView = [[RCTRootView alloc] initWithBridge:bridge
                                                   moduleName:@"Snapfood"
                                            initialProperties:nil];

  rootView.backgroundColor = [[UIColor alloc] initWithRed:1.0f green:1.0f blue:1.0f alpha:1];

  [BTAppSwitch setReturnURLScheme:@"com.snapfood.al.payments"]; // Braintree dropin ui URL scheme

  self.window = [[UIWindow alloc] initWithFrame:[UIScreen mainScreen].bounds];
  UIViewController *rootViewController = [UIViewController new];
  rootViewController.view = rootView;
  self.window.rootViewController = rootViewController;
  [self.window makeKeyAndVisible];
  [RNSplashScreen show];
  return YES;
}

// - (void)application:(UIApplication *)application didReceiveLocalNotification:(UILocalNotification *)notification {
//   [[RNFirebaseNotifications instance] didReceiveLocalNotification:notification];
// }

// - (void)application:(UIApplication *)application didReceiveRemoteNotification:(nonnull NSDictionary *)userInfo
// fetchCompletionHandler:(nonnull void (^)(UIBackgroundFetchResult))completionHandler{
//   [[RNFirebaseNotifications instance] didReceiveRemoteNotification:userInfo fetchCompletionHandler:completionHandler];
// }

// - (void)application:(UIApplication *)application didRegisterUserNotificationSettings:(UIUserNotificationSettings *)notificationSettings {
//   [[RNFirebaseMessaging instance] didRegisterUserNotificationSettings:notificationSettings];
// }

- (BOOL)application:(UIApplication *)app
            openURL:(NSURL *)url
            options:(NSDictionary<UIApplicationOpenURLOptionsKey,id> *)options
{
  [RNBranch application:app openURL:url options:options];
BOOL fbsdk = [[FBSDKApplicationDelegate sharedInstance] application:app
openURL:url
sourceApplication:options[UIApplicationOpenURLOptionsSourceApplicationKey]
annotation:options[UIApplicationOpenURLOptionsAnnotationKey]
 ];

BOOL shareLinking = [RCTLinkingManager application:app openURL:url options:options];
FIRDynamicLink *dynamicLink = [[FIRDynamicLinks dynamicLinks] dynamicLinkFromCustomSchemeURL:url];
BOOL hasDyamicLinking = dynamicLink ? YES : NO;

return fbsdk || shareLinking || hasDyamicLinking;
}

- (BOOL)application:(UIApplication *)application
            openURL:(NSURL *)url
  sourceApplication:(NSString *)sourceApplication
         annotation:(id)annotation {
  FIRDynamicLink *dynamicLink = [[FIRDynamicLinks dynamicLinks] dynamicLinkFromCustomSchemeURL:url];

  if (dynamicLink) {
    return YES;
  }
  return NO;
}

- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
{
#if DEBUG
  return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index" fallbackResource:nil];
#else
  return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
#endif
}

- (BOOL)application:(UIApplication *)application continueUserActivity:(nonnull NSUserActivity *)userActivity restorationHandler:(nonnull void (^)(NSArray<id<UIUserActivityRestoring>> * _Nullable))restorationHandler
{
  [RNBranch continueUserActivity:userActivity];
  // Deep Links required: https://reactnative.dev/docs/linking#enabling-deep-links
  return [RCTLinkingManager application:application continueUserActivity:userActivity restorationHandler:restorationHandler];
}

@end
