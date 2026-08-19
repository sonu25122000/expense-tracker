# Expense Tracker

A personal expense management app: Node/Express + MongoDB backend, and a React web
frontend that runs as an installable Android app (via Capacitor) and an installable
iPhone home-screen app (via PWA "Add to Home Screen").

```
expense-tracker-app/
  backend/    Node.js + Express + MongoDB API
  frontend/   React (Vite) web app, wrapped with Capacitor for Android
```

## 1. Run the backend

```
cd backend
npm install
npm run dev
```

This starts the API on `http://localhost:5001` and connects to the MongoDB Atlas
database configured in `backend/.env`. The first request seeds the 10 default
expense categories automatically.

**Important:** `backend/.env` contains real database credentials (`MONGODB_URI`) and
a `JWT_SECRET`. It is already excluded from git via `.gitignore` — never commit it.

## 2. Run the frontend (development)

```
cd frontend
npm install
npm run dev
```

Vite will print a local URL (e.g. `http://localhost:5175` — it auto-shifts if
5173 is already busy). Open it in a browser.

On first launch the app asks for the backend's address:
- Testing on the same PC: `http://localhost:5001`
- Testing from a phone browser: your PC's local network IP, e.g. `http://192.168.1.10:5001`
  (find it with `ipconfig` on Windows — look for "IPv4 Address"). Your phone must
  be on the same Wi-Fi network as the PC, and the backend must be running.

After that, you'll be asked to create a username/password (one-time) — this is
your personal login for the app, stored (hashed) in the backend database.

## 3. Install on Android (real .apk file)

A GitHub Actions workflow (`.github/workflows/build-android.yml`) builds a debug
`.apk` automatically on every push to `main`. To get it:

1. Go to the GitHub repo → **Actions** tab → open the latest **Build Android APK** run.
2. Download the `expense-tracker-debug-apk` artifact (a zip containing `app-debug.apk`).
3. Copy `app-debug.apk` to your Android phone and open it to install (you'll need to
   allow "install unknown apps" for whichever app you used to open the file).
4. On first launch, enter your PC's backend address exactly as in step 2.

You can also trigger a build manually from the Actions tab ("Run workflow") without
pushing new code.

## 4. Install on iPhone (PWA, no Apple Developer account needed)

1. Deploy or run the frontend somewhere your iPhone can reach it (same Wi-Fi + your
   PC's IP is enough, e.g. `http://192.168.1.10:5175` in dev, or host the `dist/`
   build with any static server).
2. Open that address in **Safari** on the iPhone.
3. Tap the Share icon → **Add to Home Screen**.
4. The app icon appears on the home screen and opens full-screen, like a native app.

## 5. Building the Android project locally (optional)

Requires Android Studio / JDK 21 / Android SDK installed:

```
cd frontend
npm run build
npx cap sync android
cd android
./gradlew assembleDebug
```

The APK lands at `android/app/build/outputs/apk/debug/app-debug.apk`.

## Notes

- The app is self-hosted: the backend must be running on your PC (or wherever you
  deploy it) for the app to work. There is no cloud-hosted version.
- Receipt photos are stored on the backend under `backend/uploads/` and served at
  `/uploads/<filename>`.
- Login uses a single fixed account (JWT-based). If you ever need to reset it,
  delete the one document in the `users` collection in MongoDB and the app will
  show the account-setup screen again.
