import { Typography } from '@mui/material';
import './Info.css';
import IframeViewer from './IframeViewer';

function Info() {
  const userName = sessionStorage.getItem('hotelUserName');
  const positionName = sessionStorage.getItem('hotelPosition');

  return (
    <div style={{ width: '100%', overflow: 'hidden', wordWrap: 'break-word' }}>
      <Typography variant="h3" gutterBottom>Вітаємо {userName}!</Typography>
      <Typography variant="h3" gutterBottom>Інформація</Typography>
      <IframeViewer positionName={positionName} />
    </div>
  );
}

export default Info;
