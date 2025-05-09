# SnapFood App Setup Guide

This guide provides instructions for setting up and running the SnapFood application for both iOS and Android platforms.

## Prerequisites

- Node.js (v14 or later)
- Yarn or npm
- For iOS:
  - Xcode 16.2 or later
  - CocoaPods 1.12.1 or later
  - Ruby 3.2.2 or later
- For Android:
  - Android Studio
  - JDK 11
  - Android SDK

## Installation

### 1. Clone the repository

```bash
git clone [repository-url]
cd snapfood-customer-app
```

### 2. Install dependencies

```bash
npm install
# or
yarn
```

## iOS Setup

### Known Issues and Solutions

#### 1. Boost URL Fix

The project includes a fix in the Podfile for the broken Boost library URL. This is handled automatically by a script at the top of the Podfile that replaces the JFrog URL with the archives.boost.io URL:

```ruby
def find_and_replace_boost_url
  pod_spec = "../node_modules/react-native/third-party-podspecs/boost.podspec"
  puts "Debug: Starting boost URL replacement"
  if File.exist?(pod_spec)
    puts "Debug: Found boost.podspec"
    spec_content = File.read(pod_spec)
    
    # Replace the URL
    spec_content.gsub!(
      'https://boostorg.jfrog.io/artifactory/main/release/1.76.0/source/boost_1_76_0.tar.bz2',
      'https://archives.boost.io/release/1.76.0/source/boost_1_76_0.tar.bz2'
    )
    
    # Write the updated content back to the file
    File.write(pod_spec, spec_content)
    puts "Debug: Updated boost.podspec"
  end
end

# Call the function to execute the replacement
find_and_replace_boost_url
```

#### 2. Xcode 16.2 Compatibility - Object Version Fix

If you encounter the error `[Xcodeproj] Unable to find compatibility version string for object version '70'` when running `pod install`, you need to modify the project.pbxproj file:

1. Open the project.pbxproj file:
```bash
cd ios
open Snapfood.xcodeproj/project.pbxproj
```

2. Find the line that contains:
```
objectVersion = 70;
```

3. Change it to:
```
objectVersion = 60;
```

4. Save the file and run `pod install` again

This is a widely-used workaround in the community for using CocoaPods with Xcode 16.2. This change only affects the project file format and has no impact on your app's functionality or App Store submission.

#### 3. RNC Clipboard VisionOS Platform Issue

For newer versions of React Native Clipboard that include VisionOS platform support, we need to patch the podspec in older CocoaPods versions:

```ruby
def patch_clipboard_podspec
  podspec_path = "../node_modules/@react-native-clipboard/clipboard/RNCClipboard.podspec"
  puts "Debug: Checking clipboard podspec"
  if File.exist?(podspec_path)
    puts "Debug: Found clipboard podspec"
    content = File.read(podspec_path)
    
    # Remove the visionos platform which isn't supported in older CocoaPods
    if content.include?("s.visionos.source_files")
      puts "Debug: Removing visionos platform from clipboard podspec"
      modified_content = content.gsub(/\s+s\.visionos\.source_files.*$/, '')
      File.write(podspec_path, modified_content)
      puts "Debug: Updated clipboard podspec"
    end
  end
end
```

#### 4. Patch Package

The project uses `patch-package` to manage patches for some dependencies. The patches are automatically applied during the `npm install` or `yarn` process via a postinstall script:

```json
"scripts": {
  "postinstall": "patch-package"
}
```

If you need to create a new patch:

1. Modify the file in node_modules
2. Run `npx patch-package package-name`
3. Commit the generated patch files in the `patches` directory

### Running iOS

1. Install CocoaPods dependencies:

```bash
cd ios
pod install
```

2. Run the app:

```bash
# From the project root
npm run ios
# or
yarn ios
```

## Android Setup

### Running Android

1. Start an Android emulator or connect a device

2. Run the development build:

```bash
npm run android-dev
# or
yarn android-dev
```

3. For a release build:

```bash
npm run android-release
# or
yarn android-release
```

## Available Scripts

- `android`: Run the app on Android
- `ios`: Run the app on iOS
- `start`: Start the Metro bundler
- `test`: Run Jest tests
- `lint`: Run ESLint
- `build-android`: Build the Android bundle
- `android-dev`: Run Android in development mode
- `android-release`: Run Android in release mode
- `ios-dev`: Build iOS bundle

### iOS Issues

1. **Pod install fails with boost error**:
   - The automatic fix in the Podfile should handle this
   - If issues persist, manually edit `node_modules/react-native/third-party-podspecs/boost.podspec` and update the URL

2. **Xcode 16.2 compatibility issues - "Unable to find compatibility version string for object version '70'"**:
   - Edit the project.pbxproj file and change `objectVersion = 70;` to `objectVersion = 60;`
   - This change only affects the project file format and has no impact on your app's functionality
   - This is a temporary workaround until CocoaPods fully supports Xcode 16.2 project format

3. **CardIO architecture mismatch errors**:
   - This error occurs because CardIO contains binary code built for iOS devices but not compatible with the simulator architecture
   - The solution is to update the "Excluded Architectures" build setting for **ALL targets** including:
     - Main app target (Snapfood)
     - Test target (SnapfoodTests)
     - Extension targets (ShareMenu, OneSignalNotificationServiceExtension)
   - For each target, go to Build Settings → search for "Excluded Architectures" → add "arm64" for "Any iOS Simulator SDK"
   - If you miss any target (especially test targets), you'll still get build errors

4. **RNC Clipboard VisionOS platform errors**:
   - The automatic patch in the Podfile should handle this by removing the VisionOS platform code
   - If issues persist, manually edit the RNCClipboard.podspec file to remove any VisionOS-specific code

5. **Dependency conflicts**:
   - Clear the CocoaPods cache: `pod cache clean --all`
   - Remove the Pods directory: `rm -rf ios/Pods`
   - Remove Podfile.lock: `rm ios/Podfile.lock`
   - Run pod install again: `cd ios && pod install`

### Android Issues

1. **Build fails with SDK version issues**:
   - Check your Android SDK versions in `android/build.gradle`
   - Ensure your environment has the correct SDK installed

2. **React Native native module issues**:
   - Run `npx react-native-clean-project` to clean the project
   - Reinstall dependencies and rebuild

## Project Structure

- `/src`: Source code files
- `/ios`: iOS native code
- `/android`: Android native code
- `/patches`: Patch files for dependencies

## Dependencies

The app uses several key dependencies:

- React Native v0.72.4
- React Navigation for routing
- Firebase for analytics and messaging
- Stripe for payments
- Google Maps for location services
- OneSignal for push notifications
- And many UI components (see package.json for the full list)

## Deployment

### iOS App Store

1. Configure app signing in Xcode
2. Build the production IPA
3. Submit to App Store Connect

### Google Play Store

1. Generate a signed APK/AAB: 
   ```bash
   cd android && ./gradlew bundleRelease
   ```
2. Upload to Google Play Console

## Support

For any issues with setup, please contact the development team.