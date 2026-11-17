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

*(empty: your first build has nothing to clear, so build whatever the interview
points at. From the second onwards, this table is the constraint.)*

---

## What is taken

Add a bullet here whenever a build claims something a later build should avoid
reusing: a grammar, a nav treatment, a close pattern, a signature move, an
act-count-and-length band. The shared columns are what the next build inherits
as a constraint, so writing them down is the whole point.

- Gallery-on-a-board with results as data columns (/experience). Chaptered feature with a held poster-size folio (/about). Typographic poster with a pointer-following 3D preview (/blog).

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

| nizar-portfolio /experience (rev 5) | Gallery: the results are the collection, one label schema (figure, what moved, company and role) | Site bar plus an index of results along the foot of the board, grouped by company, each one a jump | The empty landing board in mist with the route faintly laid out; title and roles at the left | One pinned WebGL act (~6vh: opening, a sideways walk along nine results, the whole board), then a flow act (scattered words drawn into order), then a flow close | Degrees as a ledger beside one black marble pawn turning with the scroll; the site footer carries the action | The board of results: each result rises out of its square as a marble column as tall as its percentage, a tag riding its top | Pale studio, Carrara and Marquina, the landing's blue thread | 3477 (Next.js dev) |
| nizar-portfolio /about (rev 5) | Chaptered editorial: title page, three story spreads, then working sections | Site bar plus a held folio beside the story (chapter name at poster size and a progress rule) | Title page: heading at the front, the portrait set back (slower), a black marble king nearest (faster) | Flow throughout, no pin: title page, numbers, three spreads, a white band of live numbers, a 3D lineup, a drifting wall | The certificates drifting by on two rows, each opening larger; the site footer carries the action | The piece picker: five marble pieces on plinths stand up as the section arrives; choose one and it lifts, turns and sets out that part of the stack | Same | 3477 |
| nizar-portfolio /blog (rev 5) | Typographic poster: the titles are the imagery | Site bar plus topic words and a search line | NOTES at the full width of the page with a marble knight standing in front of its last letter | Flow: the poster, then title slabs wiping in from alternate sides, alternately set left and right | The smallest line on the page, the action as a link inside it, then the site footer | The preview piece: a marble piece follows the pointer over the notes, a different piece for each | Same | 3477 |

Shared with prior rows: the site bar and the landing's world (stone, mist, blue thread) on all three; nothing else. Each differs from the landing row on grammar, nav, hero, act shape, close and signature move.
| nizar-portfolio /experience (rev 7) | One world held behind the page: ordinary flow sections over a fixed WebGL world, a place in it per part of the record | Site bar, a fixed index pill naming each place (jumps to where the camera has arrived), and a fixed "All results" that opens every result | The landing's black king on its plinth in the mist, pawn and knight standing off; title and roles at the left | Flow throughout over one glide: start, a sideways gallery walk (one unit per result), the migration (sticky figures), the stack (sticky, carried off with its section), credentials on plain ground | The degrees and the drifting certificates on the plain ground as the world steps back; the site footer carries the action | The migration: twenty server blocks lift off an on-premise rack one by one and arc onto a marble cloud while the figures count up with them | Same | 3477 |

Rev 7 /experience against every row: differs from /experience rev 5 on grammar, hero, act shape, close and signature move (5 of 6; the index along the foot is the shared trait). Its close is the one /about rev 5 had; that close moved here in revision 6, and /about no longer has it.
