# Version 4 — Interactive Colour Line Room

Version 4 is the only active site in this repository and is served at `/v4`.
The root route redirects to it. Earlier versions have been removed from the
working tree and will be archived separately after version 4 is stable.

## Visual direction

The room is a warm, modern black-and-white interior drawing based on the real
bedroom layout. Generated studies are composition references only. The shipped
room is code-native three.js geometry so fixed cameras can turn through the
space and every interactive object can change material state correctly.

The approved object inventory is deliberately small: window, deep sill, long
desk, chair, bed, one cabinet above the desk, one cabinet above the bed, the
achievements shelf, one desk display, one Mac on the bed and one stylised
low-poly avatar. Do not add decoration without asking first.

## Avatar and portrait view

The avatar uses code-native faceted geometry rather than a scanned or realistic
portrait asset. Dark spiked hair, strong brows and a blue-grey hoodie carry the
likeness from the approved reference while the simplified face remains part of
the room's drawing language. Source selfies stay outside the repository.

The chair and avatar face the desk display. The pelvis rests on the cushion,
the thighs continue above its front edge and the lower legs bend down without
passing through the chair. The hoodie uses an open neckline and fine drawstrings
instead of a complete collar ring. The overview therefore sees a side view,
with both arms reaching towards the desk. Who am I moves the camera to the desk
side and looks back at the avatar's front; the display remains at the left edge
of the frame as a spatial cue rather than covering the face.

## Interaction rule

Colour marks the transition from the room into content. It is not hover
feedback.

1. The overview is entirely monochrome.
2. Hover strengthens charcoal outlines but adds no colour.
3. Moving towards any destination starts a natural room-colour cascade at that
   object and carries it outwards through everything in the camera view.
4. The selected object keeps its own stronger palette within that shared room
   colour as the camera approaches.
5. At arrival, the real projected outline of the screen or window expands into
   the HTML content layer.
6. Back collapses the content into the same object, drains colour back towards
   it and returns the camera to the monochrome overview.

Who am I and Achievements do not cross into an immersive screen or media layer,
but their camera travel uses the same room-wide colour restoration. At arrival,
everything visible uses its stable natural material colour while the figure or
achievement shelf keeps the stronger destination palette. The full view drains
back to monochrome during the return. Charcoal outlines remain visible over
every coloured wash.

## Approved palettes

| Object | Primary | Secondary | Accent |
| --- | --- | --- | --- |
| Figure and chair | `#687B86` | `#B97865` | `#D5C5AC` |
| Desk display | `#2F6970` | `#86A0A0` | `#D5A84A` |
| Mac on the bed | `#3F526B` | `#A46B58` | `#C9A45B` |
| Achievements shelf | `#705845` | `#B39861` | `#754F57` |
| Window | `#7393A1` | `#7E956F` | `#D7B66A` |

The distribution is approximately 60 percent primary, 30 percent secondary
and no more than 10 percent accent. These are restrained washes rather than
large, perfectly uniform colour fills.

The shared room palette uses warm ivory walls, oak furniture, muted blue-grey
fabric and soft graphite details. These stable material colours prevent each
destination from making the same room look like a different place.

## Screen and media motion

The desk display is angled towards the avatar and exposed beside the avatar in
the overview. Its visible screen and forgiving hit area are both large enough
to select without searching for a narrow edge.

Immersive camera travel is deliberately slower than the small object views:
about 1.58 seconds for Continue, 1.5 seconds for the Mac and 1.64 seconds for
the window. The overview return takes about 1.22 seconds. The camera movement,
colour cascade and portal expansion overlap so they read as one continuous
action rather than separate loading steps.

- Continue opens as a quiet full-screen desk workspace with a subtle grid.
- What I've done opens as an application-like project browser whose cards enter
  in a short stagger.
- Gallery opens as a three-column window composition. Selecting a photograph
  expands it into an in-site lightbox and returns it to its source position on
  close.
- Selecting a project card expands that card into its account. Back reverses the
  relationship before returning to the card grid.

Native browser view transitions are used when available. A small built-in
geometry animation provides the same spatial relationship elsewhere. Reduced
motion removes movement while preserving every destination and control. No
animation dependency is required.

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

## Mac project navigation

The Mac represents **What I've done**, not one specific project. Clicking it
opens a full-viewport application layer generated from the shared activities
content collection. The room remains behind that layer but is no longer part of
the reading layout. Conrad Challenge is one card alongside the other projects
and activities.

Selecting a card opens its full account inside the Mac panel. Back first returns
to the project selection without moving the camera or removing the Mac palette;
back from the selection closes the Mac, removes its colour and returns the camera
to the room overview.

Project photographs keep their source proportions. Desktop layouts may combine
portrait and landscape images into section-specific editorial grids; narrow
screens return them to one natural-width column. Layout changes must not create
new crops or edited photo derivatives unless a privacy-safe crop or redaction is
explicitly required. A project's strongest wide photograph may open the account
as a full-width hero immediately below the project title.

## Technical boundaries

- Keep v4 self-contained under `src/v4/` and `src/pages/v4/`.
- Keep three.js behind a capability gate and dynamic import.
- Use fixed camera views rather than free movement.
- Keep readable content in HTML overlays, never inside the 3D scene.
- Keep the narrow-screen fallback code-native and complete without three.js.
- Add no dependency for line work, colour transitions or small interactions.
