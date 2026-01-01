#!/bin/bash
ROOT="$(dirname "$(readlink -f "$0")")"/..
cd "$ROOT"

rm -rf out/appimage-x64/GTKornell.AppDir
mkdir -p out/appimage-x64/GTKornell.AppDir
cd out/appimage-x64/GTKornell.AppDir
mkdir -p usr/bin
cp "$ROOT/assets/icon.png" ./gtkornell.png
cp "$ROOT/gtkornell.desktop" .
cp "$ROOT/out/gtkornell-linux-x64/gtkornell" usr/bin
cp "$ROOT/appimage_scripts/AppRun" .
chmod +x AppRun

chmod +x "$ROOT/appimage_scripts/appimagetool-x86_64.AppImage"
mkdir -p "$ROOT/out/make/appimage/x64"
"$ROOT/appimage_scripts/appimagetool-x86_64.AppImage" . "$ROOT/out/make/appimage/x64/GTKornell-x86_64.AppImage"