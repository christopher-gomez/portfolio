import {
  faNode,
  faReact,
  faSpotify,
  faVuejs,
  faChrome,
  faCss3Alt,
  faPython,
  faNpm,
  faHtml5,
  faJsSquare,
  faUnity,
  faDocker,
} from "@fortawesome/free-brands-svg-icons";
import { faGamepad, faMobile } from "@fortawesome/free-solid-svg-icons";
import syn from "../../Assets/images/syn_orange.png";
import spotilize from "../../Assets/images/spotilize.JPG";
import nba from "../../Assets/images/nba.png";
import smooth from "../../Assets/images/smooth.png";
import city from "../../Assets/images/city-def.png";
import smart from "../../Assets/images/smartdj.png";
import jupyter from "../../Assets/images/jupyter.png";
import tree from "../../Assets/images/orb.PNG";
import engine from "../../Assets/images/engine.png";
import aw from "../../Assets/images/AW.avif";
import playshow from "../../Assets/images/playshow.jpg";
import portal from "../../Assets/images/portal.jpg";
import twit from "../../Assets/images/twit.png";
import catan from "../../Assets/images/catan.png";
import { Watson } from "../../Assets/svg";
import bingo from "../../Assets/images/bingo.png";
import journeyViewIsland from "../../Assets/images/journeyViewIsland.png";
import journeyViewLandscape from "../../Assets/images/journeyViewLandscape.jpeg";
import journeyViewSea from "../../Assets/images/journeyViewSea.jpg";
import oceanCompass from "../../Assets/images/oceanCompass.jpg";
import oceanCompassJapanese from "../../Assets/images/OceanCompassJapanese.jpeg";
import RCG from "../../Assets/images/RCG.jpg";
import TravelMapMain from "../../Assets/images/travel_map.png";
import TravelMap2 from "../../Assets/images/travel_map2.png";
import TravelMap3 from "../../Assets/images/travel_map_mobile.png";

const items = [
  {
    img: {
      cols: 12,
      rowHeight: 32,
      gap: 0,
      data: [
        { url: TravelMap2, cols: 12, rows: 4 },
        { url: TravelMapMain, cols: 6, rows: 4 },
        { url: TravelMap3, cols: 6, rows: 4 },
      ],
    },
    title: "Travel App",
    description:
      "A small utility web app I made for my upcoming trip to Japan, utlizing the Google Maps API and Notion API to display a map of my trip and a list of places I want to visit. The app is built with React and Node, and is deployed on Google Cloud. Notion is used extensively for the backend data storage and management, as well as a collaborative document for tip planning between my family and I.",
    icons: [
      { type: "font-awesome", icon: faNode },
      { type: "font-awesome", icon: faReact },
    ],
    links: [],
    time: "2024",
  },
  {
    img: { data: [{ url: RCG }] },
    title: "River City Girls Mobile",
    description:
      "A mobile port of the popular River City Girls game. I worked on the project as a network programmer, integrating CrunchyRoll API calls. I am currently working on porting the sequel to mobile as well.",
    icons: [
      {
        type: "font-awesome",
        icon: faGamepad,
      },
      {
        type: "fizz",
        icon: "icon-csharp",
      },
      {
        type: "font-awesome",
        icon: faUnity,
      },
    ],
    time: "2024",
  },
  {
    img: { data: [{ url: aw }] },
    title: "Advance Wars™ 1+2: Re-Boot Camp",
    description:
      "My first experience working on a high profile game with a major publisher, " +
      "working with Nintendo and re-making Advance Wars 1 and 2 from the ground up for the Switch was a blast. " +
      "I wrote and worked on various systems and components utilized throughout the game and the stack. " +
      // "I worked closely with multiple teams on the project, most prominently the network, UI, and localization teams. " +
      // "I was responsible for writing much of the midddleware used to communicate with Nintendo Online servers, and owned " +
      // "the local multiplayer systems, network middleware, and lobby menu. Additionally, I owned various UI systems, menus, and " +
      // "components, such as the Popup system, Cinematics system, Mode Select menus, Versus menus, Shop menu, " +
      // "and CO Select menus. I ensured all our UI was up to Ninendo's standards by working closely with the UI artists, " +
      // "localization team, and audio engineers."+
      "Over the 2 years or so I was on the project, my hands touched more " +
      "parts of the game than I can remember during the design sessions, brainstorms, scrum sprints, QA cycles, and " +
      "many, many long nights, and I enjoyed every minute of it.",
    icons: [
      {
        type: "font-awesome",
        icon: faGamepad,
      },
      {
        type: "fizz",
        icon: "icon-csharp",
      },
      {
        type: "font-awesome",
        icon: faUnity,
      },
    ],
    links: [
      {
        title: "Nintendo Store",
        href: "https://www.nintendo.com/store/products/advance-wars-1-plus-2-re-boot-camp-switch/",
      },
    ],
    time: "2021-2022",
  },
  {
    img: {
      cols: 12,
      rowHeight: 48,
      gap: 0,
      data: [
        { url: portal, cols: 12, rows: 3 },
        { url: journeyViewLandscape, cols: 6, rows: 3 },
        { url: journeyViewSea, preview: false },
        { url: oceanCompass, preview: false },
        { url: oceanCompassJapanese, cols: 3, rows: 3 },
        { url: bingo, cols: 3, rows: 3 },
      ],
    },
    title: "Princess Cruises MedallionClass®",
    description:
      "Interactive software for Princess Cruises ship guests. I actively develop and maintain many parts of this network of systems. " +
      "This product includes both a phone app and software that gets deployed to large touch screen devices on-ship that guests can interact with while walking " +
      "around. I'm responsible for various products under the MedallionClass umbrella such as Wayfinding (ship map and GPS routing services), Shipmates Chat, Casino and " +
      "localization. I work in both the front and the back ends, and work closely with the product manager, directors, and designers to ensure network data requests are " +
      "optimal when at sea.",
    icons: [
      {
        type: "font-awesome",
        icon: faMobile,
      },
      { type: "font-awesome", icon: faNode },
      { type: "font-awesome", icon: faDocker },
      {
        type: "fizz",
        icon: "icon-csharp",
      },
      {
        type: "font-awesome",
        icon: faUnity,
      },
    ],
    links: [
      {
        title: "Website",
        href: "https://www.princess.com/cruise-tips-vacation-ideas/cruise-destinations/cruise-tips-advice-and-information/what-is-medallion-class.html",
      },
    ],
    time: "2022-2023",
  },
  {
    img: { data: [{ url: playshow }] },
    title: "Jeopardy! PlayShow",
    description:
      "A small trivia game that's loads of fun with friends, this was my first published game. I lead development and worked closely with the producer " +
      "and designer to create a hybrid tv output/phone input game. The game was created using React, IBM Watson, Node/Socket.io, Azure services, PlayFab services, and Unity. " +
      "I was responsible for all networking, UI, DLC, achievements, analytics, and eventual console and digital media player ports. The game works by creating a lobby that players then connect to by scanning a QR code on the screen, " +
      "once everyone's ready, an episode of Jeopardy is then streamed and players follow along with the contestants to try to win the game. When it's time to answer a question " +
      "players buzz-in by tapping on their phone and speaking their answer into the mic. It's near-instantaneously displayed as text on the TV and evaluated. Player stats and " +
      "and data are tracked and stored in a database.",
    icons: [
      {
        type: "font-awesome",
        icon: faMobile,
      },
      {
        type: "svg",
        icon: <Watson />,
      },
      { type: "font-awesome", icon: faNode },
      { type: "font-awesome", icon: faReact },
      {
        type: "font-awesome",
        icon: faGamepad,
      },
      {
        type: "fizz",
        icon: "icon-csharp",
      },
      {
        type: "font-awesome",
        icon: faUnity,
      },
    ],
    links: [
      { title: "Website", href: "https://www.playshowtv.com/" },
      { title: "Companion App", href: "https://www.playshow.games" },
    ],
    time: "2019-2020",
  },
  {
    img: catan,
    title: "Catan",
    description:
      "Powered by A 3D tilemap Engine, this is a quick prototype of a web-based, multiplayer, 3D version of the popular board game Settlers of Catan. ",
    icons: [
      { type: "font-awesome", icon: faNode },
      { type: "font-awesome", icon: faReact },
    ],
    links: [
      {
        title: "Website",
        href: "https://tiles-416322.web.app/catan",
      },
      {
        title: "Github",
        href: "https://github.com/christopher-gomez/tiles.js",
      },
    ],
    time: "2020-2023",
  },
  {
    img: engine,
    title: "3D Tilemap Engine",
    description:
      "A Three.js powered, JavaScript, 3D tilemap engine for Node.js or the browser. Currently in development. Checkout the GitHub or the showcase sandbox for periodic updates.",
    icons: [
      { type: "font-awesome", icon: faNode },
      { type: "font-awesome", icon: faReact },
    ],
    links: [
      {
        title: "V2",
        href: "https://tiles-7cf7b.web.app/",
      },
      {
        title: "V1",
        href: "https://christopher-gomez.github.io/tiles.js/#/",
      },
      {
        title: "Github",
        href: "https://github.com/christopher-gomez/tiles.js",
      },
    ],
    time: "2020-2023",
  },
  {
    img: twit,
    title: "Twitter Bot Manager",
    description:
      "A NPM package built to bypass the lengthy Twitter bot setup stage and get straight to defining bot actions. " +
      "Built with Node, the package sets up a server that hooks into Twitter web events and allows any number of account's to listen " +
      "and respond. Essentially a framework to write Twitter-based actions based on pre-defined events while abstracting away " +
      "the network and bot lifecycle management.",
    icons: [
      { type: "font-awesome", icon: faNode },
      { type: "font-awesome", icon: faNpm },
    ],
    links: [
      {
        title: "Github",
        href: "https://github.com/christopher-gomez/twitter-bot-manager",
      },
      {
        title: "NPM",
        href: "https://www.npmjs.com/package/twitter-bot-manager",
      },
    ],
    time: "2020-2021",
  },
  {
    img: jupyter,
    title: "Spotify ML",
    description:
      "Machine learning with Spotify to emulate Spotify's Discovery feature. Classification and Prediction based on user's listening habits, integrated with Amazon Alexa.",
    icons: [
      { type: "font-awesome", icon: faPython },
      { type: "mfizz", icon: "icon-shell" },
      { type: "font-awesome", icon: faNode },
      { type: "font-awesome", icon: faSpotify },
    ],
    links: [
      {
        title: "Jupyter Notebook",
        href: "https://github.com/christopher-gomez/DJ-Spotify/blob/master/DJ%20Spotify.ipynb",
      },
      {
        title: "Github",
        href: "https://github.com/christopher-gomez/DJ-Spotify",
      },
    ],
    time: "2018",
  },
  {
    img: spotilize,
    title: "Spotilize",
    description:
      "A Node, Express, Vue web app that utilizes a Chrome extension to analyze and visualize Spotify audio frequency waves.",
    icons: [
      { type: "font-awesome", icon: faNode },
      { type: "font-awesome", icon: faVuejs },
      { type: "font-awesome", icon: faSpotify },
      { type: "font-awesome", icon: faChrome },
    ],
    links: [
      {
        title: "Website",
        href: "https://spotilize.uc.r.appspot.com/",
      },
      {
        title: "Github",
        href: "https://github.com/christopher-gomez/Spotify-VIsualizer",
      },
    ],
  },

  {
    img: nba,
    title: "NBA Rosters",
    description:
      "A Node, Express, Vue, MongoDB web app that utilizes a RESTful API for CRUDL operations on NBA team rosters.",
    icons: [
      { type: "font-awesome", icon: faNode },
      { type: "font-awesome", icon: faVuejs },
      { type: "mfizz", icon: "icon-mongodb" },
    ],
    links: [
      {
        title: "Website",
        href: "https://aerobic-ward-301402.wl.r.appspot.com/",
      },
      {
        title: "Github",
        href: "https://github.com/christopher-gomez/NBARosters",
      },
    ],
    time: "2019",
  },
  {
    img: smooth,
    title: "smooth-load",
    description:
      "A GSAP and CSS3 animation powered loading spinner component for VueJS, deployed on NPM",
    icons: [
      { type: "font-awesome", icon: faVuejs },
      { type: "font-awesome", icon: faCss3Alt },
      { type: "font-awesome", icon: faHtml5 },
      { type: "font-awesome", icon: faNpm },
    ],
    links: [
      {
        title: "Website",
        href: "https://christopher-gomez.github.io/smooth-load/",
      },
      {
        title: "NPM",
        href: "https://www.npmjs.com/package/smooth-load",
      },
      {
        title: "Github",
        href: "https://github.com/christopher-gomez/smooth-load",
      },
    ],
  },
  {
    img: smart,
    title: "SmartDJ",
    description:
      "An alternative to voice-based AI assistants, this software controls Spotify with nothing but your hand movements. (OpenCV, Python, Microsoft Kinect)",
    icons: [
      { type: "font-awesome", icon: faPython },
      { type: "fizz", icon: "icon-csharp" },
      { type: "font-awesome", icon: faVuejs },
      { type: "font-awesome", icon: faNode },
      { type: "mfizz", icon: "icon-shell" },
      { type: "font-awesome", icon: faSpotify },
      { type: "mfizz", icon: "icon-mongodb" },
    ],
    links: [
      {
        title: "Github",
        href: "https://github.com/christopher-gomez/SmartDJ",
      },
    ],
    time: "2018-2019",
  },
  {
    img: syn,
    title: "Synesthesiafy",
    description:
      "A Node, Express, React web app that explores the relationship between music and color using Spotify",
    icons: [
      { type: "font-awesome", icon: faNode },
      { type: "font-awesome", icon: faReact },
      { type: "font-awesome", icon: faSpotify },
      { type: "mfizz", icon: "icon-bootstrap" },
      { type: "font-awesome", icon: faCss3Alt },
    ],
    links: [
      // {
      //   title: "Website",
      //   href: "https://synesthesiafy.herokuapp.com/",
      // },
      {
        title: "Github",
        href: "https://github.com/christopher-gomez/synesthesiafy",
      },
    ],
    time: "2018",
  },

  {
    img: city,
    title: "Tower Defense Builder",
    description:
      "A procedurally generated, 3D crafting/survival game. Created with C#, Unity, and Blender.",
    icons: [
      { type: "fizz", icon: "icon-csharp" },
      { type: "fizz", icon: "icon-unity" },
    ],
    links: [
      {
        title: "Github",
        href: "https://github.com/christopher-gomez/UnityRPGCityBuilderTowerDefenseCrafter",
      },
    ],
    time: "2018",
  },

  {
    img: tree,
    title: "Generative Art",
    description:
      "A collection of doodles and creative expressions created with JavaScript, the HTML Canvas API, WebGL, and popular rendering libraries D3 and Three.js",
    icons: [
      { type: "font-awesome", icon: faJsSquare },
      { type: "mfizz", icon: "icon-d3" },
    ],
    links: [
      {
        title: "Codepen",
        href: "https://codepen.io/christophergomez",
      },
    ],
    time: "2017-2020",
  },
];

export default items;
