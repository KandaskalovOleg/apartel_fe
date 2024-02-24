import { useState, useEffect } from 'react';
import { Typography } from '@mui/material';
import { config } from './../../env/env';
import './Info.css';

function Info() {
  const [positionInfo, setPositionInfo] = useState('');

  useEffect(() => {
    const fetchPositionInfo = async () => {
      try {
        const positionName = sessionStorage.getItem('hotelPosition');
        const response = await fetch(`${config.apiUrl}api/positions/${encodeURIComponent(positionName)}`);
        if (!response.ok) {
          throw new Error('Failed to fetch position info');
        }
        const data = await response.json();
        setPositionInfo(data.html);
      } catch (error) {
        console.error('Помилка при отриманні інформації про позицію:', error);
      }
    };

    fetchPositionInfo();
  }, []);

  return (
    <div style={{width: '100%'}}>
      <Typography variant="h3" gutterBottom>
        Інформація
      </Typography> 
      <div className='info' dangerouslySetInnerHTML={{ __html: positionInfo }} />
    </div>
  );
}

export default Info;
