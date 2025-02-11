# SnapFood CI/CD Setup

This repository contains automated workflows for deploying Android and iOS apps to their respective app stores using GitHub Actions and Fastlane.

## Prerequisites

- Ruby (version 3.0 or newer)
- Xcode (for iOS builds)
- Android SDK (for Android builds)
- GitHub repository access
- App Store Connect access
- Google Play Console access

## Setup Instructions

### 1. Install Dependencies

```bash
# Install Ruby dependencies
gem install bundler
bundle install
```

### 2. Configure Android Setup

1. Base64 encode your keystore:
```bash
base64 upload-keystore.jks > upload-keystore.jks.base64
```

2. Set up these GitHub secrets for Android:
- `UPLOAD_KEYSTORE`: Content of upload-keystore.jks.base64
- `ANDROID_KEYSTORE_PASSWORD`: Your keystore password
- `ANDROID_KEY_ALIAS`: Your key alias
- `ANDROID_KEY_PASSWORD`: Your key password
- `PLAY_STORE_CONFIG_JSON`: Your Play Store service account JSON key

### 3. Configure iOS Setup

1. Base64 encode your certificates:
```bash
# For distribution certificate
base64 -i distribution.p12 | pbcopy

# For provisioning profile
base64 -i profile.mobileprovision | pbcopy
```

2. Set up these GitHub secrets for iOS:
- `IOS_DISTRIBUTION_CERTIFICATE_BASE64`: Your encoded distribution certificate
- `IOS_PROVISION_PROFILE_BASE64`: Your encoded provisioning profile
- `KEYCHAIN_PASSWORD`: Any secure password for temporary keychain
- `P12_PASSWORD`: Your distribution certificate password
- `APP_STORE_CONNECT_API_KEY_KEY_ID`: App Store Connect API Key ID
- `APP_STORE_CONNECT_API_KEY_ISSUER_ID`: App Store Connect API Key Issuer ID
- `APP_STORE_CONNECT_API_KEY_KEY`: App Store Connect API Key content

### 4. File Structure

Ensure these files are in the correct locations:
```
.
├── .github
│   └── workflows
│       ├── android-workflow.yml
│       └── ios-workflow.yml
├── fastlane
│   ├── Fastfile
│   └── Appfile
├── Gemfile
└── README.md
```

### 5. Gemfile Content

```ruby
source "https://rubygems.org"

gem "fastlane"
```

## Usage

The workflows will automatically trigger when pushing to the main branch.

### Manual Triggers

You can manually trigger deployments:
1. Go to GitHub Actions tab
2. Select the workflow (Android or iOS)
3. Click "Run workflow"
4. Select the branch and click "Run workflow"

### Local Testing

Test Fastlane locally:
```bash
# For Android
bundle exec fastlane android beta

# For iOS
bundle exec fastlane ios beta
```

## Branch Protection

Enable branch protection for main:
1. Go to repository Settings
2. Navigate to Branches
3. Add rule for main branch
4. Enable required status checks

## Troubleshooting

Common issues and solutions:

1. Certificate issues:
```bash
# Verify keychain setup
security list-keychains
security default-keychain
```

2. Fastlane errors:
```bash
# Clear Fastlane cache
rm -rf ~/Library/Caches/fastlane
```

3. Android build failures:
```bash
# Clean Gradle cache
./gradlew clean
```

## Security Notes

- Never commit sensitive files directly to the repository
- Rotate certificates and keys periodically
- Use environment variables for sensitive values
- Review GitHub Actions logs for sensitive data before making them public