# Bringing the LiBRE data pages into wearelibre.org (Wix Studio)

Every page in this repo works two ways:

- **Standalone:** `https://lbhousing.github.io/ctpa.html`, with the LiBRE nav and footer.
- **Embedded:** `https://lbhousing.github.io/ctpa.html?embed`. The nav and footer are hidden so the Wix header and footer take over. Links between data pages move the whole Wix page to the matching wearelibre.org URL (set in `WIX` inside `nav.js`). External links open in a new tab.

Hosting stays free on GitHub Pages. Wix only displays the pages, so nothing here uses ArcGIS credits.

## 1. (Optional, recommended) Serve the pages from your own domain

So visitors and search engines see `maps.wearelibre.org` instead of `github.io`:

1. In Wix: **Settings → Domains → wearelibre.org → Manage DNS records → CNAME → Add record**. Host `maps`, value `lbhousing.github.io`.
2. In GitHub: **LBHousing/LBHousing.github.io → Settings → Pages → Custom domain** → `maps.wearelibre.org` → Save. Check **Enforce HTTPS** once the certificate is issued (it can take up to a day).
3. In `wix/pages.csv` and the steps below, swap `lbhousing.github.io` for `maps.wearelibre.org`.

Do the GitHub step only after the DNS record exists, or the github.io address will stop resolving in the meantime.

## 2. Create the Wix pages

In the **unpublished dev copy** of the site, for each row below:

1. **Pages & Menu → + Add Page → Blank page.** Name it from the *Wix page title* column and set **SEO → URL slug** to the slug shown. The slugs must match `nav.js`, or cross-page links will land on 404s.
2. Add a full-width section with no padding. Then **Add Elements → Embed Code → Embed a Site** and paste the *embed src*.
3. Stretch it to full width. Set the height for each breakpoint (desktop / tablet / mobile) to the values shown. They were measured with headless Chrome and include a 40 px buffer, so the frame won't show its own scrollbar.
4. In the element's **Accessibility** settings, set the iframe title to the page title (for example "Tenant Protections map"). Screen readers announce this name.

| Menu group | Wix page title | URL slug | embed src (append to https://lbhousing.github.io/) | Desktop px | Tablet px | Mobile px |
|---|---|---|---|---|---|---|
| Data & Maps (landing) | Data Hub | `/data-hub` | `index.html?embed` | 2530 | 2360 | 3510 |
| Data & Maps (landing) | Maps & Open Data | `/maps-data` | `data.html?embed` | 1870 | 2360 | 4560 |
| Neighborhoods | District Statistics | `/district-stats` | `district-stats.html?embed` | 7930 | 7850 | 10000 |
| Neighborhoods | Environmental Burden | `/environmental-burden` | `environment.html?embed` | 2070 | 2690 | 3000 |
| Neighborhoods | Neighborhood Conditions | `/neighborhood-conditions` | `neighborhoods.html?embed` | 1460 | 2400 | 2660 |
| Neighborhoods | Who Owns, Who Rents | `/who-owns-who-rents` | `demographics.html?embed` | 1100 | 1560 | 1750 |
| Ownership | Parcel Explorer | `/parcel-explorer` | `parcels.html?embed` | 1100 | 1710 | 1920 |
| Ownership | Tenant Protections (TPA) | `/tenant-protections` | `ctpa.html?embed` | 1120 | 1670 | 1910 |
| Ownership | Who Owns Long Beach | `/who-owns-long-beach` | `ownership.html?embed` | 14170 | 13490 | 13530 |
| Evictions | Eviction Dashboard | `/evictions` | `evictions.html?embed` | 3510 | 4240 | 4710 |
| Evictions | Eviction Filings | `/eviction-filings` | `ud-filings.html?embed` | 1290 | 1940 | 2060 |
| Housing Conditions | Assisted Housing | `/assisted-housing` | `assisted-housing.html?embed` | 1120 | 1730 | 1780 |
| Housing Conditions | Code Violations | `/code-enforcement` | `code-enforcement.html?embed` | 1690 | 2750 | 3190 |
| Housing Conditions | Housing Maps | `/housing-maps` | `housing-maps.html?embed` | 4490 | 4860 | 8080 |
| Housing Conditions | Violation Hot Spots | `/violation-hotspots` | `hotspots.html?embed` | 1330 | 1930 | 2130 |
| Stories | Housing Is Health | `/housing-is-health` | `story.html?embed` | 18810 | 18930 | 21750 |
| About | Data Team | `/data-team` | `team.html?embed` | 4540 | 6750 | 9700 |

The same table is in `wix/pages.csv`.

## 3. Menu

Add a **Data & Maps** menu item that links to `/maps-data`, with these sub-items: Neighborhoods, Ownership, Evictions, Housing Conditions, Housing Is Health, Data Team. Each sub-item gets the pages in its group.

## 4. If a page grows

The heights are fixed in Wix. If you add content to a page and a scrollbar appears inside the frame, raise that page's height. Embedded pages also post `{type:"libre-embed-height",height}` to the parent window, which Velo code can use for automatic resizing later.

## 5. Accessibility

Every page passes an automated axe-core WCAG 2.1 A/AA scan with 0 violations. The pages include a skip link, landmarks, visible focus outlines, 4.5:1 text contrast, labelled controls, keyboard-reachable tables, data tables alongside maps and charts, and reduced-motion support. In Wix, also turn on **Settings → Accessibility wizard** for the surrounding pages.
