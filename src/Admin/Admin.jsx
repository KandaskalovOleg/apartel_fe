import { useEffect, useState } from 'react';
import { Grid } from '@mui/material';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Link } from '@mui/material';
import { styled } from '@mui/system';
import { config } from './../env/env';
import { CircularProgress } from '@mui/material';
import './Admin.css';

const StyledLink = styled(Link)({
  color: 'rgba(0, 0, 0, 0.6)',
  textDecoration: 'none',
  border: '1px solid rgba(0, 0, 0, 0.6)',
  padding: '10px 10px',
  borderRadius: '5px',
  boxSizing: 'border-box',
  fontWeight: 'bold',

  '&.active': {
    color: '#47B972',
    border: '1px solid #47B972',
  },
});

function Admin() {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function checkPassword() {
      try {
        const response = await fetch(`${config.apiUrl}api/checkPassword`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ password: sessionStorage.getItem('hotelPassword') }),
        });

        if (response.ok) {
          setLoading(false);
        } else {
          navigate('/');
        }
      } catch (error) {
        console.error('Error:', error);
        navigate('/');
      }
    }

    checkPassword();
  }, [navigate]);

  return (
    <Grid
      container
      style={{ flexDirection: 'column'}}
    >
      {loading ? (
        <CircularProgress style={{ margin: '20px auto' }} />
      ) : (
        <div className='navigation'>
          <StyledLink to="/admin/users" component={NavLink} >
            Користувачі
          </StyledLink>
          <StyledLink to="/admin/positions" component={NavLink} >
            Посади та питання
          </StyledLink>
        </div>
      )}
      <Outlet />
    </Grid>
  );
}

export default Admin;
