const express = require('express');
const admin = require('firebase-admin');
const cors = require('cors');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());

// Initialize Firebase Admin SDK
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

// Listen to Firebase path
db.ref('/1_sensor_data').on('value', (snapshot) => {
  cachedRealtimeData = snapshot.val();
  console.log('✅ Firebase Realtime Data Updated:', cachedRealtimeData);
});

// API endpoint for frontend
app.get('/api/realtime', (req, res) => {
  res.json(cachedRealtimeData);
});

// Serve the cover page first
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'cover.html'));
});

// Optional: dashboard page
app.get('/index.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Serve static files (CSS, JS, images)
app.use(express.static(path.join(__dirname, 'public')));

// Start server
app.listen(port, () => {
  console.log(`✅ Server started at http://localhost:${port}`);
});
