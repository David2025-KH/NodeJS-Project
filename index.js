const express = require('express');
const admin = require('firebase-admin');
const cors = require('cors');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// ✅ Apply CORS middleware FIRST (before routes/static)
app.use(cors({
  origin: "https://david2025-kh.github.io"   // allow your GitHub Pages
  // origin: "*"  // <-- use this instead if you want to allow all
}));

// ================== Firebase Admin Init ==================
let serviceAccount;

if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
} else {
  serviceAccount = require('./serviceAccountKey.json'); // Local testing
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://air-quality-dashboard-2b7be-default-rtdb.asia-southeast1.firebasedatabase.app"
});

const db = admin.database();
let cachedRealtimeData = {};

// ================== Firebase Listener ==================
db.ref('/1_sensor_data').on('value', (snapshot) => {
  cachedRealtimeData = snapshot.val();
  console.log('✅ Firebase Realtime Data Updated:', cachedRealtimeData);
});

// ================== API Routes ==================
app.get('/api/realtime', (req, res) => {
  res.json(cachedRealtimeData);
});

// Cover page (root)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'cover.html'));
});

// Optional: dashboard page
app.get('/index.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ================== Static Files ==================
app.use(express.static(path.join(__dirname, 'public')));

// ================== Start Server ==================
app.listen(port, () => {
  console.log(`✅ Server started at http://localhost:${port}`);
});
