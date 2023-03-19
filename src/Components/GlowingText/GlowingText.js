import React, { useEffect, useRef } from "react";
import "../../styles/CSS/GlowingText.css";

export default ({ letters, delay }) => {
  const timeoutRef = useRef();
  const div = useRef();

  useEffect(() => {
    clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(() => {
      console.log('timeout')
      if (div.current) {
        div.current.className = "glowing-text";
      }
    }, delay ?? 0);
  }, [delay]);

  return (
    <div className="" ref={div}>
      {Array.isArray(letters) ? (
        letters.map((letter, index) => {
          return (
            <span
              key={letter + index}
              style={{
                animationDelay: delay
                  ? `${delay + index * 100}ms`
                  : `${index * 100}ms`,
              }}
              onAnimationEnd={() => {
                if (index == letters.length - 1) {
                  if (div.current) div.current.className = "";

                  timeoutRef.current = setTimeout(() => {
                    if (div.current) {
                      div.current.className = "glowing-text";
                    }
                  }, delay ?? 0);
                }
              }}
            >
              {letter}
            </span>
          );
        })
      ) : (
        <span
          style={{
            animationDelay: `${delay ? delay : 2000}ms`,
          }}
        >
          {letters}
        </span>
      )}
    </div>
  );
};
