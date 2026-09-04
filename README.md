# Stasiosdesign — standalone site

The Webflow export for stasiosdesign.com, adapted to run as an ordinary static site with no
dependency on Webflow's hosting or CDN. It is a faithful reproduction of
<https://www.stasiosdesign.com/> — same markup, same stylesheet, same interactions, same URLs.

```
*.html                  9 content pages + 401 + 404
css/                    Webflow's three stylesheets
js/webflow.js           Webflow runtime (interactions, Lottie, forms)
js/vendor/              third-party libraries, now served locally
js/site.js              the site's own behaviours, as re-runnable init functions
js/site-forms.js        standalone form submission (see "Before you go live")
js/page-transition.js   Barba + the overlapping parallax page transition
images/ documents/      assets
vercel.json             clean URLs, so /work resolves to work.html
serve.ps1               local preview server (not deployed)
```

## Preview locally

The site must be served over HTTP — opening `index.html` with `file://` breaks the page
transition, whose Lottie animation is fetched with XHR.

```bash
powershell -ExecutionPolicy Bypass -File .\serve.ps1
```

Then open <http://localhost:5173>. `serve.ps1` exists only because this machine has no Node
or Python; it deliberately mirrors the Vercel config, resolving `/work` → `work.html` and
serving `404.html` for unknown paths, so local and production behave the same.

## Deploy

**Vercel** — import the repo and deploy. There is nothing to configure: no build step, no
framework, and `vercel.json` sets up the clean URLs. `README.md` and `serve.ps1` are excluded
from the deployment by `.vercelignore`.

Pages link to each other as `/work`, `/lets-talk` and so on — the same root-relative form the
live Webflow site uses — so the host has to resolve extensionless paths to `.html`. Vercel
does this via `cleanUrls` in `vercel.json`; Netlify and Cloudflare Pages do it by default.
On a host that does not (GitHub Pages, plain S3, bare nginx), those links would 404 and you
would need an equivalent rewrite rule.

One thing Webflow generated that the export does not include: **`sitemap.xml` and
`robots.txt`**. Add them by hand if the site goes back on a public domain — the live sitemap
lists all nine content pages.

## Before you go live

Two things need configuring, both of which were previously handled by Webflow's servers.

### 1. The contact form needs a backend

On Webflow's hosting, `webflow.js` posted `.w-form` submissions to Webflow's own form API,
which only accepts requests from the Webflow-hosted domain. In an export that code path can
never succeed — it falls straight through to the "Hmm... something's missing" error block.

`js/site-forms.js` takes over submission for the Let's Talk form and reproduces the same UI
states Webflow used (the `data-wait` button label while sending, then `.w-form-done` or
`.w-form-fail`). Set `ENDPOINT` at the top of that file to any backend that accepts a POST:

```js
var ENDPOINT = 'https://formspree.io/f/xxxxxxxx';   // Formspree, Basin, Formcarry, your own…
```

Left empty, the form still works without a server: it opens the visitor's email client with
their answers prefilled and addressed to `stas@stasiosdesign.com`.

Note that the live site has Cloudflare Turnstile enabled on this form (a Webflow feature).
That protection does not carry over — whichever form service you pick should provide its own
spam filtering.

### 2. Adobe Fonts needs the new domain

The display faces (`urbane`, `mixta-pro`) come from the Adobe Fonts kit
`https://use.typekit.net/vhm2hbv.js`. Adobe serves them per-domain, so add the production
domain to that web project in Adobe Fonts or the headings will fall back. The kit already
works from `localhost`, so local previews render correctly. Montserrat comes from Google
Fonts and needs nothing.

These two are the only remaining external dependencies. Everything else — jQuery, GSAP,
ScrollTrigger, Lenis, SplitType, the WebFont loader, and the one placeholder graphic the
stylesheet pulled from Webflow's CDN — is now served from this folder.

## What was changed, and why

The export was left intact wherever it worked. Every change below is either a bug in the
export or something that only functioned on Webflow's infrastructure.

**Broken image filenames (8 files).** Webflow wrote these to disk with the original asset
name appended — spaces, brackets and all — but referenced a hyphenated name in the `srcset`.
Since those `srcset` candidates carry width descriptors, the browser never falls back to
`src`, so the images were simply missing. The files were renamed to the names the HTML
already expects, e.g.

```
images/MK-Iphone_1MK Iphone.avif   ->   images/MK-Iphone_1MK-Iphone.avif
```

**Four empty background images.** The export emitted `background-image: url('../images/')`
for `.project-container.structure`, `.b_card-icon.behance`, `.b_card-icon-spin` and
`.div-block-225`. The correct assets were read off the live stylesheet and all four were
already present in `images/`, so the URLs were filled back in.

**Webflow CDN dependencies.** jQuery was loaded from Webflow's CloudFront domain and the
stylesheet pulled one placeholder SVG from it. Both are now local. GSAP, ScrollTrigger,
Lenis, SplitType and the WebFont loader were vendored into `js/vendor/` at the same versions
and in the same load order — including the deliberate GSAP 3.11.3 / 3.12.2 pair on the home
page, left as the site had it.

**Page transitions on any host with a port.** The site's own transition script compared
`link.hostname` against `window.location.host`. Those differ whenever a port is in the URL
(`localhost` vs `localhost:5173`), so the exit transition was silently skipped on local
previews and staging. Comparing `hostname` to `hostname` fixes that and is identical in
behaviour on the live domain.

**Internal links restored to the live site's clean URLs.** The export rewrote every link to
`work.html`, `lets-talk.html` and so on; the live site uses `/work`, `/lets-talk`, `/`. This
matters for more than tidiness: `webflow.js` decides which nav link gets the `w--current`
class by comparing the link's href to the current URL, so serving clean URLs while linking to
`.html` made it strip the "current page" highlight from all four nav links on every page.
Links now use the same root-relative form as the live site, which also means existing inbound
links and search results for `/work` keep working if the domain moves over.

**Page transitions replaced with Osmo's overlapping parallax transition.** The old
Webflow transition intercepted link clicks, played a Lottie wipe and then did a full page
load. The new one needs both pages on screen at once, so navigation is now AJAX-based via
Barba.js: `<body>` is the Barba wrapper and each page's `.body-container` (or
`.body-container-contact`) is the container. The incoming page slides up a full `100vh`
while the outgoing page rises only `25vh` under a dark overlay fading to 80%, both on the
`parallax` custom ease over 1.2s.

Because the document no longer reloads between pages, the per-page inline scripts that used
to sit at the bottom of every page moved into `js/site.js` as init functions that Barba
re-runs, scoped to the incoming container. Four things also have to be re-synced by hand on
each swap, in `syncShellFromNextPage()`:

* `<html data-wf-page>` - Webflow's IX2 scopes element selectors by page id, so without this
  the new page's interactions never bind. IX2 is then re-initialised with the raw data kept
  from its own store, since Barba never re-runs `webflow.js`.
* the `<body>` class, which carries page-level styling (`body-2`, `body-8`, `body-9` ...).
* the `.cover` overlay, which only exists on the home page. IX2 resets it to opaque black at
  maximum z-index, so a leftover one blanks every other page.
* the two magnetic-cursor labels, which differ per page ("[View Project]", "[View Next
  Project]", "[Start Your Project]" ...).

Two adaptations were needed beyond the reference boilerplate. Its `afterLeave` hook kills
every ScrollTrigger, but this transition is `sync`, so `afterLeave` runs *after*
`beforeEnter` has already built the incoming page's triggers - killing them there left every
page with no scroll animations, so the cleanup moved into `beforeEnter` ahead of the rebuild.
And the container is only pinned to `position: fixed` when there is an outgoing page to
overlap; doing it on first load collapses the document height and strands the home page hero
mid-zoom.

The first-load Webflow intro (the Lottie wipe) is deliberately kept - it is the site's
loader rather than a page-to-page transition - and now runs once from `initOnceFunctions()`.

Nothing else in the markup, styles, content or interactions was touched.

## Verified against the live site

Every page was compared against <https://www.stasiosdesign.com/> by fingerprinting each
element's box size, font family, size, weight, line-height, letter-spacing, colour,
background colour, display and position:

| Page | Result |
| --- | --- |
| home @ 1440 | 615 of 625 elements identical; the other 10 differ by 1px of sub-pixel rounding |
| home @ 768 and @ 375 | identical — same hash, same document height |
| `work`, `about`, `work-csj-architects`, `work-architectural-works`, `mikhail-riches`, `hawkstone-developments` | identical |
| `lets-talk` | identical except the live form carries Turnstile's `w-form-loading` state |

The total page height varies by up to 5px between runs — but it does so on the live site as
well (13072–13077 observed on both), so it is animation-settling noise rather than a
difference between the two.

Also checked: every `<img>` and CSS background resolves on every page; the Lottie page
transition renders and plays; the desktop side menu and the mobile menu open, lock scrolling
and navigate; internal links work across all pages, with `w--current` landing on the right
nav item; the form shows its real success and failure states; and the Adobe and Google fonts
all load. Every one of the 130 asset references is case-exact, which matters because Vercel
serves from a case-sensitive filesystem and Windows does not. The browser console output
matches the live site's, minus the Turnstile errors.

## Known quirks, carried over unchanged

These exist on the live site too and were deliberately left alone:

- `404.html` has an empty `<body>` — the live 404 page renders blank as well.
- `401.html` is Webflow's password-protection page. It posts to `/.wf_auth` with
  `<%WF_FORM_VALUE_PATH%>` template tokens that only Webflow's server understands. No page in
  this site is password-protected, so it is unreachable in normal use.
- `about.html`, `hawkstone-developments.html` and `mikhail-riches-copy.html` are published but
  unlinked, exactly as on the live site. `about.html` is a "Page coming soon" placeholder,
  which is why the menu's "About" item points at `/work`; `hawkstone-developments.html` is
  a duplicate of the CSJ Architects page and `mikhail-riches-copy.html` a duplicate of the
  Mikhail Riches page.
- The console logs `One or both checkboxes not found` (leftover custom code referencing
  `checkbox-design` / `checkbox-dev`, which the form no longer has) and a few GSAP
  "target not found" warnings. Both appear on the live site; neither affects anything.
