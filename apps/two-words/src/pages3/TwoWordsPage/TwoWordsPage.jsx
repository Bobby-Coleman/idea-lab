import React, { Component } from 'react';
import './TwoWordsPage.css'
import IdeaBox from '../../components/IdeaBox/IdeaBox'
const randomWords = require('random-words');


export default class TwoWords extends Component {

  state = {
    wordOne: null,
    wordTwo: null,
  };

  getWords = () => {
    const words = randomWords({exactly: 2, maxLength: 7, formatter: (word)=> word.toUpperCase()})
    const wordOne = words[0]
    const wordTwo = words[1]
    this.setState({
      wordOne,
      wordTwo,
    })
  }
  
  componentDidMount() {
    this.getWords()
  }

  render() {

    return (
      <>
      <div className="two-words-idea-box">
        <div className="two-words-container">
            <div className="word">{this.state.wordOne}</div>
            <div className="word">{this.state.wordTwo}</div>
            <button onClick={this.getWords} className="btn">></button>
        </div>
        <IdeaBox 
        wordOne={this.state.wordOne} 
        wordTwo={this.state.wordTwo} 
        handleAddEntry={this.props.handleAddEntry}
        user={this.props.user}/>
      </div>
      </>
    );
  }
}