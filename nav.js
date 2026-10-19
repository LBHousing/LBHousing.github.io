/* LiBRE — shared nav + footer, injected into every page. Marks the active link by filename.
   Embed mode (for wearelibre.org / Wix): add ?embed to any page URL, or load it inside an iframe.
   In embed mode the nav and footer are hidden (Wix supplies its own), links open in the top window,
   and the page reports its height to the parent so a Wix "Embed HTML" wrapper can size itself. */
(function(){
  var PAGES=[
    ["index.html","Home"],
    ["district-stats.html","District Stats"],
    ["ownership.html","Who Owns LB"],
    ["housing-maps.html","Housing Maps"],
    ["code-enforcement.html","Code Enforcement"],
    ["evictions.html","Evictions"],
    ["data.html","More Maps"],
    ["team.html","Team"]
  ];
  var SUB=["ctpa.html","parcels.html","ud-filings.html","demographics.html","assisted-housing.html","neighborhoods.html","hotspots.html","environment.html"];
  /* Where each page lives on wearelibre.org. Used only in embed mode so links move the whole Wix page. */
  var WIX_BASE="https://www.wearelibre.org";
  var WIX={"index.html":"/data-hub","district-stats.html":"/district-stats","ownership.html":"/who-owns-long-beach","housing-maps.html":"/housing-maps",
    "code-enforcement.html":"/code-enforcement","evictions.html":"/evictions","data.html":"/maps-data","team.html":"/data-team","story.html":"/housing-is-health",
    "ctpa.html":"/tenant-protections","parcels.html":"/parcel-explorer","ud-filings.html":"/eviction-filings","demographics.html":"/who-owns-who-rents",
    "assisted-housing.html":"/assisted-housing","neighborhoods.html":"/neighborhood-conditions","hotspots.html":"/violation-hotspots","environment.html":"/environmental-burden"};

  var q=location.search||"";
  var inFrame=false; try{inFrame=window.self!==window.top;}catch(e){inFrame=true;}
  var embed=/[?&]embed\b/.test(q)||inFrame;
  var here=(location.pathname.split("/").pop()||"index.html")||"index.html";
  var active=SUB.indexOf(here)>-1?"data.html":here;
  document.documentElement.lang=document.documentElement.lang||"en";

  /* main landmark + skip target */
  var main=document.querySelector("main");
  if(!main){ main=document.querySelector("body > .wrap, body > div:not(.nav)"); if(main&&!main.getAttribute("role")) main.setAttribute("role","main"); }
  if(main&&!main.id) main.id="main";

  /* accessibility safety net: label unlabeled form controls, make scroll areas keyboard-reachable */
  function a11y(){
    document.querySelectorAll("select,input:not([type=hidden])").forEach(function(el){
      if(el.getAttribute("aria-label")||el.getAttribute("aria-labelledby")||el.closest("label")) return;
      if(el.id&&document.querySelector('label[for="'+el.id+'"]')) return;
      var g=el.closest(".cg,.ctrl,.control,.field,div"), lab=g&&g.querySelector("label,.lbl,.label");
      var t=(lab&&lab.textContent.trim())||el.getAttribute("title")||el.getAttribute("placeholder")||el.id.replace(/([A-Z])/g," $1");
      el.setAttribute("aria-label",t.replace(/\s+/g," ").trim());
    });
    document.querySelectorAll(".tablewrap,.table-wrap,.lb,[data-scroll]").forEach(function(el){
      if(el.hasAttribute("tabindex")) return; var cs=getComputedStyle(el);
      if(/(auto|scroll)/.test(cs.overflowY+cs.overflowX)){ el.tabIndex=0; if(!el.getAttribute("role")) el.setAttribute("role","region");
        if(!el.getAttribute("aria-label")){ var h=el.closest("section,.card"); h=h&&h.querySelector("h2,h3,.h3"); el.setAttribute("aria-label",(h?h.textContent.trim():"Scrollable table")); } }
    });
  }
  if(document.readyState==="complete") a11y(); else window.addEventListener("load",a11y);
  setTimeout(a11y,2500);

  if(embed){
    document.documentElement.classList.add("embed");
    var st=document.createElement("style");
    st.textContent="html.embed .nav,html.embed .footer,html.embed .skip{display:none!important}html.embed body{padding-top:0}";
    document.head.appendChild(st);
    /* links: send internal pages to the matching wearelibre.org page, external links to a new tab */
    document.addEventListener("click",function(e){
      var a=e.target.closest&&e.target.closest("a[href]"); if(!a) return;
      var href=a.getAttribute("href"); if(!href||href.charAt(0)==="#"||a.hasAttribute("download")||/^(mailto|tel):/.test(href)) return;
      var file=href.split("#")[0].split("?")[0].split("/").pop();
      if(/^https?:/.test(href)&&href.indexOf(location.host)<0){ a.target="_blank"; a.rel="noopener"; return; }
      if(WIX[file]){ e.preventDefault(); var hash=href.indexOf("#")>-1?href.slice(href.indexOf("#")):""; var dest=WIX_BASE+WIX[file]+hash; try{ window.top.location.href=dest; }catch(err){ location.href=href+(href.indexOf("?")>-1?"&":"?")+"embed"; } }
    },true);
    /* report height to the parent (Wix HTML embed wrapper listens for this) */
    var last=0;
    function report(){ var h=Math.ceil(Math.max(document.documentElement.scrollHeight,document.body.scrollHeight));
      if(Math.abs(h-last)>2){ last=h; try{ parent.postMessage({type:"libre-embed-height",page:here,height:h},"*"); }catch(e){} } }
    window.addEventListener("load",report); window.addEventListener("resize",report);
    if(window.ResizeObserver) new ResizeObserver(report).observe(document.body); else setInterval(report,1000);
    setTimeout(report,300);
    return;
  }

  var skip=document.createElement("a");
  skip.className="skip"; skip.href="#main"; skip.textContent="Skip to main content";
  document.body.insertBefore(skip,document.body.firstChild);

  var links=PAGES.map(function(p){
    return '<a href="'+p[0]+'"'+(p[0]===active?' class="active" aria-current="page"':'')+'>'+p[1]+'</a>';
  }).join("");

  var nav=document.createElement("header");
  nav.className="nav";
  nav.innerHTML=
    '<div class="nav-in">'+
      '<a class="brand" href="index.html" aria-label="LiBRE Long Beach, home"><span class="dot" aria-hidden="true"></span>LiBRE <small>Long Beach</small></a>'+
      '<button class="nav-toggle" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="site-nav">☰</button>'+
      '<nav class="nav-links" id="site-nav" aria-label="Main">'+links+'</nav>'+
    '</div>';
  document.body.insertBefore(nav,skip.nextSibling);
  var btn=nav.querySelector(".nav-toggle"), menu=nav.querySelector(".nav-links");
  function setOpen(o){menu.classList.toggle("open",o);btn.setAttribute("aria-expanded",o?"true":"false");btn.setAttribute("aria-label",o?"Close menu":"Open menu");}
  btn.addEventListener("click",function(){setOpen(!menu.classList.contains("open"));});
  menu.addEventListener("click",function(e){if(e.target.tagName==="A")setOpen(false);});
  document.addEventListener("keydown",function(e){if(e.key==="Escape"&&menu.classList.contains("open")){setOpen(false);btn.focus();}});

  var f=document.createElement("footer");
  f.className="footer";
  f.innerHTML=
    '<div class="wrap footer-in">'+
      '<div style="max-width:340px">'+
        '<div class="brand"><span class="dot" aria-hidden="true"></span>LiBRE <small>Long Beach</small></div>'+
        '<p>Long Beach Residents Empowered — advancing housing justice through data, organizing, and power. Housing is a human right.</p>'+
      '</div>'+
      '<div class="cols">'+
        '<nav class="col" aria-label="Data and maps"><h2 class="h4">Data &amp; Maps</h2>'+
          '<a href="district-stats.html">District Statistics</a>'+
          '<a href="ownership.html">Who Owns Long Beach</a>'+
          '<a href="code-enforcement.html">Code Violations</a>'+
          '<a href="hotspots.html">Violation Hot Spots</a>'+
          '<a href="evictions.html">Eviction Dashboard</a>'+
          '<a href="housing-maps.html">Housing Maps</a>'+
          '<a href="ctpa.html">Tenant Protections (TPA)</a>'+
          '<a href="parcels.html">Parcel Explorer</a>'+
          '<a href="ud-filings.html">Eviction Filings</a>'+
          '<a href="demographics.html">Who Owns, Who Rents</a>'+
          '<a href="assisted-housing.html">Assisted Housing</a>'+
          '<a href="neighborhoods.html">Neighborhood Conditions</a>'+
          '<a href="environment.html">Environmental Burden</a>'+
          '<a href="data.html">Open Data</a></nav>'+
        '<nav class="col" aria-label="Organization"><h2 class="h4">Organization</h2>'+
          '<a href="team.html">Our Team</a>'+
          '<a href="https://www.wearelibre.org" rel="noopener">wearelibre.org</a>'+
          '<a href="https://github.com/LBHousing" target="_blank" rel="noopener">GitHub<span class="sr-only"> (opens in a new tab)</span></a></nav>'+
      '</div>'+
    '</div>'+
    '<div class="wrap fine">© '+new Date().getFullYear()+' Long Beach Residents Empowered · Data from the U.S. Census Bureau, LA County Assessor, and City of Long Beach public records · Built and maintained by LiBRE.</div>';
  document.body.appendChild(f);
})();
