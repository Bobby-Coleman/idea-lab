import React, { Component } from 'react'
import { NavLink, Link } from 'react-router-dom'
import userService from '../../utils/userService'
import RobotImg from '../../images/RobotImg.svg'

class SignupForm extends Component {

    state = {
        name: '',
        email: '',
        password: '',
        passwordConf: ''
    }

    handleChange = (e) => {
        this.props.updateMessage('')
        this.setState({
            [e.target.name]: e.target.value
        })
    }

    handleSubmit = async(e) => {
        e.preventDefault()
        try {
            await userService.signup(this.state)
            this.props.handleSignupOrLogin();
            this.props.history.push('/two-words');
        } catch (err) {
            this.props.updateMessage(err.message)
        }
    }

    isFormInvalid() {
        return !(this.state.name && this.state.email && this.state.password === this.state.passwordConf)
    }
    
    render() {

        return (
            <div className="signup-shadow"> 
              <div className="form-container">
                 <div className="header-group">
                    <Link className="signup-btn" to='/login'>LOGIN</Link>
                    <NavLink 
                    className="signup-btn" 
                    activeClassName="active-link"
                     to='/signup'>
                        SIGNUP
                    </NavLink>
                </div>
                <div className="robot-img">
                    <img src={RobotImg} alt="Robot"/>
                </div>
                <form onSubmit={this.handleSubmit}>
                    <div className='form signup'>
                        <div className='form-group'>
                        <label htmlFor="password">Name</label>
                            <input 
                                className='form-line' 
                                type='text' 
                                placeholder='Name' 
                                value={this.state.name} 
                                name='name' 
                                onChange={this.handleChange} 
                            />
                        </div>
                        <div className='form-group'>
                        <label htmlFor="password">Email</label>
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
                                value={this.state.password} 
                                name='password' 
                                onChange={this.handleChange} 
                            />
                        </div>
                        <div className='form-group'>
                            <label htmlFor="password">Confirm Password</label>
                            <input 
                                className='form-line' 
                                type='password' 
                                placeholder='Confirm Password' 
                                value={this.state.passwordConf} 
                                name='passwordConf' 
                                onChange={this.handleChange}
                            />
                        </div>
                        <div className='form-links'>
                            <Link className="btn-cancel" to='/'>Cancel</Link>
                            <button className="btn" disabled={this.isFormInvalid()}>Sign Up</button>
                        </div>
                    </div>
                </form>
            </div>
          </div>
        )
    }
}

export default SignupForm