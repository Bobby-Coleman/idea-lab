import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import './IdeaBox.css'

export default class IdeaBox extends Component {

    state = {
        wordOne: '',
        wordTwo: '',
        title: '',
        entry: '',
    }

    handleChange = e => {
        this.setState({
            [e.target.name]: e.target.value,
        saved: false,
        })
        this.setState({
          wordOne: this.props.wordOne,
          wordTwo: this.props.wordTwo,
        })
    }

    handleSubmit = e => {
      e.preventDefault()
      this.props.handleAddEntry(this.state)
      this.setState({
        title: '',
        entry: '',
        saved: true,
      })
  }

  render() {

    let isLoggedIn = this.props.user;
    let AuthButton;
    let form;
    
    if (isLoggedIn) {
      AuthButton = <div>
      <button 
      className="btn btn-no-margin"
      type="submit"
      form="idea-form">
          Submit
      </button>
      {this.state.saved && <p className="idea-saved">Saved to your <Link to="/notebook">notebook</Link>.</p>}
      </div>

      form = <div className="idea-box">
      <form id="idea-form" onSubmit={this.handleSubmit}>
      <div className="entry-group">
          <input 
          className='entry-line'
          placeholder="Think of a title"
          name='title'
          type='text'
          value={this.state.title}
          onChange={this.handleChange}
          required
          >
          </input>
      </div>
      <div className="entry-group">
          <textarea
          className='entry-line'
          placeholder="Write your idea"
          name='entry'
          type='text'
          value={this.state.entry}
          onChange={this.handleChange}
          required
          rows="10" cols="40"
          >
          </textarea>
      </div>
  </form>
  </div>

    } else {
      AuthButton = 
      <div className="link-to-signup">
        <label>Want to save an idea?</label>
        <Link to="/signup" className="btn btn-margin">SIGNUP</Link>
      </div>

      form = <div className="idea-box idea-box-disabled">
      <form onSubmit={this.handleSubmit}>
      <div className="entry-group">
          <input disabled
          className='entry-line'
          placeholder="Think of a title"
          >
          </input>
      </div>
      <div className="entry-group">
          <textarea disabled
          className='entry-line'
          placeholder="Write your idea"
          rows="10" cols="40"
          >
          </textarea>
      </div>
      </form>
      </div>
    }

    return (
      <div>
       {form}
       {AuthButton}
      </div>
    );
  }
}