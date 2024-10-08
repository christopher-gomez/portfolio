import React from "react";

export default React.forwardRef(
  ({ color, string, characters, style, className, ...others }, ref) => {
    if (characters === undefined && string === undefined) return null;
    if (characters === undefined) {
      characters = string.split("");
    }

    return (
      <span
        ref={ref}
        {...others}
        style={{
          // color: color ? color(i) : "inherit",
          color: "white",
          ...style,
        }}
        className={className}
      >
        {string}
      </span>
      // <div ref={ref} {...others}>

      //   {/* {characters.map((letter, i) => {
      //     return (
      //       <span
      //         style={{
      //           color: color ? color(i) : "inherit",
      //           ...style,
      //         }}
      //         className={className}
      //       >
      //         {letter}
      //       </span>
      //     );
      //   })} */}
      // </div>
    );
  }
);
