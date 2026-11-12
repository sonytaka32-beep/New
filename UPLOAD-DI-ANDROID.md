# Upload Shisui Calc 3.0 from Android

## Option A — GitHub website
1. Download `shisui-calc-v3-mobile.zip` and extract it with ZArchiver.
2. Open your repository: https://github.com/sonytaka32-beep/New
3. Open the `main` branch and choose **Add file → Upload files**.
4. Select the contents of the extracted `shisui-calc-v3` folder, including the `assets` folder and `.github/workflows/build-apk.yml`.
5. If Android's file picker hides `.github`, use Option B (Termux) so the workflow file is not missed.
6. Commit the changes with a message such as `Upgrade Shisui Calc to 3.0 Susanoo Edition`.

Important: upload the extracted files and folders, not the ZIP itself. Keep the folder structure exactly as it is.

## Option B — Termux (recommended; includes hidden workflow folder)
Install Termux, then:

```bash
pkg update -y
pkg install git unzip -y
termux-setup-storage
cd ~/storage/downloads
unzip shisui-calc-v3-mobile.zip
git clone https://github.com/sonytaka32-beep/New.git
cd New
cp -r ~/storage/downloads/shisui-calc-v3/. .
git status
git add .
git commit -m "Upgrade Shisui Calc to 3.0 Susanoo Edition"
git push origin main
```

If the ZIP is saved outside Downloads, adjust the `cp` source path. If you already cloned `New`, skip `git clone` and `cd` into your existing repository. GitHub may ask you to authenticate; use a GitHub token when prompted for an HTTPS password and never share it.

## Build the APK
After the push, open the repository's **Actions** tab. Wait for `Build Shisui Calc 3 APK` to finish, then download the `shisui-calc-v3-debug-apk` artifact and extract the APK from it.

The workflow intentionally keeps the known successful versions: Ubuntu 22.04, Node 20, Java 17, Cordova 12.0.0, Android platform 13.0.0, SDK 34 and build-tools 34.0.0. It adds only one required copy command for the new local `assets/` directory. It does not copy the empty `res/*` directory that caused the earlier issue.

This package is source code; an APK is produced only after GitHub Actions completes successfully.
