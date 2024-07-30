// server.js
const express = require('express');
const { startSimulation, stopSimulation } = require('./simulateTrainData');
const cors = require('cors');

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

app.post('/start-simulation', (req, res) => {
  try {
    startSimulation();
    res.status(200).send('Simulation started.');
  } catch (error) {
    res.status(500).send('Error starting simulation: ' + error.message);
  }
});

app.post('/stop-simulation', (req, res) => {
  try {
    stopSimulation();
    res.status(200).send('Simulation stopped.');
  } catch (error) {
    res.status(500).send('Error stopping simulation: ' + error.message);
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
