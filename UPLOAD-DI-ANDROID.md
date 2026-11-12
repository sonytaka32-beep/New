# Shisui Calc 4.0 — upload from Android

1. Download `shisui-calc-v4-mobile.zip`.
2. Extract it with ZArchiver.
3. Open https://github.com/sonytaka32-beep/New.
4. Choose branch `main` → **Add file** → **Upload files**.
5. Upload the contents of the extracted `shisui-calc-v4` folder, including the hidden `.github/workflows/build-apk.yml` and `assets/` folder.
6. Commit with message `Upgrade Shisui Calc to 4.0 animated chakra`.
7. Open **Actions**, wait for `Build Shisui Calc 4 APK`, then download artifact `shisui-calc-v4-debug-apk` and extract the APK.

Important: keep the directory structure. Upload the extracted files, not the ZIP as a single file. If Android's file picker hides `.github`, use Termux:

```bash
pkg update -y
pkg install git unzip -y
termux-setup-storage
cd ~/storage/downloads
unzip shisui-calc-v4-mobile.zip
git clone https://github.com/sonytaka32-beep/New.git
cd New
cp -r ~/storage/downloads/shisui-calc-v4/. .
git status
git add .
git commit -m "Upgrade Shisui Calc to 4.0 animated chakra"
git push origin main
```

If you already cloned the repository, skip `git clone` and enter your existing `New` folder. Adjust the ZIP path if it is not in Downloads.

## Build compatibility
The workflow keeps the previous known successful environment and Cordova build commands unchanged. Only workflow display/artifact labels are renamed, and the app version becomes 4.0.0. The animated flames use local JavaScript canvas; no npm package or extra Cordova plugin is added.
