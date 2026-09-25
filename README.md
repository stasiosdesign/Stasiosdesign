# Stasiosdesign — standalone site

The Webflow export for stasiosdesign.com, adapted to run as an ordinary static site with no
dependency on Webflow's hosting or CDN. It is a faithful reproduction of
<https://www.stasiosdesign.com/> — same markup, same stylesheet, same interactions, same URLs.

```
*.html                      9 content pages + 401 + 404
css/                        Webflow's three stylesheets
js/vendor/                  third-party libraries, served locally - including the Webflow
                            runtime (webflow-runtime.js: IX2 interaction engine, Lottie,
                            forms, links)
js/webflow-interactions.js  the site's Webflow interaction (IX2) data, as exported
js/app.js                   the page lifecycle: boot once, mount / ready / unmount per
                            page, and the Barba wiring (see "How a page comes to life")
js/site.js                  the site's own behaviours, as features the lifecycle mounts
js/site-forms.js            standalone form submission (see "Before you go live")
js/page-transition.js       the overlapping parallax transition and the first-load
                            loader - visuals only
images/ documents/          assets
vercel.json                 clean URLs, so /work resolves to work.html
serve.ps1                   local preview server (not deployed)
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
load. The new one needs both pages on screen at once, so navigation is AJAX-based via
Barba.js: `<body>` is the Barba wrapper and each page's `.body-container` (or
`.body-container-contact`) is the container. The incoming page slides up a full `100vh`
while the outgoing page rises only `25vh` under a dark overlay fading to 80%, both on the
`parallax` custom ease over 1.2s. The first-load Webflow intro (the Lottie wipe) is kept -
it is the site's loader rather than a page-to-page transition.

Because the document no longer reloads between pages, everything that used to rely on a
fresh page load had to be given an explicit lifecycle. That is described in the next section.

## How a page comes to life

Since the site no longer runs inside Webflow, there is nothing left to work around: the
lifecycle is owned by `js/app.js`, and every page goes through the same phases whether it
was loaded directly, reached through a link, or reached with the browser's back/forward
buttons.

| Phase | When | What happens |
| --- | --- | --- |
| **boot** | once per document | GSAP plugins, Lenis, the shell features (side menu, scroll lock, magnetic cursor), Barba. |
| **mount** | the container is in the DOM, possibly still off-screen | the page's shell state is applied (body class, cursor labels, `w--current` / `aria-current` links), Webflow's interactions are started for this page, and every feature's `mount()` runs inside a GSAP context. |
| **ready** | the container is in normal flow at the top of the viewport | work that needs real layout runs (ScrollTriggers), then Webflow's page-load interactions fire. |
| **unmount** | the container has left the document | feature cleanups run and the GSAP context is killed, which takes every tween and ScrollTrigger the page created with it. |

On a direct load, `mount` and `ready` run back to back and the loader plays. On a Barba
navigation the incoming container is pinned over the page, mounted, and animated in; when
the transition completes the outgoing container is removed and unmounted and the new page
is settled at the top - through Lenis as well as natively, since Lenis owns the scroll
position - and made ready. Barba's own hover prefetch is on, so the next page's HTML is
usually already cached when a link is clicked.

The site's behaviours are **features** (`js/site.js`, `js/site-forms.js`) with a
`mount(container, page)` contract: they only ever look inside the container they are given,
register layout-dependent work with `page.onReady()`, and return a cleanup function for
anything that is not GSAP. Text reveals, for example, split the text and build their
paused timelines at mount - so the copy sits in its pre-animation state from the moment the
page is visible - and only create their ScrollTriggers at ready, once the container is in
flow and positions can be measured. Shell features mount once and expose
`pageWillChange()` to put the persistent shell back to rest (menu closed, scroll lock
released) before a swap.

**Webflow is treated as a component with two halves.** Its runtime, `js/vendor/webflow-runtime.js`,
is vendor code that binds delegated handlers once at DOM ready (links, forms, Lottie,
touch, focus) and is never re-run. Its interaction engine, IX2, is page-scoped: element
targets are `<pageId>|<elementId>`, resolved against `<html data-wf-page>`. So `mount` sets
that attribute and re-initialises IX2 from the raw export in `js/webflow-interactions.js` -
exactly what Webflow's own runtime did at the end of every full page load, and the reason
the data was split out of the runtime file. (Re-feeding the engine its own normalised store,
as an earlier version did, silently dropped the breakpoint table: "IX2 missing mediaQueries
in site data".) IX2 evaluates its page-load and scroll-driven events on `readystatechange`
and on a `IX2_PAGE_UPDATE` event; a page mounted after the document has finished loading
gets the latter when it settles, so page-load animations play on arrival just as they do
on a direct load.

Two shell details follow from that. The home page's black `.cover` is its first-load intro:
IX2's initial state shows it and the page-load interaction fades it out. The cover is now
part of the shell on every page (inert everywhere but home, since only the home page's
interactions target it), and on a swap it is parked in its resting state once IX2 has applied
its initial styles, because the parallax transition is the intro then. And because the
outgoing container is still on screen while the incoming page's IX2 binds, a few of its
elements pick up bindings too; they hold only detached nodes and are dropped at the next
mount.

`js/page-transition.js` knows nothing about any of this. It pins, swaps and unpins
containers and plays the loader, and `app.js` calls it at the right moments.

Nothing else in the markup, styles, content or interactions was touched.

## Cleanup and performance pass

A later pass removed the remaining Webflow dead weight. Every removal was
measured first, and verified afterwards by comparing computed styles, element
counts and document heights against the previous commit.

| | Before | After |
| --- | --- | --- |
| CSS (3 files) | 244.5 KB | 191.3 KB (−22%) |
| `webflow.css` alone | 39.2 KB | 3.6 KB (−91%) |
| HTML across 11 pages | 366.3 KB | 239.3 KB (−35%) |
| `images/` on disk | 10.4 MB | 8.1 MB (−2.3 MB) |
| Home page load | 2654 KB / 65 requests | 2097 KB / 61 requests |
| CSS selector utilisation | 62% | 92% |
| Inline `<style>` blocks | 85 | 6 |

What changed:

* **`webflow.css` was 91% dead.** 279 of its 306 selectors matched nothing on
  any page - sliders, tabs, dropdowns, navbars, lightboxes, commerce, CMS
  collections, file uploads, popovers and rich text, none of which this site
  contains - plus the base64 icon webfont and the lightbox spinner keyframes
  only those components referenced. It is now a readable 3.6 KB of the rules
  actually in use.
* **108 dead rule blocks** in the site stylesheet, all leftovers from abandoned
  Webflow sections (`.ticket-*`, `.footer1_grid`, `.btn-animate-chars*`,
  `.flowappz-cookie-consent-*`, orphaned `.div-block-2xx`). Runtime state
  selectors that never match a static probe - `w--redirected-checked`,
  `w--current`, the Lenis classes - were explicitly protected.
* **79 duplicated inline `<style>` blocks** collapsed into the stylesheet. The
  same eight rule sets were repeated on every page; the `.menu-text` underline
  alone appeared 17 times. The six that remain are the per-page Webflow
  interaction pre-states, which have to stay inline.
* **2.3 MB of unreferenced images** deleted - Webflow's unused `-p-500/800/1080`
  renditions and duplicate `_1<Original Name>` copies. Each was checked against
  every `src`, `srcset`, `data-src` and CSS `url()` first.
* **Montserrat went from 18 requested variants to 3.** Only 400, 500 and 300
  are ever rendered, and no italic at all. This matters more than it looks:
  `Groteskly Yours Okta Neue` has no `@font-face` and no fallback of its own, so
  those 38 declarations actually render in Montserrat. Since the page is hidden
  behind `.wf-loading * { opacity: 0 }` until the loader resolves, cutting the
  variants shortens how long the site stays blank.
* **Eight below-the-fold images switched from `loading="eager"` to `lazy`**,
  chosen by measuring each one's document position - they sat 1.5 to 2 viewports
  down, and one was 944 KB. The seven genuinely above the fold stay eager and
  now carry `fetchpriority="high"`. This is most of the 557 KB saved on first
  load.
* **62 redundant `srcset` candidates** removed. Webflow listed the same file at
  several widths because it only shipped two renditions; each URL now appears
  once at its largest width, which cannot change the browser's choice.
* **`initTextAnimations` was ten near-identical blocks** re-wrapping `jQuery(this)`
  three times per element. It is now two config tables and a loop, using plain
  DOM.
* **The hamburger scroll handler queued a fresh 50 ms timer on every scroll
  event** - and Lenis emits those continuously, so one flick scheduled hundreds.
  It now keeps at most one pending check, and the scroll and mousemove listeners
  are passive.
* Invalid `width="Auto"`/`height="Auto"` attributes and the Webflow generator
  comments dropped.

Deliberately left alone: the Webflow runtime itself. It is already a targeted
build - only seven modules, and all but the inert badge are in use - and it
carries the IX2 engine that drives every animation on the site. Replacing it
would be rewriting the interaction layer, not refactoring it. The one change
made to it is the split described above: the runtime is vendor code in
`js/vendor/webflow-runtime.js`, unmodified apart from the removal of its
trailing `init()` call, and the site's interaction data is its own file.
`normalize.css` also stays whole; it is 7.7 KB of base resets and trimming
unused element rules would be a speculative risk for almost no gain.

One thing worth your attention, left unchanged because it is a content decision:
every page still carries `<meta property="og:title" content="Business - Webflow
HTML website template">`, a leftover from the original Webflow template.

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
