# Zombie Survival - Mobile Deployment Guide

## Overview
This guide explains how to deploy the Zombie Survival game to mobile platforms (iOS & Android) using **Emscripten** and **Apache Cordova**.

## Platform Support
- ✅ **Web Browser** (Responsive)
- ✅ **Android** (Native APK)
- ✅ **iOS** (Native IPA)
- ✅ **Progressive Web App (PWA)**

## Prerequisites

### For Web Version
```bash
# Install Emscripten
git clone https://github.com/emscripten-core/emsdk.git
cd emsdk
./emsdk install latest
./emsdk activate latest
source ./emsdk_env.sh  # Linux/Mac
# or emsdk_env.bat on Windows
```

### For Native Mobile Apps
```bash
# Install Node.js and npm
# https://nodejs.org/

# Install Cordova
npm install -g cordova

# Install platform SDKs
# Android: https://developer.android.com/studio
# iOS: Install Xcode from App Store
```

## Build Instructions

### 1. Web Version (Recommended for Quick Testing)

```bash
# Navigate to project root
cd /path/to/Zombies-survival

# Create web build directory
mkdir -p build/web
cd build/web

# Configure with Emscripten
emconfigure cmake -DWEB=ON ..

# Build
emmake make

# The output will be in build/web/
# Open index.html in a browser
```

### 2. Android App

```bash
cd /path/to/Zombies-survival

# Create Cordova project
cordova create mobile com.zombiesurvival.game ZombieSurvival
cd mobile

# Add Android platform
cordova platform add android

# Copy game files
mkdir -p www/game
cp -r ../build/web/* www/game/

# Build APK
cordova build android --release

# Output APK: platforms/android/app/build/outputs/apk/release/app-release.apk
```

### 3. iOS App

```bash
cd /path/to/Zombies-survival/mobile

# Add iOS platform
cordova platform add ios

# Build IPA
cordova build ios --release

# Open in Xcode for final compilation
open platforms/ios/ZombieSurvival.xcworkspace
```

## Mobile-Specific Features

### Touch Controls
- **Movement**: Virtual joystick (left side)
- **Aim**: Touch anywhere on right side
- **Fire**: Tap right side continuously
- **Reload**: Swipe up
- **Build**: Tap base location
- **Eat/Drink**: Tap hunger/thirst bar

### Responsive UI
- Dynamic scaling for different screen sizes
- Portrait and landscape support
- Touch-optimized buttons
- Adaptive font sizes

### Performance Optimization
- Reduced particle effects on mobile
- Lower resolution textures
- Limited zombie count (scale with device)
- Aggressive frame rate capping (30 FPS default)

### Battery & Network
- Reduced draw calls
- Optional WiFi-only gameplay
- Resume from pause functionality

## File Structure

```
Zombies-survival/
├── src/                    # C++ source
├── include/               # Headers
├── web/                   # Web-specific files
│   ├── index.html        # Web entry point
│   ├── style.css         # Web styling
│   └── touch.js          # Touch controls
├── mobile/               # Cordova project
│   ├── www/              # Mobile assets
│   ├── config.xml        # Cordova configuration
│   └── plugins/          # Mobile plugins
├── CMakeLists.txt        # Build config (dual-target)
└── MOBILE.md            # This file
```

## Configuration Files

### CMakeLists.txt Additions
```cmake
# Mobile target
if(WEB)
    # Emscripten/Web configuration
    set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -s WASM=1 -s USE_SDL=2")
elseif(MOBILE)
    # Mobile/Cordova configuration
    # Set appropriate flags for Android/iOS
endif()
```

### config.xml (Cordova)
```xml
<widget id="com.zombiesurvival.game" version="1.0.0">
    <name>Zombie Survival</name>
    <description>Survive the zombie apocalypse</description>
    
    <preference name="Orientation" value="portrait" />
    <preference name="FullScreen" value="true" />
    <preference name="EnableViewportScale" value="true" />
</widget>
```

## Distribution

### Web App (Free)
1. Build web version
2. Host on GitHub Pages, Netlify, or Vercel
3. Share URL with players

### Google Play Store (Android)
1. Create Google Play Developer account
2. Build signed APK
3. Upload to Play Store
4. Set pricing and distribution

### Apple App Store (iOS)
1. Create Apple Developer account
2. Build and sign IPA
3. Use Xcode to upload to App Store
4. Wait for review and approval

## Touch Control Implementation

### Virtual Joystick (Left Side)
- Base circle at bottom-left
- Drag thumb to move player
- Analog stick for smooth movement

### Aiming & Firing (Right Side)
- Touch anywhere on right half
- Continuous firing while touching
- Visual crosshair follows finger

### Action Buttons (Bottom)
- Reload (swipe up)
- Build (double tap)
- Use item (tap status area)

## Performance Tips

1. **Reduce particle effects** in mobile mode
2. **Lower texture quality** for smaller screens
3. **Limit zombie spawns** on older devices
4. **Use object pooling** for frequent allocations
5. **Cache rendering** where possible

## Debugging

### Web
```bash
# Open DevTools in browser (F12)
# Check Console for errors
# Use Chrome DevTools for profiling
```

### Android
```bash
# Connect device with USB debugging
adb logcat | grep zombies

# Or use Android Studio debugger
```

### iOS
```bash
# Use Xcode console
# Or Console.app on macOS
```

## Troubleshooting

### "Emscripten not found"
```bash
source /path/to/emsdk/emsdk_env.sh
```

### Touch controls not responding
- Check `touch.js` is loaded
- Verify touch event listeners attached
- Test in Chrome DevTools mobile mode

### APK too large
- Strip symbols: `arm-linux-androideabi-strip`
- Compress assets
- Use ProGuard minification

### iOS build fails
- Ensure minimum deployment target is set
- Check signing certificates
- Update Xcode to latest version

## Performance Targets

| Platform | Target FPS | Zombie Limit | Max Particles |
|----------|-----------|--------------|---------------|
| Desktop  | 60 FPS    | 50+          | 500           |
| Phone    | 30 FPS    | 20-30        | 200           |
| Tablet   | 60 FPS    | 40           | 400           |

## Future Enhancements

- [ ] Cloud save synchronization
- [ ] Multiplayer support
- [ ] In-app purchases (cosmetics)
- [ ] Push notifications
- [ ] Offline play mode
- [ ] Controller support (MFi, Xbox)
- [ ] AR mode integration
