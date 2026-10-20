import React, { Component } from 'react';
import Typical from 'react-typical'
import { Link } from 'react-router-dom'
import './HomePage.css'

export default class Home extends Component {

  render() {
    return <div className="home-container">
        <div className="home-welcome-container">
          <div className="home-welcome">
          Block Writer's Block 
          </div>
        </div>
        <p className="home-intro">Creativity is the ability to connect the unconnected. 
            Thinking of good ideas is hard. Preconscieved notions about
            the world can get in the way. Two Words will allow new thoughts to be formed and
            new ideas born. Flip through each pairing of random words.
            Let your thoughts wander and write down whatever comes to mind, 
            and remember, don’t think too hard.
          </p>
          <p className="home-animation">
          Start writing ideas for the next best {' '}
          <Typical 
            className="home-animation-text"
            loop={Infinity}
            wrapper="b"
            steps={[
              "invention",
              1300,
              "art installation",
              1300,
              "song",
              1300,
              "fashion design",
              1300,
              "book idea",
              1300,
              "app", 
              1300,
              "game",
              1300,
              "pet name",
              1300,
            ]}
            />
          </p>
          <Link className="btn" to='/two-words'>GO</Link>
      </div>
  }
}