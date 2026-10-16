# Version 4 — Interactive Desk

Version 4 is the only active site in this repository. The single-screen photographic
portfolio is served at `/`; its optional interactive room is served at
`/interactive`. Earlier versions have been removed from the working tree and
will be archived separately after version 4 is stable.

## Floating previews and portfolio navigation

The homepage is a fixed, viewport-sized composition with a large pale name
centered in the viewport, four oversized category titles, and two floating photo
windows per category.
The former cutout portrait is no longer displayed or downloaded. A fine line-art
door sits at bottom center, revealing "INTERACTIVE ROOM" on hover or keyboard
focus. Anton is self-hosted with its OFL license.

The previews use existing collection images and the supplied project logo,
interleaved across entries. Both titles and photographs link to their category.
Small circular paths (8-18 pixels in radius) keep the photographs moving around
their positions beside the titles, with opposite directions and offset timing.
Counter-rotation preserves each photograph's angle. Hovering or
focusing a photo stops its drift so it remains easy to select. Images preserve
their source proportions and use responsive WebP copies capped at 640 pixels.
Only the first frame of each window loads initially; later frames load on demand.

Projects, Activities, Others and Honors open one static page per category,
showing all five projects, three activities, three interests, or eight honors
and publication entries together.
Content is sourced from Markdown collections, including the existing activity
and showcase entries. A shared navigation component owns the four category
links. All description paragraphs are visible at once; no item switching or text
pagination is used. Old individual entry URLs redirect to their category. Photo
windows retain their automatic crossfades with no visible controls or counters.
Desktop and tablet views keep the complete category in one viewport. Phones
use a single-column layout with readable type and vertical scrolling within the
same page, as explicitly approved by the user. The homepage itself remains a
single-screen composition on phones. The homepage door
is the clickable room entry and has an accessible name and a label shown on hover or keyboard focus.

## Portfolio transitions and certificate reading

The homepage background name stays centered. Contours move by a few pixels with
a fine pointer. Hover raises each category label slightly
and draws a fine underline. Native shared-element transitions carry the chosen
label into the category heading. Category changes keep navigation stable and
move the active marker while the whole content grid fades/slides over 280 ms.
The homepage door opens before departure, and the room is revealed from its
screen position over 700 ms. These effects do not delay navigation with timers.
Reduced motion disables spatial transitions; unsupported browsers keep functional
links and a brief arrival fade. Desktop single-screen and phone scrolling rules
remain unchanged.

Automatic photographs continue switching with reduced motion enabled, without
crossfades or floating. Reduced motion must not freeze the collection on its
first image. Visibility changes and browser history restoration restart playback;
a stalled or failed image is skipped without replacing the current photograph
with an empty frame. Offscreen and hidden-page playback remains paused.

Certificate thumbnails in Honors are clickable, without a new visible control
bar. A modal fits the full certificate to the screen, offers further zoom, and
returns focus to the original thumbnail on close. Multi-certificate entries can
be browsed inside the modal. This does not add controls to photograph carousels.

## Visual direction

The interactive route is a coloured loft desk, using the procedural geometry
and camera from EdwinjJ1/personal-website with the user's approval. It replaces
the measured-bedroom layout and the stylised avatar. There is no character.

A wood desk, monitor, keyboard, open notebook, project publications, camera,
photographs and trophies sit in front of a project board and black steel
floor-to-ceiling window. The reference's 23 mm camera is positioned above the
front of the desk. Warm wood, cream paper, green screens and blue-grey city
buildings provide the palette from the first frame. A restrained edge treatment
and real shadows keep the objects legible. The former monochrome-to-colour
cascade is removed.

The source modeling helpers and layout are adapted under MIT in
`src/v4/room/model/`, with the original copyright and permission notice.
`public/room-license.txt` accompanies the shipped asset. No attribution strip
overlays the scene. The reference author's photographs, writing, identity and
project graphics are not used. Texture artwork is generated locally using
portfolio labels and existing approved photographs; source photos are never
copied from outside the repository.

## Model pipeline

The model is generated offline with the already-installed Blender. It is
exported as `src/assets/room/desk-room.glb`, approximately 1.7 MB, including
compressed textures and per-object interaction metadata. The matching fallback
render is `src/assets/room/desk-poster.webp`. Astro makes responsive copies.
Neither Blender nor new JavaScript dependencies are required to build or serve
the site. The checked-in exports are sufficient for `npm run build`.

To regenerate after changing geometry or textures:

1. Run `node src/v4/room/model/textures.mjs` from the repository root.
2. Run the installed Blender in background mode with
   `--factory-startup -P src/v4/room/model/export.py`.
3. Convert `docs/local/room-builder/desk-poster.png` to the tracked WebP with
   the existing Sharp dependency at quality 85.
4. Build and inspect every camera destination and the phone fallback.

The intermediate PNGs remain under ignored `docs/local/`. The reference model
source had comments translated or removed for this repository's English-only
rule. `export.py` removes the reference's mascot and personal project props,
remaps content targets and writes the attribution into the GLB.

## Interaction and camera movement

The room remains a fixed-view menu, without free roaming. The historical target
keys are retained for existing links and content code:

| Target key | Physical object | Content |
| --- | --- | --- |
| `figure` | Open notebook and name card | Who am I |
| `monitor` | Monitor and keyboard | Continue workspace |
| `mac` | Project board and publications | Completed projects and activities |
| `achievements` | Trophies | Certificates |
| `window` | Camera and photographs | Gallery |

Hover brightens an object's outline and shows its label. Clicking travels for
about 1.1 seconds to a fixed close view. The screen, project board or photograph
then expands into the existing HTML content layer. About uses a card beside the
notebook; certificates retain their existing content layout. Closing retracts
the content and returns the camera in about one second. Subviews inside the
workspace, project browser and gallery close before leaving their parent.

The room has no name card, introductory text or visible menu. On the fallback
poster, transparent buttons sit over the five objects. Keyboard focus outlines
the selected object and reveals its name. On desktop, pointer interaction uses
the real model while the same buttons provide keyboard access.
Only the scene module imports three.js and GLTFLoader; that module stays behind
the capability-gated dynamic import. Phones, touch-first devices, reduced-motion
visitors and devices without WebGL get the matching desk poster and full HTML
object navigation. Failed model loading preserves this working fallback. The scene draws
only when the camera, viewport or hover state changes, rather than continuously
rendering a stationary desk.

The reference website uses offline image stylisation. Its ten alternate comic
styles are not reproduced by exporting the model; the current room uses real
browser lighting and a single consistent palette so its camera can move.

## Continue workspace

Continue is for work that is still changing, not a second archive of completed
activities. It behaves like a light, custom personal computer rather than a
feed of project cards. Entering Continue always lands on the desktop first;
applications and folders never open automatically. Its desktop currently
contains two destinations:

- Games is a folder rather than an application. Metabolis is the only active
  game inside it. Metabolis opens with a supplied title-animation video and a
  four-page horizontal presentation for its circulation, network-building and
  system-overview states. Only the visible slide plays; arrows, slide tabs and
  touch swipes move between pages. The browser copies are muted H.264 MP4 files,
  each under 20 seconds and 10 MB. The game tile uses the supplied biological
  transport-road artwork without cropping. Empty game slots remain inactive
  until their external links exist.
- Cycling is a separate application. It combines a ride list with a large route
  map and readable statistics. Its 17 records total 327.3 km and are shown in
  source order as Ride 01 through Ride 17. Each map is a derived crop that omits
  the original date, account identity and exact endpoint markers. The source set
  contains route screenshots rather than GPX files or separate ride photographs,
  so the application does not invent a combined route or photo timeline.

Games, Metabolis and Cycling use the entire viewport below the Continue system
bar. Cycling fits every supplied route image inside the available map area
without cropping; its readable statistics and privacy note sit outside the map.

New active work should extend the computer as another clear application or
folder rather than turning Continue into a generic feed. Internal Back and
Escape actions return to the desktop before closing Continue back into the room.

## Project board navigation

The project board represents **What I've done**, not one specific project. Clicking it
opens a full-viewport application layer generated from the shared activities
content collection. The room remains behind that layer but is no longer part of
the reading layout. Conrad Challenge is one card alongside the other projects
and activities.

Selecting a card opens its full account inside the project panel. Back first returns
to the project selection without moving the camera or changing the room view;
back from the selection closes the project board content and returns the camera
to the room overview.

Project photographs keep their source proportions. Desktop layouts may combine
portrait and landscape images into section-specific editorial grids; narrow
screens return them to one natural-width column. Layout changes must not create
new crops or edited photo derivatives unless a privacy-safe crop or redaction is
explicitly required. A project's strongest wide photograph may open the account
as a full-width hero immediately below the project title.

## Technical boundaries

- Keep the implementation under `src/v4/` and the route under `src/pages/interactive/`.
- Keep three.js behind a capability gate and dynamic import.
- Use fixed camera views rather than free movement.
- Keep readable content in HTML overlays, never inside the 3D scene.
- Keep the matching poster and HTML navigation complete without three.js.
- Add no dependency for the model loader, camera travel or small interactions.
