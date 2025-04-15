#!/bin/bash

# Exit on any error
set -e

# Define the manifest path
HOST_NAME=dev.hakancelik.fasthistorysearch
CHROME_MANIFEST_DIR="$HOME/Library/Application Support/Google/Chrome/NativeMessagingHosts"
CHROMIUM_MANIFEST_DIR="$HOME/Library/Application Support/Chromium/NativeMessagingHosts"

# Create manifest directories if they don't exist
mkdir -p "$CHROME_MANIFEST_DIR"
mkdir -p "$CHROMIUM_MANIFEST_DIR"

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Copy the manifest file
cp "$SCRIPT_DIR/$HOST_NAME.json" "$CHROME_MANIFEST_DIR/"
cp "$SCRIPT_DIR/$HOST_NAME.json" "$CHROMIUM_MANIFEST_DIR/"

echo "Native messaging host installed successfully." 