'use client';

import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { TiWeatherPartlySunny } from "react-icons/ti";
import { MdQuestionMark } from "react-icons/md";
import { BiPlusMedical } from "react-icons/bi";
import WeatherChecker from '@/components/WeatherChecker'; // Import WeatherChecker component


//components/ui
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription
} from './ui/dialog';
import InstructionsDialog from './InstructionsDialog';

const startSimulation = async () => {
  try {
    const response = await fetch('http://localhost:3000/start-simulation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      console.log('Simulation started.');
    } else {
      console.error('Failed to start simulation.');
    }
  } catch (error) {
    console.error('Error starting simulation:', error);
  }
};

interface Train {
  id: string;
  name: string;
  location: {
    latitude: number;
    longitude: number;
  };
  speed: number;
  status: string;
  advisory: string;
}

interface TrainMapProps {
  trains: Train[];
  selectedTrain: Train | null;
}

const TrainMap: React.FC<TrainMapProps> = ({ trains, selectedTrain }) => {
  const mapRef = useRef<any>(null);
  const [mapInitialized, setMapInitialized] = useState(false);

  const [weatherOpen, setWeatherOpen] = useState(false);
  const [emergencyOpen, setEmergencyOpen] = useState(false);
  const [instructionsOpen, setInstructionsOpen] = useState(false);
  const [weather, setWeather] = useState<any>(null); // State to store weather data

  useEffect(() => {
    setMapInitialized(true);
  }, []);

  useEffect(() => {
    if (selectedTrain && mapRef.current) {
      const { latitude, longitude } = selectedTrain.location;
      mapRef.current.setView([latitude, longitude], 15, { animate: true });
    }
  }, [selectedTrain]);

  const fetchWeather = async (location: string) => {
    // Weather API to fetch weather
    // Mocked response for demonstration
    const response = {
      temperature: 25,
      condition: 'Sunny'
    };
    setWeather(response);
  };

  if (!mapInitialized) {
    return null; // or a loader/spinner
  }

  return (
    <div style={{ position: 'relative', height: '100%', width: '100%' }}>
      <MapContainer center={[20.2961, 85.8245]} zoom={13} style={{ height: '100%', width: '100%', zIndex: 1 }} ref={mapRef}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {trains.map(train => (
          <Marker
            key={train.id}
            position={[train.location.latitude, train.location.longitude]}
            icon={L.icon({
              iconUrl: 'https://img.icons8.com/?size=100&id=53163&format=png&color=000000',
              iconSize: [30, 30],
              popupAnchor: [-3, -76],
            })}
          >
            <Popup>
              <div>
                <h2 className='font-bold'>{train.name}</h2>
                <p>Speed: {train.speed.toFixed(2)} km/h</p>
                <p>Status: <span className={`status-indicator ${train.status.toLowerCase()}`} />{train.status}</p>
                <p>Advisory: {train.advisory}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      <div style={{ position: 'absolute', top: 10, right: 150, display: 'flex', gap: '10px', zIndex: 1000 }}>
        <Button className='bg-blue-500' onClick={() => setWeatherOpen(true)}><TiWeatherPartlySunny className='w-6 h-6' /></Button>
        <Dialog open={weatherOpen} onOpenChange={setWeatherOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Weather Still in Development</DialogTitle>
            <DialogDescription>
              <WeatherChecker />
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setWeatherOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>
      <div style={{ position: 'absolute', top: 10, right: 250, display: 'flex', gap: '10px', zIndex: 1000 }}>
        <Button className='bg-red-600' onClick={() => setEmergencyOpen(true)}><BiPlusMedical className='h-7 w-7' /></Button>
        <Dialog open={emergencyOpen} onOpenChange={setEmergencyOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Contact Emergency</DialogTitle>
              <DialogDescription>
                {/* Emergency contact information content */}
                Call 108
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button onClick={() => setEmergencyOpen(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <div style={{ position: 'absolute', top: 10, right: 50, display: 'flex', gap: '10px', zIndex: 1000 }}>
        <Button className='bg-yellow-300' onClick={() => setInstructionsOpen(true)}><MdQuestionMark className='w-7 h-7 text-black' /></Button>
        <Dialog open={instructionsOpen} onOpenChange={setInstructionsOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Instructions</DialogTitle>
              <DialogDescription>
                <li>Simulate to see the Train on the Tracks</li>
                <li>Click on the Train to see the details</li>
                <li>Click on the Weather icon to see the Weather</li>
                <li>Click on the Emergency icon to see the Emergency Contact</li>

              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button onClick={() => setInstructionsOpen(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default TrainMap;
