const express = require('express');
const { createServer } = require('http');
const WebSocket = require('ws');
const { startSimulation, stopSimulation, setWebSocketServer } = require('./simulateTrainData');
require('dotenv').config();
const cors = require('cors')

const app = express();
const server = createServer(app);
const wss = new WebSocket.Server({ server });

// Enable CORS for your frontend origin
app.use(cors({
  origin: 'https://realtime-rail-safety-simulation-alerts-application-lxaa.vercel.app/',
  methods: ['GET', 'POST' ,'OPTIONS'], // List allowed HTTP methods
  allowedHeaders: ['Content-Type', 'Authorization',],// List allowed headers
}));

setWebSocketServer(wss);

// Endpoint to start the simulation
app.post('/start-simulation', (req, res) => {
  startSimulation();
  res.status(200).send('Simulation started');
});

// Endpoint to stop the simulation
app.post('/stop-simulation', (req, res) => {
  stopSimulation();
  res.status(200).send('Simulation stopped');
});

wss.on('connection', (ws) => {
  console.log('New client connected');
  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

app.get('/', (req, res) => {
  res.send('WebSocket server is running');
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  stopSimulation(); // Ensure simulation stops
  wss.close();
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

