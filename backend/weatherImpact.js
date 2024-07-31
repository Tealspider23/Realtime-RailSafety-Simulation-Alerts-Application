// weatherImpact.js
const weatherConditions = ['Clear', 'Rain', 'Storm', 'Fog'];

const getWeatherImpact = () => {
  const condition = weatherConditions[Math.floor(Math.random() * weatherConditions.length)];
  let impact;

  switch (condition) {
    case 'Clear':
      impact = 1.0; // No impact
      break;
    case 'Rain':
      impact = 0.8; // 20% speed reduction
      break;
    case 'Storm':
      impact = 0.5; // 50% speed reduction
      break;
    case 'Fog':
      impact = 0.7; // 30% speed reduction
      break;
    default:
      impact = 1.0; // Default to no impact
  }

  return { condition, impact };
};

module.exports = { getWeatherImpact };
