# Shisui Calc 4.0 — Susanoo Flame Edition

An offline Cordova calculator with scientific functions, history, selectable Uchiha themes, and locally rendered animated emerald chakra flames around the Shisui/Susanoo artwork.

## Technology
- HTML5, CSS3 and Vanilla JavaScript
- Apache Cordova 12 / Android platform 13
- Local canvas animation (no animation API, CDN, or network dependency)

## Build
The GitHub Actions workflow intentionally retains the previously successful build sequence and toolchain:
Ubuntu 22.04, Node 20, Java 17, Cordova 12.0.0, Android platform 13.0.0, SDK 34 and build-tools 34.0.0.

Push to `main` or run the workflow manually. The artifact is `shisui-calc-v4-debug-apk`.

## Animation performance
The chakra animation uses a small canvas particle field, capped device pixel ratio, pauses when the app is backgrounded, and respects `prefers-reduced-motion`. It has no third-party dependencies and does not affect calculator arithmetic.
