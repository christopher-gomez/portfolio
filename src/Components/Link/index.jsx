import React, { useRef } from "react";
import { useLink } from "react-aria";
import { Link } from "react-router-dom";

export default ({ children, href, newTab, routerLink, ...others }) => {
  const props = { children, href, ...others };
  const ref = useRef();
  const { linkProps } = useLink(props, ref);

  return (
    <>
      {routerLink ? (
        <Link ref={ref} to={href} {...linkProps}>
          {children}
        </Link>
      ) : (
        <a
          ref={ref}
          href={href}
          target={newTab ? "_blank" : "_self"}
          rel={newTab ? "noopener noreferrer" : ""}
          {...linkProps}
        >
          {children}
        </a>
      )}
    </>
  );
};
