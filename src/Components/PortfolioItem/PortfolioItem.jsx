import React, { useEffect, useRef, useState } from "react";
import "../../styles/CSS/PortfolioItem.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { hexToRgb } from "../../util/color";
import Backdrop from "../Backdrop";
import { createContainer } from "react-tracked";
import Link from "../Link";
import { IconButton, ImageListItem, ImageList } from "@mui/material";
import FontAwesomeTextIcon from "../FontAwesomeTextIcon";
import {
  faDownLeftAndUpRightToCenter,
  faUpRightAndDownLeftFromCenter,
} from "@fortawesome/free-solid-svg-icons";
import { ArrowBack, ArrowForward } from "@mui/icons-material";

// const useValue = () =>
//   useState({
//     isAnyHovered: false,
//   });

// const { Provider, useTracked } = createContainer(useValue);

// export const PortfolioProvider = Provider;
function srcset(image, size, rows = 1, cols = 1) {
  if (size === null) size = 1;

  return {
    src: `${image}?w=${size * cols}&h=${size * rows}&fit=crop&auto=format`,
    srcSet: `${image}?w=${size * cols}&h=${
      size * rows
    }&fit=crop&auto=format&dpr=2 2x`,
  };
}

export const ImageGrid = ({ images, layout = "condensed", onClick }) => {
  const [gridProps, setGridProps] = useState({
    cols: 1,
    rowHeight: 50,
    gap: 0,
  });

  useEffect(() => {
    if (Array.isArray(images)) {
      if (images.length <= 1) {
        setCurImage(0);
      }
      return;
    }

    if ("img" in images && images.data.length <= 1) {
      setCurImage(0);
    }

    setGridProps({
      cols: images.cols ?? 1,
      rowHeight: images.rowHeight ?? 50,
      gap: images.gap ?? 0,
    });
  }, [images]);

  const [curImage, setCurImage] = useState(-1);

  if (!images) return null;

  const imageList = Array.isArray(images)
    ? images
    : "data" in images
    ? images.data
    : [];

  if (imageList.length === 0) return null;

  if (curImage === -1 && imageList.length > 1)
    return (
      <div
        style={{ cursor: layout === "modal" ? "default" : "pointer" }}
        onClick={() => {
          if (onClick) onClick();
        }}
      >
        <ImageList
          gap={gridProps.gap}
          sx={{
            borderRadius:
              layout === "condensed" ? "1em 0 0 1em" : "1em 1em 0 0",
            position: "relative",
            height: "100%",
            width: "100%",
          }}
          variant="quilted"
          cols={gridProps.cols}
          rowHeight={gridProps.rowHeight}
        >
          {layout === "modal" && (
            <div className="img-caro-buttons">
              <IconButton
                onClick={() =>
                  setCurImage((cur) => {
                    if (cur === -1) return imageList.length - 1;
                    else return cur - 1;
                  })
                }
              >
                <ArrowBack />
              </IconButton>
              <IconButton
                onClick={() => {
                  setCurImage((cur) => {
                    if (cur === imageList.length - 1) return -1;
                    else return cur + 1;
                  });
                }}
              >
                <ArrowForward />
              </IconButton>
            </div>
          )}
          {imageList.map((item, i) => {
            if (
              typeof item !== "string" &&
              "preview" in item &&
              item.preview === false
            ) {
              return null;
            } else {
              return (
                <ImageListItem
                  key={typeof item === "string" ? item : item.url}
                  cols={
                    typeof item !== "string" && item.cols
                      ? item.cols
                      : undefined
                  }
                  rows={
                    typeof item !== "string" && item.rows
                      ? item.rows
                      : undefined
                  }
                >
                  <img
                    {...srcset(
                      typeof item === "string" ? item : item.url,
                      typeof item !== "string" && item.size
                        ? item.size
                        : gridProps.rowHeight,
                      typeof item !== "string" && item.rows ? item.rows : 1,
                      typeof item !== "string" && item.cols ? item.cols : 1
                    )}
                    loading="lazy"
                  />
                </ImageListItem>
              );
            }
          })}
        </ImageList>
      </div>
    );
  else {
    return (
      <div
        className={`portfolio-item__img ${layout} ${
          layout === "condensed" ? "fancy" : ""
        }`}
        style={{ cursor: layout === "modal" ? "default" : "pointer" }}
        onClick={() => {
          if (onClick) onClick();
        }}
      >
        {layout === "modal" && imageList.length > 1 && (
          <div className="img-caro-buttons">
            <IconButton
              onClick={() =>
                setCurImage((cur) => {
                  if (cur === -1) return imageList.length - 1;
                  else return cur - 1;
                })
              }
            >
              <ArrowBack />
            </IconButton>
            <IconButton
              onClick={() => {
                setCurImage((cur) => {
                  if (cur === imageList.length - 1) return -1;
                  else return cur + 1;
                });
              }}
            >
              <ArrowForward />
            </IconButton>
          </div>
        )}
        <img
          src={
            typeof imageList[imageList.length > 1 ? curImage : 0] === "string"
              ? imageList[imageList.length > 1 ? curImage : 0]
              : imageList[imageList.length > 1 ? curImage : 0].url
          }
          style={{
            borderRadius:
              layout === "modal"
                ? "none"
                : layout === "condensed"
                ? "1em 0 0 1em"
                : "1em 1em 0 0",
          }}
        />
      </div>
    );
  }
};

const PortfolioItem = ({
  item,
  onShowMore,
  isModal,
  allowDyanimicExpansion: allowDynamicExpansion = true,
  onHover,
  isBlurred,
  isCondensed,
  modalOpen,
  allowHoverFocus,
  ...others
}) => {
  const [state, setState] = useState({
    overflowed: false,
    hovered: false,
    animating: false,
    isCondensed: false,
  });

  // const [globalState, setGlobalState] = useTracked();

  const entireElem = useRef();
  const descriptionElem = useRef();
  const titleElem = useRef();
  const textContainerElem = useRef();
  const hoverDelay = useRef();

  function checkMulti() {
    if (!titleElem.current) return;

    let ta = titleElem.current;
    let multi = false;

    // disable wrapping, padding and enable horiz scoll
    ta.classList.add("nowrap");

    // check if there is anything to be scrolled horizontally (means multi-lines otherwise)
    multi = ta.scrollWidth > ta.offsetWidth;

    // checking done. remove the class.
    ta.classList.remove("nowrap");

    return multi;
  }

  useEffect(() => {
    // window.addEventListener("resize", handleTextOverflow);
    // return () => {
    //   window.removeEventListener("resize", handleTextOverflow);
    //   clearTimeout(hoverDelay.current);
    // };
  }, []);

  const handleTextOverflow = () => {
    if (titleElem.current) {
      if (state.isCondensed) {
        // descriptionElem.current.style.webkitLineClamp = 2;
        // descriptionElem.current.style.lineClamp = 2;
      } else if (checkMulti()) {
        descriptionElem.current.style.webkitLineClamp = 4;
        descriptionElem.current.style.lineClamp = 4;
      } else {
        // descriptionElem.current.style.webkitLineClamp = 6;
        // descriptionElem.current.style.lineClamp = 6;
      }
    }

    if (
      descriptionElem.current &&
      descriptionElem.current.scrollHeight >
        descriptionElem.current.clientHeight
    ) {
      setState({ ...state, overflowed: true });
    }
  };

  const timeout = useRef();

  useEffect(() => {
    if (
      item !== undefined &&
      item !== null &&
      item.description !== undefined &&
      descriptionElem.current
    ) {
      clearTimeout(timeout.current);

      timeout.current = setTimeout(() => {
        handleTextOverflow();
      }, 500);
    }

    return () => {
      clearTimeout(timeout.current);
    };
  }, [item, state.isCondensed]);

  const shouldCondense = useRef(false);
  const shouldExpand = useRef(false);

  useEffect(() => {
    if (!entireElem.current) {
      setState((s) => ({ ...s, isCondensed: isCondensed }));
      return;
    }

    if (isCondensed !== state.isCondensed) {
      shouldCondense.current = false;
      shouldExpand.current = false;
      // entireElem.current.classList.remove("fade-in-grow");
      // entireElem.current.classList.remove("fade-out-shrink");

      shouldCondense.current = isCondensed;
      shouldExpand.current = !isCondensed;
      // animate out
      // entireElem.current.classList.add("fade-out-shrink");

      setState((s) => ({ ...s, isCondensed: isCondensed }));
      // wait for anim and set the in elem on anim end
    }
  }, [isCondensed]);

  useEffect(() => {
    if (!entireElem.current) {
      return;
    }

    if (!state.animating) {
      entireElem.current.classList.remove("fade-out-shrink");
      if (shouldCondense.current || shouldExpand.current) {
        shouldCondense.current = false;
        shouldExpand.current = false;
      } else {
        entireElem.current.classList.remove("fade-in-grow");
      }
    }
  }, [state.animating]);

  useEffect(() => {
    if (!entireElem.current) {
      return;
    }

    // entireElem.current.classList.add("fade-in-grow");
    entireElem.current.classList.remove("hidden-y-scale");

    if (state.isCondensed) {
      entireElem.current.classList.add("condensed");
      // textContainerElem.current.classList.add("text-wrapper");
    } else {
      entireElem.current.classList.remove("condensed");
      // textContainerElem.current.classList.remove("text-wrapper");
    }
  }, [state.isCondensed]);

  useEffect(() => {
    if (allowHoverFocus !== undefined && !allowHoverFocus && state.hovered)
      setState((s) => ({ ...s, hovered: false }));
  }, [allowHoverFocus]);

  const [curImage, setCurImage] = useState(0);

  if (item === undefined || item === null) return null;

  const textElem = (
    <>
      <div className="portfolio-item__title" ref={titleElem}>
        <p>{item.title ? item.title : "Title"}</p>
        {!isModal && allowDynamicExpansion && (
          <IconButton
            onClick={(e) => {
              setState((s) => ({ ...s, isCondensed: !s.isCondensed }));
            }}
            size="small"
            sx={{ color: "white", alignSelf: "start" }}
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
      </div>
      <div className="wrapper">
        <div
          className={
            isModal === undefined || isModal === false
              ? "portfolio-item__desc_less"
              : "portfolio-item__desc_all"
          }
          ref={descriptionElem}
        >
          {item.description ? item.description : "Project Description"}
        </div>
        {(isModal === undefined || isModal === false) && (
          <div
            style={{
              display: "inline-flex",
              pointerEvents: state.overflowed ? "auto" : "none",
            }}
          >
            <div
              className="desc_show_more"
              onClick={() => onShowMore(item)}
              style={{
                opacity: state.overflowed ? 1 : 0,
                pointerEvents: state.overflowed ? "auto" : "none",
                display: state.overflowed ? "block" : "none",
              }}
            >
              More...
            </div>
          </div>
        )}
      </div>
      {item.icons && (
        <div
          className="portfolio-item__icon"
          style={{
            display: state.isCondensed ? "block" : "inline-flex",
            textAlign: state.isCondensed ? "unset" : "left",
          }}
        >
          {item.icons.map((icon, i) => {
            if (icon.type === "font-awesome")
              return (
                <FontAwesomeIcon
                  icon={icon.icon}
                  key={"portfolio-item-icon-" + i}
                />
              );
            else if (icon.type === "svg")
              return <span key={"portfolio-item-icon-" + i}>{icon.icon}</span>;
            else
              return (
                <i
                  className={`${icon.icon}`}
                  key={"portfolio-item-icon-" + i}
                />
              );
          })}
        </div>
      )}
      {item.links && (
        <div className="portfolio-item__links">
          {item.links.map((link, i) => {
            return (
              <Link newTab href={link.href} key={"portfolio-item-link-" + i}>
                {link.title}
              </Link>
            );
          })}
        </div>
      )}
    </>
  );

  return (
    <>
      <div
        ref={entireElem}
        onClick={(e) => e.stopPropagation()}
        className={"portfolio-item" + (isModal ? " modal" : "") + " noselect"}
        // onPointerEnter={(e) => {
        //   if (
        //     isModal ||
        //     // state.animating ||
        //     (allowHoverFocus !== undefined && !allowHoverFocus)
        //   )
        //     return;

        //   clearTimeout(hoverDelay.current);

        //   hoverDelay.current = setTimeout(() => {
        //     if (onHover) onHover(true);
        //     setState((s) => ({ ...s, hovered: true }));
        //   }, 0);
        // }}
        // onPointerLeave={() => {
        //   if (
        //     isModal ||
        //     (allowHoverFocus !== undefined && !allowHoverFocus)
        //   )
        //     return;

        //   if (onHover) onHover(false);
        //   // setGlobalState((s) => ({ ...s, isAnyHovered: false }));

        //   clearTimeout(hoverDelay.current);
        //   setState((s) => ({ ...s, hovered: false }));
        // }}
        {...others}
        // onAnimationStart={() => {
        //   console.log('animating')
        //   setState((s) => ({ ...s, animating: true }));
        // }}
        // onAnimationEnd={() => {
        //   setState((s) => ({ ...s, animating: false }));
        // }}
        style={
          isBlurred
            ? {
                opacity: 0.9,
                // transform: `scale(.95,.95)`,
                transition: "all .1s ease-in-out",
              }
            : {}
        }
      >
        {item.img && (
          <>
            {Array.isArray(item.img) || typeof item.img === "object" ? (
              <ImageGrid
                images={item.img}
                title={item.title}
                layout={
                  isModal ? "modal" : state.isCondensed ? "condensed" : "card"
                }
                onClick={() => {
                  if (isModal) return;
                  else onShowMore(item);
                }}
              />
            ) : (
              <div
                onClick={() => {
                  onShowMore(item);
                }}
                className="portfolio-item__img"
                style={{
                  backgroundImage: `url(${item.img})`,
                  cursor: isModal ? "default" : "pointer",
                }}
              />
            )}
          </>
        )}
        <div className="body-wrapper">
          {state.isCondensed ? (
            <div
              ref={textContainerElem}
              style={{ height: "100%", display: "flex", flexFlow: "column" }}
            >
              {textElem}
            </div>
          ) : (
            <>{textElem}</>
          )}
        </div>
        {/* <div
          className="blur"
          style={{
            opacity: isBlurred ? 1 : 0,
            backgroundColor: "rgba(0,0,0,.1)",
          }}
        ></div> */}
      </div>
    </>
  );
};

export const ModalPortfolioItem = ({ item, open, handleClose, color }) => {
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "scroll";

    return () => {
      document.body.style.overflow = "scroll";
    };
  }, [open]);
  const { r, g, b } = hexToRgb(color.textColor);
  return (
    <Backdrop
      sx={{
        color: "#fff",
        zIndex: (theme) => theme.zIndex.drawer + 2,
        backgroundColor: `rgba(0,0,0,.5)`,
        backdropFilter: "blur(10px)",
        padding: "1em !important",
      }}
      open={open}
      onClick={handleClose}
    >
      {/* <Backdrop
        sx={{
          color: "#fff",
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: `rgba(0,0,0,.75)`,
        }}
        open={true}
      > */}
      <PortfolioItem item={item} isModal={true} />
      {/* </Backdrop> */}
    </Backdrop>
  );
};

export default PortfolioItem;
