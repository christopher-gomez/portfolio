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
      <Slideshow>
        <div className="content-grid">
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
          <div className="wrapper">
            <div className="content">
              {/* <p>
                  Computer Science is my background, Software Engineering is my process, Creating is my passion.
                </p>
                <p>
                  I'm a believer of creative expression and thoughtful design in order to build a better, more accessible, personal, and most importantly, fun user experience.
                </p>
                <p>
                  I love JavaScript and everything web related because of the platform's openness, interactive affordances, and ability to reach and connect with broad audiences. I'm particularly interested in the intersection between web development, human-computer interaction, and multimedia.
                </p>
                <p>
                  When my dev senses kick-in I build presumably awesome stuff. I stay close to
                  the community and try to keep tabs with the pace at which the web is evolving.
                </p>
                <p>
                  React-Redux, Vue-Vuex, Angular, Express, Node.js, MongoDB, Git, Heroku, and
                  AWS are the main tricks up my sleeve. I'm also obsessed with making the web look pretty with SASS/CSS, and making fun, interactive graphics with the Canvas API and WebGL.
                </p>
                <p>
                  Never one to shy away from hard problems and difficult concepts I also enjoy hackathons, code challenges, analyzing big data, fine-tuning machine learning models, video game development, writing shaders, creative coding and generative art, and combining hardware and software to build innovative solutions, tools, and experiences.
                </p>
                <div className="resume">
                  <ReactMarkdown children={state.resume} />
                </div> */}
              <p>
                I'm a creative and passionate software engineer with a strong
                background in computer science.
              </p>
              <p>
                My focus is on creating accessible and enjoyable user
                experiences through thoughtful design and creative expression,
                particularly at the intersection of web development,
                human-computer interaction, and multimedia.
              </p>
              <p>
                I'm skilled in a variety of technologies, including React, Vue,
                Express, Node.js, MongoDB, Git, Unity, and cloud services.
              </p>
              <p>
                I have a talent for designing visually appealing websites and
                interactive graphics and I enjoy tackling complex challenges,
                from fine-tuning machine learning models to writing shaders and
                generative art.
              </p>
              <p>
                When I'm not coding, I enjoy running, traveling, watching
                movies, following the NBA, and discovering new music.
              </p>
            </div>
          </div>
        </div>
        {/* <div className="content-grid">
            <h1>Bio</h1>
            <div className="contact">
              <a href="mailto:c.gomez3644@gmail.com">Contact</a>
            </div>
            <div className="wrapper">
              <div className="content">
                <p>
                  Born and raised in Los Angeles, I recently graduated from
                  California State University Northridge with a B.S. in Computer
                  Science, I even earned an A.S. in Mathematics along the way!
                </p>
                <p>
                  I started programming in my early teens, learning HTML, CSS,
                  and JavaScript in an effort to create games. This effort most
                  likely stemmed from my innate desire to build and design
                  things. A builder at heart, my favorite toys growing up were
                  Legos, one of my favorite games was Minecraft, and I took 3
                  years of architecture classes in highschool before these
                  interests led me into the wonderful world of Computer Science.
                </p>
                <p>
                  Simultaneously shrinking the world and expanding all of our
                  personal worlds, I believe the internet is one of the most
                  important human inventions. With most of our time spent on the
                  intenet, I enjoy making that time spent a more pleasant and
                  interesting place. And fascinated by Human-Computer
                  Interaction, it's no surprise I'm drawn to the web. Not only
                  does the internet allow for me to put my work in a place
                  everyone in the world can access it freely and easily, but
                  it's also constantly evolving with the pace of technology,
                  allowing for more immersive, interactive human-computer
                  experiences.
                </p>
                <p>
                  When I'm not programming or tutoring Computer Science, my two
                  dogs take most of my time, but I also enjoy running cross
                  country trails, traveling the world, going to the movies
                  (MoviePass era, I miss you!), watching the NBA, reading about
                  history, current events, and politics, and discovering new
                  bands at my favorite LA hotspots.
                </p>
              </div>
            </div>
          </div> */}
        <div className="content-grid">
          <h1>Skills</h1>
          <div className="contact">
            <a href="mailto:c.gomez3644@gmail.com">Contact</a>
          </div>
          <div className="wrapper">
            <div className="content skills">
              <div>
                <h3>Languages</h3>
                <p>
                  JavaScript, Java, C#, C++, C, Python, R, Prolog, Bash, Swift.
                </p>
              </div>
              <div>
                <h3>Tools & Technologies</h3>
                <p>
                  React/Redux, Vue/Vuex, Angular, Node.js, Express, Webpack,
                  Babel, ES6, ES7, MongoDB, SQL, Karma, Mocha, Git, AWS, Docker,
                  Heroku, Socket.io, WebGL, Three.js, SASS/SCSS, Bootstrap,
                  OpenGL, Tensorflow, Unity, Blender, SolidWorks, CAD AutoDesk,
                  Raspberry PI.
                </p>
              </div>
              <div>
                <h3>Knowledge Industry</h3>
                <p>
                  Software Development Life Cycle, Agile, Software
                  Documentation, Software Project Management, UI/UX Design,
                  Multimedia Design and Development, Architecture, Data
                  Analysis, Algorithms, Data Structures.
                </p>
              </div>
              <div>
                <h3>Interpersonal Skills</h3>
                <p>
                  Teaching, Leadership, Teamwork, Verbal and Written
                  Communication, Dependability, Responsibility.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Slideshow>
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
      <ScrollArrow prev={true} to=".portfolio" />
    </div>
  );
};
