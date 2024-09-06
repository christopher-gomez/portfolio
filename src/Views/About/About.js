import React, { useEffect, useState } from "react";
import "../../styles/CSS/About.css";
import resume from "../../Assets/christopher_gomez_resume.pdf";
import Link from "../../Components/Link";
import { Accordion, AccordionDetails, AccordionSummary } from "@mui/material";
import { faArrowDown, faExpand } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ColorCharacters from "../../Components/GlowingText/ColorCharacters";

export default () => {
  const [careerExpanded, setCareerExpanded] = useState(true);
  const [personalExpanded, setPersonalExpanded] = useState(true);

  return (
    <div className="about">
      <div className="title">
        <div className="blur-container main">
          <ColorCharacters
            style={{
              fontSize: "3rem",
            }}
            string={"About"}
          />
        </div>
        <div className="contact">
          <div className="blur-container">
            <Link href="mailto:c.gomez3644@gmail.com">Contact 📥</Link>
            <Link newTab style={{ marginLeft: ".5em" }} href={resume}>
              Resume 📋
            </Link>
          </div>
        </div>
      </div>
      {/* <hr style={{ margin: "5px 0", color: 'transparent', background: 'transparent'}} /> */}
      <div className="wrapper" style={{ margin: "5px 0" }}>
        <Accordion
          expanded={careerExpanded}
          onChange={(event, expanded) => setCareerExpanded(expanded)}
          sx={{
            border: "none",
            boxShadow: "none",
            backgroundColor: "rgba(44, 48, 59, 0.6862745098) !important",
            backdropFilter: "blur(10px)",
            border: "2px solid white",
            borderRadius: ".5em !important",
          }}
        >
          <AccordionSummary
            expandIcon={<FontAwesomeIcon color="white" icon={faArrowDown} />}
            aria-controls="panel1a-content"
            id="panel1a-header"
          >
            <h2>Professional Bio 💻🛠️</h2>
          </AccordionSummary>
          <AccordionDetails>
            {/* <hr style={{ marginRight: "0 !important", marginLeft: '.5em' }} /> */}
            <div
              className="content professional-content"
              style={{ marginRight: "10%", paddingLeft: ".5em" }}
            >
              <p style={{ fontWeight: 500 }}>
                <i>
                  Hi, I'm Chris! Thanks for taking the time to visit and read
                  through my site.
                </i>
              </p>
              <p>
                I'm a software engineer and I implement full-stack stack
                solutions and experiences in the video game and hospitality
                industries. I work at Wayforward Technologies, a video game
                studio based in Santa Clarita, CA. I've been primarily working
                on the LBE (Location Based Entertainment) team for the past 2
                years, but I've also contributed work to multiple games during
                my tenure here.
              </p>
              <p>
                My day to day tasks usually have me working in a video game
                engine such as Unity or Unreal, but my skills and
                responsibilities range from application design and development,
                general research and development, and even some light devops
                work.
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
                interactive graphics and enjoy tackling complex challenges, from
                fine-tuning machine learning models to writing shaders and
                generative art.
              </p>
              <p>
                As a team member, I am reliable, collaborative, and always open
                to learning new things. I also have an affinity for teaching
                others. I'm excited to continue creating and innovating in the
                field of software engineering.
              </p>
              <p>
                I'm proficient with React, Node.js, C#/.NET Framework, and
                Unity. I'm also adept in Python, and can hold my own in C++ and
                Unreal. Languages and syntax are easy for me to pick up, but I
                think the most important skill to have is the ability to learn
                and adapt to new technologies and paradigms. I'm always looking
                to learn new things and improve my skills.
              </p>
              {/* <p>
                I have a passion for a wide range of technologies and am always
                eager to learn new things. I enjoy making interactive
                applications, games, and multimedia art.
              </p> */}
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
      {/* <hr
        style={{
          margin: "5px 0",
          color: "transparent",
          background: "transparent",
        }}
      /> */}
      <div className="wrapper" style={{ textAlign: "right" }}>
        <Accordion
          expanded={personalExpanded}
          onChange={(event, expanded) => setPersonalExpanded(expanded)}
          sx={{
            boxShadow: "none",
            backgroundColor: "rgba(44, 48, 59, 0.6862745098) !important",
            backdropFilter: "blur(10px)",
            border: "2px solid white",
            borderRadius: ".5em !important",
          }}
        >
          <AccordionSummary
            expandIcon={<FontAwesomeIcon color="white" icon={faArrowDown} />}
            aria-controls="panel2a-content"
            id="panel2a-header"
            className="personal-accordion-summary"
          >
            <h2>Personal Bio 🌴🕹️</h2>
          </AccordionSummary>
          <AccordionDetails>
            <div
              className="content personal-content"
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
                I started coding when I was about 16 years old, and couldn't
                imagine doing anything else.
              </p>
              <p>
                Outside of work, I enjoy spending time with my two dogs, going
                to the gym, running, hiking, traveling, playing video games,
                going to concerts, and eating! I'm a huge foodie and love trying
                new foods and restaurants. I'm also an avid reader, history
                buff, and lore (of any kind!) enthusiast.
              </p>
              <p>
                Even though I live in the bay, I bleed purple and gold. I'm a
                die hard Lakers fan, but I'll go to any NBA game I can, and will
                usually watch any game on when I have the time. Some of my
                earliest core memories include attending a game on Christmas
                during the Kobe and Shaq era and cheering with my dad in our
                living room on Sundays, when they still wore the Sunday whites.
                And although I've gotten older, I find myself with less time to
                invest into them, I'd really like to see them hang banner #18
                soon.
              </p>
              <p>
                I'm happiest when I'm making and eating fresh homemade pasta
                with a nice glass of red wine. My dream is to own a vineyard and
                spend my days eating in the company of family and friends. Che
                bello!
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
