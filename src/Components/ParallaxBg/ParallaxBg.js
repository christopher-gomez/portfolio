import React from 'react';
import '../../styles/CSS/ParallaxBg.css';

export default class ParallaxBg extends React.Component {
  render() {
    return (
      <div className="parallax">
        <div id="stars1" />
        <div id="stars2" />
        <div id="stars3" />
      </div>
    );
  }
}