
#!/bin/bash

echo "🔧 Fixing Android build issues..."

# Step 1: Clean everything
echo "🧹 Cleaning project..."
rm -rf android/app/build
rm -rf android/build
rm -rf android/.gradle

# Step 2: Rebuild web assets
echo "📦 Building web assets..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Web build failed"
    exit 1
fi

# Step 3: Sync Capacitor
echo "🔄 Syncing Capacitor..."
npx cap sync android

if [ $? -ne 0 ]; then
    echo "❌ Capacitor sync failed"
    exit 1
fi

# Step 4: Make gradlew executable
echo "🔧 Setting permissions..."
chmod +x android/gradlew

# Step 5: Clean and build Android
echo "🏗️ Building Android project..."
cd android
./gradlew clean
./gradlew build

if [ $? -eq 0 ]; then
    echo "✅ Android build successful!"
    echo "📱 You can now open the android folder in Android Studio"
else
    echo "❌ Android build failed - check the output above for errors"
    exit 1
fi
