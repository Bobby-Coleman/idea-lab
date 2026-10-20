import React, { Component } from 'react'
import { NavLink, Link } from 'react-router-dom'
import userService from '../../utils/userService'
import './RegistrationPages.css'
import RobotImg from '../../images/RobotImg.svg'

class LoginPage extends Component {

    state = {
        email: '',
        pw: '',
        err: '',
    }

    handleChange = (e) => {
        this.setState({
            [e.target.name]: e.target.value
        })
    }

    updateMessage = (err) => {
        this.setState({ err })
    }

    handleSubmit = async(e) => {
        e.preventDefault()
        try {
            await userService.login(this.state)
            this.props.handleSignupOrLogin();
            this.props.history.push('/two-words');
        } catch (err) {
            this.updateMessage(err.message)
        }
    }

    render() {
        return (
        <div className="register">
          <div className="box-shadow"> 
            <div className="form-container">
                <div className="header-group">
                    <NavLink 
                    className="signup-btn" 
                    activeClassName="active-link" 
                    to='/login'>
                        LOGIN
                    </NavLink>
                    <Link 
                    className="signup-btn"
                     to='/signup'>
                        SIGNUP
                    </Link>
                </div>
                <div className="robot-img">
                    <img src={RobotImg} alt="Robot"/>
                </div>
                <form onSubmit={this.handleSubmit}>
                    <div className='form-login'>
                        <div className='form-group'>
                            <label htmlFor="Email">Email</label>
                            <input 
                                className='form-line' 
                                type='email' 
                                placeholder='Email' 
                                value={this.state.email} 
                                name='email' 
                                onChange={this.handleChange}
                            />
                        </div>
                        <div className='form-group'>
                            <label htmlFor="password">Password</label>
                            <input 
                                className='form-line' 
                                type='password' 
                                placeholder='Password' 
                                value={this.state.pw} 
                                name='pw' 
                                onChange={this.handleChange}
                            />
                        </div>
                        <div className='form-links'>
                            <Link className="btn-cancel" to='/'>Cancel</Link>
                            <button className="btn">Login</button>
                        </div>
                    </div>
                </form>
            </div>
          </div>
        <div className="err-msg">{this.state.err}</div>
        </div>
        )
    }
}

export default LoginPage