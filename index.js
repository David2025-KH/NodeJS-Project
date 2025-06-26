const express = require('express');
const admin = require('firebase-admin');
const cors = require('cors');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());

// Serve static files from 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Initialize Firebase Admin SDK using environment variable
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://air-quality-dashboard-2b7be-default-rtdb.asia-southeast1.firebasedatabase.app"
});

const db = admin.database();

let cachedRealtimeData = {};

// Listen to correct Firebase path
db.ref('/1_sensor_data').on('value', (snapshot) => {
  cachedRealtimeData = snapshot.val();
  console.log('✅ Firebase Realtime Data Updated:', cachedRealtimeData);
});

// API endpoint for your frontend
app.get('/api/realtime', (req, res) => {
  res.json(cachedRealtimeData);
});

// Serve the UI from public/index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(port, () => {
  console.log(`✅ Server started at http://localhost:${port}`);
});
