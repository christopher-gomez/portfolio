import React, { useEffect, useRef, useState } from "react";
import "../../styles/CSS/PortfolioItem.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Backdrop } from "@mui/material";
import { hexToRgb } from "../../util/color";

const PortfolioItem = ({ item, onShowMore, isModal }) => {
  const descRef = useRef(null);

  const [state, setState] = useState({ overflowed: false });

  useEffect(() => {
    if (
      item !== undefined &&
      item !== null &&
      item.description !== undefined &&
      descRef.current
    ) {
      if (descRef.current.scrollHeight > descRef.current.clientHeight) {
        setState({ ...state, overflowed: true });
      }
    }
  }, [item]);

  if (item === undefined || item === null) return null;

  return (
    <div className={"portfolio-item " + (isModal ? "modal" : "")}>
      {item.img && (
        <div
          className="portfolio-item__img"
          style={{
            backgroundImage: `url(${item.img})`,
          }}
        />
      )}

      <div className="portfolio-item__title">
        {item.title ? item.title : "Title"}
      </div>
      <div className="wrapper">
        <div
          className={
            isModal === undefined || isModal === false
              ? "portfolio-item__desc_less"
              : "portfolio-item__desc_all"
          }
          ref={descRef}
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
              <a
                target="_blank"
                rel="noopener noreferrer"
                href={link.href}
                key={"portfolio-item-link-" + i}
              >
                {link.title}
              </a>
            );
          })}
        </div>
      )}
    </div>
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
