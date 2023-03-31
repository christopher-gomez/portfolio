import React, { useEffect, useRef, useState } from "react";
import "../../styles/CSS/PortfolioItem.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { hexToRgb } from "../../util/color";
import Backdrop from "../Backdrop";
import { createContainer } from "react-tracked";
import Link from "../Link";

const useValue = () =>
  useState({
    isAnyHovered: false,
  });

const { Provider, useTracked } = createContainer(useValue);

export const PortfolioProvider = Provider;

const PortfolioItem = (props) => {
  const {
    item,
    onShowMore,
    isModal,
    onHover,
    isBlurred,
    isCondensed,
    modalOpen,
    i,
    allowHoverFocus,
    ...others
  } = props;

  const [state, setState] = useState({
    overflowed: false,
    hovered: false,
    animating: false,
    isCondensed: false,
  });

  const [globalState, setGlobalState] = useTracked();

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
    window.addEventListener("resize", handleTextOverflow);
    return () => {
      window.removeEventListener("resize", handleTextOverflow);
      clearTimeout(hoverDelay.current);
    };
  }, []);

  const handleTextOverflow = () => {
    if (titleElem.current) {
      if (checkMulti() || state.isCondensed) {
        descriptionElem.current.style.webkitLineClamp = 3;
        descriptionElem.current.style.lineClamp = 3;
      } else {
        descriptionElem.current.style.webkitLineClamp = 4;
        descriptionElem.current.style.lineClamp = 4;
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

  useEffect(() => {
    if (
      item !== undefined &&
      item !== null &&
      item.description !== undefined &&
      descriptionElem.current
    ) {
      setTimeout(() => {
        handleTextOverflow();
      }, 500);
    }
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

  if (item === undefined || item === null) return null;

  const textElem = (
    <>
      <div className="portfolio-item__title" ref={titleElem}>
        {item.title ? item.title : "Title"}
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
              opacity: state.overflowed ? 1 : 0,
              pointerEvents: state.overflowed ? "auto" : "none",
            }}
          >
            <div className="desc_show_more" onClick={() => onShowMore()}>
              More...
            </div>
          </div>
        )}
      </div>
      {item.icons && (
        <div className="portfolio-item__icon">
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
              <Link
              newTab
                href={link.href}
                key={"portfolio-item-link-" + i}
              >
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
        className={"portfolio-item" + (isModal ? " modal" : "") + " noselect"}
        onPointerEnter={(e) => {
          if (
            isModal ||
            // state.animating ||
            (allowHoverFocus !== undefined && !allowHoverFocus)
          )
            return;

          clearTimeout(hoverDelay.current);

          hoverDelay.current = setTimeout(() => {
            if (onHover) onHover(true);
            setState((s) => ({ ...s, hovered: true }));
          }, 0);
        }}
        onPointerLeave={() => {
          if (
            isModal ||
            (allowHoverFocus !== undefined && !allowHoverFocus)
          )
            return;

          if (onHover) onHover(false);
          // setGlobalState((s) => ({ ...s, isAnyHovered: false }));

          clearTimeout(hoverDelay.current);
          setState((s) => ({ ...s, hovered: false }));
        }}
        {...others}
        onAnimationStart={() => {
          setState((s) => ({ ...s, animating: true }));
        }}
        onAnimationEnd={() => {
          setState((s) => ({ ...s, animating: false }));
        }}
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
          <div
            className="portfolio-item__img"
            style={{
              backgroundImage: `url(${item.img})`,
            }}
          />
        )}
        {state.isCondensed ? (
          <div ref={textContainerElem}>{textElem}</div>
        ) : (
          <>{textElem}</>
        )}
        <div
          className="blur"
          style={{
            opacity: isBlurred ? 1 : 0,
            backgroundColor: "rgba(0,0,0,.1)",
          }}
        ></div>
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
        backgroundColor: `rgba(${r},${g},${b},.25)`,
      }}
      open={open}
      onClick={handleClose}
    >
      <Backdrop
        sx={{
          color: "#fff",
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: `rgba(0,0,0,.75)`,
        }}
        open={true}
      >
        <PortfolioItem item={item} isModal={true} />
      </Backdrop>
    </Backdrop>
  );
};

export default PortfolioItem;
