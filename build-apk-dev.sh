
#!/bin/bash

echo "🏗️ Quick Development APK Build"

# Check for Java
if ! command -v java &> /dev/null; then
    echo "❌ Java not found. Please install Java through Replit's package manager."
    echo "💡 Add 'pkgs.openjdk17' to your replit.nix file and restart the repl."
    echo "   Then run this script again."
    exit 1
fi

# Check Java version
echo "☕ Java version:"
java -version

# Set up environment variables
export JAVA_HOME=${JAVA_HOME:-/nix/store/$(ls /nix/store/ | grep openjdk17 | head -1)/lib/openjdk}
export ANDROID_HOME=${ANDROID_HOME:-$HOME/android-sdk}
export ANDROID_SDK_ROOT=$ANDROID_HOME
export PATH=$JAVA_HOME/bin:$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools:$PATH

echo "🔧 Environment:"
echo "   JAVA_HOME: $JAVA_HOME"
echo "   ANDROID_HOME: $ANDROID_HOME"

# Check if Android SDK is set up
if [ ! -d "$ANDROID_HOME" ]; then
    echo "❌ Android SDK not found at $ANDROID_HOME"
    echo "💡 Please run ./setup-android-sdk.sh first"
    exit 1
fi

# Build web app
echo "📦 Building web app..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Web build failed"
    exit 1
fi

# Sync Capacitor
echo "🔄 Syncing Capacitor..."
npx cap sync android

if [ $? -ne 0 ]; then
    echo "❌ Capacitor sync failed"
    exit 1
fi

# Build debug APK
echo "🔨 Building debug APK..."
cd android

# Make gradlew executable
chmod +x gradlew

# Build APK
./gradlew assembleDebug

if [ $? -eq 0 ]; then
    echo "✅ Debug APK built successfully!"
    echo "📦 APK location: android/app/build/outputs/apk/debug/app-debug.apk"
    echo ""
    echo "📱 To install on your Android device:"
    echo "1. Enable 'Unknown Sources' in your Android device settings"
    echo "2. Transfer the APK file to your device"
    echo "3. Install the APK"
    echo ""
    echo "🔧 For a release APK (signed), run:"
    echo "   cd android && ./gradlew assembleRelease"
else
    echo "❌ APK build failed"
    echo "💡 Try opening Android Studio with: npx cap open android"
    echo "   Then build from Android Studio directly"
    exit 1
fi
