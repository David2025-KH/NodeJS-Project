const express = require('express');
const admin = require('firebase-admin');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());

// Initialize Firebase Admin SDK
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://air-quality-dashboard-2b7be-default-rtdb.asia-southeast1.firebasedatabase.app"
});

const db = admin.database();

let cachedRealtimeData = {};

// ✅ Listen to correct path where ESP32 writes sensor data
db.ref('/1_sensor_data').on('value', (snapshot) => {
  cachedRealtimeData = snapshot.val();
  console.log('✅ Firebase Realtime Data Updated:', cachedRealtimeData);
});

// ✅ API endpoint for your frontend
app.get('/api/realtime', (req, res) => {
  res.json(cachedRealtimeData);
});

// ✅ Basic Home Page
app.get('/', (req, res) => {
  res.send('✅ Firebase Proxy Server is running...');
});

// ✅ Start Server
app.listen(port, () => {
  console.log(`✅ Server started at http://localhost:${port}`);
});
