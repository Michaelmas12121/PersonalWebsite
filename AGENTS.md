# PersonalWebsite — Agent Instructions

These instructions apply to every AI agent working in this repository. Read this
file before doing anything else. If an instruction here conflicts with your own
defaults, this file wins.

**If you are new to this project, read `docs/handover.md` next.** It records
what has already been tried and rejected and why, the traps that have already
cost time, and how the person you are working for prefers to work. Then read
`docs/v4-design.md` for the design and `docs/todo.md` for what is outstanding.

## 1. Output language

Every file you write or modify must be entirely in English. This applies without
exception to: source code, identifiers, comments, documentation, Markdown, JSON,
YAML, configuration, test fixtures, UI copy, commit messages, branch names, pull
request titles and bodies, and any TODO or coordination marker left in the code.
Do not write Chinese or any other language into a file.

Chat is not a file. The user writes in a mix of Chinese and English, and you may
reply in whichever language fits the conversation. Only the artifacts on disk are
constrained.

Do not translate an existing file unless the user explicitly asks for it.

## 2. Scope of work

The local working directory is:

`/Users/michaelmas/Desktop/PersonalWebsite`

All code, edits, tests, and builds happen inside this directory. Do not create
files outside it, and do not touch files unrelated to the task you were given.

Do only what was asked. If you notice an unrelated problem, mention it to the
user instead of fixing it silently in the same change.

## 3. Tech stack

The stack is **locked**. Do not substitute, extend, or "upgrade" it on your own.

| Concern | Choice |
| --- | --- |
| Site framework | Astro |
| Styling | Tailwind CSS |
| Content (activities, projects, writing) | Astro content collections, Markdown |
| The version 4 room | three.js, loaded by dynamic import only |
| Small interactions (hover, reveal, scroll) | CSS / Tailwind |
| Stateful interactive components | React islands — **not installed**, see below |

Deployment target is a static build. Do not introduce anything that requires a
server runtime.

**three.js must stay behind a dynamic `import()`.** It is by far the largest
thing the site ships, and the gate in `src/v4/room/enhance.ts` is what keeps a
phone from downloading any of it. Never turn that into a static import, and
never move any three.js code into a module the page imports eagerly.

### Running the project

Start the dev server in background mode so it does not block your session:

```
astro dev --background
```

Manage it with `astro dev stop`, `astro dev status`, and `astro dev logs`. Verify
changes with `npm run build` before reporting a task complete.

Reference documentation — consult before working on the related area rather than
guessing at the API:

- Routing and pages: https://docs.astro.build/en/guides/routing/
- Astro components: https://docs.astro.build/en/basics/astro-components/
- Content collections: https://docs.astro.build/en/guides/content-collections/
- Styling and Tailwind: https://docs.astro.build/en/guides/styling/
- Framework components (React islands): https://docs.astro.build/en/guides/framework-components/

### Directory conventions

Every agent must place files in the same locations, so that different agents
working at different times do not create parallel structures:

```
src/
  content/          Markdown content
    activities/     one .md file per activity, plus its media alongside
  assets/           images processed at build time
  v4/               the current site
    room/           layout data, camera views, the three.js scene, the capability gate
  pages/
    v4/             the current route
public/             site-wide static files
docs/               design decisions, the handover, and the to-do list
```

Rules that follow from this and must not be violated:

- **This repository contains only the active version.** Do not create another
  version directory or restore an archived version without explicit approval.
  Frozen versions belong in separate archive repositories.
- **Content lives once.** Activity Markdown remains in `src/content/` and is
  consumed by the current site.
- Navigation exists in exactly one file. Never copy it into
  individual pages, and never let two pages define their own.
- Activity, project and writing entries are Markdown files in a content
  collection with a schema. Adding an entry means adding one Markdown file. Never
  hardcode entry content into a page template.
- **Read `docs/v4-design.md` before changing how the room or its navigation
  works.** It records what was decided and why, including several things that
  were tried and rejected.

### Media

The user's media profile: one or two cover images per activity, and occasional
video clips of 20 seconds or less. The rules below are sized for that and must be
revisited with the user before assuming anything larger is acceptable.

**Images.** Activity images live inside the content collection directory,
alongside the Markdown file that references them, and are declared in the
collection schema using Astro's `image()` helper. This lets Astro resize,
compress, and serve modern formats automatically. Do not put activity images in
`public/` — files there are served untouched, and an unprocessed phone photo is
several megabytes for something displayed a few hundred pixels wide.

**Video.** Short clips may live in the repository, under these hard limits:

- 20 seconds or shorter.
- 10 MB or smaller, as H.264 MP4.
- Compressed before being committed. Never commit footage straight from a phone
  or camera; raw 1080p is roughly 2 MB per second, and 4K is several times that.

Before staging any media file, check its size. If a video exceeds either limit,
stop and tell the user. Do not commit it, and do not silently re-encode it at
quality the user did not agree to. The correct fix for oversized video is to host
it externally and store only the URL in the Markdown frontmatter.

This matters because Git keeps every version of every file permanently. A large
video committed once stays in the repository's history even after it is deleted,
and the damage cannot be undone without rewriting history.

When a clip is used decoratively rather than as something the user presses play
on, render it muted, looping, inline, and without autoplaying downloads of the
full file until needed.

### Adding dependencies

Nothing may be installed without explicit approval from the user. Before
proposing any package, state all three of the following and then wait:

1. The specific problem it solves in this project.
2. What happens if it is not used — including whether a plain CSS or built-in
   Astro feature would be sufficient.
3. Whether it is actively maintained, and roughly what it costs in bundle size.

The user has no frontend background and cannot evaluate a package name on its
own, so an unexplained proposal is not a valid proposal.

### Deliberately excluded, with conditions for reconsidering

- **React** is not installed. Add it only when a specific component genuinely
  needs client-side state, and only that component becomes an island. Do not
  convert existing `.astro` components to React, and do not add React
  preemptively "so it is available later."
- **Animation libraries** (Motion, GSAP, and similar) are not installed. Use CSS
  transitions and Astro View Transitions first. Propose a library only when a
  specific requested effect demonstrably cannot be done in CSS — not because a
  library would be more convenient to write.
- **UI component libraries** and **CSS frameworks other than Tailwind** are out
  of scope entirely.
- **Gaussian splatting** was considered for the room and rejected. A splat
  cannot be restyled or reduced in size, and both are required. Meshes only.

## 4. Communicating with the user

The user is building this site entirely through AI agents and does not read code.
They review work by looking at the rendered site, not by reading a diff. Adjust
accordingly:

- After each change, explain in plain non-technical language: what changed, which
  pages are affected, and what the user should look at to confirm it is right.
- Do not use jargon without a short gloss on first use.
- When offering options, describe the trade-off in terms of outcomes the user can
  perceive, not implementation detail.
- Before reporting a task as done, actually run the build or dev server and
  confirm it compiles. The user cannot catch a build error by reading the code.
- If a change is visual, say what it should now look like, specifically enough
  that the user can tell whether it worked.

## 5. Working style

- Read the relevant existing files before writing new ones. Match the conventions
  already present in the repository over your own preferences.
- Do not scaffold speculative structure. Create a file when something needs it.
- Do not add a README, license, CI config, linter config, or `.gitignore` entry
  unless asked or unless the task genuinely requires it.
- Do not leave placeholder or stub content presented as finished work. If part of
  a task is incomplete, say so plainly.
- Keep changes reviewable. One task, one coherent set of edits.

## 6. Secrets

Never write a password, API key, access token, private key, or `.env` value into
any file that could be committed. If a task needs a secret, use an environment
variable and tell the user what to set.

## 7. Git — every task

- Before starting work, run `git status` and report anything unexpected. Preserve
  every uncommitted change; never discard the user's work to get a clean tree.
- After finishing a task:
  1. Run whatever tests or checks are relevant to the change.
  2. Review the diff and confirm it contains only what the task needed.
  3. Stage only the files belonging to that task.
  4. Write one clear, accurate commit message in English describing what changed
     and why.
- Do not create empty commits.
- Never run `git reset --hard`, `git clean -fd`, `git checkout -- .`, or any
  other command that can destroy uncommitted work, unless the user explicitly
  authorizes that exact command for that exact situation.

## 8. Git — remote

Remote repository, already configured as `origin` and **private**:

`https://github.com/Michaelmas12121/PersonalWebsite.git`

**Pushing is not optional.** Any change worth a commit message is worth being on
the remote, because the only other copy of this project is one folder on one
laptop. Push after finishing a piece of work — not at the end of a session, not
when the user asks.

In practice that means: after a feature, a fix, a design decision recorded in
`docs/`, or any change that would be painful to redo. Do not batch a day of work
into one push.

These rules apply in addition to section 7:

- Before starting work, fetch and sync with the remote. Begin only after
  confirming local is up to date. If you hit branch divergence, merge conflicts,
  or blocking uncommitted changes, stop, leave the working tree untouched, and
  explain the situation to the user.
- **Run `npm run build` before pushing.** Never push something that does not
  compile; the user cannot see a build error by reading the code.
- After committing: fetch again, integrate any new upstream commits safely,
  resolve conflicts, then push the current branch.
- Confirm the push landed and that the local branch is in sync with its remote
  branch. If the push fails for any reason — network, authentication, branch
  protection, conflicts, failing tests — keep the local commits, report the exact
  state, and do not claim the work was uploaded.
- **Never run `git push --force` or `git push --force-with-lease`** unless the
  user explicitly authorizes it for a specific branch and a specific reason.
  Where local and remote histories are unrelated, merge with
  `--allow-unrelated-histories` and resolve the conflicts; do not overwrite the
  remote because it is quicker.
- Do not edit the project through the GitHub web interface.

### Repository visibility

The active v4 repository is public by explicit user approval. The full-history
backup and frozen v1/v2 repositories are private and must remain private unless
the user explicitly changes that decision. Do not enable GitHub Pages or any
other additional publishing feature without asking first — publishing is not
reversible in practice once a page has been crawled or cached.

## 9. Honesty

Report what actually happened. If a command failed, a test did not pass, or you
could not verify something, say so directly. Do not describe intended behavior as
if it were confirmed behavior.
