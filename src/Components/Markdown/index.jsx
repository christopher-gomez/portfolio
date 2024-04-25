import * as React from "react";
import { ReactMarkdown } from "react-markdown/lib/react-markdown";
import "../../styles/CSS/Markdown.css";

export default ({ markdownFile }) => {
  const [state, setState] = React.useState({ resume: null });

  React.useEffect(() => {
    fetch(markdownFile)
      .then((response) => response.text())
      .then((text) => {
        setState((state) => ({ ...state, resume: text }));
      });
  }, []);
  return (
    <div className="md">
      {state.resume && <ReactMarkdown children={state.resume} />}
    </div>
  );
};
