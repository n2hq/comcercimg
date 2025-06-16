#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e


echo "📦  Staging changes..."
git add .

echo "✅  Committing changes..."
git commit -m "update commit"

echo "🌿  Renaming branch to main..."
git branch -M main

echo "🚀  Pushing to origin/main..."
git push -u origin main

echo "🎉  Done!"


