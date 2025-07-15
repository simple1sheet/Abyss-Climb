
#!/bin/bash

echo "🏗️ Quick Development APK Build"

# Set up Java environment
export JAVA_HOME=$(dirname $(dirname $(which java)))
export PATH=$JAVA_HOME/bin:$PATH

# Verify Java installation
if ! command -v java &> /dev/null; then
    echo "❌ Java not found. Installing..."
    nix-env -iA nixpkgs.openjdk17
    export JAVA_HOME=$(dirname $(dirname $(which java)))
    export PATH=$JAVA_HOME/bin:$PATH
fi

echo "✅ Java configured: $(java -version 2>&1 | head -n 1)"

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
