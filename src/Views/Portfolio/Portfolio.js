import React, { useEffect, useRef, useState } from "react";
import "../../styles/CSS/Portfolio.css";
import ScrollArrow from "../../Components/ScrollArrow/ScrollArrow";
import PortfolioItem, {
  ModalPortfolioItem,
  PortfolioProvider,
} from "../../Components/PortfolioItem/PortfolioItem.jsx";
import PortfolioItems from "./PortfolioItems.jsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faDownLeftAndUpRightToCenter,
  faToggleOff,
  faToggleOn,
  faUpRightAndDownLeftFromCenter,
} from "@fortawesome/free-solid-svg-icons";
import FadeMenu from "../../Components/FadeMenu";
import FontAwesomeTextIcon from "../../Components/FontAwesomeTextIcon";

export default ({ color }) => {
  const [state, setState] = useState({
    showingModal: false,
    modalItem: null,
    hovered: false,
    hoveredIndex: 0,
    ignoreHovered: false,
    isCondensed: false,
    allowHoverFocus: true,
  });

  const elementInView = (el, percentageScroll = 0) => {
    if (el == undefined) return false;

    const elementTop = el.getBoundingClientRect().top;

    return elementTop >= percentageScroll;
  };

  const timer = useRef();
  const scrollingToward = useRef(true);
  const prevTop = useRef(0);
  useEffect(() => {
    console.log("effe");
    const handleScroll = (e) => {
      clearTimeout(timer.current);

      const el = document.querySelector(".portfolio");
      setState((s) => ({ ...s, ignoreHovered: true }));
      let curTop = el.getBoundingClientRect().top;

      if (curTop > 0 && curTop < prevTop.current) {
        scrollingToward.current = true;
      } else if (curTop > 0 && curTop > prevTop.current) {
        scrollingToward.current = false;
      } else if (curTop < 0 && curTop < prevTop.current) {
        scrollingToward.current = false;
      } else if (curTop < 0 && curTop > prevTop.current) {
        scrollingToward.current = true;
      }

      prevTop.current = curTop;

      timer.current = setTimeout(() => {
        setState((s) => ({ ...s, ignoreHovered: false }));
      }, 500);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearTimeout(timer.current);
      clearTimeout(delayTimer.current);
    };
  }, []);

  useEffect(() => {
    if (!state.allowHoverFocus && state.hovered)
      setState((s) => ({ ...s, hovered: false }));
  }, [state.allowHoverFocus]);

  const delayTimer = useRef();

  return (
    <PortfolioProvider>
      <ModalPortfolioItem
        color={color}
        item={state.modalItem}
        open={state.showingModal}
        handleClose={() =>
          setState({ ...state, showingModal: false, modalItem: null })
        }
      />
      <div
        style={{
          position: "fixed",
          left: 0,
          right: 0,
          top: 0,
          bottom: 0,
          backgroundColor: "rgba(0,0,0,.5)",
          opacity:
            (!state.ignoreHovered && state.hovered) || state.showingModal
              ? 0.9
              : 0,
          transition:
            state.ignoreHovered || !state.hovered
              ? "opacity 0s linear"
              : "opacity .15s linear 0s",
          pointerEvents: "none",
        }}
      />
      <div className="portfolio">
        <div className="content-grid">
          <div className="title">
            <h1
              style={{
                color:
                  (!state.ignoreHovered && state.hovered) || state.showingModal
                    ? "white"
                    : "black",
                transition:
                  state.ignoreHovered || !state.hovered
                    ? "color 0s linear"
                    : "color .15s linear 0s",
              }}
            >
              Portfolio
            </h1>
            <FontAwesomeTextIcon
              icon={
                state.isCondensed
                  ? faUpRightAndDownLeftFromCenter
                  : faDownLeftAndUpRightToCenter
              }
              text={state.isCondensed ? "Expand" : "Shrink"}
              style={{
                fontSize: "1.5rem",
                cursor: "pointer",
                fontWeight: 200,
                color:
                  (!state.ignoreHovered && state.hovered) || state.showingModal
                    ? "white"
                    : "black",
                transition:
                  state.ignoreHovered || !state.hovered
                    ? "color 0s linear"
                    : "color .15s linear 0s",
              }}
              onClick={() =>
                setState((s) => ({ ...s, isCondensed: !s.isCondensed }))
              }
            />
            <FontAwesomeTextIcon
              icon={state.allowHoverFocus ? faToggleOn : faToggleOff}
              text={
                state.allowHoverFocus ? "Hover Focus On" : "Hover Focus Off"
              }
              style={{
                fontSize: "1.5rem",
                cursor: "pointer",
                fontWeight: 200,
                color:
                  (!state.ignoreHovered && state.hovered) || state.showingModal
                    ? "white"
                    : "black",
                transition:
                  state.ignoreHovered || !state.hovered
                    ? "color 0s linear"
                    : "color .15s linear 0s",
              }}
              onClick={() =>
                setState((s) => ({ ...s, allowHoverFocus: !s.allowHoverFocus }))
              }
            />
          </div>

          <div className="portfolio-wrapper">
            {PortfolioItems.map((item, i) => {
              return (
                <PortfolioItem
                  key={"portfolio-item-" + i}
                  item={item}
                  onShowMore={() =>
                    setState({ ...state, showingModal: true, modalItem: item })
                  }
                  onShowLess={() =>
                    setState({ ...state, showingModal: false, modalItem: null })
                  }
                  isCondensed={state.isCondensed}
                  onHover={(hovered) => {
                    clearTimeout(delayTimer.current);

                    if (hovered || state.ignoreHovered) {
                      setState((s) => ({
                        ...s,
                        hovered: hovered,
                        hoveredIndex: i,
                      }));
                    } else {
                      delayTimer.current = setTimeout(() => {
                        setState((s) => ({
                          ...s,
                          hovered: hovered,
                          hoveredIndex: i,
                        }));
                      }, 250);
                    }
                  }}
                  modalOpen={state.showingModal}
                  isBlurred={
                    !state.ignoreHovered &&
                    state.hovered &&
                    state.hoveredIndex != i
                  }
                  allowHoverFocus={state.allowHoverFocus}
                  i={i}
                />
              );
            })}
          </div>
        </div>
        <ScrollArrow to=".about" />
      </div>
    </PortfolioProvider>
  );
};
