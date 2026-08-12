# PersonalWebsite

Yanlang Liu's personal site. Built with [Astro](https://astro.build); the
version 4 main menu is a room rendered with three.js.

Version 4 is the only active site in this repository. `/` redirects to `/v4`.
Frozen versions 1 and 2 live in separate private archive repositories. Version
3 was a rejected design direction and is retained only in the private history
backup.

## Running it

```sh
npm install
npm run dev     # start the dev server in the foreground
npm run build   # produce dist/
```

Use `astro dev --background` when a blocking dev server would get in the way;
manage it with `astro dev stop`, `astro dev status` and `astro dev logs`.

Adding `#figure`, `#monitor`, `#mac`, `#achievements` or `#window` to the `/v4`
URL opens the room in that view.

## Where things are

```
src/content/activities/   one Markdown file per activity — the site's content
src/v4/room/              the room: layout data, camera views, the three.js scene
src/pages/v4/             the current site
docs/                     design decisions, the handover and the to-do list
```

`docs/v4-design.md` records what was decided about the room and why. Read it
before changing how the navigation works.

## Working on this

Read [AGENTS.md](./AGENTS.md) first. It applies to every agent and every person
touching this repository, and it is not optional.
