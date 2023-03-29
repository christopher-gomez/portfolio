import React from "react";

export default ({ color, string, characters }) => {
  if (characters === undefined && string === undefined) return null;
  if (characters === undefined) {
    characters = string.split("");
  }
  
  return (
    <div>
      {characters.map((letter, i) => {
        return (
          <span
            style={{
              color: color ? color(i) : "inherit",
            }}
          >
            {letter}
          </span>
        );
      })}
    </div>
  );
};
