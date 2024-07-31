'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { getDatabase, ref, onValue } from 'firebase/database';
import { database } from '@/firebaseConfig';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import 'leaflet/dist/leaflet.css';

import { Button } from '@/components/ui/button';


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

const MapWithNoSSR = dynamic(() => import('../../components/TrainMap'), {
  ssr: false
});

const TrackTrainPage: React.FC = () => {
  const [trains, setTrains] = useState<Train[]>([
    { id: 'train1', name: 'Train 1', location: { latitude: 0, longitude: 0 }, speed: 0, status: 'All clear', advisory: 'All clear' },
    { id: 'train2', name: 'Train 2', location: { latitude: 0, longitude: 0 }, speed: 0, status: 'All clear', advisory: 'All clear' },
    { id: 'train3', name: 'Train 3', location: { latitude: 0, longitude: 0 }, speed: 0, status: 'All clear', advisory: 'All clear' }
  ]);
  const [selectedTrain, setSelectedTrain] = useState<Train | null>(null);
  const [simulationRunning, setSimulationRunning] = useState(false);

  useEffect(() => {
    const trainRefs = ['train1', 'train2', 'train3'].map(trainId => ref(database, `trains/${trainId}`));
    const unsubscribeFns = trainRefs.map((trainRef, index) =>
      onValue(trainRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          setTrains(prevTrains => {
            const updatedTrains = [...prevTrains];
            updatedTrains[index] = data;
            return updatedTrains;
          });
        }
      })
    );

    return () => unsubscribeFns.forEach(unsubscribe => unsubscribe());
  }, []);

  const handleTrainClick = (train: Train) => {
    setSelectedTrain(train);
  };

  const handleSimulationToggle = async () => {
    const url = simulationRunning
      ? 'https://realtime-rail-safety-simulation-alerts-application-kdsec2d9i.vercel.app/stop-simulation'
      : 'https://realtime-rail-safety-simulation-alerts-application-kdsec2d9i.vercel.app/start-simulation';

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      setSimulationRunning(!simulationRunning);

      if (!simulationRunning) {
        setTrains(trains.map(train => ({
          ...train,
          speed: 0,
          status: 'All clear',
          advisory: 'All clear'
        })));
      }
    } catch (error) {
      console.error('Error toggling simulation:', error);
    }
  };

  return (
    <div className="flex h-screen">
      <div className="w-1/4 p-4 bg-white overflow-y-auto">
        <div className='flex justify-center items-center'>
          <Button 
            onClick={handleSimulationToggle}
            style={{
              backgroundColor: simulationRunning ? 'red' : 'blue',
              color: 'white'
            }}
          >
            {simulationRunning ? 'Stop Simulation' : `Start Simulation`}
          </Button>
        </div>
        <h2 className="text-lg font-bold mb-4">Train Details</h2>
        {trains.map(train => (
          <Card key={train.id} onClick={() => handleTrainClick(train)} className="mb-4">
            <CardHeader className="cursor-pointer">
              <h2 className="text-lg font-bold">{train.name}</h2>
            </CardHeader>
            <CardContent>
              <p>Speed: {train.speed.toFixed(2)} km/h</p>
              <p>Status: <span className={`status-indicator ${train.status.toLowerCase()}`}/>{train.status}</p>
              <p>Advisory: {train.advisory}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="w-3/4 h-screen">
        <MapWithNoSSR trains={trains} selectedTrain={selectedTrain} />
      </div>
    </div>
  );
};

export default TrackTrainPage;