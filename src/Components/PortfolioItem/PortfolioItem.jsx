import React, { useEffect, useRef, useState } from "react";
import "../../styles/CSS/PortfolioItem.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { hexToRgb } from "../../util/color";
import Backdrop from "../Backdrop";
import { createContainer } from "react-tracked";
import Link from "../Link";
import { IconButton, ImageListItem, ImageList, Tooltip } from "@mui/material";
import FontAwesomeTextIcon from "../FontAwesomeTextIcon";
import {
  faDownLeftAndUpRightToCenter,
  faUpRightAndDownLeftFromCenter,
} from "@fortawesome/free-solid-svg-icons";
import {
  ArrowBack,
  ArrowBackIos,
  ArrowForward,
  ArrowForwardIos,
  Forward,
} from "@mui/icons-material";
import { useIntersectionObserver } from "../../util/IntersectionObserver";

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

export const ImageGrid = ({
  images,
  layout = "condensed",
  onClick,
  children,
}) => {
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

  useEffect(() => {
    if (layout === "modal") {
      setCurImage(0);
    }
  }, [layout]);
  const imgContainerRef = useRef(null);

  useEffect(() => {
    if (!imgContainerRef.current || images == undefined) return;

    const imageList = Array.isArray(images)
      ? images
      : "data" in images
      ? images.data
      : [];

    var img =
      typeof imageList[imageList.length > 1 ? curImage : 0] === "string"
        ? imageList[imageList.length > 1 ? curImage : 0]
        : imageList[imageList.length > 1 ? curImage : 0].url;

    if (img === undefined) return;

    imgContainerRef.current.style.setProperty("--image-url", `url(${img})`);
  }, [curImage, imgContainerRef.current, images]);

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
                sx={{ background: "rgba(0,0,0,0.5)" }}
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
                sx={{ background: "rgba(0,0,0,0.5)" }}
                onClick={() => {
                  setCurImage((cur) => {
                    if (cur === imageList.length - 1) {
                      if (layout === "modal") return 0;

                      return -1;
                    } else return cur + 1;
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
        {children}
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
        ref={imgContainerRef}
      >
        {layout === "modal" && imageList.length > 1 && (
          <div className="img-caro-buttons">
            <IconButton
              sx={{ background: "rgba(0,0,0,0.5)" }}
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
              sx={{ background: "rgba(0,0,0,0.5)" }}
              onClick={() => {
                setCurImage((cur) => {
                  if (cur === imageList.length - 1) {
                    if (layout === "modal") return 0;

                    return -1;
                  } else return cur + 1;
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
        {children}
      </div>
    );
  }
};

const PortfolioItem = ({
  item,
  onShowMore,
  isModal,
  allowDynamicExpansion = true,
  onHover,
  // isBlurred,
  isCondensed,
  onNavigate,
  items,
  ...others
}) => {
  const [state, setState] = useState({
    isCondensed: false,
  });

  const [overflowed, setOverflowed] = useState(false);

  const entireElem = useRef();
  const descriptionElem = useRef();
  const titleElem = useRef();
  const textContainerElem = useRef();

  const shouldHandleOverflow = useRef(true);

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

  const handleTextOverflow = () => {
    if (isModal || !item) return;

    if (titleElem.current) {
      if (state.isCondensed) {
        descriptionElem.current.style.webkitLineClamp = 3;
        descriptionElem.current.style.lineClamp = 3;
      } else if (checkMulti()) {
        descriptionElem.current.style.webkitLineClamp = 4;
        descriptionElem.current.style.lineClamp = 4;
      } else {
        descriptionElem.current.style.webkitLineClamp = 3;
        descriptionElem.current.style.lineClamp = 3;
      }
    }

    if (
      descriptionElem.current &&
      descriptionElem.current.scrollHeight >
        descriptionElem.current.clientHeight
    ) {
      setOverflowed(true);
    } else {
      setOverflowed(false);
    }

    shouldHandleOverflow.current = false;
  };

  useEffect(() => {
    if (isModal) {
      return;
    }

    if (!entireElem.current) {
      return;
    }

    entireElem.current.classList.remove("hidden-y-scale");

    if (state.isCondensed) {
      entireElem.current.classList.add("condensed");
    } else {
      entireElem.current.classList.remove("condensed");
    }
  }, [state.isCondensed, entireElem.current, item]);

  useEffect(() => {
    if (item === undefined || item === null) return;

    setState((s) => ({ ...s, isCondensed: isCondensed }));
  }, [isCondensed]);

  useIntersectionObserver(entireElem, handleTextOverflow, () => {}, 0.25);

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
        {isModal && item && items && (
          <div className="portfolio-item__nav">
            <Tooltip title="Previous Project">
              <IconButton
                onClick={() => {
                  onNavigate(-1);
                }}
                disabled={items.indexOf(item) === 0}
                sx={{
                  "&.Mui-disabled": {
                    color: "gray", // Color when disabled
                    opacity: 0.5, // Optional: Adjust opacity to give a more "disabled" look
                  },
                }}
              >
                <ArrowBackIos sx={{ color: "white" }} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Next Project">
              <IconButton
                onClick={() => {
                  onNavigate(1);
                }}
                disabled={items.indexOf(item) === items.length - 1}
                sx={{
                  "&.Mui-disabled": {
                    color: "gray", // Color when disabled
                    opacity: 0.5, // Optional: Adjust opacity to give a more "disabled" look
                  },
                }}
              >
                <ArrowForwardIos sx={{ color: "white" }} />
              </IconButton>
            </Tooltip>
          </div>
        )}
      </div>
      {isModal && item.type && item.time && (
        <div className="portfolio-item__info">
          <p>{item.type}</p>
          <p style={{ margin: "0 .25em" }}> - </p>
          <p>{item.time}</p>
        </div>
      )}
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
              pointerEvents: overflowed ? "auto" : "none",
            }}
          >
            <div
              className="desc_show_more"
              onClick={() => onShowMore(item)}
              style={{
                opacity: overflowed ? 1 : 0,
                pointerEvents: overflowed ? "auto" : "none",
                display: overflowed ? "block" : "none",
              }}
            >
              More...
            </div>
          </div>
        )}
      </div>
      {item.icons && item.icons.length > 0 && (
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
      {item.links && item.links.length > 0 && (
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
        {...others}
        // style={
        //   isBlurred
        //     ? {
        //         opacity: 0.9,
        //         transition: "all .1s ease-in-out",
        //       }
        //     : {}
        // }

        onPointerEnter={() => {
          if (onHover) onHover(item);
        }}
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
                className={`portfolio-item__img ${isModal ? "modal" : ""}`}
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
      </div>
    </>
  );
};

export const ModalPortfolioItem = ({ item, open, onNavigate, items }) => {
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "scroll";

    return () => {
      document.body.style.overflow = "scroll";
    };
  }, [open]);

  // const { r, g, b } = hexToRgb(color.textColor);
  return (
    <Backdrop
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 2,
        backgroundColor: "rgba(0,0,0,.5) !important",
      }}
      className={"portfolio-item-modal-backdrop"}
      open={open && item !== undefined}
      // onClick={handleClose}
    >
      <PortfolioItem
        item={item}
        isModal={true}
        onNavigate={onNavigate}
        items={items}
      />
    </Backdrop>
  );
};

export default PortfolioItem;
