#!/bin/bash

# Build Android APK for Abyss Climber
echo "🏗️  Building Abyss Climber for Android..."

# Step 1: Build the web app
echo "📦 Building web app..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Web build failed"
    exit 1
fi

# Step 2: Initialize Capacitor if not already done
if [ ! -d "android" ]; then
    echo "🔧 Initializing Capacitor..."
    npx cap add android
fi

# Step 3: Copy web assets to native project
echo "📱 Copying web assets to Android project..."
npx cap copy android

if [ $? -ne 0 ]; then
    echo "❌ Failed to copy assets"
    exit 1
fi

# Step 4: Sync Capacitor
echo "🔄 Syncing Capacitor..."
npx cap sync android

# Step 5: Build APK
echo "🔨 Building APK..."
cd android
./gradlew assembleRelease

if [ $? -ne 0 ]; then
    echo "❌ APK build failed"
    exit 1
fi

# Step 6: Show output location
echo "✅ APK built successfully!"
echo "📦 APK location: android/app/build/outputs/apk/release/app-release.apk"
echo "🎉 Ready to install on Android devices!"

# Optional: Open Android Studio
read -p "🤖 Open Android Studio? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    npx cap open android
fi