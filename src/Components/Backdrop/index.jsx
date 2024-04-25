import { Backdrop } from "@mui/material";
import React from "react";

// why did i make this a component? It's now just a redundant wrapper for Backdrop from MUI

export default (props) => {
  let { open, children, sx, style, ...others } = props;

  if (!sx) sx = {};
  if (!style) style = {};

  let _style = {
    color: "black",
    zIndex: (theme) => theme.zIndex.drawer + 2,
    ...style,
    ...sx,
  };

  // const childrenWithProps = React.Children.map(children, (child) =>
  //   React.cloneElement(child)
  // );

  return (
    <Backdrop sx={{ ..._style }} open={open} {...others}>
      {children}
    </Backdrop>
  );
};
