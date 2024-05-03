import {
  HashRouter as Router,
  Routes,
  Route,
  Navigate
} from 'react-router-dom';
import App from './App';
import Main from './Main/Main';
import Admin from './Admin/Admin';
import User from './Employee/User';
import Users from './Admin/Users/Users';
import Positions from './Admin/Positions/Positions';
import Info from './Employee/Info/Info';
import Tasks from './Employee/Tasks/Tasks';
import AdditionalTests from './Employee/Additional/AdditionalTests';

export const Root = () => (
  <Router>
    <Routes>
      <Route path="/" element={<App />}>
        <Route index element={<Main />} />
        
        <Route path="admin" element={<Admin />}>
          <Route path="users" element={<Users />} />
          <Route path="positions" element={<Positions />} />
        </Route>

        <Route path="employee" element={<User />}>
          <Route path="info" element={<Info />} />
          <Route path="tasks" element={<Tasks />} />
          <Route path="additional" element={<AdditionalTests />} />
        </Route>

        <Route path="*" element={<Navigate to="/" />} />
      </Route>
    </Routes>
  </Router>
);