import Logo from './../public/logo.jpg';
import './App.css';
import { Outlet } from 'react-router-dom';
import { Link } from 'react-router-dom';

function App() {

  return (
    <>
      <header className='header'>
        <div className='logo-wrapper'>
          <Link to="/">
           <img src={Logo} className="logo" alt="logo" />
          </Link>
        </div>
      </header>
      <main>
        <Outlet />
      </main>
    </>
  )
}

export default App;
