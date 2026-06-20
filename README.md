# Mesai Takip — v6

React + Vite + Tailwind ile yazılmış, Capacitor üzerinden Android'e (ve Electron ile masaüstüne) paketlenen mesai/puantaj takip uygulaması.

## v6'da neler düzeltildi

- **Ayarlar penceresi çöküyordu**: `App.jsx` ve `SettingsModal.jsx`, hiç var olmayan bir "çoklu personel" özelliğine (`activeUser`, `users`, `addUser`, `updateUserInfo` vb.) referans veriyordu. `useStore.js` bu özelliği hiç desteklemiyordu, bu yüzden Ayarlar açılır açılmaz `ReferenceError` ile çöküyordu. Bu özellik tamamen kaldırıldı, uygulama tek kullanıcı olarak basitleştirildi.
- **CSV İndir** butonu aynı sebepten çöküyordu, düzeltildi.
- Eksik proje config dosyaları eklendi: `vite.config.js`, `tailwind.config.js`, `postcss.config.js`, `.gitignore`. Bunlar önceki zip'te hiç yoktu.
- `tailwind.config.js` içinde `darkMode: 'class'` ayarlandı. Bu olmadan Ayarlar'daki "Koyu Tema" seçeneği görsel olarak hiçbir şey değiştirmiyordu (Tailwind varsayılan olarak `dark:` sınıflarını sadece işletim sistemi temasına göre tetikler, kodun manuel `classList.add('dark')` çağrısına göre değil).

## Kurulum (GitHub Codespace içinde)

```bash
npm install
npm run dev          # tarayıcıda geliştirme sunucusu (localhost:5173)
```

## Android APK üretmek

```bash
npm run build         # dist/ klasörünü oluşturur
npx cap sync android   # web çıktısını android projesine kopyalar
cd android
./gradlew assembleDebug
# APK: android/app/build/outputs/apk/debug/app-debug.apk
```

## Electron (masaüstü) build

```bash
npm run electron-build
```

## Klasör yapısı

```
src/            React kaynak kodu
public/         Electron giriş dosyaları (electron.js, preload.js) + statik dosyalar
android/        Capacitor Android projesi
capacitor.config.json
```

Not: `node_modules/`, `dist/`, `android/.gradle/`, `android/app/build/` klasörleri `.gitignore` ile hariç tutuldu — `npm install` ve build komutlarıyla yeniden oluşturulurlar.
