'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { getDatabase, ref, onValue } from 'firebase/database';
import { database } from '@/firebaseConfig';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import 'leaflet/dist/leaflet.css';

import { Button } from '@/components/ui/button';
import {WebSocket} from 'ws';


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
  const [socket, setSocket] = useState<WebSocket | null>(null);

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
      ? 'https://realtime-rail-safety-simulation-alerts-application.vercel.app/stop-simulation'
      : 'https://realtime-rail-safety-simulation-alerts-application.vercel.app/start-simulation';

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      // Toggle the simulationRunning state
      setSimulationRunning(prev => !prev);

      if (simulationRunning) {
        // Stop the simulation
        if (socket) {
          socket.close();
          setSocket(null);
        }
        setTrains(trains.map(train => ({
          ...train,
          speed: 0,
          status: 'All clear',
          advisory: 'All clear',
        })));
      } else {
        // Start the simulation and initiate WebSocket connection
        initializeWebSocket();
      }
    } catch (error) {
      console.error('Error toggling simulation:', error);
    }
  };

  // WebSocket initialization function
  const initializeWebSocket = () => {
    // Close any existing connection
    if (socket) {
      socket.close();
    }

    // Initialize new WebSocket connection
    const newSocket = new WebSocket('wss://realtime-rail-safety-simulation-alerts-application.vercel.app');

    newSocket.onopen = () => {
      console.log('WebSocket connection opened');
    };

    newSocket.onmessage = (event) => {
      try {
        let messageData = event.data;

        // If data is a Buffer or ArrayBuffer, convert it to string
        if (typeof messageData !== 'string') {
          if (messageData instanceof ArrayBuffer) {
            // Convert ArrayBuffer to string
            messageData = new TextDecoder('utf-8').decode(new Uint8Array(messageData));
          } else if (Array.isArray(messageData)) {
            // Handle the case where messageData is an array of Buffers
            messageData = messageData.map(buffer => buffer.toString()).join('');
          } else if (typeof Buffer !== 'undefined' && messageData instanceof Buffer) {
            // Handle Node.js Buffer case
            messageData = messageData.toString('utf-8');
          } else {
            throw new Error('Unsupported message data type');
          }
        }

        const updatedTrains = JSON.parse(messageData);
        setTrains(updatedTrains);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    newSocket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    newSocket.onclose = () => {
      console.log('WebSocket connection closed');
    };

    // Update the state with the new WebSocket
    setSocket(newSocket);
  };

  // Cleanup WebSocket on component unmount
  useEffect(() => {
    return () => {
      if (socket) {
        socket.close();
      }
    };
  }, [socket]);

  // Cleanup WebSocket on component unmount
  useEffect(() => {
    return () => {
      if (socket) {
        socket.close();
      }
    };
  }, [socket]);

  // Cleanup WebSocket on component unmount
  useEffect(() => {
    return () => {
      if (socket) {
        socket.close();
      }
    };
  }, [socket]);

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