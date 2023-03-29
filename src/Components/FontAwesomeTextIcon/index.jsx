import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Tooltip } from "@mui/material";
import React from "react";
import "../../styles/CSS/TextIcon.css";

export default (props) => {
  const { icon, text, containerStyle, iconStyle, textStyle, style, ...others } =
    props;

  let base = { ...style };

  if (containerStyle) base = { ...containerStyle, ...base };

  return (
    <div style={base} {...others} className="text-icon noselect">
      <Tooltip title={text}>
        <FontAwesomeIcon icon={icon} size="1x" style={iconStyle} />
      </Tooltip>
      {/* <div style={{ fontSize: "1em", ...textStyle }}>{text}</div> */}
    </div>
  );
};
