#!/bin/bash
SRC="/Users/apple/.gemini/antigravity/brain/df8c3363-bf33-4982-a6ad-b1caef1feec1/media__1784201332282.png"

# --- Android ---
RES="/Users/apple/Downloads/OfflineTimeBasedAccess/TimeBasedAccess/android/app/src/main/res"
echo "Generating Android Icons..."
sips -z 48 48 "$SRC" --out "$RES/mipmap-mdpi/ic_launcher.png" > /dev/null
sips -z 48 48 "$SRC" --out "$RES/mipmap-mdpi/ic_launcher_round.png" > /dev/null
sips -z 72 72 "$SRC" --out "$RES/mipmap-hdpi/ic_launcher.png" > /dev/null
sips -z 72 72 "$SRC" --out "$RES/mipmap-hdpi/ic_launcher_round.png" > /dev/null
sips -z 96 96 "$SRC" --out "$RES/mipmap-xhdpi/ic_launcher.png" > /dev/null
sips -z 96 96 "$SRC" --out "$RES/mipmap-xhdpi/ic_launcher_round.png" > /dev/null
sips -z 144 144 "$SRC" --out "$RES/mipmap-xxhdpi/ic_launcher.png" > /dev/null
sips -z 144 144 "$SRC" --out "$RES/mipmap-xxhdpi/ic_launcher_round.png" > /dev/null
sips -z 192 192 "$SRC" --out "$RES/mipmap-xxxhdpi/ic_launcher.png" > /dev/null
sips -z 192 192 "$SRC" --out "$RES/mipmap-xxxhdpi/ic_launcher_round.png" > /dev/null

# --- iOS ---
IOS_RES="/Users/apple/Downloads/OfflineTimeBasedAccess/TimeBasedAccess/ios/TimeBasedAccess/Images.xcassets/AppIcon.appiconset"
echo "Generating iOS Icons..."
sips -z 40 40 "$SRC" --out "$IOS_RES/AppIcon-20x20@2x.png" > /dev/null
sips -z 60 60 "$SRC" --out "$IOS_RES/AppIcon-20x20@3x.png" > /dev/null
sips -z 58 58 "$SRC" --out "$IOS_RES/AppIcon-29x29@2x.png" > /dev/null
sips -z 87 87 "$SRC" --out "$IOS_RES/AppIcon-29x29@3x.png" > /dev/null
sips -z 80 80 "$SRC" --out "$IOS_RES/AppIcon-40x40@2x.png" > /dev/null
sips -z 120 120 "$SRC" --out "$IOS_RES/AppIcon-40x40@3x.png" > /dev/null
sips -z 120 120 "$SRC" --out "$IOS_RES/AppIcon-60x60@2x.png" > /dev/null
sips -z 180 180 "$SRC" --out "$IOS_RES/AppIcon-60x60@3x.png" > /dev/null
sips -z 1024 1024 "$SRC" --out "$IOS_RES/AppIcon-1024x1024@1x.png" > /dev/null

echo "Done!"
