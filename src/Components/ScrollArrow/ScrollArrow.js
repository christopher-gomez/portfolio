import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons";
import { toElement as scrollToElement } from "../../util/scroll";
import "../../styles/CSS/ScrollArrow.css";

export default class ScrollArrow extends React.Component {
  scrollToNext() {
    const to = this.props.to;
    const element = document.querySelector(to);
    scrollToElement(element);
  }
  render() {
    return (
      <div className="scroll" onClick={() => this.scrollToNext()}>
        <div className="arrow bounce">
          {this.props.text && (
            <div className="scroll-text">{this.props.text}</div>
          )}

          {this.props.prev ? (
            <FontAwesomeIcon
              style={{ color: "var(--text-color)" }}
              icon={faChevronUp}
              size="2x"
            />
          ) : (
            <FontAwesomeIcon
              style={{ color: "var(--text-color)" }}
              icon={faChevronDown}
              size="2x"
            />
          )}
        </div>
      </div>
    );
  }
}
