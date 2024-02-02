import Logo from './../public/logo.jpg';
import './App.css';
import { Outlet } from 'react-router-dom';

function App() {

  return (
    <>
      <header className='header'>
        <div className='logo-wrapper'>
          <a href="/">
           <img src={Logo} className="logo" alt="logo" />
          </a>
        </div>
      </header>
      <main>
        <Outlet />
      </main>
    </>
  )
}

export default App;
