import React from "react";
import "../../styles/CSS/Slideshow.css";

export default class Slideshow extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      slides: React.Children.toArray(this.props.children),
      slideIndex: 0,
    };
  }
  goNext() {
    let index = this.state.slideIndex;
    this.showSlide(++index);
  }
  goPrev() {
    let index = this.state.slideIndex;
    this.showSlide(--index);
  }
  showSlide(n) {
    let slideIndex = this.state.slideIndex;
    if (n >= this.state.slides.length) {
      slideIndex = 0;
    } else if (n < 0) {
      slideIndex = this.state.slides.length - 1;
    } else {
      slideIndex = n;
    }
    this.setState({ slideIndex: slideIndex });
  }
  render() {
    let elems = this.state.slides;
    let slides,
      dots = null;
    if (elems.length > 0) {
      slides = elems.map((elem, index) => {
        return (
          <div
            className="mySlides fade"
            style={{
              display: index === this.state.slideIndex ? "block" : "none",
            }}
            key={"slideshow-item-" + index}
          >
            {elem}
          </div>
        );
      });
      dots = elems.map((elem, index) => {
        return (
          <span
            className={this.state.slideIndex === index ? "dot active" : "dot"}
            onClick={() => this.showSlide(index)}
            key={"slideshow-dot" + index}
          ></span>
        );
      });
    } else {
      slides = (
        <div className="mySlides">Add Some Slides as Component Children</div>
      );
    }
    return (
      <div className="slideshow">
        <div className="slideshow-container">
          {slides}
          <a className="prev" onClick={() => this.goPrev()}>
            &#10094;
          </a>
          <a className="next" onClick={() => this.goNext()}>
            &#10095;
          </a>
        </div>
        <br />

        <div className="dot-container">{dots}</div>
      </div>
    );
  }
}
