import * as React from "react";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import "../../styles/CSS/HorizontalTimeline.css";
import { Chip } from "@mui/material";

export default ({ children, container }) => {
  //   const ref = React.useRef(null);
  const animRef = React.useRef(null);

  React.useEffect(() => {
    const onScroll = (e) => {
      //   if (container) {
      //     if (animRef.current) {
      //       window.cancelAnimationFrame(animRef.current);
      //       animRef.current = null;
      //     }
      //     if (e.deltaY < 0 && container.scrollLeft <= 0) return;
      //     if (
      //       e.deltaY > 0 &&
      //       container.scrollLeft >=
      //         container.scrollWidth - container.clientWidth
      //     )
      //       return;
      //     e.preventDefault();
      //     e.stopPropagation();
      //     container.scrollLeft += e.deltaY * 2;
      // let scrollAmount = 0;
      // const step = () => {
      //   container.scrollLeft += e.deltaY * 0.05; // Adjust the multiplier for speed
      //   scrollAmount += Math.abs(e.deltaY * 0.05);
      //   if (scrollAmount < Math.abs(e.deltaY)) {
      //     animRef.current = window.requestAnimationFrame(step);
      //   }
      // };
      // animRef.current = window.requestAnimationFrame(step);
      //   }
    };

    // if (container) {
    //   container.addEventListener("wheel", onScroll);
    // }

    return () => {
      if (animRef.current) {
        window.cancelAnimationFrame(animRef.current);
        animRef.current = null;
      }
      // if (container) {
      //   container.removeEventListener("wheel", onScroll);
      // }
    };
  }, [container]);

  return (
    <Breadcrumbs
      maxItems={100}
      aria-label="breadcrumb"
      component={"div"}
      separator={<Chip label=">" variant="outlined" sx={{ color: "black" }} />}
      classes={{ root: "custom-root", ol: "custom-ol" }} // Add this line to apply a custom class
    >
      {children}
    </Breadcrumbs>
  );
};
