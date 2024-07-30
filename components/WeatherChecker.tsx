'use client';

import React, { useState } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';
require('dotenv').config();


const WeatherChecker = () => {
  const [location, setLocation] = useState('');
  const [weather, setWeather] = useState<any>(null);

  const fetchWeather = async () => {
    const apiKey = process.env.TRAIN_SIMU_WEATHER; // Replace with your OpenWeather API key
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${apiKey}&units=metric`;

    try {
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        const weatherData = {
          temperature: data.main.temp,
          condition: data.weather[0].description,
        };
        setWeather(weatherData);
      } else {
        console.error('Failed to fetch weather data.');
        setWeather(null);
      }
    } catch (error) {
      console.error('Error fetching weather data:', error);
      setWeather(null);
    }
  };

  return (
    <div>
      <Input
        type='text'
        placeholder='Enter Location'
        value={location}
        onChange={(e) => setLocation(e.target.value)}
      />
      <Button onClick={fetchWeather}>
        Check Weather
      </Button>
      {weather && (
        <div>
          <p>Temperature: {weather.temperature} °C</p>
          <p>Condition: {weather.condition}</p>
        </div>
      )}
    </div>
  );
};

export default WeatherChecker;
