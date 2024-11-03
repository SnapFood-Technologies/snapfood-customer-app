#import "AppDelegate.h"

#import <React/RCTBundleURLProvider.h>
#import <React/RCTLinkingManager.h>
#import <RNFBDynamicLinksAppDelegateInterceptor.h>
#import <FBSDKCoreKit/FBSDKCoreKit.h>
#import <RNBranch/RNBranch.h>
#import <Firebase.h>
#import "RNSplashScreen.h"
#import <GoogleMaps/GoogleMaps.h>
//#import "RNBraintreeDropin.h"

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  self.moduleName = @"Snapfood";
  // You can add your custom initial props in the dictionary below.
  // They will be passed down to the ViewController used by React Native.
  self.initialProps = @{};

  [RNBranch initSessionWithLaunchOptions:launchOptions isReferrable:YES];
  if (@available(iOS 15.0, *)) {
    [[Branch getInstance] checkPasteboardOnInstall];
  }

  [[Branch getInstance] initSessionWithLaunchOptions:launchOptions andRegisterDeepLinkHandler:^(NSDictionary * _Nonnull params, NSError * _Nullable error) {
    NSLog(@"%@", params);
  }];
  [RNFBDynamicLinksAppDelegateInterceptor sharedInstance];
  [GMSServices provideAPIKey:@"AIzaSyAEe-vcJ-r8w9FQdVEskAozi1v9cWy6YAA"];
  [FIRApp configure];

//  [BTAppContextSwitcher setReturnURLScheme:@"com.snapfood.al.payments"];

  BOOL success = [super application:application didFinishLaunchingWithOptions:launchOptions];
  if (success) {
    [RNSplashScreen show];
  }
  return success;
}

- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
{
#if DEBUG
  return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index"];
#else
  return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
#endif
}

- (BOOL)application:(UIApplication *)app openURL:(NSURL *)url options:(NSDictionary<UIApplicationOpenURLOptionsKey,id> *)options
{
  [RNBranch application:app openURL:url options:options];
  BOOL fbsdk = [[FBSDKApplicationDelegate sharedInstance] application:app
                                                              openURL:url
                                                    sourceApplication:options[UIApplicationOpenURLOptionsSourceApplicationKey]
                                                           annotation:options[UIApplicationOpenURLOptionsAnnotationKey]];

  BOOL shareLinking = [RCTLinkingManager application:app openURL:url options:options];
  FIRDynamicLink *dynamicLink = [[FIRDynamicLinks dynamicLinks] dynamicLinkFromCustomSchemeURL:url];
  BOOL hasDynamicLinking = dynamicLink != nil;

  return fbsdk || shareLinking || hasDynamicLinking;
}

- (BOOL)application:(UIApplication *)application continueUserActivity:(nonnull NSUserActivity *)userActivity restorationHandler:(nonnull void (^)(NSArray<id<UIUserActivityRestoring>> * _Nullable))restorationHandler
{
  [RNBranch continueUserActivity:userActivity];
  return [RCTLinkingManager application:application continueUserActivity:userActivity restorationHandler:restorationHandler];
}

@end
