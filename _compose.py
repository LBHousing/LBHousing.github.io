"""
Compose standalone ArcGIS-Hub components into one integrated LiBRE-site page.
Scopes each component's CSS under a section class, namespaces its static ids,
wraps its scripts in an IIFE, and loads shared libs once. No iframes, no collisions.
"""
import re, os, sys

HUB = "c:/Users/Zoro/Documents/LiBRE/ArcGIS-Hub"
OUT = "c:/Users/Zoro/Documents/LiBRE/libre-site"

def read(p): return open(p, encoding="utf-8").read()

def split_top(css):
    """Yield top-level CSS chunks (rule or at-rule with its block)."""
    out, i, n, depth, start = [], 0, len(css), 0, 0
    while i < n:
        c = css[i]
        if c == "{":
            depth += 1
        elif c == "}":
            depth -= 1
            if depth == 0:
                out.append(css[start:i+1]); start = i+1
        i += 1
    tail = css[start:].strip()
    if tail: out.append(tail)
    return out

def prefix_selectors(sel_list, scope):
    parts = []
    for sel in sel_list.split(","):
        s = sel.strip()
        if not s: continue
        if s in ("html", "body", "html body"): parts.append("."+scope)
        elif s == "*": parts.append("."+scope+" *")
        elif s.startswith(("html,", "body")) and False: parts.append(s)
        elif s.startswith(":root"): parts.append("."+scope + s[5:])
        elif s.startswith(("body ", "html ")): parts.append("."+scope+" "+s.split(" ",1)[1])
        elif s.startswith(("body.", "body:", "body#")): parts.append("."+scope+s[4:])
        else: parts.append("."+scope+" "+s)
    return ", ".join(parts)

def scope_css(css, scope, kf):
    css = re.sub(r"/\*.*?\*/", "", css, flags=re.S)
    out = []
    for chunk in split_top(css):
        chunk = chunk.strip()
        if not chunk: continue
        m = re.match(r"^(@[\w-]+)([^{]*)\{(.*)\}\s*$", chunk, re.S)
        if m:
            at, cond, inner = m.group(1), m.group(2), m.group(3)
            if at in ("@media", "@supports"):
                out.append(f"{at}{cond}{{{scope_css(inner, scope, kf)}}}")
            elif at == "@keyframes":
                name = cond.strip(); newn = f"{scope}-{name}"; kf.append(name)
                out.append(f"@keyframes {newn}{{{inner}}}")
            else:
                out.append(chunk)  # @font-face, @import, etc.
            continue
        m = re.match(r"^([^{]+)\{(.*)\}\s*$", chunk, re.S)
        if m:
            out.append(f"{prefix_selectors(m.group(1), scope)}{{{m.group(2)}}}")
    css2 = "\n".join(out)
    for name in set(kf):  # update animation refs to namespaced keyframes
        css2 = re.sub(r"(animation(?:-name)?\s*:[^;}]*?)\b"+re.escape(name)+r"\b",
                      lambda mm: mm.group(1)+scope+"-"+name, css2)
    return css2

def wrap_script(js, sid):
    """Run a component script with a `document` scoped to its own section (.sid).
       Keeps original ids (no namespacing); duplicate ids across sections are fine
       because each script only queries within its own subtree."""
    return (
      "(function(){var __r=window.document.querySelector('."+sid+"');if(!__r)return;"
      "var document=new Proxy(window.document,{get:function(t,p){"
      "if(p==='getElementById')return function(id){return __r.querySelector('#'+(window.CSS&&CSS.escape?CSS.escape(id):id))};"
      "if(p==='querySelector')return function(s){return __r.querySelector(s)};"
      "if(p==='querySelectorAll')return function(s){return __r.querySelectorAll(s)};"
      "if(p==='getElementsByClassName')return function(s){return __r.getElementsByClassName(s)};"
      "if(p==='addEventListener')return function(e,f,o){if(e==='DOMContentLoaded'){f();}else{return t.addEventListener(e,f,o);}};"
      "var v=t[p];return typeof v==='function'?v.bind(t):v;}});\n"
      + js + "\n})();")

def component(path, sid):
    html = read(path)
    ext = re.findall(r'<script src="([^"]+)"></script>', html)
    kf = []
    css = "\n".join(re.findall(r"<style>(.*?)</style>", html, re.S))
    css = scope_css(css, sid, kf)
    body = re.search(r"<body>(.*?)</body>", html, re.S).group(1)
    scripts = re.findall(r"<script>(.*?)</script>", body, re.S)
    body = re.sub(r"<script>.*?</script>", "", body, flags=re.S)
    js = []
    for s in scripts:
        if "m=1" in s or "libre-resize" in s or "postMessage" in s: continue
        js.append(wrap_script(s, sid))
    return dict(css=css, body=f'<div class="cx {sid}">{body}</div>', js=js, ext=ext)

def compose(slug, head_extra, items):
    """items: ('c', path, sid) component | ('h', html) raw block."""
    styles, bodies, scripts, exts = [], [], [], []
    for it in items:
        if it[0] == "c":
            comp = component(f"{HUB}/{it[1]}", it[2])
            styles.append(comp["css"]); bodies.append(comp["body"])
            scripts.extend(comp["js"])   # list of section-scoped scripts
            exts += comp["ext"]
        else:
            bodies.append(it[1])
    exts = list(dict.fromkeys(exts))
    ext_tags = "\n".join(f'<script src="{u}"></script>' for u in exts)
    page = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>{head_extra['title']} — LiBRE</title>
<link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet">
{ext_tags}
<link rel="stylesheet" href="theme.css">
<style>
.cx{{max-width:1140px;margin:0 auto;padding:0 24px}}
.cx .wrap,.cx .wrapper,.cx .inner{{max-width:100%!important;padding-left:0!important;padding-right:0!important}}
.composed-hero{{padding:0}}
section.cx-block{{padding:clamp(40px,6vw,72px) 0;border-top:1px solid var(--line)}}
@media(max-width:600px){{.cx{{padding:0 16px}}}}
{chr(10).join(styles)}
</style>
</head>
<body>
{chr(10).join(bodies)}
<script src="nav.js"></script>
{chr(10).join('<script>'+chr(10)+s+chr(10)+'</script>' for s in scripts)}
</body>
</html>
"""
    open(f"{OUT}/{slug}.html", "w", encoding="utf-8").write(page)
    print(f"wrote {slug}.html  ({len(items)} blocks, {len(exts)} libs)")

# ---- section-header helper (replaces the old Hub text cards) ----
def head(eyebrow, title, sub="", color="var(--blue)"):
    p = f'<p style="color:var(--soft);font-weight:300;font-size:16px;margin-top:8px;max-width:64ch">{sub}</p>' if sub else ""
    return ("h", f'<section class="cx cx-block"><p class="eyebrow" style="color:{color}">{eyebrow}</p>'
                 f'<h2>{title}</h2>{p}</section>')

if __name__ == "__main__":
    # ---------- District Statistics ----------
    compose("district-stats", {"title": "District Statistics"}, [
        ("c", "stats/hero.html", "s-hero"),
        head("Citywide Snapshot", "Long Beach housing at a glance.",
             "Key indicators from the 2020–2024 ACS with 10-year trends.", "var(--blue)"),
        ("c", "stats/metrics.html", "s-met"),
        head("B25070 · All Renters", "Total rent-burden households.",
             "The share of all renter households spending 30%+ of income on housing.", "var(--blue)"),
        ("c", "stats/charts-all-renters.html", "s-allr"),
        head("B25072 · Seniors", "Rent-burdened households 65+.",
             "Seniors on fixed incomes are among the most vulnerable to rising costs.", "var(--purple)"),
        ("c", "stats/charts-seniors.html", "s-sen"),
        head("B25074 · Low-Income", "Low-income households, severely burdened.",
             "Households under $35K face the most acute pressure. Declining counts signal displacement.", "var(--amber)"),
        ("c", "stats/charts-lowincome.html", "s-low"),
        head("By Council District", "Not all districts face the same burden.",
             "Districts above the citywide average are highlighted in red.", "var(--red)"),
        ("c", "stats/district-bars.html", "s-bars"),
        head("District Breakdown", "Every district, side by side.", "", "var(--blue)"),
        ("c", "stats/district-cards.html", "s-dc"),
        head("Analysis", "What the data tells us.", "", "var(--green)"),
        ("c", "stats/narr-analysis.html", "s-narr"),
    ])

    # ---------- Who Owns Long Beach (CTPA) ----------
    compose("ownership", {"title": "Who Owns Long Beach"}, [
        ("c", "build/hero.html", "o-hero"),
        head("Citywide Ownership", "Every parcel. Every owner type.",
             "All dwelling units in Long Beach by who holds title, and how each category shifted since 2018.", "var(--blue)"),
        ("c", "build/metric-bars.html", "o-mb"),
        ("c", "build/charts-ownership.html", "o-own"),
        head("The Form Shift", "The housing didn't disappear. The owners changed shape.", "", "var(--red)"),
        ("c", "build/formshift-tiles.html", "o-fst"),
        ("c", "build/formshift-chart.html", "o-fsc"),
        ("c", "build/narr-shift.html", "o-ns"),
        head("The Trust Loophole", "Individual trusts get homeowner treatment at institutional scale.", "", "var(--purple)"),
        ("c", "build/metric-trusts.html", "o-mt"),
        ("c", "build/narr-trusts.html", "o-nt"),
        head("Ownership Concentration", "A few owners hold a lot.", "", "var(--red)"),
        ("c", "build/concentration.html", "o-con"),
        head("The Builders", "The biggest gainers built new housing.", "", "var(--green)"),
        ("c", "build/builders.html", "o-bld"),
        head("The Quiet Acquisition", "The old, naturally-affordable buildings changed hands.", "", "var(--amber)"),
        ("c", "build/acquisition.html", "o-acq"),
        head("Largest Owners", "The 25 biggest entity owners in Long Beach.", "", "var(--amber)"),
        ("c", "build/chart-top25.html", "o-t25"),
        head("The Build Case", "The city is building — just nowhere near enough.", "", "var(--green)"),
        ("c", "build/buildcase.html", "o-bc"),
        head("Renter Protections", "What this means for tenant protections.", "", "var(--blue)"),
        ("c", "build/narr-protections.html", "o-np"),
        head("Historical Context", "Flat supply. Soaring value.", "", "var(--blue)"),
        ("c", "build/charts-historical.html", "o-hist"),
        head("Know Your Rights", "You may have more protection than you think.", "", "var(--green)"),
        ("c", "build/know-your-rights.html", "o-kyr"),
    ])

    # ---------- Housing Maps (redlining + conditions) ----------
    compose("housing-maps", {"title": "Housing Maps"}, [
        ("c", "conditions/hero.html", "h-hero"),
        ("c", "conditions/timeline.html", "h-tl"),
        head("Code Violations", "Where the buildings are failing.", "", "var(--red)"),
        ("c", "conditions/narr-violations.html", "h-nv"),
        head("Evictions", "Where displacement concentrates.", "", "var(--amber)"),
        ("c", "conditions/narr-evictions.html", "h-ne"),
        ("c", "conditions/action-cards.html", "h-ac"),
        head("Demographics", "Who lives where, and who rents.", "", "var(--blue)"),
        ("c", "conditions/narr-demographics.html", "h-nd"),
    ])

    # ---------- Our Team ----------
    compose("team", {"title": "Our Team"}, [
        ("c", "libre-team/hero.html", "t-hero"),
        ("c", "libre-team/partners.html", "t-part"),
        ("c", "libre-team/team-cards.html", "t-cards"),
        ("c", "libre-team/collabs.html", "t-col"),
        ("c", "libre-team/dslc.html", "t-dslc"),
        ("c", "libre-team/origins.html", "t-org"),
        ("c", "libre-team/updates-bar.html", "t-upd"),
    ])
