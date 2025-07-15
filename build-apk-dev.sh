
#!/bin/bash

echo "🏗️ Quick Development APK Build"

# Build web app
echo "📦 Building web app..."
npm run build

# Sync Capacitor
echo "🔄 Syncing Capacitor..."
npx cap sync android

# Build debug APK
echo "🔨 Building debug APK..."
cd android && ./gradlew assembleDebug

if [ $? -eq 0 ]; then
    echo "✅ Debug APK ready!"
    echo "📦 Location: android/app/build/outputs/apk/debug/app-debug.apk"
else
    echo "❌ Build failed. Try: npx cap open android"
fi
