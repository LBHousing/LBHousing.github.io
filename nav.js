/* LiBRE — shared nav + footer, injected into every page. Marks the active link by filename. */
(function(){
  var PAGES=[
    ["index.html","Home"],
    ["district-stats.html","District Stats"],
    ["ownership.html","Who Owns LB"],
    ["housing-maps.html","Housing Maps"],
    ["code-enforcement.html","Code Enforcement"],
    ["evictions.html","Evictions"],
    ["team.html","Team"]
  ];
  var here=(location.pathname.split("/").pop()||"index.html")||"index.html";
  if(here==="")here="index.html";

  var links=PAGES.map(function(p){
    return '<a href="'+p[0]+'"'+(p[0]===here?' class="active"':'')+'>'+p[1]+'</a>';
  }).join("");

  var nav=document.createElement("div");
  nav.className="nav";
  nav.innerHTML=
    '<div class="nav-in">'+
      '<a class="brand" href="index.html"><span class="dot"></span>LiBRE <small>Long Beach</small></a>'+
      '<button class="nav-toggle" aria-label="Menu">☰</button>'+
      '<nav class="nav-links">'+links+'</nav>'+
    '</div>';
  document.body.insertBefore(nav,document.body.firstChild);
  var btn=nav.querySelector(".nav-toggle"), menu=nav.querySelector(".nav-links");
  btn.addEventListener("click",function(){menu.classList.toggle("open");});
  menu.addEventListener("click",function(e){if(e.target.tagName==="A")menu.classList.remove("open");});

  var f=document.createElement("footer");
  f.className="footer";
  f.innerHTML=
    '<div class="wrap footer-in">'+
      '<div style="max-width:340px">'+
        '<div class="brand"><span class="dot"></span>LiBRE <small>Long Beach</small></div>'+
        '<p>Long Beach Residents Empowered — advancing housing justice through data, organizing, and power. Housing is a human right.</p>'+
      '</div>'+
      '<div class="cols">'+
        '<div class="col"><h4>Data & Maps</h4>'+
          '<a href="district-stats.html">District Statistics</a>'+
          '<a href="ownership.html">Who Owns Long Beach</a>'+
          '<a href="code-enforcement.html">Code Violations</a>'+
          '<a href="evictions.html">Eviction Dashboard</a>'+
          '<a href="housing-maps.html">Housing Maps</a></div>'+
        '<div class="col"><h4>Organization</h4>'+
          '<a href="team.html">Our Team</a>'+
          '<a href="index.html#mission">Mission</a>'+
          '<a href="https://github.com/LBHousing" target="_blank" rel="noopener">GitHub</a></div>'+
      '</div>'+
    '</div>'+
    '<div class="wrap fine">© '+new Date().getFullYear()+' Long Beach Residents Empowered · Data from the U.S. Census Bureau, LA County Assessor, and City of Long Beach public records · Built and maintained by LiBRE.</div>';
  document.body.appendChild(f);
})();
