import * as React from "react";
import { ReactMarkdown } from "react-markdown/lib/react-markdown";
import resume from "../../Assets/resume.md";
import '../../styles/CSS/Markdown.css';

export default () => {
  const [state, setState] = React.useState({ resume: null });

  React.useEffect(() => {
    fetch(resume)
      .then((response) => response.text())
      .then((text) => {
        setState((state) => ({ ...state, resume: text }));
      });
  }, []);
  return <div className="md">{state.resume && <ReactMarkdown children={state.resume} />}</div>;
};
