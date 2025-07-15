
#!/bin/bash

echo "🏗️ Preparing Abyss Climber for Android Studio (Complete Setup)"

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

# Step 3: Remove existing android folder to ensure clean setup
if [ -d "android" ]; then
    echo "🗑️ Removing existing Android project..."
    rm -rf android
fi

# Step 4: Add Android platform
echo "🔧 Adding Android platform..."
npx cap add android
if [ $? -ne 0 ]; then
    echo "❌ Failed to add Android platform"
    exit 1
fi

# Step 5: Copy web assets and sync
echo "📱 Syncing Capacitor..."
npx cap copy android
npx cap sync android
if [ $? -ne 0 ]; then
    echo "❌ Capacitor sync failed"
    exit 1
fi

# Step 6: Make gradlew executable
echo "🔧 Setting up Gradle permissions..."
chmod +x android/gradlew

echo "✅ Android project is ready for Android Studio!"
echo ""
echo "📱 Next steps:"
echo "1. Download the entire 'android' folder to your local machine"
echo "2. Open Android Studio"
echo "3. Choose 'Open an existing Android Studio project'"
echo "4. Select the 'android' folder"
echo "5. Wait for Gradle sync to complete"
echo "6. Build → Generate Signed Bundle / APK"
echo ""
echo "🎯 The android folder contains everything needed for a standalone APK"
echo "💡 Make sure you have Android SDK API level 34 or higher installed"
