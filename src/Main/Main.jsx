import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Grid, Paper, TextField, Button, CircularProgress } from '@mui/material';
import { styled } from '@mui/system';
import './Main.css';
import { config } from './../env/env';

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

function Main() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(' ');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  function handlePasswordSubmit() {
    setLoading(true);

    fetch(`${config.apiUrl}api/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ password }),
    })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          const position = data.position;

          if (position === 'Керівник') {
            sessionStorage.setItem('hotelPassword', password);

            navigate('/admin/users');
          } else {
            const password = data.password;
            const name = `${data.name} ${data.surname}`;

            sessionStorage.setItem('hotelPosition', position);
            sessionStorage.setItem('hotelPassword', password);
            sessionStorage.setItem('hotelUserName', name);


            navigate('/employee/info');
          }
        } else {
          setError('Неправильний пароль');
        }
      })
      .catch(error => {
        console.error('Error:', error);
        setError('Сталася помилка при відправці запиту на сервер');
      })
      .finally(() => {
        setLoading(false);
      });
  }

  return (
    <Grid
      container
      justifyContent="center"
      alignItems="center"
      style={{ margin: '0 20px', width: 'calc(100% - 40px)', height: 'calc(80dvh - 46px)'}}
    >
        <Paper elevation={1} square>
          <div className='registration'>
            <StyledTextField
              label="Введіть пароль"
              variant="outlined"
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              helperText={error}
            />
            <Button
              variant="contained"
              onClick={handlePasswordSubmit}
              style={{ backgroundColor: '#47B972' }}
            >
              {loading ? <CircularProgress size={24} color="secondary" /> : 'Підтвердити пароль'}
            </Button>
          </div>
        </Paper>
    </Grid>
  )
}

export default Main;