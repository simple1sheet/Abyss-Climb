
#!/bin/bash

echo "🏗️ Quick Development APK Build"

# Set up Java environment
if ! command -v java &> /dev/null; then
    echo "❌ Java not found. Please install Java through Replit's package manager."
    echo "💡 Add 'pkgs.openjdk17' to your replit.nix file and restart the repl."
    echo "   Then run this script again."
    exit 1
fi

# Set JAVA_HOME
export JAVA_HOME=$(readlink -f $(which java) | sed 's/bin\/java$//')
export PATH=$JAVA_HOME/bin:$PATH

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
