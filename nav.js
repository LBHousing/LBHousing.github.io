/* LiBRE — shared nav + footer, injected into every page. Marks the active link by filename.
   Embed mode (for the Wix site): add ?embed to any page URL, or load it inside an iframe.
   In embed mode the nav and footer are hidden (Wix supplies its own), links open in the top window,
   and the page reports its height to the parent so a Wix "Embed HTML" wrapper can size itself. */
(function(){
  /* Site map: organization pages first, data platform under "Data & Maps". */
  var MENU=[
    ["index.html","Home"],
    ["about.html","About"],
    ["get-help.html","Get Help"],
    ["workshops.html","Workshops"],
    ["Campaigns",[["coalition.html","Housing Justice Coalition"],["just-cause.html","Just Cause"],["endorsements.html","Endorse Just Cause"],["build-long-beach.html","Block the Cuts & Build Long Beach"]]],
    ["Data & Maps",[["data-hub.html","Data hub"],["district-stats.html","District statistics"],["ownership.html","Who owns Long Beach"],["evictions.html","Eviction dashboard"],
      ["code-enforcement.html","Code violations"],["housing-maps.html","Housing maps"],["neighborhoods.html","Neighborhood conditions"],["environment.html","Environmental burden"],
      ["story.html","Housing Is Health"],["data.html","All maps & open data"]]],
    ["careers.html","Careers"]
  ];
  var DATA_SUB=["ctpa.html","parcels.html","ud-filings.html","demographics.html","assisted-housing.html","hotspots.html","team.html"];
  /* Where each page would live on the Wix site. Used only in embed mode so links move the whole Wix page. */
  var WIX_BASE="https://www.wearelbre.org";
  var WIX={"data-hub.html":"/data-hub","district-stats.html":"/district-stats","ownership.html":"/who-owns-long-beach","housing-maps.html":"/housing-maps",
    "code-enforcement.html":"/code-enforcement","evictions.html":"/evictions","data.html":"/maps-data","team.html":"/data-team","story.html":"/housing-is-health",
    "ctpa.html":"/tenant-protections","parcels.html":"/parcel-explorer","ud-filings.html":"/eviction-filings","demographics.html":"/who-owns-who-rents",
    "assisted-housing.html":"/assisted-housing","neighborhoods.html":"/neighborhood-conditions","hotspots.html":"/violation-hotspots","environment.html":"/environmental-burden",
    "index.html":"/","about.html":"/about","get-help.html":"/tenant-resources","workshops.html":"/stayhousedla","coalition.html":"/hjc","just-cause.html":"/hjc/just-cause","endorsements.html":"/hjc/endorsements","careers.html":"/careers","build-long-beach.html":"/build-long-beach"};

  var q=location.search||"";
  var inFrame=false; try{inFrame=window.self!==window.top;}catch(e){inFrame=true;}
  var embed=/[?&]embed\b/.test(q)||inFrame;
  var here=(location.pathname.split("/").pop()||"index.html")||"index.html";
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
    /* links: send internal pages to the matching wearelbre.org page, external links to a new tab */
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

  var dd=0;
  function link(p){ var cur=p[0]===here; return '<a href="'+p[0]+'"'+(cur?' aria-current="page" class="active"':'')+'>'+p[1]+'</a>'; }
  var items=MENU.map(function(m){
    if(typeof m[1]==="string") return '<li>'+link(m)+'</li>';
    var id="dd"+(dd++), hasCur=m[1].some(function(x){return x[0]===here;})||(m[0]==="Data & Maps"&&DATA_SUB.indexOf(here)>-1);
    return '<li class="has-dd"><button type="button" class="dd-btn'+(hasCur?' active':'')+'" aria-expanded="false" aria-controls="'+id+'">'+m[0].replace("&","&amp;")+' <span aria-hidden="true" class="car">▾</span></button>'+
      '<ul class="dd" id="'+id+'">'+m[1].map(function(x){return '<li>'+link(x)+'</li>';}).join("")+'</ul></li>';
  }).join("");

  var nav=document.createElement("header");
  nav.className="nav";
  nav.innerHTML=
    '<div class="nav-in">'+
      '<a class="brand" href="index.html" aria-label="LiBRE, Long Beach Residents Empowered, home"><span class="dot" aria-hidden="true"></span>LiBRE <small>Long Beach</small></a>'+
      '<button class="nav-toggle" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="site-nav">☰</button>'+
      '<nav class="nav-links" id="site-nav" aria-label="Main"><ul class="menu">'+items+'</ul>'+
        '<a class="btn sm nav-cta" href="get-help.html">Get help</a></nav>'+
    '</div>';
  document.body.insertBefore(nav,skip.nextSibling);
  var btn=nav.querySelector(".nav-toggle"), menu=nav.querySelector(".nav-links");
  function setOpen(o){menu.classList.toggle("open",o);btn.setAttribute("aria-expanded",o?"true":"false");btn.setAttribute("aria-label",o?"Close menu":"Open menu");}
  btn.addEventListener("click",function(){setOpen(!menu.classList.contains("open"));});
  function closeDD(except){ nav.querySelectorAll(".dd-btn").forEach(function(b){ if(b!==except){ b.setAttribute("aria-expanded","false"); b.parentNode.classList.remove("open"); } }); }
  nav.querySelectorAll(".dd-btn").forEach(function(b){
    b.addEventListener("click",function(e){ e.stopPropagation(); var o=b.getAttribute("aria-expanded")!=="true"; closeDD(b); b.setAttribute("aria-expanded",o?"true":"false"); b.parentNode.classList.toggle("open",o); });
  });
  document.addEventListener("click",function(e){ if(!nav.contains(e.target)) closeDD(); });
  menu.addEventListener("click",function(e){if(e.target.tagName==="A"){setOpen(false);closeDD();}});
  document.addEventListener("keydown",function(e){ if(e.key!=="Escape") return;
    var openB=nav.querySelector('.dd-btn[aria-expanded="true"]'); if(openB){ closeDD(); openB.focus(); return; }
    if(menu.classList.contains("open")){setOpen(false);btn.focus();} });
  nav.addEventListener("focusout",function(e){ if(!nav.contains(e.relatedTarget)) closeDD(); });
  var st2=document.createElement("style");
  st2.textContent=".nav .menu{display:flex;gap:2px;list-style:none;margin:0;padding:0;align-items:center}"+
   ".nav .menu>li{position:relative}"+
   ".nav .menu a,.nav .dd-btn{font:500 13.5px var(--sans);color:var(--soft);padding:8px 11px;border-radius:8px;white-space:nowrap;background:none;border:0;cursor:pointer;display:block}"+
   ".nav .menu a:hover,.nav .dd-btn:hover{color:var(--ink);background:rgba(255,255,255,.05)}"+
   ".nav .menu a.active,.nav .dd-btn.active{color:var(--ink);background:rgba(77,138,232,.16)}"+
   ".nav .car{font-size:10px;opacity:.7;margin-left:2px}"+
   ".nav .dd{display:none;position:absolute;top:calc(100% + 6px);left:0;min-width:250px;list-style:none;margin:0;padding:8px;background:var(--panel-2);border:1px solid var(--line-2);border-radius:12px;box-shadow:var(--shadow);z-index:200}"+
   ".nav .has-dd.open .dd{display:block}"+
   ".nav .dd a{padding:9px 12px;font-size:14px}"+
   ".nav .nav-cta{margin-left:10px;background:var(--amber);color:#1a1300!important;padding:9px 16px}"+
   ".nav .nav-cta:hover{background:#ffcb45}"+
   "@media(max-width:1080px){.nav .nav-links{position:fixed;inset:var(--nav-h) 0 auto 0;max-height:calc(100vh - var(--nav-h));overflow:auto;flex-direction:column;align-items:stretch;gap:0;background:var(--panel-2);border-bottom:1px solid var(--line);padding:10px 12px 18px;margin:0;display:none}"+
     ".nav .nav-links.open{display:flex}.nav .nav-toggle{display:block}.nav .menu{flex-direction:column;align-items:stretch}"+
     ".nav .menu a,.nav .dd-btn{font-size:16px;padding:12px 14px;width:100%;text-align:left}"+
     ".nav .dd{position:static;box-shadow:none;border:0;background:transparent;padding:0 0 6px 12px;min-width:0}"+
     ".nav .nav-cta{margin:10px 14px 0;text-align:center}}";
  document.head.appendChild(st2);

  var f=document.createElement("footer");
  f.className="footer";
  f.innerHTML=
    '<div class="wrap footer-in">'+
      '<div style="max-width:340px">'+
        '<div class="brand"><span class="dot" aria-hidden="true"></span>LiBRE <small>Long Beach</small></div>'+
        '<p>Long Beach Residents Empowered connects renters with the tools, knowledge, and power to fight for housing justice. Housing is a human right.</p>'+
        '<p style="margin-top:14px"><strong style="color:var(--ink);font-weight:600">Contact</strong><br>Monday – Friday, 10 AM – 6 PM<br><a href="mailto:contact@wearelbre.org">contact@wearelbre.org</a></p>'+
      '</div>'+
      '<div class="cols">'+
        '<nav class="col" aria-label="Organization"><h2 class="h4">LiBRE</h2>'+
          '<a href="about.html">About us</a><a href="get-help.html">Tenant resources</a><a href="workshops.html">Workshops &amp; outreach</a><a href="careers.html">Careers</a><a href="team.html">Data team</a></nav>'+
        '<nav class="col" aria-label="Campaigns"><h2 class="h4">Campaigns</h2>'+
          '<a href="coalition.html">Housing Justice Coalition</a><a href="just-cause.html">Just Cause</a><a href="endorsements.html">Endorse Just Cause</a><a href="build-long-beach.html">Block the Cuts</a></nav>'+
        '<nav class="col" aria-label="Data and maps"><h2 class="h4">Data &amp; Maps</h2>'+
          '<a href="data-hub.html">Data hub</a><a href="district-stats.html">District statistics</a><a href="ownership.html">Who owns Long Beach</a><a href="evictions.html">Eviction dashboard</a>'+
          '<a href="code-enforcement.html">Code violations</a><a href="housing-maps.html">Housing maps</a><a href="neighborhoods.html">Neighborhood conditions</a><a href="environment.html">Environmental burden</a><a href="data.html">All maps &amp; open data</a></nav>'+
        '<nav class="col" aria-label="Follow us"><h2 class="h4">Follow us</h2>'+
          '<a href="https://www.instagram.com/wearelbre/" target="_blank" rel="noopener">Instagram<span class="sr-only"> (opens in a new tab)</span></a>'+
          '<a href="https://www.facebook.com/weareLBRE/" target="_blank" rel="noopener">Facebook<span class="sr-only"> (opens in a new tab)</span></a>'+
          '<a href="https://github.com/LBHousing" target="_blank" rel="noopener">GitHub<span class="sr-only"> (opens in a new tab)</span></a></nav>'+
      '</div>'+
    '</div>'+
    '<div class="wrap fine">© '+new Date().getFullYear()+' Long Beach Residents Empowered (LiBRE) · Fiscally sponsored by Social and Environmental Entrepreneurs (SEE) · Data from the U.S. Census Bureau, LA County Assessor, and City of Long Beach public records.</div>';
  document.body.appendChild(f);
})();
