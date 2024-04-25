import React, { useEffect, useRef, useState } from "react";
import "../../styles/CSS/Portfolio.css";
import ScrollArrow from "../../Components/ScrollArrow/ScrollArrow.js";
import PortfolioItem, {
  ModalPortfolioItem,
  // PortfolioProvider,
} from "../../Components/PortfolioItem/PortfolioItem.jsx";
import PortfolioItems from "./PortfolioItems.js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faDownLeftAndUpRightToCenter,
  faToggleOff,
  faToggleOn,
  faUpRightAndDownLeftFromCenter,
  faTimeline,
  faArrowsUpDown,
  faArrowsLeftRight,
} from "@fortawesome/free-solid-svg-icons";
import FadeMenu from "../../Components/FadeMenu/index.jsx";
import FontAwesomeTextIcon from "../../Components/FontAwesomeTextIcon/index.jsx";
import ColorCharacters from "../../Components/GlowingText/ColorCharacters.jsx";
import HorizontalTimeline from "../../Components/HorizontalTimeline/index.jsx";
import DashboardIcon from "@mui/icons-material/Dashboard";
import { IconButton, Tooltip, Button, Typography } from "@mui/material";
import VerticalTimeline from "../../Components/VerticalTimeline/index.jsx";

export default ({ color, onCardHover, isDrawing, drawX, hack }) => {
  const [state, setState] = useState({
    showingModal: false,
    modalItem: null,
    hovered: false,
    hoveredIndex: 0,
    ignoreHovered: false,
    isCondensed: false,
    allowHoverFocus: false,
  });

  const timer = useRef();
  const scrollingToward = useRef(true);
  const prevTop = useRef(0);
  const delayTimer = useRef();

  useEffect(() => {
    // const handleScroll = (e) => {
    //   clearTimeout(timer.current);

    //   const el = document.querySelector(".portfolio");
    //   setState((s) => ({ ...s, ignoreHovered: true }));

    //   if (onCardHover) onCardHover(false);

    //   let curTop = el.getBoundingClientRect().top;

    //   if (curTop > 0 && curTop < prevTop.current) {
    //     scrollingToward.current = true;
    //   } else if (curTop > 0 && curTop > prevTop.current) {
    //     scrollingToward.current = false;
    //   } else if (curTop < 0 && curTop < prevTop.current) {
    //     scrollingToward.current = false;
    //   } else if (curTop < 0 && curTop > prevTop.current) {
    //     scrollingToward.current = true;
    //   }

    //   prevTop.current = curTop;

    //   timer.current = setTimeout(() => {
    //     setState((s) => ({ ...s, ignoreHovered: false }));
    //   }, 500);
    // };

    // window.addEventListener("scroll", handleScroll);
    return () => {
      // window.removeEventListener("scroll", handleScroll);
      clearTimeout(timer.current);
      clearTimeout(delayTimer.current);
    };
  }, []);

  useEffect(() => {
    if (!state.allowHoverFocus && state.hovered)
      setState((s) => ({ ...s, hovered: false }));
  }, [state.allowHoverFocus]);

  useEffect(() => {
    if (onCardHover && !state.ignoreHovered) onCardHover(state.hovered);
  }, [state.hovered]);

  useEffect(() => {
    if (!state.ignoreHovered && state.hovered) {
      if (onCardHover) onCardHover(true);
    }
  }, [state.ignoreHovered]);

  const [view, setView] = useState("timeline");
  const [timelineSubView, setTimelineSubView] = useState("vertical");

  const containerRef = useRef(null);

  const [sContainerRef, setSContainerRef] = useState(null);

  const [items, setItems] = useState(PortfolioItems);

  useEffect(() => {
    setSContainerRef(containerRef.current);
  }, [containerRef]);

  const [cards, setCards] = useState([]);
  useEffect(() => {
    const cards = PortfolioItems.map((item, i) => {
      const cardComponent = (
        <>
          {view === "timeline" && i % 2 === 1 && (
            <div
              style={{
                height: "5em",
                margin: "0 1.5em",
                display: "flex",
                flexFlow: "row",
                alignContent: "end",
                justifyContent: "end",
                alignItems: "end",
              }}
            >
              <p style={{ fontWeight: "bold", fontStyle: "italic" }}>
                {item.time}
              </p>
            </div>
          )}
          <PortfolioItem
            key={"portfolio-item-" + i}
            item={item}
            onShowMore={() =>
              setState((state) => ({
                ...state,
                showingModal: true,
                modalItem: item,
              }))
            }
            onShowLess={() =>
              setState((state) => ({
                ...state,
                showingModal: false,
                modalItem: null,
              }))
            }
            isCondensed={view === "timeline" || state.isCondensed}
            // onHover={(hovered) => {
            //   clearTimeout(delayTimer.current);

            //   if (hovered || state.ignoreHovered) {
            //     setState((s) => ({
            //       ...s,
            //       hovered: hovered,
            //       hoveredIndex: i,
            //     }));
            //   } else {
            //     delayTimer.current = setTimeout(() => {
            //       setState((s) => ({
            //         ...s,
            //         hovered: hovered,
            //         hoveredIndex: i,
            //       }));
            //     }, 250);
            //   }
            // }}
            modalOpen={state.showingModal}
            allowHoverFocus={state.allowHoverFocus}
          />
          {view === "timeline" && i % 2 === 0 && (
            <div
              style={{
                height: "5em",
                margin: "0 1.5em",
                display: "flex",
                flexFlow: "row",
              }}
            >
              <p style={{ fontWeight: "bold", fontStyle: "italic" }}>
                {item.time}
              </p>
            </div>
          )}
        </>
      );
      if (view === "timeline") return <div>{cardComponent}</div>;
      else return cardComponent;
    });

    setCards(cards);
    setItems(PortfolioItems);
  }, [view, state.isCondensed]);

  return (
    <>
      {/* <PortfolioProvider> */}
      {state.modalItem && (
        <ModalPortfolioItem
          color={color}
          item={state.modalItem}
          open={state.showingModal}
          handleClose={() =>
            setState((state) => ({
              ...state,
              showingModal: false,
              modalItem: null,
            }))
          }
        />
      )}

      <div className="portfolio">
        <div className="content-grid">
          <div className={"title"}>
            <div className="blur-container no-border">
              <ColorCharacters
                style={{
                  transition:
                    state.ignoreHovered || !state.hovered
                      ? "color 0s linear"
                      : "color .15s linear 0s",
                  fontSize: "3rem",
                }}
                string={"Portfolio"}
              />
            </div>
            <div
              className="blur-container no-border"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {view === "cards" && (
                <IconButton
                  onClick={() =>
                    setState((s) => ({ ...s, isCondensed: !s.isCondensed }))
                  }
                >
                  <FontAwesomeTextIcon
                    icon={
                      state.isCondensed
                        ? faUpRightAndDownLeftFromCenter
                        : faDownLeftAndUpRightToCenter
                    }
                    text={state.isCondensed ? "Expand" : "Shrink"}
                  />
                </IconButton>
              )}
              {view === "timeline" && (
                <>
                  <IconButton>
                    <FontAwesomeTextIcon
                      icon={
                        timelineSubView === "horizontal"
                          ? faArrowsUpDown
                          : faArrowsLeftRight
                      }
                      text={
                        timelineSubView === "horizontal"
                          ? "Vertical"
                          : "Horizontal"
                      }
                    />
                  </IconButton>
                  {/* <IconButton
                    sx={{ p: 0, m: 1 }}
                    onClick={() => {
                      setTimelineSubView(
                        timelineSubView === "horizontal"
                          ? "vertical"
                          : "horizontal"
                      );
                    }}
                  >

                  </IconButton> */}
                </>
              )}
              <IconButton
                sx={{ p: 0, m: 1 }}
                onClick={() => {
                  setView(view === "timeline" ? "cards" : "timeline");
                }}
              >
                {view === "timeline" ? (
                  <Tooltip title="Cards" placement="bottom">
                    <DashboardIcon />
                  </Tooltip>
                ) : (
                  <FontAwesomeTextIcon icon={faTimeline} text={"Timeline"} />
                )}
              </IconButton>
            </div>
          </div>

          <div
            className="portfolio-wrapper"
            style={{
              justifyContent: view === "cards" ? "center" : "start",
              padding: view === "timeline" ? "0" : "0 3em",
              overflowX: view === "timeline" ? "auto" : "hidden",
            }}
            ref={containerRef}
          >
            {view === "cards" && cards}
            {view === "timeline" && (
              <>
                {timelineSubView === "horizontal" && (
                  <HorizontalTimeline
                    container={sContainerRef}
                    onShowMore={(item) =>
                      setState((s) => ({
                        ...s,
                        showingModal: true,
                        modalItem: item,
                      }))
                    }
                  >
                    {cards}
                  </HorizontalTimeline>
                )}
                {timelineSubView === "vertical" && (
                  <VerticalTimeline
                    items={items}
                    onShowMore={(item) =>
                      setState((s) => ({
                        ...s,
                        showingModal: true,
                        modalItem: item,
                      }))
                    }
                  />
                )}
              </>
            )}
            {/* <HorizontalTimeline /> */}
          </div>
        </div>
        <ScrollArrow to=".about" />
      </div>
      {/* </PortfolioProvider> */}
    </>
  );
};
