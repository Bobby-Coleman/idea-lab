import React from 'react';
import { NavLink } from 'react-router-dom';

import './SideDrawer.css';

const sideDrawer = (props) => {

    let drawerClassNames = 'side-drawer';
    if (props.show) {
        drawerClassNames = 'side-drawer open'
    }

    let sideDrawer = props.user ? (
        <ul className="drawer-container">
            <NavLink to="/two-words" className="drawer-link" exact activeClassName="active-link">TWO WORDS</NavLink>
            <NavLink to="/notebook" className="drawer-link" exact activeClassName="active-link">NOTEBOOK</NavLink>
            <NavLink to="/" className="drawer-link" exact activeClassName="active-link">STORY</NavLink>
        </ul>
            ) : (
        <ul className="drawer-container">
            <NavLink to="/two-words" className="drawer-link" exact activeClassName="active-link">TWO WORDS</NavLink>
            <NavLink to="/" className="drawer-link" exact activeClassName="active-link">STORY</NavLink>
            <NavLink to="/login" className="drawer-link" exact activeClassName="active-link">LOGIN</NavLink>
            <NavLink to="/signup" className="drawer-link" exact activeClassName="active-link" >SIGN UP</NavLink>
        </ul>
    )

    return <nav className={drawerClassNames}>{sideDrawer}</nav>;
};

export default sideDrawer;