
#!/bin/bash

echo "🔍 Verifying Android assets..."

# Check if web assets exist
if [ -f "dist/index.html" ]; then
    echo "✅ Web assets found in dist/"
else
    echo "❌ No web assets found in dist/ - run 'npm run build' first"
    exit 1
fi

# Check if Android assets are copied
if [ -f "android/app/src/main/assets/public/index.html" ]; then
    echo "✅ Assets copied to Android project"
else
    echo "❌ Assets not copied to Android - run 'npx cap copy android'"
    exit 1
fi

echo "🎯 All assets verified!"
