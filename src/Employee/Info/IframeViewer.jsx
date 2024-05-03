import React, { useEffect, useRef, useState } from 'react';
import { Typography } from '@mui/material';
import { config } from './../../env/env';

function IframeViewer({ positionName }) {
  const [fileUrl, setFileUrl] = useState('');
  const iframeRef = useRef(null);

  useEffect(() => {
    const fetchPositionFile = async () => {
      try {
        const response = await fetch(`${config.apiUrl}api/positions/${encodeURIComponent(positionName)}/file`);
        if (!response.ok) {
          throw new Error('Failed to fetch position file');
        }
  
        const url = await response.text();
        setFileUrl(url);
      } catch (error) {
        console.error('Помилка при отриманні файлу позиції:', error);
      }
    };
  
    fetchPositionFile();
  }, [positionName]);

  useEffect(() => {
    const handleLoad = () => {
      const iframe = iframeRef.current;
      if (iframe) {
        const iframeDocument = iframe.contentDocument;
        if (iframeDocument) {
          const iframeImages = iframeDocument.querySelectorAll('img');
          iframeImages.forEach((img) => {
            img.style.width = '100%';
            img.style.height = 'auto';
          });
        }
      }
    };

    const iframe = iframeRef.current;
    if (iframe) {
      iframe.addEventListener('load', handleLoad);
      return () => {
        iframe.removeEventListener('load', handleLoad);
      };
    }
  }, [fileUrl]);
  
  return (
    <>
      {fileUrl ? (
        <iframe
          ref={iframeRef}
          title="embedded-document"
          srcDoc={fileUrl}
          style={{ width: '100%', height: '100vh', border: 'none' }}
        ></iframe>
      ) : (
        <Typography variant="body1">Завантаження...</Typography>
      )}
    </>
  );
}

export default IframeViewer;
