# Upload Shisui Calc 5.0 from Android

1. Download `shisui-calc-v5-mobile.zip` and extract with ZArchiver.
2. Open https://github.com/sonytaka32-beep/New and choose branch `main`.
3. Select **Add file → Upload files**.
4. Upload the contents of the extracted `shisui-calc-v5` folder, including `assets/` and `.github/workflows/`.
5. Commit with message `Fix visible animated Susanoo chakra flames`.
6. Open Actions. Wait for the build to finish, then download the artifact using the same artifact name shown by the workflow.

If Android hides `.github`, use Termux:
```bash
pkg update -y
pkg install git unzip -y
termux-setup-storage
cd ~/storage/downloads
unzip shisui-calc-v5-mobile.zip
git clone https://github.com/sonytaka32-beep/New.git
cd New
cp -r ~/storage/downloads/shisui-calc-v5/. .
git status
git add .
git commit -m "Fix visible animated Susanoo chakra flames"
git push origin main
```
If the repository is already cloned, skip `git clone` and enter the existing `New` folder. Adjust the ZIP path if needed. Keep the folder structure and upload the extracted files, not the ZIP as one file.
