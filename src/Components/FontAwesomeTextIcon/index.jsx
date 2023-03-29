import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Tooltip } from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import "../../styles/CSS/TextIcon.css";

const FontAwesomeTextIcon = (props) => {
  const { icon, text, containerStyle, iconStyle, textStyle, style, ...others } =
    props;

  let base = { ...style };

  if (containerStyle) base = { ...containerStyle, ...base };

  let [num, setNum] = useState(0);

  useEffect(() => {
    setNum(++FontAwesomeTextIcon.NumIcons);
  }, []);

  return (
    <div
      style={base}
      {...others}
      className="text-icon noselect"
      role={
        others.onClick ||
        others.onPointerDown ||
        others.onPointerUp ||
        others.onSelect
          ? "button"
          : "img"
      }
      aria-label={text ?? ""}
      aria-labelledby={text ? "" : "Icon-" + num}
    >
      {text ? (
        <Tooltip title={text} role="tooltip">
          <FontAwesomeIcon
            icon={icon}
            size="1x"
            style={iconStyle}
            id={"Icon-" + num}
          />
        </Tooltip>
      ) : (
        <FontAwesomeIcon
          icon={icon}
          size="1x"
          style={iconStyle}
          id={"Icon-" + num}
        />
      )}
      {/* <div style={{ fontSize: "1em", ...textStyle }}>{text}</div> */}
    </div>
  );
};

FontAwesomeTextIcon.NumIcons = 0;

export default FontAwesomeTextIcon;
