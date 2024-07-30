import React from 'react'
import { Button } from './ui/button';

const EmergencyServices = () => {

const handleContactEmergency = () =>{
    alert('Contacting Emergency Services...');
}

  return (
    <div>
        <h2>Emergency Services</h2>
        <Button onClick={handleContactEmergency}>
            Contact Emergency
        </Button>
    </div>
  )
}

export default EmergencyServices