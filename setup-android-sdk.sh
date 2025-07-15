
#!/bin/bash

echo "🏗️ Setting up Android SDK..."

# Create SDK directory
sudo mkdir -p /opt/android-sdk
sudo chown -R runner:runner /opt/android-sdk

# Download command line tools
cd /opt/android-sdk
wget -q https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip
unzip -q commandlinetools-linux-11076708_latest.zip
rm commandlinetools-linux-11076708_latest.zip

# Move cmdline-tools to proper location
mkdir -p cmdline-tools/latest
mv cmdline-tools/* cmdline-tools/latest/ 2>/dev/null || true

# Accept licenses and install required packages
echo y | cmdline-tools/latest/bin/sdkmanager --licenses
cmdline-tools/latest/bin/sdkmanager "platform-tools" "build-tools;34.0.0" "platforms;android-34"

echo "✅ Android SDK setup complete!"
