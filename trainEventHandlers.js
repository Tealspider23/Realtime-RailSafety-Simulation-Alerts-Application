// trainEventHandlers.js
const nodemailer = require('nodemailer');
require('dotenv').config(); // Load environment variables from .env file

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  host:process.env.HOST_NAME,
  port: 587,
  secure:false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD
  }
});

const notifyEmergencyServices = (train, incidentType) => {
  console.log(`Notifying emergency services: 108 for train ${train.id} - ${incidentType}`);
  // Logic to notify emergency services, for example, sending a request to an emergency notification API
};

const sendNotification = (message) => {
  console.log(`Sending notification: ${message}`);
  // Logic to send a notification, e.g., push notification, email, or SMS
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.RECEIVER_USER,
    subject: 'Train Incident Notification',
    text: message
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending email:', error);
    } else {
      console.log('Email sent:', info.response);
    }
  });
};

const handleBridgeDisaster = (train) => {
  console.log(`Bridge disaster for train ${train.id}`);
  train.speed = 0;
  train.status = 'Disaster';
  train.advisory = 'Bridge collapse ahead. All trains have been stopped. Contact emergency services.';

  notifyEmergencyServices(train, 'Bridge Disaster');
  sendNotification(`Train ${train.id} has encountered a bridge disaster. Emergency services have been notified.`);
};

const handleTrainStop = (train, currentPositionIndex) => {
  console.log(`Train ${train.id} stopped at position ${currentPositionIndex}`);
  train.speed = 0;
  train.status = 'Stopped';
  train.advisory = 'Train has come to a complete stop.';

  sendNotification(`Train ${train.id} has stopped at position ${currentPositionIndex}.`);
};

const handleDerailment = (train) => {
  console.log(`Derailment for train ${train.id}`);
  train.speed = 0;
  train.status = 'Derailment';
  train.advisory = 'Train has derailed. Contact emergency services immediately.';

  notifyEmergencyServices(train, 'Derailment');
  sendNotification(`Train ${train.id} has derailed. Emergency services have been notified.`);
};

const handleTrainCrash = (train1, train2) => {
  console.log(`Train crash between train ${train1.id} and train ${train2.id}`);
  train1.speed = 0;
  train2.speed = 0;
  train1.status = 'Crash';
  train2.status = 'Crash';
  train1.advisory = 'Train crash. Contact emergency services immediately.';
  train2.advisory = 'Train crash. Contact emergency services immediately.';

  notifyEmergencyServices(train1, 'Train Crash');
  notifyEmergencyServices(train2, 'Train Crash');
  sendNotification(`Train ${train1.id} and train ${train2.id} have crashed. Emergency services have been notified.`);
};

module.exports = {
  handleBridgeDisaster,
  handleTrainStop,
  handleDerailment,
  handleTrainCrash
};
