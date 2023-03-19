import React from 'react';
import { toTop as scrollToPageTop } from '../../util/scroll';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAngleDoubleUp } from '@fortawesome/free-solid-svg-icons';

import '../../styles/CSS/ScrollTop.css';

export default class ScrollTop extends React.Component {
  constructor(props) {
    super(props);
    this.handleScroll = this.handleScroll.bind(this);
    this.state = {
      shouldShowScrollTopArrow: false
    };
  }

  handleScroll() {
    const boundingRect = ((document || {}).documentElement || {})
      .getBoundingClientRect;
    if (boundingRect) {
      if (document.documentElement.getBoundingClientRect().top * -1 > 100)
        this.setState({ shouldShowScrollTopArrow: true });
      else this.setState({ shouldShowScrollTopArrow: false });
    }
  }

  componentDidMount() {
    window.addEventListener('scroll', this.handleScroll);
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.handleScroll);
  }

  render() {
    const hideArrowClass = this.state.shouldShowScrollTopArrow ? '' : 'hide';
    return (
      <div className="scroll-top" onClick={(e) => scrollToPageTop()}>
        <div
          className={`arrow ${hideArrowClass}`}
          style={{ color: 'var(--text-color)' }}
        >
          <FontAwesomeIcon icon={faAngleDoubleUp} size='2x' />
          <div className="to-top">To Top</div>
        </div>
      </div>
    );
  }
}
