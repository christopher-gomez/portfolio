import { Backdrop } from "@mui/material";
import React from "react";

export default (props) => {
  const { open, children, sx, ...others } = props;

  let style = { color: "black", zIndex: (theme) => theme.zIndex.drawer + 2 };
  style = sx ? { ...style, ...sx } : style;

  const childrenWithProps = React.Children.map(children, (child) =>
    React.cloneElement(child)
  );

  return (
    <Backdrop sx={{ ...style }} open={open} {...others}>
      {childrenWithProps}
    </Backdrop>
  );
};
