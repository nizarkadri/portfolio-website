# Fingerprints

Every site you build with **scroll-craft** gets one row here, appended after it
ships. The registry exists so your next build can prove it is a different page
rather than a re-skin of one you already made.

This file is **yours**. It starts empty on purpose: the gate is about not
repeating *yourself*, so it has nothing to say until you have built something.

The rules and the gate live in the skill's
`references/uniqueness.md`. Short version:

**A new build must differ from EVERY row below on at least 4 of the 6
dimensions.** Four against each row individually, not four on average across the
table. If a planned build fails, change the plan. Never edit a row to make room
for it.

The six dimensions are: **grammar**, **nav treatment**, **hero device**,
**act-sequence shape**, **close pattern**, **signature move**.

Dimension 6 is free, because a signature move is unique by definition. So the
gate really asks for three more out of the remaining five, and a build that
changes only grammar and world will fail it.

---

## The registry

| Build | Grammar | Nav treatment | Hero device | Act-sequence shape | Close pattern | Signature move | World | Port |
|---|---|---|---|---|---|---|---|---|
| nizar-portfolio (landing) | Continuous world, on one fixed real-time WebGL stage instead of worldflight video legs | Site bar plus a chess scoresheet that is the clickable map of the page | Establishing position: lit king on a stone board in fog, pointer-parallax camera, headline greeting at p=0 | One pinned act, 11vh, six waypoints (opening, calculation, three doors, city, authored fog silence, tower peak, last position) | Arrival on a fresh board; the CTA plays Black's reply (pawn to the lit e5 square) and carries the move to /contact; footer inside the stage | The scoresheet: scrolling writes the game in notation, Black's column stays empty until the visitor replies | The Long Game: black stone chessboard on Lake Ontario at night, Toronto skyline, one ember light | 3000 (Next.js dev) |
| nizar-portfolio r2, light version (landing). **Superseding revision of the row above, same site, not a new build.** | Continuous world as native worldflight: one fixed stage, seven scroll-scrubbed video legs, copy in one fixed layer | Same as r1 by the owner's request: site bar plus the chess scoresheet written as function calls, which is the clickable map | Establishing frame of the flight: marble pieces on a mirror board in the sky, his name as the headline, stack labels pinned to the pieces, no pin | One flight, 10.1vh of track plus landing room: six scenes on seven legs at one pace (1.3vh per 5s leg, 2.6vh for the tower), authored cloud silence before the peak | Same as r1 by the owner's request: the CTA plays Black's reply and carries it to /contact; footer inside the final scene, which keeps drifting | Same as r1: the scoresheet | The Long Game from daylight to blue hour: marble, glass, blue light, cloud; a sculpture of the owner dissolving into glass cubes | 3000 (Next.js dev) |

*(The registry is yours. From the second site onwards, this table is the
constraint.)*

**Gate note for r2.** Against the r1 row it differs on hero device and
act-sequence shape, and on the stage technology inside the grammar; it shares
grammar family, nav treatment, close pattern and signature move because the
owner asked for the concept, flow and scoresheet to be kept. That is 2 of 6, so
it does not clear the gate as a new build and is recorded as a revision of the
same site instead. A different site must clear 4 of 6 against both rows.

---

## What is taken

Add a bullet here whenever a build claims something a later build should avoid
reusing: a grammar, a nav treatment, a close pattern, a signature move, an
act-count-and-length band. The shared columns are what the next build inherits
as a constraint, so writing them down is the whole point.

- Continuous world with a chess scoresheet as the map (nizar-portfolio, both revisions).
- A scoresheet written by scrolling whose last line is the visitor's reply, carried to the contact page.
- Worldflight at 10.1vh with a double-weight peak leg and a cloud white-out as the authored silence.
- A subject (a sculpture) dissolving into glass cubes as the bridge between a craft and software.

---

## Appending a row

After shipping, add one line to the table and one bullet to **What is taken** if
the build claimed something new. Fill every column. Say what the build shares
with existing rows.

Rows are append-only. A build that has been superseded stays in the table,
because the space it occupies is still occupied.

---

## Worked example

The skill's author kept a registry of twelve builds across eight page grammars.
If you want to see what a filled-in table looks like, and which shapes tend to
collide, read `EXAMPLES.md` in the scroll-craft repository. Treat it as
illustration only: those rows are somebody else's builds and they do **not**
constrain yours.
