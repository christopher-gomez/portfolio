import React, { useCallback, useEffect, useRef, useState } from "react";
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
import { isMobile } from "mobile-device-detect";
import { isMobileClient } from "../../util/misc.js";

export default ({ color, onModalToggled, modalOpen }) => {
  const [state, setState] = useState({
    showingModal: false,
    modalItem: null,
    hovered: false,
    isCondensed: false,
  });

  useEffect(() => {
    if (
      modalOpen !== undefined &&
      !modalOpen &&
      modalOpen !== state.showingModal
    ) {
      setState((s) => ({ ...s, showingModal: modalOpen }));
    }
  }, [modalOpen]);

  useEffect(() => {
    if (onModalToggled) onModalToggled(state.showingModal);
  }, [state.showingModal]);

  const [view, setView] = useState("timeline");
  const [timelineSubView, setTimelineSubView] = useState("vertical");

  const containerRef = useRef(null);

  const [sContainerRef, setSContainerRef] = useState(null);

  useEffect(() => {
    setSContainerRef(containerRef.current);
  }, [containerRef]);

  // const [cards, setCards] = useState([]);
  // useEffect(() => {

  //   // setCards(cards);
  //   // setItems(PortfolioItems);
  // }, [view, state.isCondensed]);

  // const getCards =
  //   //  useCallback(
  //   (renderView, condensed) => {
  //     const cards = PortfolioItems.map((item, i) => {
  //       const cardComponent = (
  //         <>
  //           {renderView === "timeline" && i % 2 === 1 && (
  //             <div
  //               style={{
  //                 height: "5em",
  //                 margin: "0 1.5em",
  //                 display: "flex",
  //                 flexFlow: "row",
  //                 alignContent: "end",
  //                 justifyContent: "end",
  //                 alignItems: "end",
  //               }}
  //             >
  //               <p style={{ fontWeight: "bold", fontStyle: "italic" }}>
  //                 {item.time}
  //               </p>
  //             </div>
  //           )}
  //           <PortfolioItem
  //             key={"portfolio-item-" + i}
  //             item={item}
  //             onShowMore={() =>
  //               setState((state) => ({
  //                 ...state,
  //                 showingModal: true,
  //                 modalItem: item,
  //               }))
  //             }
  //             onShowLess={() =>
  //               setState((state) => ({
  //                 ...state,
  //                 showingModal: false,
  //                 modalItem: null,
  //               }))
  //             }
  //             isCondensed={renderView !== "timeline" && condensed}
  //           />
  //           {renderView === "timeline" && i % 2 === 0 && (
  //             <div
  //               style={{
  //                 height: "5em",
  //                 margin: "0 1.5em",
  //                 display: "flex",
  //                 flexFlow: "row",
  //               }}
  //             >
  //               <p style={{ fontWeight: "bold", fontStyle: "italic" }}>
  //                 {item.time}
  //               </p>
  //             </div>
  //           )}
  //         </>
  //       );

  //       if (renderView === "timeline") return <div>{cardComponent}</div>;
  //       else return cardComponent;
  //     });

  //     return cards;
  //   };
  // }, [view, state.isCondensed]);

  useEffect(() => {
    if (isMobile || isMobileClient()) {
      setView("cards");
    }
  }, []);

  return (
    <>
      {/* <PortfolioProvider> */}
      {/* {state.modalItem && ( */}
      <ModalPortfolioItem
        color={color}
        item={state.modalItem}
        items={PortfolioItems}
        open={state.showingModal}
        onNavigate={(direction) => {
          if (!state.showingModal || !state.modalItem) return;

          const curIndex = PortfolioItems.indexOf(state.modalItem);
          let nextIndex = curIndex + direction;
          if (nextIndex < 0) nextIndex = PortfolioItems.length - 1;
          if (nextIndex >= PortfolioItems.length) nextIndex = 0;
          setState((s) => ({
            ...s,
            modalItem: PortfolioItems[nextIndex],
          }));
        }}
        handleClose={() =>
          setState((state) => ({
            ...state,
            showingModal: false,
            modalItem: null,
          }))
        }
      />
      {/* )} */}

      <div className="portfolio">
        <div className="content-grid">
          <div className={"title"}>
            <div className="blur-container">
              <ColorCharacters
                style={{
                  transition: !state.hovered
                    ? "color 0s linear"
                    : "color .15s linear 0s",
                  fontSize: "3rem",
                }}
                string={"Portfolio"}
              />
            </div>
            <div
              className="blur-container"
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
                  {/* <IconButton>
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
                  </IconButton> */}
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
              {!isMobile && !isMobileClient() && (
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
              )}
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
            {view === "cards" &&
              PortfolioItems.map((item, i) => (
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
                  isCondensed={state.isCondensed}
                />
              ))}
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
                    {/* {getCards("timeline", false)} */}
                  </HorizontalTimeline>
                )}
                {timelineSubView === "vertical" && (
                  <VerticalTimeline
                    items={PortfolioItems}
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
