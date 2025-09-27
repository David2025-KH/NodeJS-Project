const express = require('express');
const admin = require('firebase-admin');
const cors = require('cors');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// ================== CORS ==================
app.use(cors({
  origin: [
    "http://localhost:3000",
    "http://127.0.0.1:5500",
    "https://david2025-kh.github.io"
  ]
}));

// ================== Firebase Init ==================
let serviceAccount;
if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
} else {
  serviceAccount = require('./serviceAccountKey.json');
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://air-quality-dashboard-2b7be-default-rtdb.asia-southeast1.firebasedatabase.app"
});

const db = admin.database();
let cachedRealtimeData = { message: "No data yet" };

// ================== Firebase Listener ==================
db.ref('/1_sensor_data').on('value', (snapshot) => {
  cachedRealtimeData = snapshot.val() || { message: "No data available" };
  console.log('✅ Firebase Realtime Data Updated:', cachedRealtimeData);
});

// ================== API Route ==================
app.get('/api/realtime', (req, res) => {
  res.json(cachedRealtimeData);
});

// ================== Static Files ==================
app.use(express.static(path.join(__dirname, 'public'), { extensions: ['html'] }));

// ================== HTML Pages ==================

// Cover / Landing page as main
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Dashboard page
app.get('/dashboard.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// Historical data page
app.get('/historical.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'historical.html'));
});

// Fallback → cover page
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ================== Start Server ==================
app.listen(port, () => {
  console.log(`✅ Server running at http://localhost:${port}`);
});
