(window.webpackJsonp=window.webpackJsonp||[]).push([[0],[,,,,,,,,,,,,,,,function(e,t,n){e.exports=n.p+"static/media/resume.a2977a6c.pdf"},function(e,t,n){e.exports=n.p+"static/media/syn_orange.fe0613e0.png"},function(e,t,n){e.exports=n.p+"static/media/spotilize.917e034a.JPG"},function(e,t,n){e.exports=n.p+"static/media/nba.d53f2a2f.png"},function(e,t,n){e.exports=n.p+"static/media/smooth.b79f20fc.png"},function(e,t,n){e.exports=n.p+"static/media/city-def.826923c7.png"},function(e,t,n){e.exports=n.p+"static/media/smartdj.bbc03885.png"},function(e,t,n){e.exports=n.p+"static/media/jupyter.ff8cd5d3.png"},function(e,t,n){e.exports=n.p+"static/media/orb.d607b5e2.PNG"},function(e,t,n){e.exports=n.p+"static/media/engine.0de98f95.png"},function(e,t,n){e.exports=n(47)},,,,,function(e,t,n){},function(e,t,n){},function(e,t,n){},,,,,,function(e,t,n){},function(e,t,n){},function(e,t,n){},function(e,t,n){},function(e,t,n){},function(e,t,n){},function(e,t,n){},function(e,t,n){},function(e,t,n){},function(e,t,n){"use strict";n.r(t);var a=n(0),o=n.n(a),i=n(14),r=n.n(i),l=(n(30),n(3)),s=n(4),c=n(7),m=n(5),p=n(6),u=(n(31),n(10)),h=(n(32),n(8)),d=n(9),f=!!((document||{}).documentElement||{}).style&&"scrollBehavior"in document.documentElement.style,y=function(){f?window.scrollTo({top:0,left:0,behavior:"smooth"}):window.scrollTo(0,0)},g=function(e){e&&(f?e.scrollIntoView({behavior:"smooth",block:"start"}):e.scrollIntoView())},b=function(e){function t(e){var n;return Object(l.a)(this,t),(n=Object(c.a)(this,Object(m.a)(t).call(this,e))).handleScroll=n.handleScroll.bind(Object(u.a)(n)),n.state={isSticky:!1,color:null},n}return Object(p.a)(t,e),Object(s.a)(t,[{key:"componentDidMount",value:function(){window.addEventListener("scroll",this.handleScroll),this.handleColorClick()}},{key:"componentWillUnmount",value:function(){window.removeEventListener("scroll",this.handleScroll)}},{key:"handleScroll",value:function(){window.pageYOffset>this.nav.offsetTop?this.setState({isSticky:!0}):this.setState({isSticky:!1})}},{key:"scrollToPage",value:function(e){var t=document.querySelector(e);g(t)}},{key:"handleColorClick",value:function(){var e=[{textColor:"#FF4136",bgColor:"#fff",altBg:"#FF4136",altText:"#fff"},{textColor:"#0074D9",bgColor:"#fff",altBg:"#0074D9",altText:"#fff"},{textColor:"#FF851B",bgColor:"#fff",altBg:"#FF851B",altText:"#fff"},{textColor:"#fff",bgColor:"#FF851B",altBg:"#ffa85c",altText:"#fff"},{textColor:"#fff",bgColor:"#FF4136",altBg:"#ca5f59",altText:"#fff"},{textColor:"#fff",bgColor:"#0074D9",altBg:"#6bbaff",altText:"#fff"}],t=e[Math.floor(Math.random()*e.length)];if(null!==this.state.color)for(;t.textColor===this.state.color.textColor&&t.bgColor===this.state.color.bgColor;)t=e[Math.floor(Math.random()*e.length)];var n=document.documentElement;n.style.setProperty("--text-color",t.textColor),n.style.setProperty("--bg-color",t.bgColor),n.style.setProperty("--alt-bg",t.altBg),n.style.setProperty("--alt-text",t.altText),this.setState({color:t})}},{key:"render",value:function(){var e=this,t=this.state.isSticky?"sticky":"",n=(this.state.isSticky,{backgroundColor:"var(--bg-color)",color:"var(--text-color)"});return o.a.createElement("header",null,o.a.createElement("nav",{className:t,ref:function(t){e.nav=t},style:n},o.a.createElement("div",{className:"magic-wand bounce-xy",onClick:function(){return e.handleColorClick()}},o.a.createElement(h.a,{style:{color:"var(--text-color)"},icon:d.d}),o.a.createElement("div",{className:"magic-text"},"Color Me!")),o.a.createElement("div",{className:"menu"},o.a.createElement("div",{className:"menu__item",onClick:function(t){return e.scrollToPage(".about")}},"About"),o.a.createElement("div",{className:"menu__item",onClick:function(t){return e.scrollToPage(".portfolio")}},"Portfolio"))))}}]),t}(o.a.Component),v=n(1),w=(n(38),n(39),function(e){function t(){return Object(l.a)(this,t),Object(c.a)(this,Object(m.a)(t).apply(this,arguments))}return Object(p.a)(t,e),Object(s.a)(t,[{key:"scrollToNext",value:function(){var e=this.props.to,t=document.querySelector(e);g(t)}},{key:"render",value:function(){var e=this;return o.a.createElement("div",{className:"scroll",onClick:function(){return e.scrollToNext()}},o.a.createElement("div",{className:"arrow bounce"},this.props.text&&o.a.createElement("div",{className:"scroll-text"},this.props.text),this.props.prev?o.a.createElement(h.a,{style:{color:"var(--text-color)"},icon:d.c,size:"2x"}):o.a.createElement(h.a,{style:{color:"var(--text-color)"},icon:d.b,size:"2x"})))}}]),t}(o.a.Component)),E=(n(40),function(e){function t(){return Object(l.a)(this,t),Object(c.a)(this,Object(m.a)(t).apply(this,arguments))}return Object(p.a)(t,e),Object(s.a)(t,[{key:"render",value:function(){var e=this;return o.a.createElement("div",{className:"glowing-text"},this.props.letters.constructor===Array?this.props.letters.map(function(t,n){return o.a.createElement("span",{key:t+n,style:{animationDelay:e.props.delay?"".concat(e.props.delay+100*n,"ms"):"".concat(100*n,"ms")}},t)}):o.a.createElement("span",{style:{animationDelay:"".concat(this.props.delay?this.props.delay:2e3,"ms")}},this.props.letters))}}]),t}(o.a.Component)),k=function(e){function t(){return Object(l.a)(this,t),Object(c.a)(this,Object(m.a)(t).apply(this,arguments))}return Object(p.a)(t,e),Object(s.a)(t,[{key:"render",value:function(){var e="Creator | Engineer | Scientist".split("");return o.a.createElement("div",{className:"landing"},o.a.createElement("main",null,o.a.createElement("div",{className:"wrapper"},o.a.createElement("div",{className:"intro"},"Hi, I'm Christopher!"),o.a.createElement("div",{className:"tagline"},o.a.createElement(E,{delay:1e3,letters:e})),o.a.createElement("div",{className:"social animate-icons"},o.a.createElement("a",{target:"_blank",rel:"noopener noreferrer",href:"https://github.com/christophgomez"},o.a.createElement(h.a,{style:{color:"var(--text-color)"},icon:v.d})),o.a.createElement("a",{target:"_blank",rel:"noopener noreferrer",href:"https://www.linkedin.com/in/christopher-gomez-8489a7186/"},o.a.createElement(h.a,{style:{color:"var(--text-color)"},icon:v.g})),o.a.createElement("a",{target:"_blank",rel:"noopener noreferrer",href:"https://codepen.io/christophergomez"},o.a.createElement(h.a,{style:{color:"var(--text-color)"},icon:v.b}))))),o.a.createElement(w,{to:".about"}))}}]),t}(o.a.Component),S=(n(41),n(42),function(e){function t(e){var n;return Object(l.a)(this,t),(n=Object(c.a)(this,Object(m.a)(t).call(this,e))).state={slides:o.a.Children.toArray(n.props.children),slideIndex:0},n}return Object(p.a)(t,e),Object(s.a)(t,[{key:"goNext",value:function(){var e=this.state.slideIndex;this.showSlide(++e)}},{key:"goPrev",value:function(){var e=this.state.slideIndex;this.showSlide(--e)}},{key:"showSlide",value:function(e){var t=this.state.slideIndex;t=e>=this.state.slides.length?0:e<0?this.state.slides.length-1:e,this.setState({slideIndex:t})}},{key:"render",value:function(){var e,t=this,n=this.state.slides,a=null;return n.length>0?(e=n.map(function(e,n){return o.a.createElement("div",{className:"mySlides fade",style:{display:n===t.state.slideIndex?"block":"none"}},e)}),a=n.map(function(e,n){return o.a.createElement("span",{className:t.state.slideIndex===n?"dot active":"dot",onClick:function(){return t.showSlide(n)}})})):e=o.a.createElement("div",{className:"mySlides"},"Add Some Slides as Component Children"),o.a.createElement("div",{className:"slideshow"},o.a.createElement("div",{className:"slideshow-container"},e,o.a.createElement("a",{className:"prev",onClick:function(){return t.goPrev()}},"\u276e"),o.a.createElement("a",{className:"next",onClick:function(){return t.goNext()}},"\u276f")),o.a.createElement("br",null),o.a.createElement("div",{className:"dot-container"},a))}}]),t}(o.a.Component)),C=n(15),x=n.n(C),j=function(e){function t(){return Object(l.a)(this,t),Object(c.a)(this,Object(m.a)(t).apply(this,arguments))}return Object(p.a)(t,e),Object(s.a)(t,[{key:"render",value:function(){return o.a.createElement("div",{className:"about"},o.a.createElement(S,null,o.a.createElement("div",{className:"content-grid"},o.a.createElement("h1",null,"About"),o.a.createElement("div",{className:"wrapper"},o.a.createElement("div",{className:"content"},o.a.createElement("p",null,"Computer Science is my background, Software Engineering is my process, Creating is my passion."),o.a.createElement("p",null,"I'm a believer of creative expression and thoughtful design in order to build a better, more accessible, personal, and most importantly, fun user experience."),o.a.createElement("p",null,"I love JavaScript and everything web related because of the platform's openness, interactive affordances, and ability to reach and connect with broad audiences. I'm particularly interested in the intersection between web development, human-computer interaction, and multimedia."),o.a.createElement("p",null,"When my dev senses kick-in I build presumably awesome stuff. I stay close to the community and try to keep tabs with the pace at which the web is evolving."),o.a.createElement("p",null,"React-Redux, Vue-Vuex, Angular, Express, Node.js, MongoDB, Git, Heroku, and AWS are the main tricks up my sleeve. I'm also obsessed with making the web look pretty with SASS/CSS, and making fun, interactive graphics with the Canvas API and WebGL."),o.a.createElement("p",null,"Never one to shy away from hard problems and difficult concepts I also enjoy hackathons, code challenges, analyzing big data, fine-tuning machine learning models, video game development, writing shaders, creative coding and generative art, and combining hardware and software to build innovative solutions, tools, and experiences."),o.a.createElement("p",null,o.a.createElement("a",{style:{marginRight:".25em"},href:"mailto:c.gomez3644@gmail.com"},"Contact"),o.a.createElement("a",{target:"_blank",rel:"noopener noreferrer",style:{marginLeft:".25em"},href:x.a},"Resume"))))),o.a.createElement("div",{className:"content-grid"},o.a.createElement("h1",null,"Skills"),o.a.createElement("div",{className:"wrapper"},o.a.createElement("div",{className:"content skills"},o.a.createElement("div",null,o.a.createElement("h3",null,"Languages"),o.a.createElement("p",null,"JavaScript, Java, C#, C++, C, Python, R, Prolog, Bash, Swift.")),o.a.createElement("div",null,o.a.createElement("h3",null,"Tools & Technologies"),o.a.createElement("p",null,"React/Redux, Vue/Vuex, Angular, Node.js, Express, Webpack, Babel, ES6, ES7, MongoDB, SQL, Karma, Mocha, Git, AWS, Docker, Heroku, Socket.io, WebGL, Three.js, SASS/SCSS, Bootstrap, OpenGL, Tensorflow, Unity, Blender, SolidWorks, CAD AutoDesk, Raspberry PI.")),o.a.createElement("div",null,o.a.createElement("h3",null,"Knowledge Industry"),o.a.createElement("p",null,"Software Development Life Cycle, Agile, Software Documentation, Software Project Management, UI/UX Design, Multimedia Design and Development, Architecture, Data Analysis, Algorithms, Data Structures.")),o.a.createElement("div",null,o.a.createElement("h3",null,"Interpersonal Skills"),o.a.createElement("p",null,"Teaching, Leadership, Teamwork, Verbal and Written Communication, Dependability, Responsibility."))))),o.a.createElement("div",{className:"content-grid"},o.a.createElement("h1",null,"Bio"),o.a.createElement("div",{className:"wrapper"},o.a.createElement("div",{className:"content"},o.a.createElement("p",null,"Born and raised in Los Angeles, I recently graduated from California State University Northridge with a B.S. in Computer Science, I even earned an A.S. in Mathematics along the way!"),o.a.createElement("p",null,"I started programming in my early teens, learning HTML, CSS, and JavaScript in an effort to create games. This effort most likely stemmed from my innate desire to build and design things. A builder at heart, my favorite toys growing up were Legos, one of my favorite games was Minecraft, and I took 3 years of architecture classes in highschool  before these interests led me into the wonderful world of Computer Science."),o.a.createElement("p",null,"Simultaneously shrinking the world and expanding all of our personal worlds, I believe the internet is one of the most important human inventions. With most of our time spent on the intenet, I enjoy making that time spent a more pleasant and interesting place. And fascinated by Human-Computer Interaction, it's no surprise I'm drawn to the web. Not only does the internet allow for me to put my work in a place everyone in the world can access it freely and easily, but it's also constantly evolving with the pace of technology, allowing for more immersive, interactive human-computer experiences."),o.a.createElement("p",null,"When I'm not programming or tutoring Computer Science, my two dogs take most of my time, but I also enjoy running cross country trails, traveling the world, going to the movies (MoviePass era, I miss you!), watching the NBA, reading about history, current events, and politics, and discovering new bands at my favorite LA hotspots."))))),o.a.createElement("p",{className:"text-emoji"},"\\(^\u25c7^)/"),o.a.createElement(w,{to:".portfolio"}))}}]),t}(o.a.Component),N=(n(43),n(44),function(e){function t(){return Object(l.a)(this,t),Object(c.a)(this,Object(m.a)(t).apply(this,arguments))}return Object(p.a)(t,e),Object(s.a)(t,[{key:"render",value:function(){var e=this.props.item?this.props.item:{};return o.a.createElement("div",{className:"portfolio-item"},e.img&&o.a.createElement("div",{className:"portfolio-item__img",style:{backgroundImage:"url(".concat(e.img,")")}}),o.a.createElement("div",{className:"portfolio-item__title"},e.title?e.title:"Title"),o.a.createElement("div",{className:"portfolio-item__desc"},e.description?e.description:"Project Description"),e.icons&&o.a.createElement("div",{className:"portfolio-item__icon"},this.props.item.icons.map(function(e){return"font-awesome"===e.type?o.a.createElement(h.a,{icon:e.icon}):o.a.createElement("i",{className:"".concat(e.icon)})})),e.links&&o.a.createElement("div",{className:"portfolio-item__links"},this.props.item.links.map(function(e){return o.a.createElement("a",{target:"_blank",rel:"noopener noreferrer",href:e.href},e.title)})))}}]),t}(o.a.Component)),O=n(16),z=n.n(O),A=n(17),I=n.n(A),T=n(18),D=n.n(T),B=n(19),P=n.n(B),M=n(20),L=n.n(M),W=n(21),_=n.n(W),G=n(22),R=n.n(G),J=n(23),F=n.n(J),V=n(24),U=[{img:n.n(V).a,title:"3D Tilemap Engine",description:"A 3D JavaScript tilemap engine powered by Three.js. Currently in development.",icons:[{type:"font-awesome",icon:v.h},{type:"font-awesome",icon:v.k}],links:[{title:"Website",href:"https://christophgomez.github.io/tiles.js/#/"},{title:"Github",href:"https://github.com/christophgomez/tiles.js"}]},{img:z.a,title:"Synesthesiafy",description:"Node, Express, React web app that explores the relationship between music and color using Spotify",icons:[{type:"font-awesome",icon:v.h},{type:"font-awesome",icon:v.k},{type:"font-awesome",icon:v.l},{type:"mfizz",icon:"icon-bootstrap"},{type:"font-awesome",icon:v.c}],links:[{title:"Website",href:"https://synesthesiafy.herokuapp.com/"},{title:"Github",href:"https://github.com/christophgomez/synesthesiafy"}]},{img:I.a,title:"Spotilize",description:"Node, Express, Vue web app that utilizes a Chrome extension to analyze and visualize Spotify audio frequency waves.",icons:[{type:"font-awesome",icon:v.h},{type:"font-awesome",icon:v.m},{type:"font-awesome",icon:v.l},{type:"font-awesome",icon:v.a}],links:[{title:"Website",href:"https://spotilize.herokuapp.com/"},{title:"Github",href:"https://github.com/christophgomez/Spotify-VIsualizer"}]},{img:D.a,title:"NBA Rosters",description:"Node, Express, Vue, MongoDB web app that utilizes a RESTful API for CRUDL operations on NBA team rosters.",icons:[{type:"font-awesome",icon:v.h},{type:"font-awesome",icon:v.m},{type:"mfizz",icon:"icon-mongodb"}],links:[{title:"Website",href:"https://nbarosters.herokuapp.com/"},{title:"Github",href:"https://github.com/christophgomez/NBARosters"}]},{img:P.a,title:"smooth-load",description:"A GSAP and CSS3 animation powered loading spinner component for VueJS, deployed on NPM",icons:[{type:"font-awesome",icon:v.m},{type:"font-awesome",icon:v.c},{type:"font-awesome",icon:v.e},{type:"font-awesome",icon:v.i}],links:[{title:"Website",href:"https://christophgomez.github.io/smooth-load/"},{title:"NPM",href:"https://www.npmjs.com/package/smooth-load"},{title:"Github",href:"https://github.com/christophgomez/smooth-load"}]},{img:L.a,title:"Tower Defense Builder",description:"A procedurally generated, 3D crafting/survival game created with C#, Unity, and Blender.",icons:[{type:"fizz",icon:"icon-csharp"},{type:"fizz",icon:"icon-unity"}],links:[{title:"Github",href:"https://github.com/christophgomez/UnityRPGCityBuilderTowerDefenseCrafter"}]},{img:_.a,title:"SmartDJ",description:"An alternative to voice-based AI assistants, this software controls Spotify with nothing but your hand movements. (OpenCV, Python, Microsoft Kinect)",icons:[{type:"font-awesome",icon:v.j},{type:"fizz",icon:"icon-csharp"},{type:"font-awesome",icon:v.m},{type:"font-awesome",icon:v.h},{type:"mfizz",icon:"icon-shell"},{type:"font-awesome",icon:v.l},{type:"mfizz",icon:"icon-mongodb"}],links:[{title:"Github",href:"https://github.com/christophgomez/SmartDJ"}]},{img:R.a,title:"Spotify ML",description:"Machine Learning with Spotify to simulate Spotify's Discovery feature. Classification / Prediction based on user's listening habits, integrated with Amazon Alexa.",icons:[{type:"font-awesome",icon:v.j},{type:"mfizz",icon:"icon-shell"},{type:"font-awesome",icon:v.h},{type:"font-awesome",icon:v.l}],links:[{title:"Jupyter Notebook",href:"https://github.com/christophgomez/DJ-Spotify/blob/master/DJ%20Spotify.ipynb"},{title:"Github",href:"https://github.com/christophgomez/DJ-Spotify"}]},{img:F.a,title:"Generative Art",description:"A collection of doodles and creative expressions created with JavaScript, the HTML Canvas API, WebGL, and popular rendering libraries D3 and Three.js",icons:[{type:"font-awesome",icon:v.f},{type:"mfizz",icon:"icon-d3"}],links:[{title:"Codepen",href:"https://codepen.io/christophergomez"}]}],H=function(e){function t(){return Object(l.a)(this,t),Object(c.a)(this,Object(m.a)(t).apply(this,arguments))}return Object(p.a)(t,e),Object(s.a)(t,[{key:"render",value:function(){return o.a.createElement("div",{className:"portfolio"},o.a.createElement("div",{className:"content-grid"},o.a.createElement("h1",null,"Portfolio"),o.a.createElement("div",{className:"portfolio-wrapper"},U.map(function(e){return o.a.createElement(N,{item:e})}))),o.a.createElement(w,{prev:!0,to:".about"}))}}]),t}(o.a.Component),q=(n(45),function(e){function t(){return Object(l.a)(this,t),Object(c.a)(this,Object(m.a)(t).apply(this,arguments))}return Object(p.a)(t,e),Object(s.a)(t,[{key:"render",value:function(){return o.a.createElement("div",{className:"parallax"},o.a.createElement("div",{id:"stars1"}),o.a.createElement("div",{id:"stars2"}),o.a.createElement("div",{id:"stars3"}))}}]),t}(o.a.Component)),K=(n(46),function(e){function t(e){var n;return Object(l.a)(this,t),(n=Object(c.a)(this,Object(m.a)(t).call(this,e))).handleScroll=n.handleScroll.bind(Object(u.a)(n)),n.state={shouldShowScrollTopArrow:!1},n}return Object(p.a)(t,e),Object(s.a)(t,[{key:"handleScroll",value:function(){((document||{}).documentElement||{}).getBoundingClientRect&&(-1*document.documentElement.getBoundingClientRect().top>100?this.setState({shouldShowScrollTopArrow:!0}):this.setState({shouldShowScrollTopArrow:!1}))}},{key:"componentDidMount",value:function(){window.addEventListener("scroll",this.handleScroll)}},{key:"componentWillUnmount",value:function(){window.removeEventListener("scroll",this.handleScroll)}},{key:"render",value:function(){var e=this.state.shouldShowScrollTopArrow?"":"hide";return o.a.createElement("div",{className:"scroll-top",onClick:function(e){return y()}},o.a.createElement("div",{className:"arrow ".concat(e),style:{color:"var(--text-color)"}},o.a.createElement(h.a,{icon:d.a,size:"2x"}),o.a.createElement("div",{className:"to-top"},"To Top")))}}]),t}(o.a.Component)),Q=function(e){function t(){return Object(l.a)(this,t),Object(c.a)(this,Object(m.a)(t).apply(this,arguments))}return Object(p.a)(t,e),Object(s.a)(t,[{key:"render",value:function(){return o.a.createElement("div",{className:"App"},o.a.createElement(b,null),o.a.createElement(q,null),o.a.createElement(K,null),o.a.createElement(k,null),o.a.createElement(j,null),o.a.createElement(H,null))}}]),t}(o.a.Component);Boolean("localhost"===window.location.hostname||"[::1]"===window.location.hostname||window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/));r.a.render(o.a.createElement(Q,null),document.getElementById("root")),"serviceWorker"in navigator&&navigator.serviceWorker.ready.then(function(e){e.unregister()})}],[[25,1,2]]]);
//# sourceMappingURL=main.97dff547.chunk.js.map