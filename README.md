# Shisui Calc 3.0 — Susanoo Edition

A visual and UX refresh of the community Shisui Calc project. Built with HTML5, CSS3, vanilla JavaScript and Apache Cordova. The app remains offline-first: calculator logic, settings, history, CSS and artwork are bundled locally.

## Changes in 3.0
- Reworked emerald/charcoal visual system with clearer hierarchy and higher contrast.
- Added a locally bundled Shisui-inspired ninja and emerald guardian artwork at `assets/shisui-susanoo.png`.
- Redesigned hero, calculator panel, keys, display and responsive spacing for Android phones.
- Kept the existing calculator parser, scientific functions, local history, theme options and sound controls.
- Bumped the settings storage key to v3 so the Shisui emerald theme is selected by default after upgrade; calculation history is retained.
- Preserved the known-good GitHub Actions build toolchain from successful run `0d0492d`: Ubuntu 22.04, Node 20, Java 17, Cordova 12.0.0, Android platform 13.0.0, Android SDK 34 and build-tools 34.0.0.
- The workflow still creates a fresh Cordova project and copies `index.html`, `css`, `js`, and `config.xml`; it now additionally copies `assets/`. It intentionally does not copy the previously empty `res/*` path that caused the earlier workflow issue.

## Build Android APK
Push to `main` or run the workflow manually from GitHub Actions. The artifact is `shisui-calc-v3-debug-apk`.

The workflow outputs:
`build/platforms/android/app/build/outputs/apk/debug/app-debug.apk`

## Local build
Requires Node.js 20, Java 17, Android SDK and Cordova 12:

```bash
npm install
cordova platform add android@13.0.0
cordova build android --debug
```

## Notes
- No remote image URLs, web fonts, analytics or runtime APIs are required.
- The artwork is bundled in the app, so it displays offline.
- This is a fan-made community modification. Shisui Uchiha and Naruto franchise names/characters are owned by their respective rights holders. Check the upstream repository license and retain applicable notices before redistribution.
