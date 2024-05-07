import React, { useState } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, CircularProgress, TextField } from '@mui/material';
import { config } from '../env/env';
import { useNavigate } from 'react-router-dom';
import { styled } from '@mui/system';

const StyledTextField = styled(TextField)({
  '& label.Mui-focused': {
    color: '#47B972',
  },
  '& .MuiOutlinedInput-root': {
    '&:hover fieldset': {
      borderColor: '#47B972',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#47B972',
    },
  },
});

function ChangePasswordDialog({ open, onClose }) {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleClose = () => {
    setOldPassword('');
    setNewPassword('');
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
  
    if (newPassword.length < 8) {
      setError('Пароль повинен містити принаймні 8 символів');
      setLoading(false);
      return;
    }
  
    try {
      const response = await Promise.race([
        fetch(`${config.apiUrl}api/changeMainPassword`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ oldPassword, newPassword }),
        }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Таймаут запиту')), 3000) 
        ),
      ]);
  
      if (response.ok) {
        navigate('/');
      } else {
        const data = await response.json();
        setError(data.message);
      }
    } catch (error) {
      console.error('Error:', error);
      navigate('/');
    } finally {
      setLoading(false);
    }
  };  

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Зміна пароля</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Введіть старий та новий паролі:
        </DialogContentText>
        <form onSubmit={handleSubmit}>
          <StyledTextField
            autoFocus
            margin="dense"
            id="oldPassword"
            label="Старий пароль"
            type="password"
            fullWidth
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
          />
          <StyledTextField
            margin="dense"
            id="newPassword"
            label="Новий пароль"
            type="password"
            fullWidth
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          {error && <p style={{ color: 'red' }}>{error}</p>}
          {loading ? (
            <CircularProgress />
          ) : (
            <DialogActions>
              <Button 
                type="submit" 
                color="primary"
                style={{ backgroundColor: '#47B972', margin: '20px auto 0', maxWidth: '300px', color: '#fff'}}
              >Змінити пароль</Button>
            </DialogActions>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default ChangePasswordDialog;
