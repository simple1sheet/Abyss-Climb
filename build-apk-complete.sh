
#!/bin/bash

echo "🏗️ Building Abyss Climber APK - Complete Process"

# Set up Java environment
echo "☕ Setting up Java environment..."
export JAVA_HOME=$(dirname $(dirname $(which java)))
export PATH=$JAVA_HOME/bin:$PATH

# Verify Java installation
if ! command -v java &> /dev/null; then
    echo "❌ Java not found. Installing..."
    nix-env -iA nixpkgs.openjdk17
    export JAVA_HOME=$(dirname $(dirname $(which java)))
    export PATH=$JAVA_HOME/bin:$PATH
fi

echo "✅ Java version: $(java -version 2>&1 | head -n 1)"
echo "✅ JAVA_HOME: $JAVA_HOME"

# Check prerequisites
echo "🔍 Checking prerequisites..."
if ! command -v npm &> /dev/null; then
    echo "❌ npm not found"
    exit 1
fi

if ! command -v npx &> /dev/null; then
    echo "❌ npx not found"
    exit 1
fi

# Step 1: Install dependencies
echo "📦 Installing dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

# Step 2: Build the web app for production
echo "🔨 Building web app for production..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Web build failed"
    exit 1
fi

# Step 3: Initialize Android platform if needed
if [ ! -d "android" ]; then
    echo "🔧 Adding Android platform..."
    npx cap add android
    if [ $? -ne 0 ]; then
        echo "❌ Failed to add Android platform"
        exit 1
    fi
fi

# Step 4: Copy web assets and sync
echo "📱 Syncing Capacitor..."
npx cap copy android
npx cap sync android
if [ $? -ne 0 ]; then
    echo "❌ Capacitor sync failed"
    exit 1
fi

# Step 5: Check if Gradle wrapper exists
if [ ! -f "android/gradlew" ]; then
    echo "❌ Gradle wrapper not found. Please run: npx cap open android"
    echo "   This will open Android Studio to complete the setup"
    exit 1
fi

# Step 6: Build APK
echo "🔨 Building APK..."
cd android
chmod +x gradlew
./gradlew assembleDebug

if [ $? -eq 0 ]; then
    echo "✅ APK built successfully!"
    echo "📦 APK location: android/app/build/outputs/apk/debug/app-debug.apk"
    echo ""
    echo "📱 To install on your Android device:"
    echo "1. Enable 'Unknown Sources' in your Android device settings"
    echo "2. Transfer the APK file to your device"
    echo "3. Install the APK"
    echo ""
    echo "🔧 For a release APK (signed), run:"
    echo "   ./gradlew assembleRelease"
else
    echo "❌ APK build failed"
    echo "💡 Try opening Android Studio with: npx cap open android"
    echo "   Then build from Android Studio directly"
    exit 1
fi
