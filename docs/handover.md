# Handover

Read `AGENTS.md`, then `docs/v4-design.md`, then this file, then
`docs/todo.md`. Those files describe the current repository; older versions no
longer live in the working tree.

---

## What this is

This is a personal site for a 17-year-old applying to universities in the
United States. The photo-preview homepage is served at `/` and fits a single viewport.
Four large titles with floating photo previews open Projects, Activities, Others
and Honors; a bottom-center line-drawn door opens the optional room. Each category
has one static URL and shows every entry and all descriptions together, with no item switching, description paging
or scrolling on desktop. Phones keep each category on one scrollable page with
readable type. Its optional interactive room, at
`/interactive`, is a coloured loft desk adapted from the approved reference scene. Navigation there is
camera movement between fixed objects, while readable content remains ordinary
HTML. The immersive destinations move the camera towards a selected object, then expand
its physical surface into readable content.

Version 4 is the only active site in this repository. Versions 1 and 2 live in
separate private frozen repositories; the rejected version 3 direction is
retained only in the private history backup.

---

## Where things stand

**Complete foundations:** the photographic homepage and portfolio categories;
the interactive desk with reference-derived Blender geometry, a 23 mm overhead
camera, real camera travel, five object destinations, no avatar, a matching
phone poster and the capability gate; the existing project browser, gallery,
Continue desktop with Games, Metabolis and Cycling; and the approved activity
photographs and certificates. The reference desk now includes the large black
steel floor-to-ceiling window, superseding the postponed bedroom-window task.

**Incomplete content:** the Who am I text and the eventual Load Game links to
separately hosted archives. Activity accounts do not require additional
reflection sections.

---

## Repository structure

- `src/v4/` contains the active room implementation.
- `src/pages/interactive/` contains the room route and all HTML content layers.
- `src/v4/room/model/` contains the adapted MIT modeling scripts and the local
  exporter. `src/assets/room/` contains the exported GLB and responsive poster source.
- `src/content/` contains the activity accounts.
- `src/assets/` contains build-processed project, gallery and certificate media.
- Versions 1, 2 and 3 are absent from the working tree and remain recoverable
  from Git history.

The removed v2 window experiment and rejected v3 Blender prototype were
preserved under the ignored `docs/local/` directory before the cleanup. They
must not be staged or uploaded. The v2 experiment includes views derived from
the real bedroom window and is private by default.

Do not create a v5 folder. Finish the current site in v4. When an old version
needs to be kept, freeze it in a separate archive repository instead of adding
another parallel implementation here.

---

## Settled decisions

- **The homepage is a single-screen photographic navigation page.** The user
  removed the cutout portrait. An oversized pale name is centered behind four large
  category titles, each surrounded by two floating, automatically changing photo
  previews. Titles and previews open the same category. Hover/focus stops preview
  drift; reduced motion removes drift and crossfades but keeps automatic changes.
  Photos follow small circular paths while retaining their angle. The line-art
  door is at bottom center and reveals "INTERACTIVE ROOM" on hover or keyboard
  focus. No subtitles, logo or header branding. The room remains at `/interactive`
  with its existing navigation.
- **Portfolio content is grouped by the supplied resume.** Projects contains
  five entries, Activities three, Others photography/cycling/game development,
  and Honors includes awards and publication. Resume descriptions omit years.
  Existing activity/showcase Markdown owns its own portfolio metadata and media;
  additional entries live in `src/content/portfolio/`. The section navigation
  is shared in `src/v4/PortfolioNav.astro`.
- **Category screens show everything together.** `/projects/` shows all five
  projects, `/activities/` all three activities, `/others/` all three interests,
  and `/honors/` all eight award/publication entries. Every description paragraph
  is visible immediately. There is no entry picker, previous/next entry control
  or text pagination. Old entry URLs redirect to their category. Photos retain
  independent automatic crossfades without arrows, counters or pause buttons. Desktop and
  tablet views fit one viewport; phones use readable type and vertical scrolling
  within the same category page, as explicitly approved by the user.
  No new imagery is invented for entries without supplied images.
- **The room is the menu.** Navigation is fixed camera movement, not a scroll
  page or a free-roam world. There is no visible name card, menu panel or credit
  strip. The fallback poster has transparent object buttons; keyboard focus
  reveals a label. Attribution remains in the asset and public license file.
- **The desk and camera come from the approved reference.** The user chose to
  replace the bedroom geometry and avatar with EdwinjJ1/personal-website's desk
  model and camera. Use the adapted scripts rather than rebuilding a rough
  approximation. Keep original MIT notices; replace all author-specific content.
- **The room is coloured from the start.** Browser lighting and restrained edges
  replace the old monochrome-to-colour cascade. The source site's ten offline
  comic styles are not part of this implementation.
- **Physical surfaces become interfaces.** The screen, project board and
  photographs expand into HTML content after the camera approaches.
- **Text is HTML.** Never render substantial readable content inside three.js.
- **The project board represents completed work.** It opens a full-screen project browser
  generated from the shared activity collection.
- **Continue represents active work as a personal computer.** It always opens
  on its desktop. Games is a folder, Metabolis is its only active game, and
  Cycling is a separate route application. Metabolis uses all four supplied
  video recordings as a full-screen, swipeable four-page presentation; only the
  current muted H.264 slide plays. Games and Cycling also fill the screen below
  the system bar, and Cycling uses complete uncropped route-map derivatives.
  Continue does not duplicate completed activity accounts from the project board.
- **Cycling records use screenshots, not invented route data.** A ride becomes a
  map crop plus HTML statistics. Exact endpoint markers, account names and dates
  stay outside the website copy; GPX files are not required. The current archive
  contains all 17 supplied records, totalling 327.3 km, numbered by source order.
- **The current repository contains one active version.** Archives belong in
  separate repositories and Load Game will link to their deployed addresses.
- **The active repository is public by explicit approval.** Full development
  history and the v1/v2 archive repositories remain private.

---

## Tried and rejected

| Direction | Why it was dropped |
| --- | --- |
| Floating museum cards | Moving targets made navigation unreliable. |
| Pixel-art typography throughout | Longer text was inherently difficult to read. |
| Gaussian splatting | A splat could not be restyled or reduced enough. |
| Generic furniture packs | The fitted furniture stopped reading as this specific room. |
| Paper diorama | The paper treatment became the subject instead of the room. |
| Realistic-room prototype | It lost the authored line-drawing identity and increased asset weight. |
| A rough stick figure as the final character | It is only a structural placeholder and is not personal enough. |

---

## Traps

- Judge every fixed view, not only the overview. Use `/interactive/#figure`,
  `/interactive/#monitor`, `/interactive/#mac`, `/interactive/#achievements` and
  `/interactive/#window`. The legacy keys now mean notebook, monitor, board,
  trophies and camera; there is no avatar or Mac on a bed.
- Changing only the hash may not re-run the page setup. Navigate away before
  opening a different hash directly during visual testing.
- Background browser tabs may suspend `requestAnimationFrame`, making camera
  movement appear broken.
- Camera moves must be checked for furniture clipping from start to finish.
- Immersive movement must be checked at the start, midpoint, arrival and return;
  a correct final camera does not prove that its travel or content expansion is clean.
- Project and photograph expansion must work both with and without native View
  Transitions. The built-in fallback is required for browsers without the API.
- Regenerate the matching poster after changing the desktop model. The mobile
  fallback must match the desk and must not download the model or three.js.
- three.js must remain behind the capability gate and dynamic `import()`. Phones
  must not download it.

---

## Sensitive material

The external university-application folder contains identity, passport,
address, family, visa and transcript data. It is read-only. None of those
details may enter this repository or a model prompt.

For certificates, preserve only Yanlang Liu's name; pixelate other student
names, adviser names and the school name. Never use generative editing on an
official certificate. Only the privacy-safe WebP copies in
`src/assets/certificates/v4/` belong on the site.

Source selfies used to design an avatar should also stay outside the repository.
Only an approved, reduced final model or illustration belongs in the site.

The source football photographs also stay outside the repository. Only selected,
compressed WebP derivatives belong in the activity collection. Classmates'
faces are cropped or pixelated; the certificate visible in
`number-six.webp` is intentionally left readable at the user's explicit request.
Privacy processing is deterministic and must not generatively alter documentary
photographs.

---

## How the user works

- He judges the rendered site rather than code diffs. Verify visually and
  describe exactly what changed on screen.
- He wants direct opinions, not neutral lists of options.
- Direction changes are normal; do not defend an older treatment for its own
  sake.
- University applications remain the main constraint, so avoid scope creep.

---

## Latest portfolio media

The category pages include three selected community-service photographs and
three additional ElderGo event photographs, plus the supplied AHAY2U logo and
website link. Re:Think and AIME have certificate/score-report images; AIME
account, identification and school fields are pixelated. USACO stays unchanged
at the user's explicit request, with no additional evidence uploaded.

HiMCM, IMMC, Re:Think and AF-AdvGAN link to local PDFs in new tabs. Public paper
copies omit source metadata and annotations. The AF-AdvGAN first page is
rasterized with contact emails and the student affiliation removed; author names
and paper content are retained. Original documents remain outside the repository.
The two CR3 photographs use the full-resolution camera-embedded JPEG previews,
resized and compressed as WebP without metadata.

## Portfolio motion and loading

The homepage background has small pointer-driven depth on fine-pointer devices.
Home category labels share native cross-document transition names with category
headings. Category navigation retains its header and moves its active underline;
content changes together with a short directional transition. The door opens on
intent and reveals the room through an expanding aperture. Standard links and
browser history remain intact; unsupported browsers use a short arrival effect,
and reduced-motion users get immediate navigation.

`PageMotion.astro`, `page-motion.ts` and `page-motion.css` own this shared behavior.
Do not replace it with a client router without accounting for the room lifecycle.
Astro prefetches internal pages on intent; first-frame previews are warmed at low
priority. The room module stays behind dynamic import and the existing capability
gate, including when warmed from the door. Failed room initialization preserves
the desk poster and HTML menu. No new dependency was added.

The first category photograph has priority; later carousel frames wait until
needed. Hidden room videos use no preload, and hidden cycling maps are lazy.
Anton is served as a losslessly wrapped WOFF (63,552 bytes versus 130,324 bytes
for the original TTF), retaining the original font and license. Homepage previews
use responsive WebP copies capped at 640 pixels; the portrait is no longer loaded.
The local development toolbar is disabled to avoid its extra downloads.

Honors certificates open a native modal dialog with a larger processed image
loaded only on demand, zoom/fit, Escape/backdrop/close dismissal and focus return.
Multiple certificates remain reachable inside the dialog, including with reduced
motion. Background slideshows pause while a certificate is open.

Do not gate automatic photo changes on reduced motion: this previously left
other devices stuck on the first image. Only spatial motion and crossfades are
disabled for that preference. The carousel also handles history restoration,
visibility changes, reattachment, failed requests and bounded decode waits.
Intersection callbacks restart timers only when visibility actually changes,
so floating previews cannot continually postpone their next frame.

Production smoke checks cover native transitions, history, automatic photographs,
certificate zoom and focus, phone gating, reduced motion and eight layout sizes.
Cold-load resource comparisons use isolated builds on the same local static server
and simulated 40 ms latency / 10 Mbps; these are not public-host speed guarantees.
No hosting cache policy was changed: no active deployment configuration is present
in this repository. Verify long-lived caching for hashed assets at deployment.

## What to do next

Review the new desk composition with the user. The remaining unresolved room
content task is Who am I; its existing draft is unchanged. Archive hosting
remains separate and requires explicit public-deployment approval.

The desk model was exported using installed Blender 5.2. The modeling source is
adapted from `EdwinjJ1/personal-website/002/blender/kit.py` and `layout.py`.
Regeneration instructions and interaction mappings are in `docs/v4-design.md`.
