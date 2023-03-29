import React, { useEffect, useRef, useState } from "react";
import "../../styles/CSS/Transition.css";

const transitions = ["fade"];

export default (props) => {
  const { children, transitionType, visible, ...others } = props;

  const [state, setState] = useState({
    curTransitionState: "in",
    curTransitionType: "fade",
    renderChildren: true,
  });

  function toggleTransitionState() {
    let cur = "in";
    if (state.curTransitionState === "in") {
      cur = "out";
    }

    setState((state) => ({
      ...state,
      curTransitionState: cur,
    }));
  }

  useEffect(() => {
    if (
      transitionType !== undefined &&
      transitionType !== null &&
      transitions.includes(transitionType)
    )
      setState((state) => ({ ...state, curTransitionType: transitionType }));
  }, [transitionType]);

  useEffect(() => {
    if (visible !== undefined) {
      if (
        (state.curTransitionState === "in" && visible) ||
        (state.curTransitionState === "out" && !visible)
      )
        return;

      let s = "in";
      if (!visible) {
        s = "out";
      }

      document.body.scrollTop = document.documentElement.scrollTop = 0;

      setState((state) => ({
        ...state,
        curTransitionState: s,
      }));
    }
  }, [visible]);

  const className =
    "transition " + state.curTransitionType + " " + state.curTransitionState;

  const childrenWithProps = React.Children.map(children, (child, index) => {
    return React.cloneElement(child, { ...others });
  });

  return (
    <div
      className={className}
      onAnimationStart={() => {
        if (state.curTransitionState === "in") {
          setState((state) => ({ ...state, renderChildren: true }));
        }
      }}
      onAnimationEnd={() => {
        if (state.curTransitionState === "out") {
          setState((state) => ({ ...state, renderChildren: false }));
        }
      }}
    >
      {state.renderChildren ? childrenWithProps : null}
    </div>
  );
};
