
#!/bin/bash

# Simple Android build script
echo "🏗️ Building Android APK..."

# Set environment variables
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
export ANDROID_HOME=~/android-sdk
export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools

# Build web app
echo "📦 Building web app..."
npm run build

# Copy to Android
echo "📱 Syncing to Android..."
npx cap copy android
npx cap sync android

# Build APK directly
echo "🔨 Building APK..."
cd android && ./gradlew assembleRelease

echo "✅ APK built at: android/app/build/outputs/apk/release/app-release.apk"
