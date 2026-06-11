import { NavLink } from 'react-router-dom';

const Navbar = () => (
  <header className="navbar">
    <NavLink to="/" className="brand">
      <span className="brand-mark">BLW</span>
      <span>
        <strong>Expenditure Analysis</strong>
        <small>Banaras Locomotive Works</small>
      </span>
    </NavLink>
    <nav className="nav-links" aria-label="Primary navigation">
      <NavLink to="/" end>
        Dashboard
      </NavLink>
      <NavLink to="/overview">Overview</NavLink>
      <NavLink to="/settings">Settings</NavLink>
    </nav>
  </header>
);

export default Navbar;
