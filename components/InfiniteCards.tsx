'use client';

import React from 'react';
import { motion } from 'framer-motion';

const cardData = [
  { id: 1, title: 'Real-time Tracking' },
  { id: 2, title: 'Safety Alerts' },
  { id: 3, title: 'Route Optimization' },
  { id: 4, title: 'Accident Prevention' },
];

const InfiniteCards: React.FC = () => {
  return (
    <div className="overflow-hidden whitespace-nowrap">
      <motion.div
        animate={{ x: [0, -1000] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        className="flex"
      >
        {cardData.map((card) => (
          <div key={card.id} className="p-4 bg-white rounded-lg shadow-md mx-4 w-64">
            <h3 className="text-lg font-bold">{card.title}</h3>
          </div>
        ))}
      </motion.div>
    </div>
  );
};

export default InfiniteCards;
