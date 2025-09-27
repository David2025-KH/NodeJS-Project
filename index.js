// ================== Imports ==================
const express = require('express');
const admin = require('firebase-admin');
const cors = require('cors');
const path = require('path');

// ================== App Setup ==================
const app = express();
const port = process.env.PORT || 3000;

// ✅ Apply CORS middleware FIRST (before routes/static)
app.use(cors({
  origin: [
    "http://localhost:3000",      // local dev
    "http://127.0.0.1:5500",      // VSCode Live Server
    "https://david2025-kh.github.io" // GitHub Pages frontend
  ],
  methods: ["GET"],
  allowedHeaders: ["Content-Type"]
}));

// ================== Firebase Init ==================
let serviceAccount;

if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
} else {
  serviceAccount = require('./serviceAccountKey.json'); // local dev
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

// ================== API Routes ==================
app.get('/api/realtime', (req, res) => {
  res.json(cachedRealtimeData);
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'cover.html'));
});

app.get('/index.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ================== Static Files ==================
app.use(express.static(path.join(__dirname, 'public')));

// ================== Start Server ==================
app.listen(port, () => {
  console.log(`✅ Server running at http://localhost:${port}`);
});
