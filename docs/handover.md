# Handover

Read `AGENTS.md`, then `docs/v4-design.md`, then this file, then
`docs/todo.md`. Those files describe the current repository; older versions no
longer live in the working tree.

---

## What this is

This is a personal site for a 17-year-old applying to universities in the
United States. The reading-first homepage is served at `/` and presents his
work as a direct, scrollable portfolio. Its optional interactive room, at
`/interactive`, is a warm monochrome drawing of his room. Navigation there is
camera movement between fixed objects, while readable content remains ordinary
HTML. The immersive destinations introduce natural room colour during camera
travel, then expand the selected physical surface into readable content.

Version 4 is the only active site in this repository. Versions 1 and 2 live in
separate private frozen repositories; the rejected version 3 direction is
retained only in the private history backup.

---

## Where things stand

**Complete foundations:** the reading-first homepage; the independent
interactive route; code-native room geometry;
fixed camera navigation; five interactive objects; the monochrome-to-colour
state rule; the capability gate; the CSS narrow-screen fallback; the stylised
avatar and desk-side portrait view; the project browser; the photograph
gallery; the exposed and enlarged desk-display target; the room-wide colour
cascade; reversible screen, project and photograph transitions; the Continue
personal computer with a Games folder, Metabolis opening and a privacy-cropped
Cycling application; the completed football account and privacy-safe team
media; and four privacy-safe certificate copies.

**Deferred visual work:** redesign the existing raised window as a
floor-to-ceiling window and update the narrow-screen drawing to match. The user
explicitly postponed this while completing content.

**Incomplete content:** the Who am I text, the decision about shareable section
URLs, and the eventual Load Game links to separately hosted archives. Activity
accounts do not require additional reflection sections.

---

## Repository structure

- `src/v4/` contains the active room implementation.
- `src/pages/v4/` contains the active route and all HTML content layers.
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

- **The room is the menu.** Navigation is fixed camera movement, not a scroll
  page or a free-roam world.
- **Colour carries the visitor into every destination.** Hover remains
  monochrome. Travel to the figure, desk display, Mac, achievements or window
  sends stable natural room colour out through the camera view while the target
  keeps its own stronger palette.
- **Physical surfaces become interfaces.** The projected desk display, Mac or
  window outline expands into the HTML layer; project cards and photographs use
  the same reversible spatial relationship.
- **Text is HTML.** Never render substantial readable content inside three.js.
- **The Mac represents completed work.** It opens a full-screen project browser
  generated from the shared activity collection.
- **Continue represents active work as a personal computer.** It always opens
  on its desktop. Games is a folder, Metabolis is its only active game, and
  Cycling is a separate route application. Metabolis uses all four supplied
  video recordings as a full-screen, swipeable four-page presentation; only the
  current muted H.264 slide plays. Games and Cycling also fill the screen below
  the system bar, and Cycling uses complete uncropped route-map derivatives.
  Continue does not duplicate completed activity accounts from the Mac.
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

- Judge every fixed view, not only the overview. Use `/v4#figure`,
  `/v4#monitor`, `/v4#mac`, `/v4#achievements` and `/v4#window`.
- Changing only the hash may not re-run the page setup. Navigate away before
  opening a different hash directly during visual testing.
- Background browser tabs may suspend `requestAnimationFrame`, making camera
  movement appear broken.
- Camera moves must be checked for furniture clipping from start to finish.
- Immersive movement must be checked at the start, midpoint, arrival and return;
  a correct final camera does not prove that the colour path or portal is clean.
- Project and photograph expansion must work both with and without native View
  Transitions. The built-in fallback is required for browsers without the API.
- The narrow-screen CSS room is a separate rendering and must be updated when
  the desktop geometry changes.
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

## What to do next

The next unresolved content task is Who am I. The floor-to-ceiling window remains
the next coherent room change, but it is postponed until the user returns to it.
Archive hosting remains separate and requires explicit public-deployment
approval.
