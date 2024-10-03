import * as React from "react";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Fade from "@mui/material/Fade";

export default ({ title, children, open }) => {
  const [anchorEl, setAnchorEl] = React.useState(null);

  React.useEffect(() => {
    if (open === undefined) return;

    // console.log('effect')
    setAnchorEl(open ? buttonEl.current : null);
  }, [open]);

  const isOpen = anchorEl !== null;

  const handleClick = (e) => {
    // console.log('handle click')
    setAnchorEl(e.currentTarget);
  };

  const handleClose = () => {
    // console.log('ok')
    setAnchorEl(null);
  };

  const menuChildren = React.Children.map(children, (child, i) => (
    <MenuItem key={"menu-item-" + i}>{child}</MenuItem>
  ));

  const buttonEl = React.useRef(null);

  return (
    <div>
      <Button
        id="fade-button"
        aria-controls={isOpen ? "fade-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={isOpen ? "true" : undefined}
        onClick={handleClick}
        ref={buttonEl}
      >
        {title ?? "Menu"}
      </Button>
      <Menu
        id="fade-menu"
        MenuListProps={{
          "aria-labelledby": "fade-button",
        }}
        anchorEl={anchorEl}
        open={isOpen}
        onClose={handleClose}
        TransitionComponent={Fade}
      >
        <MenuItem onClick={handleClose}>Profile</MenuItem>
        <MenuItem onClick={handleClose}>My account</MenuItem>
        <MenuItem onClick={handleClose}>Logout</MenuItem>
        {/* {menuChildren} */}
      </Menu>
    </div>
  );
};
