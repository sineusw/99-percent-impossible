#!/usr/bin/env bash
set -euo pipefail
rm -rf dist
mkdir -p dist

# Bundle the production web game locally inside the iOS app. Keep native/build/server-only
# folders out of the payload.
for item in *; do
  case "$item" in
    api|dist|ios|node_modules|scripts|package.json|package-lock.json|capacitor.config.json|vercel.json)
      continue
      ;;
  esac
  cp -R "$item" dist/
done

# Capacitor requires an index.html entry point.
test -f dist/index.html
