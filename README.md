# Shisui Calc 2.0

A community-developed enhancement of the public Shisui Calc repository. Built with HTML5, CSS3, vanilla JavaScript and Apache Cordova. The app works offline and has no external runtime dependencies.

## Features
- Responsive dark anime-inspired interface and animated Sharingan-inspired ornament.
- Four color themes: Shisui (emerald), Itachi (crimson), Madara (violet), Sasuke (azure).
- Standard arithmetic, parentheses, percentages, sign toggle and keyboard support.
- Scientific mode: sin, cos, tan, sqrt, log, ln, constants π/e, exponent and factorial.
- DEG/RAD angle selection.
- Local calculation history and settings persisted on the device.
- Optional synthesized button sound; no audio files or network calls.
- Reduced-motion support and safe-area layout for modern Android devices.

## Run in a browser
Open `index.html` in a modern browser. For best testing, serve the folder over localhost.

## Build Android APK
Install Node.js 20, Java 17, Android SDK, then:

```bash
npm install
cordova platform add android@13.0.0
cordova build android --debug
```

The debug APK is generated at:
`platforms/android/app/build/outputs/apk/debug/app-debug.apk`

A GitHub Actions workflow builds the APK on pushes to `main` and on manual dispatch.

## Notes
- All calculation, history and preferences remain on-device; there is no analytics or server API.
- The expression parser is implemented locally and does not use `eval()`.
- This is an independent community modification. Verify the upstream repository's licensing and retain required notices before redistributing upstream material. Naruto/Uchiha names and related franchise elements belong to their respective rights holders.
