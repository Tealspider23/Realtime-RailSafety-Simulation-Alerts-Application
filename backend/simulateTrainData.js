const firebase = require('firebase/app');
require('firebase/database');
const { database } = require('./firebaseConfig');
const { ref, set } = require('firebase/database');
const { loadGeoJson, getLineStringFeatures, parseLineStringCoordinates } = require('./geoJsonParser');
const { handleBridgeDisaster, handleDerailment, handleTrainStop, handleTrainCrash } = require('./trainEventHandlers');

let simulationIntervalId;
let wss; // WebSocket server instance
let trackCoordinates = {};
let trainPositions = [];
const numTrains = 3; // Updated to 3 trains
const speedRange = [50, 60]; // Speed between 50-60 km/h
const timeStep = 3; // Time step in seconds
const RISK_LEVELS = {
  GREEN: 'Green',
  YELLOW: 'Yellow',
  ORANGE: 'Orange',
  RED: 'Red'
};

const trackIds = [
  'way/44578168', // Track for Train 1
  'way/44946735', // Track for Train 2
  'way/44946765', // Track for Train 3
  'way/44946764', // Track continuous to track 3
  'way/150254374',
  'way/150908931',
  'way/231145671',
];

const loadTracks = async () => {
  const geoJsonData = loadGeoJson('./railway-network.geojson');
  const railwayFeatures = getLineStringFeatures(geoJsonData);
  trackCoordinates = parseLineStringCoordinates(railwayFeatures);
};

const haversineDistance = (lon1, lat1, lon2, lat2) => {
  const R = 6371; // Earth radius in kilometers
  const toRadians = degrees => degrees * Math.PI / 180;
  const phi1 = toRadians(lat1);
  const lambda1 = toRadians(lon1);
  const phi2 = toRadians(lat2);
  const lambda2 = toRadians(lon2);
  const deltaPhi = phi2 - phi1;
  const deltaLambda = lambda2 - lambda1;
  const a = Math.sin(deltaPhi / 2) ** 2 + Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const calculateRiskLevel = (distance) => {
  if (distance < 0.5) return RISK_LEVELS.RED; // < 0.5 km
  if (distance < 1) return RISK_LEVELS.ORANGE; // 0.5-1 km
  if (distance < 2) return RISK_LEVELS.YELLOW; // 1-2 km
  return RISK_LEVELS.GREEN; // > 2 km
};

const calculateAdvisory = (train, otherTrains) => {
  return otherTrains.map(otherTrain => {
    const distance = haversineDistance(
      train.location.longitude, train.location.latitude,
      otherTrain.location.longitude, otherTrain.location.latitude
    );

    if (distance < 0.5) {
      return {
        level: RISK_LEVELS.RED,
        message: 'Immediate halt required!'
      };
    }
    if (distance < 1) {
      return {
        level: RISK_LEVELS.ORANGE,
        message: 'Slow down and prepare to stop.'
      };
    }
    if (distance < 2) {
      return {
        level: RISK_LEVELS.YELLOW,
        message: 'Approaching train. Be cautious.',
        advisory: [
          'Approaching Train opposite',
          'Stagnant Train',
          'Lane change advisory',
          'Speed slowing advisory'
        ]
      };
    }
    return {
      level: RISK_LEVELS.GREEN,
      message: 'All clear.'
    };
  });
};

const adjustSpeed = (train, trainIndex) => {
  if (trainIndex < 0 || trainIndex >= trainPositions.length) {
    console.error(`Invalid trainIndex: ${trainIndex}`);
    return 0;
  }

  if (train.status === RISK_LEVELS.RED) {
    trainPositions[trainIndex].stationary = true; // Set the train as stationary
    return 0; // Immediate stop for RED
  }
  if (train.status === RISK_LEVELS.ORANGE) {
    const newSpeed = Math.max(train.speed - 5, 0);
    if (newSpeed === 0) trainPositions[trainIndex].stationary = true; // Set the train as stationary
    return newSpeed; // Gradually decrease speed to 0
  }
  if (train.status === RISK_LEVELS.YELLOW) {
    const newSpeed = Math.max(train.speed - 2, 0);
    if (newSpeed === 0) trainPositions[trainIndex].stationary = true; // Set the train as stationary
    return newSpeed; // Gradually decrease speed but not to 0
  }
  trainPositions[trainIndex].stationary = false; // Ensure train is not stationary when GREEN
  return speedRange[0] + Math.random() * (speedRange[1] - speedRange[0]); // Normal speed for GREEN
};

const simulateTrainData = async () => {
  try {
    if (!Object.keys(trackCoordinates).length) {
      await loadTracks();
    }

    if (trainPositions.length === 0) {
      trainPositions.push({ trackId: trackIds[0], index: 0, direction: 1, stationary: false }); // Train 1 starts at the beginning of track 1, moving forward
      trainPositions.push({ trackId: trackIds[6], index: trackCoordinates[trackIds[6]].length - 1, direction: -1, stationary: false }); // Train 2 starts at the last coordinate of track 6, moving backward
      trainPositions.push({ trackId: trackIds[6], index: 0, direction: 1, stationary: false }); // Train 3 starts at the beginning of track 6, moving forward
    }

    const trains = trainPositions.map((trainPos, i) => {
      if (trainPos.stationary) {
        return {
          id: `train${i + 1}`,
          name: `Train ${i + 1}`,
          location: {
            latitude: trackCoordinates[trainPos.trackId][trainPos.index][1],
            longitude: trackCoordinates[trainPos.trackId][trainPos.index][0],
          },
          speed: 0,
          status: RISK_LEVELS.RED,
          advisory: 'Stationary'
        };
      }

      const { trackId, index, direction } = trainPos;
      const coordinates = trackCoordinates[trackId];
      let speed = adjustSpeed({
        speed: speedRange[0] + Math.random() * (speedRange[1] - speedRange[0]),
        status: RISK_LEVELS.GREEN
      }, i);
      
      if (trainPos.stationary) {
        speed = 0;
      }
      
      const distanceStep = (speed * 1000 / 3600) * timeStep; // Distance in meters

      let totalDistance = 0;
      let segmentDistance = 0;
      let currentPositionIndex = index;
      

      while (distanceStep > segmentDistance) {

       

        if (direction === 1) { // Moving forward
          if (currentPositionIndex >= coordinates.length - 1) {
            currentPositionIndex = 0; // Restart if reached the end
          }
          const [lon1, lat1] = coordinates[currentPositionIndex];
          const [lon2, lat2] = coordinates[currentPositionIndex + 1];
          segmentDistance = haversineDistance(lon1, lat1, lon2, lat2) * 1000; // Convert km to meters
          currentPositionIndex++;
        } else { // Moving backward
          if (currentPositionIndex <= 0) {
            currentPositionIndex = coordinates.length - 1; // Restart if reached the start
          }
          const [lon1, lat1] = coordinates[currentPositionIndex];
          const [lon2, lat2] = coordinates[currentPositionIndex - 1];
          segmentDistance = haversineDistance(lon1, lat1, lon2, lat2) * 1000; // Convert km to meters
          currentPositionIndex--;
        }
        totalDistance += segmentDistance;

     
      }

      // Interpolate position between two points
      const [prevLon, prevLat] = direction === 1 ? coordinates[currentPositionIndex - 1] : coordinates[currentPositionIndex + 1];
      const [nextLon, nextLat] = coordinates[currentPositionIndex];
      const t = (distanceStep - (totalDistance - segmentDistance)) / segmentDistance;
      const currentPosition = [
        prevLon + (nextLon - prevLon) * t,
        prevLat + (nextLat - prevLat) * t,
      ];

      // Update the train position index
      if (!trainPos.stationary) {
        trainPositions[i].index = currentPositionIndex;
      }

      return {
        id: `train${i + 1}`,
        name: `Train ${i + 1}`,
        location: {
          latitude: currentPosition[1],
          longitude: currentPosition[0],
        },
        speed,
        status: RISK_LEVELS.GREEN,
      };
    });

    // Calculate advisories and risk levels for each train
    trains.forEach((train, index) => {
      const otherTrains = trains.filter((_, otherIndex) => otherIndex !== index);
      const advisories = calculateAdvisory(train, otherTrains);
      train.advisory = advisories;

      // Determine the highest risk level among advisories
      train.status = advisories.reduce((maxLevel, advisory) => {
        if (advisory.level === RISK_LEVELS.RED) return RISK_LEVELS.RED;
        if (advisory.level === RISK_LEVELS.ORANGE && maxLevel !== RISK_LEVELS.RED) return RISK_LEVELS.ORANGE;
        if (advisory.level === RISK_LEVELS.YELLOW && maxLevel === RISK_LEVELS.GREEN) return RISK_LEVELS.YELLOW;
        return maxLevel;
      }, RISK_LEVELS.GREEN);
    });

    // Send updated train data to all WebSocket clients
    if (wss) {
      wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(trains));
        }
      });
    }

    await set(ref(database, 'trains'), trains);
    console.log('Train data updated in Firebase and sent via WebSocket');
  } catch (error) {
    console.error('Error in train simulation:', error);
  }
};

const startSimulation = () => {
  if (simulationIntervalId) {
    clearInterval(simulationIntervalId);
  }
  simulationIntervalId = setInterval(simulateTrainData, timeStep * 1000);
};

const stopSimulation = () => {
  if (simulationIntervalId) {
    clearInterval(simulationIntervalId);
    simulationIntervalId = null;
  }
};

module.exports = { startSimulation, stopSimulation, setWebSocketServer: (wsServer) => { wss = wsServer; } };
