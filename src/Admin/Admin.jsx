import { Grid } from '@mui/material';
import { NavLink, Outlet } from 'react-router-dom';
import { Link } from '@mui/material';
import { styled } from '@mui/system';
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

  return (
    <Grid
      container
      style={{ flexDirection: 'column'}}
    >
      <div className='navigation'>
        <StyledLink to="/admin/users" component={NavLink} >
          Користувачі
        </StyledLink>
        <StyledLink to="/admin/positions" component={NavLink} >
          Посади та питання
        </StyledLink>
      </div>
      <Outlet />
    </Grid>
  );
}

export default Admin;
