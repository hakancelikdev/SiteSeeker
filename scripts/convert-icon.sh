#!/bin/bash

# Create build directory if it doesn't exist
mkdir -p build

# Create temporary directory for icon conversion
mkdir -p build/icon.iconset

# Convert PNG to different sizes for icns
sips -z 16 16     icon.png --out build/icon.iconset/icon_16x16.png
sips -z 32 32     icon.png --out build/icon.iconset/icon_16x16@2x.png
sips -z 32 32     icon.png --out build/icon.iconset/icon_32x32.png
sips -z 64 64     icon.png --out build/icon.iconset/icon_32x32@2x.png
sips -z 128 128   icon.png --out build/icon.iconset/icon_128x128.png
sips -z 256 256   icon.png --out build/icon.iconset/icon_128x128@2x.png
sips -z 256 256   icon.png --out build/icon.iconset/icon_256x256.png
sips -z 512 512   icon.png --out build/icon.iconset/icon_256x256@2x.png
sips -z 512 512   icon.png --out build/icon.iconset/icon_512x512.png
sips -z 1024 1024 icon.png --out build/icon.iconset/icon_512x512@2x.png

# Create icns file
iconutil -c icns build/icon.iconset -o build/icon.icns

# Clean up
rm -rf build/icon.iconset

echo "Icon converted to build/icon.icns" 