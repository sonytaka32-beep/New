# Panduan upload Shisui Calc 2.0 dari HP Android

## 1. Ekstrak ZIP
1. Download `shisui-calc-v2-mobile.zip` ke HP.
2. Buka ZArchiver atau pengelola file.
3. Pilih ZIP lalu tekan **Ekstrak di sini**.
4. Buka folder `shisui-calc-v2`. Di dalamnya harus ada `index.html`, `config.xml`, `package.json`, serta folder `css`, `js`, dan `.github`.

> Jangan upload ZIP sebagai isi repository. Yang di-upload adalah isi folder hasil ekstrak.

## 2. Upload lewat browser GitHub
1. Buka repository tujuan di github.com dan login.
2. Pilih branch yang ingin diperbarui (biasanya `main`).
3. Pilih **Add file → Upload files**.
4. Pilih file-file dari folder hasil ekstrak. Jika pemilih file HP tidak bisa memilih folder sekaligus, gunakan Termux di bawah.
5. Pastikan `.github/workflows/build-apk.yml` ikut ter-upload. Folder `.github` kadang tersembunyi di pengelola file.
6. Isi commit message, misalnya `Update Shisui Calc to v2`, lalu tekan **Commit changes**.

## 3. Cara praktis: Termux
Install Termux dari sumber resminya, lalu jalankan:

```bash
pkg update -y
pkg install git openssh -y
termux-setup-storage
```

Masuk ke folder Download:

```bash
cd ~/storage/downloads
unzip shisui-calc-v2-mobile.zip
```

Clone repository milikmu (ganti USERNAME dan NAMA-REPO):

```bash
cd ~
git clone https://github.com/USERNAME/NAMA-REPO.git
```

Salin isi proyek ke repository hasil clone:

```bash
cp -r ~/storage/downloads/shisui-calc-v2/. ~/NAMA-REPO/
cd ~/NAMA-REPO
git status
git add .
git commit -m "Update Shisui Calc to v2"
git push
```

Jika folder hasil ekstrak bukan di `~/storage/downloads`, sesuaikan path pada perintah `cp`. GitHub mungkin meminta autentikasi. Untuk HTTPS, gunakan GitHub Personal Access Token saat diminta password; jangan bagikan token kepada siapa pun.

## 4. Periksa hasil upload
Pastikan file berikut terlihat di GitHub:
- `index.html`
- `css/style.css`
- `js/script.js`
- `config.xml`
- `package.json`
- `.github/workflows/build-apk.yml`

Setelah itu buka tab **Actions** untuk melihat apakah workflow build APK berjalan.

## Catatan
- Upload ke repository yang kamu miliki atau punya izin untuk mengubahnya.
- Jika ingin mengganti proyek lama, periksa perubahan sebelum commit agar file penting yang masih dibutuhkan tidak terhapus.
- Source code belum berarti APK sudah berhasil dibangun. Periksa hasil workflow di GitHub Actions.
