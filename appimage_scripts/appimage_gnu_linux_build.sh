#!/bin/bash
ROOT="$(dirname "$(readlink -f "$0")")"/..
cd "$ROOT"

rm -rf out/appimage-x64/GTKornell.AppDir
mkdir -p out/appimage-x64/GTKornell.AppDir
cd out/appimage-x64/GTKornell.AppDir
mkdir -p usr/bin
cp "$ROOT/build/icon.png" ./gtkornell.png
cp "$ROOT/gtkornell.desktop" .
cp -a "$ROOT/out/gtkornell-linux-x64/"* usr/bin
rm usr/bin/chrome-sandbox
cp "$ROOT/appimage_scripts/AppRun" .
chmod 4755 usr/bin/chrome-sandbox
chown root:root usr/bin/chrome-sandbox
chmod +x AppRun

chmod +x "$ROOT/appimage_scripts/appimagetool-x86_64.AppImage"
mkdir -p "$ROOT/out/make/appimage/x64"
"$ROOT/appimage_scripts/appimagetool-x86_64.AppImage" . "$ROOT/out/make/appimage/x64/GTKornell-x86_64.AppImage"