
#!/bin/bash

echo "🏗️ Simple Android Build for Abyss Climber..."

# Check if we have the basics
if ! command -v npm &> /dev/null; then
    echo "❌ npm not found"
    exit 1
fi

# Build web app first
echo "📦 Building web app..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Web build failed"
    exit 1
fi

# Check if Capacitor is installed
if ! command -v npx &> /dev/null; then
    echo "❌ npx not found"
    exit 1
fi

# Initialize Android if needed
if [ ! -d "android" ]; then
    echo "🔧 Adding Android platform..."
    npx cap add android
fi

# Sync the app
echo "🔄 Syncing Capacitor..."
npx cap copy android
npx cap sync android

echo "✅ Android project synced!"
echo "📱 To build APK, you can:"
echo "   1. Open Android Studio: npx cap open android"
echo "   2. Or install Android SDK and run: cd android && ./gradlew assembleRelease"
echo ""
echo "🎯 Next steps:"
echo "   - Install Android Studio"
echo "   - Open the android folder in Android Studio"
echo "   - Build > Generate Signed Bundle/APK"
