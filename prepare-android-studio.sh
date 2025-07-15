
#!/bin/bash

echo "🏗️ Preparing Abyss Climber for Android Studio..."

# Step 1: Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

# Step 2: Build the web app
echo "🔨 Building web app..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Web build failed"
    exit 1
fi

# Step 3: Initialize Android platform if needed
if [ ! -d "android" ]; then
    echo "🔧 Adding Android platform..."
    npx cap add android
fi

# Step 4: Sync Capacitor
echo "🔄 Syncing Capacitor..."
npx cap sync android

if [ $? -ne 0 ]; then
    echo "❌ Capacitor sync failed"
    exit 1
fi

echo "✅ App prepared for Android Studio!"
echo ""
echo "📱 Next steps:"
echo "1. Copy the entire 'android' folder to your local machine"
echo "2. Open Android Studio"
echo "3. Choose 'Open an existing Android Studio project'"
echo "4. Select the 'android' folder"
echo "5. Wait for Gradle sync to complete"
echo "6. Build → Generate Signed Bundle / APK"
echo ""
echo "🎯 The android folder is now ready for Android Studio!"
