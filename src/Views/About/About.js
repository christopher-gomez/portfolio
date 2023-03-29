import React, { useEffect, useState } from "react";
import "../../styles/CSS/About.css";
import ScrollArrow from "../../Components/ScrollArrow/ScrollArrow";
import Slideshow from "../../Components/Slideshow/Slideshow";
import resume from "../../Assets/resume.md";
import { ReactMarkdown } from "react-markdown/lib/react-markdown";
import { Link } from "react-router-dom";

export default () => {
  return (
    <div className="about">
      <div>
        <h1>About</h1>
        <div className="contact">
          <a href="mailto:c.gomez3644@gmail.com">Contact</a>
          <Link
            target="_blank"
            rel="noopener noreferrer"
            style={{ marginLeft: ".5em" }}
            to={"/resume"}
          >
            Resume
          </Link>
        </div>
        <hr />
      </div>
      <div className="wrapper">
        <h2 style={{ margin: ".25em 0" }}>Professional Bio</h2>
        <div className="content">
          <p>
            I am an Emmy-winning full-stack software engineer currently working
            at a video game studio, with expertise in React, Node, Unity, and
            .NET. My proficiency in C++ and Python also adds to my diverse skill
            set.
          </p>
          <p>
            I enjoy building development tools, frameworks, reusable components,
            and base classes and writing documentation to improve productivity
            and development time.
          </p>
          <p>
            My focus is on creating accessible and enjoyable user experiences
            through thoughtful design and creative expression, particularly at
            the intersection of web development, human-computer interaction, and
            multimedia.
          </p>
          <p>
            I believe in the importance of both front-end and back-end
            development to create a truly exceptional user experience. I am
            passionate about finding innovative ways to blur the line between
            art and tool, with a particular fascination for pushing the
            boundaries of software applications and human-computer interaction
            and I have experience working with industry leaders such as
            Nintendo, Princess Cruises, and Sony Television Pictures to develop
            software solutions that push these boundaries.
          </p>
          <p>
            I have a talent for designing visually appealing websites and
            interactive graphics and I enjoy tackling complex challenges, from
            fine-tuning machine learning models to writing shaders and
            generative art.
          </p>
          <p>
            As a strong team member, I am reliable, enjoy collaboration, am
            always open to learning new things, and have an affinity for
            teaching others. I'm excited to continue creating and innovating in
            the field of software engineering.
          </p>
        </div>
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

      <div className="wrapper">
        <h2 style={{ margin: ".25em 0", marginTop: 0 }}>Personal Bio</h2>
        <div className="content">
          <p>I'm a Los Angeles native who now calls San Francisco home.</p>
          <p>
            I have always had a love for technology, which led me to pursue a
            degree in Computer Science with a minor in Math.
          </p>
          <p>
            Outside of work, I enjoy spending time with my two dogs, taking long
            walks, running, hiking, traveling, playing video games, collecting
            vinyl records, and attending music festivals.
          </p>
          <p>
            I'm also an avid reader, history buff, and Game of Thrones fanatic.
          </p>
          <p>
            As a die-hard Laker and NBA fan, you can usually find me cheering on
            my team.
          </p>
          <p></p>
        </div>
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
