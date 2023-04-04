import React, { useEffect, useState } from "react";
import "../../styles/CSS/About.css";
import resume from "../../Assets/christopher_gomez_resume.pdf";
import Link from "../../Components/Link";
import { Accordion, AccordionDetails, AccordionSummary } from "@mui/material";
import { faArrowDown, faExpand } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default () => {
  const [careerExpanded, setCareerExpanded] = useState(true);
  const [personalExpanded, setPersonalExpanded] = useState(true);

  return (
    <div className="about">
      <div>
        <h1>About</h1>
        <div className="contact">
          <Link href="mailto:c.gomez3644@gmail.com">Contact 📥</Link>
          <Link newTab style={{ marginLeft: ".5em" }} href={resume}>
            Resume 📋
          </Link>
        </div>
        <hr style={{ margin: 0 }} />
      </div>
      <div className="wrapper">
        <Accordion
          expanded={careerExpanded}
          onChange={(event, expanded) => setCareerExpanded(expanded)}
        >
          <AccordionSummary
            expandIcon={<FontAwesomeIcon icon={faArrowDown} />}
            aria-controls="panel1a-content"
            id="panel1a-header"
          >
            <h2>Professional Bio 💻🛠️</h2>
          </AccordionSummary>
          <AccordionDetails>
            {/* <hr style={{ marginRight: "0 !important", marginLeft: '.5em' }} /> */}
            <div
              className="content"
              style={{ marginRight: "10%", paddingLeft: ".5em" }}
            >
<p>
                I'm an Emmy-award winning full-stack software engineer currently
                working at the video game studio Wayforward, with expertise in React, Node,
                .NET, and Unity. I also have proficiency in C++ and Python, adding to
                my diverse skill set.
              </p>
              <p>
                I enjoy building development tools, frameworks, reusable
                components, as well as base classes and writing documentation to
                improve productivity and development time.
              </p>
              <p>
                My primary focus has been creating accessible and enjoyable user
                experiences through thoughtful design and creative expression,
                particularly at the intersection of web development,
                human-computer interaction, and multimedia.
              </p>
              <p>
                I believe in the importance of both front-end and back-end
                development, creating a truly exceptional user experience. I'm
                passionate about finding innovative ways to blur the line
                between art and tool, with a particular fascination for pushing
                the boundaries of software applications and human-computer
                interaction. I have experience working with industry leaders
                such as Nintendo, Princess Cruises, and Sony Television Pictures
                to develop software solutions that push these boundaries.
              </p>
              <p>
                I have a talent for designing visually appealing websites and
                interactive graphics and enjoy tackling complex challenges,
                from fine-tuning machine learning models to writing shaders and
                generative art.
              </p>
              <p>
                As a team member, I am reliable, collaborative, and
                always open to learning new things. I also have an affinity for
                teaching others. I'm excited to continue creating and innovating
                in the field of software engineering.
              </p>
            </div>
          </AccordionDetails>
        </Accordion>
      </div>
      {/* 
      <div className="wrapper">
        <h2>Skills</h2>
        <div className="content skills">
          <div>
            <h3>Languages</h3>
            <p>JavaScript, Java, C#, C++, C, Python, R, Prolog, Bash, Swift.</p>
          </div>
          <div>
            <h3>Tools & Technologies</h3>
            <p>
              React/Redux, Vue/Vuex, Angular, Node.js, Express, Webpack, Babel,
              ES6, ES7, MongoDB, SQL, Karma, Mocha, Git, AWS, Docker, Heroku,
              Socket.io, WebGL, Three.js, SASS/SCSS, Bootstrap, OpenGL,
              Tensorflow, Unity, Blender, SolidWorks, CAD AutoDesk, Raspberry
              PI.
            </p>
          </div>
          <div>
            <h3>Knowledge Industry</h3>
            <p>
              Software Development Life Cycle, Agile, Software Documentation,
              Software Project Management, UI/UX Design, Multimedia Design and
              Development, Architecture, Data Analysis, Algorithms, Data
              Structures.
            </p>
          </div>
          <div>
            <h3>Interpersonal Skills</h3>
            <p>
              Teaching, Leadership, Teamwork, Verbal and Written Communication,
              Dependability, Responsibility.
            </p>
          </div>
        </div>
      </div> */}
      <hr style={{ margin: 0 }} />
      <div className="wrapper" style={{ textAlign: "right" }}>
        <Accordion
          expanded={personalExpanded}
          onChange={(event, expanded) => setPersonalExpanded(expanded)}
        >
          <AccordionSummary
            expandIcon={<FontAwesomeIcon icon={faArrowDown} />}
            aria-controls="panel2a-content"
            id="panel2a-header"
            sx={{
              flexFlow: "row-reverse",
              "> div": {
                flexFlow: "row-reverse",
              },
            }}
          >
            <h2
              style={{
                textAlign: "right",
                display: "flex",
                alignSelf: "flex-start",
              }}
            >
              Personal Bio 🌴🕹️
            </h2>
          </AccordionSummary>
          <AccordionDetails>
            <div
              className="content"
              style={{
                textAlign: "right",
                marginLeft: "10%",
                paddingRight: "1em",
              }}
            >
              <p>I'm a Los Angeles native who now calls San Francisco home.</p>
              <p>
                I have always had a love for technology, games, and the web
                which led me to pursue a degree in computer science and
                mathematics.
              </p>
              <p>
                Outside of work, I enjoy spending time with my two dogs, taking
                long walks, running, golfing, hiking, traveling, playing video
                games, collecting vinyl records, and attending music festivals.
                I'm also an avid reader, history buff, and Game of Thrones
                fanatic.
              </p>
              <p>
                As a die-hard Laker and NBA fan, you can usually find me
                cheering on my team or pouring through advanced analytics.
              </p>
              <p>
                I'm happiest when I'm making and eating fresh homemade pasta
                with a nice glass of red wine. My dream is to own a vineyard and
                spend my days entertaining and eating. Che bello!
              </p>
              <p>Alla prossima!</p>
              <p>🍝🍇🍷 </p>
            </div>
          </AccordionDetails>
        </Accordion>
      </div>

      {/* <Slideshow>

      </Slideshow> */}
      {/* <div>
          <p> */}
      {/* <a
              style={{ marginRight: ".25em" }}
              href="mailto:c.gomez3644@gmail.com"
            >
              Contact
            </a> */}
      {/* <a
              target="_blank"
              rel="noopener noreferrer"
              style={{ marginLeft: ".25em" }}
              href={resume}
            >
              Resume
            </a> */}
      {/* </p>
        </div> */}
      {/* <p className="text-emoji">
          \(^◇^)/
        </p> */}
      {/* <ScrollArrow prev={true} to=".portfolio" /> */}
    </div>
  );
};
