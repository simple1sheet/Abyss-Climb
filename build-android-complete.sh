
#!/bin/bash

echo "🏗️ Complete Android Build Setup for Abyss Climber"

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Step 1: Verify Java installation
echo "Step 1: Checking Java installation..."
if ! command_exists java; then
    echo "❌ Java not found!"
    echo "💡 Please add 'pkgs.openjdk17' to your replit.nix file and restart the repl."
    echo "   Then run this script again."
    exit 1
fi

# Set up Java environment
export JAVA_HOME=${JAVA_HOME:-/nix/store/$(ls /nix/store/ | grep openjdk17 | head -1)/lib/openjdk}
export PATH=$JAVA_HOME/bin:$PATH

echo "✅ Java found:"
java -version

# Step 2: Set up Android SDK
echo ""
echo "Step 2: Setting up Android SDK..."
export ANDROID_HOME=$HOME/android-sdk
export ANDROID_SDK_ROOT=$ANDROID_HOME
export PATH=$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools:$PATH

if [ ! -d "$ANDROID_HOME" ]; then
    echo "📥 Downloading Android SDK..."
    
    # Create SDK directory
    mkdir -p $ANDROID_HOME
    cd $ANDROID_HOME
    
    # Download command line tools
    wget -q https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip
    unzip -q commandlinetools-linux-11076708_latest.zip
    rm commandlinetools-linux-11076708_latest.zip
    
    # Move cmdline-tools to proper location
    mkdir -p cmdline-tools/latest
    mv cmdline-tools/* cmdline-tools/latest/ 2>/dev/null || true
    
    # Accept licenses and install required packages
    echo "📋 Accepting SDK licenses..."
    yes | cmdline-tools/latest/bin/sdkmanager --licenses
    
    echo "📦 Installing SDK packages..."
    cmdline-tools/latest/bin/sdkmanager "platform-tools" "build-tools;34.0.0" "platforms;android-34"
    
    cd - > /dev/null
fi

echo "✅ Android SDK ready at: $ANDROID_HOME"

# Step 3: Update local.properties
echo ""
echo "Step 3: Updating Android configuration..."
echo "sdk.dir=$ANDROID_HOME" > android/local.properties

# Step 4: Install Node.js dependencies
echo ""
echo "Step 4: Installing dependencies..."
npm install

# Step 5: Build web app
echo ""
echo "Step 5: Building web app..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Web build failed"
    exit 1
fi

# Step 6: Initialize Capacitor if needed
if [ ! -d "android" ]; then
    echo ""
    echo "Step 6: Initializing Capacitor..."
    npx cap add android
fi

# Step 7: Sync Capacitor
echo ""
echo "Step 7: Syncing Capacitor..."
npx cap sync android

if [ $? -ne 0 ]; then
    echo "❌ Capacitor sync failed"
    exit 1
fi

# Step 8: Build APK
echo ""
echo "Step 8: Building APK..."
cd android

# Make gradlew executable
chmod +x gradlew

# Set environment variables for gradle
export JAVA_HOME=$JAVA_HOME
export ANDROID_HOME=$ANDROID_HOME
export ANDROID_SDK_ROOT=$ANDROID_SDK_ROOT

# Build debug APK
./gradlew assembleDebug

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 SUCCESS! APK built successfully!"
    echo "📦 APK location: android/app/build/outputs/apk/debug/app-debug.apk"
    echo ""
    echo "📱 Next steps:"
    echo "1. Download the APK file from the file manager"
    echo "2. Enable 'Unknown Sources' on your Android device"
    echo "3. Install the APK on your device"
    echo ""
    echo "🔧 For future builds, you can use:"
    echo "   ./build-apk-dev.sh  (quick development builds)"
    echo "   ./build-android-complete.sh  (complete setup + build)"
else
    echo ""
    echo "❌ APK build failed"
    echo "💡 Check the error messages above for troubleshooting"
    echo "💡 You can also try: npx cap open android"
    exit 1
fi
