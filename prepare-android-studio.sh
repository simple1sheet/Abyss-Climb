
#!/bin/bash

echo "🏗️ Preparing Abyss Climber for Android Studio..."

# Step 1: Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf dist/
rm -rf android/app/build/
rm -rf node_modules/.vite/

# Step 2: Install dependencies
echo "📦 Installing dependencies..."
npm ci

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

# Step 3: Build the web app for production
echo "🔨 Building web app for production..."
NODE_ENV=production npm run build

if [ $? -ne 0 ]; then
    echo "❌ Web build failed"
    exit 1
fi

# Step 4: Verify build output
if [ ! -d "dist/public" ]; then
    echo "❌ Build output directory not found"
    exit 1
fi

if [ ! -f "dist/public/index.html" ]; then
    echo "❌ index.html not found in build output"
    exit 1
fi

echo "✅ Build verification passed"

# Step 5: Initialize Android platform if needed
if [ ! -d "android" ]; then
    echo "🔧 Adding Android platform..."
    npx cap add android
fi

# Step 6: Copy web assets to Capacitor
echo "📱 Copying web assets to Android project..."
npx cap copy android

if [ $? -ne 0 ]; then
    echo "❌ Failed to copy assets"
    exit 1
fi

# Step 7: Sync Capacitor
echo "🔄 Syncing Capacitor..."
npx cap sync android

if [ $? -ne 0 ]; then
    echo "❌ Capacitor sync failed"
    exit 1
fi

# Step 8: Verify Android assets
if [ ! -f "android/app/src/main/assets/public/index.html" ]; then
    echo "❌ Assets not properly copied to Android project"
    exit 1
fi

echo "✅ App prepared for Android Studio!"
echo ""
echo "📱 Next steps:"
echo "1. Download the entire 'android' folder from Replit"
echo "2. Extract it to your local machine"
echo "3. Open Android Studio"
echo "4. Choose 'Open an existing Android Studio project'"
echo "5. Select the 'android' folder"
echo "6. Wait for Gradle sync to complete"
echo "7. Build → Generate Signed Bundle / APK"
echo ""
echo "🎯 The android folder is now ready for Android Studio!"
echo "📦 Web assets have been bundled and copied to: android/app/src/main/assets/public/"
