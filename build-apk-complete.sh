#!/usr/bin/env bash
set -euo pipefail

echo "Starting complete APK build process..."

# Clean previous builds
echo "Cleaning previous builds..."
rm -rf dist/
rm -rf android/app/build/

# Ensure Node modules are installed
echo "Installing dependencies..."
npm ci

# Build the React app for production
echo "Building React app..."
NODE_ENV=production npm run build

# Verify build output
if [ ! -d "dist/public" ]; then
  echo "Error: dist/public directory not found after build!"
  exit 1
fi

# Copy web assets to Capacitor
echo "Copying web assets to Capacitor..."
npx cap copy android

# Sync Capacitor plugins
echo "Syncing Capacitor plugins..."
npx cap sync android

# Clean and build APK
echo "Building APK..."
cd android
./gradlew clean
./gradlew assembleRelease
cd ..

echo "APK build complete! Check android/app/build/outputs/apk/release/"