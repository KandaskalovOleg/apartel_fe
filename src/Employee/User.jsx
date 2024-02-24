import { useEffect } from 'react';
import { Grid } from '@mui/material';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Link } from '@mui/material';
import { styled } from '@mui/system';
import './User.css';

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

function Employee() {
  const navigate = useNavigate();

  useEffect(() => {
    const position = sessionStorage.getItem('hotelPosition');
    const password = sessionStorage.getItem('hotelPassword');
    if (!password || !position) {
      navigate('/');
    }
  }, [navigate]);

  return (
    <Grid
      container
      style={{ margin: '0', flexDirection: 'column'}}
    >
      <div className='navigation'>
        <StyledLink to="info" component={NavLink} >
          Інформація
        </StyledLink>
        <StyledLink to="tasks" component={NavLink} >
          Тест
        </StyledLink>
      </div>
      <Outlet />
    </Grid>
  );
}

export default Employee;
