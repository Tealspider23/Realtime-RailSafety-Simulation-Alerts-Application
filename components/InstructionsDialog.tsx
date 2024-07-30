'use client'
import React, { useState } from 'react';

const InstructionsDialog = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDialog = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div>
      <h2>Instructions</h2>
      <button onClick={toggleDialog}>Show Instructions</button>
      {isOpen && (
        <div>
          <h3>Disaster Instructions</h3>
          <p>1. Remain calm and follow the emergency procedures.</p>
          <p>2. Contact emergency services if necessary.</p>
          <p>3. Follow the instructions of the authorities.</p>
          <button onClick={toggleDialog}>Close</button>
        </div>
      )}
    </div>
  );
};

export default InstructionsDialog;
