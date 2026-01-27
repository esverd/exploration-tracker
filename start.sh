#!/bin/bash
# ============================================
# Exploration Tracker — Linux/Mac Launcher
# Run: ./start.sh
# ============================================

# Navigate to the script's directory (the project root)
cd "$(dirname "$0")"

echo ""
echo "==========================="
echo "  Exploration Tracker"
echo "==========================="
echo ""

# Check for Node.js
if ! command -v node &> /dev/null; then
  echo "ERROR: Node.js is not installed."
  echo ""
  echo "Please install Node.js from https://nodejs.org"
  echo "(or use your package manager: apt install nodejs / brew install node)"
  echo ""
  exit 1
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
  echo "Installing dependencies (first run only)..."
  npm install
  echo ""
fi

# Build if needed
if [ ! -d "dist" ]; then
  echo "Building the app (first run only)..."
  npm run build
  echo ""
fi

echo "Starting the app..."
echo "The app will open in your browser shortly."
echo ""
echo "To stop the app, press Ctrl+C."
echo ""

# Start the server (it will auto-open the browser)
OPEN_BROWSER=1 node server/index.js
