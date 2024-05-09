import { useEffect, useState } from 'react';
import { Grid, Button } from '@mui/material';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Link } from '@mui/material';
import { styled } from '@mui/system';
import { config } from './../env/env';
import { CircularProgress } from '@mui/material';
import ChangePasswordDialog from './ChangePasswordDialog';
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

const ChangePasswordButton = styled(Button)({
  position: 'fixed',
  top: '20px',
  right: '20px',
  backgroundColor: '#47B972',
  color: '#fff',
  zIndex: '1000',
  '&:hover': {
    backgroundColor: '#47B972',
    boxShadow: '0px 2px 4px -1px rgba(0, 0, 0, 0.2), 0px 4px 5px 0px rgba(0, 0, 0, 0.14), 0px 1px 10px 0px rgba(0, 0, 0, 0.12)',
  },
});

function Admin() {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [openChangePasswordDialog, setOpenChangePasswordDialog] = useState(false);

  useEffect(() => {
    const password = sessionStorage.getItem('hotelPassword');
    const owner = sessionStorage.getItem('hotelOwner');
    if (!password || !owner) {
      navigate('/');
    }
    setLoading(false);
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
            Користувачі та інформація
          </StyledLink>
          <StyledLink to="/admin/positions" component={NavLink} >
            Посади та питання
          </StyledLink>
        </div>
      )}
      <Outlet />
      <ChangePasswordButton onClick={() => setOpenChangePasswordDialog(true)}>
        Змінити пароль
      </ChangePasswordButton>
      <ChangePasswordDialog
        open={openChangePasswordDialog}
        onClose={() => setOpenChangePasswordDialog(false)}
      />
    </Grid>
  );
}

export default Admin;
