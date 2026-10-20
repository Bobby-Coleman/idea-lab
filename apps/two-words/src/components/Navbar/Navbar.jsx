import React from 'react';
import { NavLink } from 'react-router-dom';
import './Navbar.css';
import ToggleButton from '../SideDrawer/ToggleButton';

const Navbar = (props) => {
  let navbar = props.user ? (
      <header className="header">
        <nav className="navbar-container">
          <ul>
            <NavLink to="/two-words" className="nav-logo">TWO WORDS</NavLink>
            <NavLink to="/notebook" className="nav-link" exact activeClassName="active-nav-link">NOTEBOOK</NavLink>
            <NavLink to="/" className="nav-link" exact activeClassName="active-nav-link">STORY</NavLink>
            <span className="nav-username">{props.user.name}</span>
            <div className="nav-toggle-button">
              <ToggleButton click={props.drawerClickHandler}/>
            </div>
          </ul>
        </nav>
      </header>
    ) : (
      <header className="header">
        <nav className="navbar-container">
          <ul>
            <NavLink to="/two-words" className="nav-logo">TWO WORDS</NavLink>
            <NavLink to="/" className="nav-link" exact activeClassName="active-nav-link">STORY</NavLink>
            <NavLink to="/login" className="nav-link" exact activeClassName="active-nav-link">LOGIN</NavLink>
            <NavLink to="/signup" className="nav-link" exact activeClassName="active-nav-link">SIGN UP</NavLink>
            <div className="nav-toggle-button">
              <ToggleButton click={props.drawerClickHandler}/>
            </div>
          </ul>
        </nav>
      </header>
  );

  return <div className="header">{navbar}</div>;

}

export default Navbar
