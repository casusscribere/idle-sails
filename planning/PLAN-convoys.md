# Feature plan — Convoys (drafted 2026-07-16)

Groups of vessels that spawn together, sail the same passage together, and read
on the chart as one body of sail. Clicking any member opens a **convoy ledger**:
a panel in the single-vessel ledger's idiom listing every vessel in company,
where each name is a disclosure toggle that expands in place into the full
single-vessel ledger content.

## Where this sits in the architecture

This is a **sim-layer** feature (RANKING.md layer 1): it changes what spawns.
Unlike Pass-5 material it does **not** break fate-at-spawn — a convoy is decided
at the spawn event, its members are generated at the spawn event, and every
fate is still rolled entirely at spawn. So it is feasible now, with the same
determinism guarantees:

- **Deterministic:** every new draw comes from dedicated sub-streams keyed
  `hashSeed('convoy'|'vessel'|'reprieve', seed, id)` — never from the spawn-RNG
  word (whose sequence stays untouched except for the documented interval
  scaling below) and never inserted into an existing vessel's stream.
- **Granularity-independent:** convoys spawn on the same sim-time crossings as
  single vessels; one big tick produces the same convoys as many small ticks.
- **Not a settings knob.** Convoys are world behaviour, identical at every
  performance tier. The only tier interaction is render-thinning (below).

Fingerprints of existing seeds WILL change (member vessels consume ids), as
they did in every sim-touching pass. Old saves survive — the change is
additive to the data bundle, `datasetVersion` stays 4 — but a restored world's
*future* diverges from what pre-convoy code would have spawned. Same posture
as prior passes; note it in the commit.

## 1. Historical grounding — who convoys, and when

Convoying was not flavour; it was policy. The rules ship as data with the
honest evidence class (`asserted` — institutional facts are well documented,
the per-decade *rates* are our estimate with stated reasoning). Research task
**T9** (`research/TASKS.md`, Phase RB — shares T4's naval-patterns sources)
verifies these windows and bounds the rates; it refines this table but does
not gate the build:

| Pattern | Systems / lanes | Rate | Size | Escort |
|---|---|---|---|---|
| **The flota system** — convoy compulsory by Spanish ordinance from 1564 to the 1778 free-trade decree | Carrera lanes (Seville/Cadiz ↔ Veracruz/Portobello/Havana) | high, all-era to ~1778, low after | 4–7 | armed galleon, all-era |
| **Company return fleets** — VOC retourvloot, EIC/CdI homeward fleets | Cape-route Indies lanes | moderate | 3–5 | wartime only |
| **Wartime trade convoy** — culminating in the British Convoy Acts (1793/1798, convoy mandatory) | any lane whose flag is a belligerent in an active war covering its theatre | low base × war uplift, rising late-era | 3–6 | frigate / sloop-of-war when a naval type is era-valid |
| **Caravane / Levant convoy** against corsairs | Mediterranean échelles lanes | low–moderate | 3–4 | rare |

**Exclusions (charter):** no convoy grouping on `middlePassage` lanes or any
lane carrying `framing` (coerced flows). The sober treatment stays exactly as
it is — a convoy is a spectacle, and these lanes must never accrue spectacle.
Naval lanes also excluded in v1 (a squadron is a different, later idea).

## 2. Sim design (`world.js`)

### Spawn-event grouping

The Poisson spawn loop is unchanged up to and including `generateVessel(at)`.
Then:

1. **Convoy roll** from `mulberry32(hashSeed('convoy', seed, leadId))` — pure
   in the lead vessel's id. Probability looked up from the convoy rules for
   the lead's lane/system/year, times the war uplift when
   `warsActive(year).some(w => isBelligerent(w, lane.flag) && theatre matches)`.
   Rules resolve to 0 on excluded lanes.
2. If it fires: draw **size** N (total, from the rule's range) and an
   **escort?** flag from the same sub-stream.
3. **Members** get fresh ids (`state.nextId++`) and their own
   `hashSeed('vessel', seed, id)` streams for name/type/tonnage/guns/crew/cargo
   — but they **copy the leader's lane and leg sequence** instead of re-running
   `buildItinerary` (a convoy sails one passage; re-derivation would scatter
   them). Member type is drawn from the lane's era-valid types as usual.
4. **Stagger:** member *i* departs `lead.depart + i × draw(3–10 h)`; every leg
   boundary shifts by the same offset. Over a multi-week leg that strings the
   convoy out line-astern by a few pixels — real convoys straggle. Dwell times
   are the leader's (copied), so the convoy stays together across ports.
5. **Escort** (when rolled): one extra member, type picked from era-valid
   `roles`-naval shipTypes (galleon early, frigate/sloop-of-war later),
   `isNaval: true` (naval name pool + prefix via the existing paths), cargo
   `ballast`. She sails the same leg polylines — `schedule` stores `legId`s, so
   `positionOf` needs no changes even though the leg was baked for the
   merchant route class.
6. Every member (leader included) carries `convoyId: leadId` and the group
   carries a display name (see §4). A singleton spawn carries no field at all
   (sparse — saves stay lean).

### Fates: individual, plus the escorted reprieve

Each member's fate is rolled at spawn over her *shifted* schedule exactly as
today — a convoy can lose a straggler. The protective value of convoy
(historically the entire point) is added without touching any existing stream:

- For each member whose fate rolled `lost`, an **escorted** convoy grants one
  reprieve draw from `hashSeed('reprieve', seed, id)`: with probability `q`
  (rule data; recommend 0.5, war-prize causes only — weather spares no one),
  the fate is cleared to safe arrival. Deterministic, at spawn, pure in id.
- Unescorted convoys get no reprieve (safety came from the escort, not the
  company).

This is the cleanest insertion point: `generateVessel` is untouched inside,
and the modifier is auditable as one function.

### Flow honesty — spawn-interval scaling

A convoy of N counts as N voyages against the flow matrix, so after a convoy
spawn the next interval (already drawn from the spawn RNG as today, sequence
unchanged) is **multiplied by N**. Mean voyages per sim-year per lane stays
the matrix's realized figure; the sea's population band (~40–150) holds; the
counters stay honest (`spawned` increments per member).

### Observation layer & log

- `portCalls`, `stats`, `portHistory`: recorded per member through the
  existing spawn-time code paths — zero changes, granularity-independent by
  the same argument as today.
- **Log:** one departure line for the group — "A convoy of six sail cleared
  Cadiz for Veracruz" (flota lanes: "The flota…") — instead of six lines;
  losses and arrivals stay per-vessel. The entry carries `convoyId` so a
  future log-click could open the convoy panel.
- Wreck records gain `convoyId` (flavour: "lost from the convoy" available to
  the wreck ledger later; not rendered in v1).

### Serialization / restore

`convoyId` rides in the vessel objects — `serialize()`/restore work untouched.
A pre-convoy save restores cleanly (field simply absent; no backfill needed —
past spawns genuinely weren't convoyed). No `datasetVersion` bump: the rules
are an **additive** key in the bundle (§5), and stale saves must not be reset
for this.

## 3. Render design (`render.js`)

- **Formation offset (render-only):** convoy members get a small deterministic
  lateral offset perpendicular to heading, `±2–4 px` keyed
  `hashSeed('formation', id)` — with the depart stagger this reads as a loose
  column, never a stack of glyphs.
- **Density thinning by convoy:** `activeVessels(density)` hashes
  `v.convoyId ?? v.id` instead of `v.id`, so a convoy shows or hides *whole*
  at Low tier. Same stable-subset determinism; sim untouched (this is
  realization, not computation).
- **Selection:** when a convoy is selected, ring **every** live member and
  label the group near the lead ("Convoy of 6 sail"). The dashed
  selected-route drawing already works — draw it once from the leader's
  schedule.
- **`pickAt` unchanged.** It keeps returning `{type:'vessel', id}`; routing to
  the convoy panel is main.js's business (below). Port-dot priority and wreck
  picking are unaffected.

## 4. UI design (`ui.js`, `main.js`, `style.css`)

### Click routing (main.js)

`selectVessel(id)` checks the snapshot: if the vessel has a `convoyId` **and**
at least one other member is still present, route to
`selectConvoy(convoyId, focusId)` (new selection state alongside
vessel/port/wreck/archive; `deselect()` clears it). The last surviving member
of a convoy gets her plain single ledger — a convoy of one is just a ship.
The pre-clicked member starts expanded (`focusId`).

`renderPanel()` gains a convoy branch: members = snapshot vessels with this
`convoyId` (live, plus arrived/lost ones still lingering pre-cull, labelled).
Signature gating like the port panel: membership + statuses + sim-day +
expanded-set — scroll and open toggles survive the 5 Hz refresh.

### The convoy ledger (ui.js)

**Refactor first:** extract the body of `showLedger` into
`vesselCardHtml(v, ctx)` returning the existing inner markup (name, type
line, dl, status, itinerary, evidence note — everything). `showLedger`
becomes a thin wrapper; the convoy panel reuses it verbatim, so the expanded
view is *identical* to the single-vessel ledger by construction and can never
drift from it.

`showConvoy(members, ctx, expandedSet)` renders into the same `#ledger`
element (so mobile bottom-sheet presentation, Escape, and the close button
all come free):

- **Header:** convoy name ("The flota for Veracruz" on Carrera lanes, else
  "Convoy — Cadiz to Veracruz"), member count + escort note, allegiance flag,
  lane name.
- **Member list:** one row per vessel — disclosure chevron, flag chip, name
  (prefix applied once, as everywhere), type in `<em>`, status tag when
  arrived/lost. Each row is a `<button aria-expanded aria-controls>` toggling
  a `data-exp` region containing `vesselCardHtml(v, ctx)`. Distinct data
  attribute from the port panel's `[data-vid]` rows so the existing
  ledger-body click delegation stays unambiguous.
- Expanded-state lives in a `Set` owned by main.js and passed through — it's
  selection state, not world or settings state.
- Middle-Passage note: unreachable inside convoys by the §1 exclusion, but
  `vesselCardHtml` keeps the logic — the invariant lives in the sim, not the
  template.

CSS: reuse `.leglist.portlist` row styling; the expanded card indents and
carries the ledger's `dl` styles; chevron matches the menu-disclosure idiom;
44 px targets on coarse pointers as per the UI-overhaul hardening.

## 5. Data (`data-src/convoys.json`, `pipeline/build-data.mjs`)

New vocabulary file, folded additively into `datasets.json` as
`datasets.convoys` (datasetVersion stays 4):

```json
{
  "reprieve": { "q": 0.5, "causes": ["taken as a prize"] },
  "rules": [
    { "match": { "system": "carrera" }, "era": {"from":1564,"to":1778},
      "rate": 0.65, "size": [4,7], "escort": "always",
      "note": "Convoy compulsory by ordinance, 1564 to the free-trade decree.",
      "class": "asserted" },
    { "match": { "system": "voc-return" }, "rate": 0.3, "size": [3,5],
      "escort": "war", "class": "asserted", "note": "…" },
    { "match": { "war": true }, "rate": 0.12, "uplift": 3.0, "size": [3,6],
      "escort": "war", "class": "asserted",
      "note": "Wartime trade convoy; Convoy Acts 1793/98 make it mandatory." }
  ]
}
```

(Exact system ids to be matched against the folded flow systems at build
time.) build-data validates: every `match.system` exists, rates in [0,1],
sizes sane, every rule carries `class` + `note` (the charter's
no-undeclared-estimates rule applied to sim rules), and it asserts the
exclusion — no rule may match a middlePassage/framing lane. First matching
rule wins; no match ⇒ never convoys.

## 6. Tests (`test/convoys.test.mjs`) + verification

1. **Determinism:** same seed, two worlds ⇒ identical fingerprints, identical
   convoy memberships.
2. **Granularity:** one 200-day tick vs. many small ticks ⇒ identical
   fingerprints (convoys included).
3. **Structure:** members share `laneId` and leg sequence; departures strictly
   staggered within the bound; ids contiguous from the leader; sizes within
   the rule's range; escort (when present) `isNaval` with ballast cargo and an
   era-valid naval type.
4. **Exclusions:** across many seeds/years, no vessel on a middlePassage or
   framing lane ever carries `convoyId`; the build-data validator rejects a
   deliberately bad rule.
5. **Reprieve:** only escorted convoys; only the configured causes; a member's
   cleared fate arrives exactly at her shifted `voyageEnd`.
6. **Flow honesty / population:** long-run mean spawns per sim-year within
   tolerance of the pre-convoy figure; the population band holds.
7. **Persistence:** serialize/restore mid-passage ⇒ identical continuation
   (fingerprint match against never-closed); a pre-convoy save restores
   without error.
8. **Thinning:** at density 0.5, every convoy is all-shown or all-hidden.

Headless (Playwright, `#debug=1` hook): click a convoy member → panel lists
members with count; toggle expands to the full ledger markup; expanded rows
survive the HUD refresh; close/Escape and mobile sheet behaviour; no-overlap
rect asserts still pass.

## 7. Order of work

1. `data-src/convoys.json` + build-data fold & validation (small).
2. `world.js`: convoy roll, member generation, stagger, reprieve, interval
   scaling, log line, `convoyId` (~100–140 lines, the bulk of the risk).
3. Tests 1–7 green before touching a pixel.
4. `render.js`: formation offset, group thinning key, convoy selection ring.
5. `ui.js` refactor (`vesselCardHtml`) + `showConvoy`; `main.js` routing +
   expanded-state; CSS.
6. Playwright verification; RANKING.md + CLAUDE.md/AGENTS.md status entries.

## 8. Decisions taken in this draft (flag if you'd choose otherwise)

- **Reprieve mechanic ON** (q = 0.5, prize-takings only) — convoys that don't
  protect would be historically hollow; implemented without touching existing
  RNG streams.
- **No `datasetVersion` bump** — additive data; old saves survive and simply
  start convoying from now on.
- **Middle-Passage / framing lanes excluded** from convoys entirely (charter).
- **Naval squadrons out of scope** — this is trade convoy; squadrons can ride
  the same machinery later.
- **Log:** one line per convoy departure, per-vessel losses/arrivals kept.
