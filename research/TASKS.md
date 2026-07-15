# Research task queue

Standing research tasks that are **not** port promotions — those keep their
own pipeline in `CURATION.md` + `minor-ports-promotion.json`. A task moves to
**Done** with a one-line outcome when its output lands in the repo.

## Open

### T1 — Port name & ownership changes: the full-roster sweep
For each of the 66 sailing ports (`data-src/ports.json`), compile the
1550–1815 timeline of (a) **name** changes and (b) **ownership/allegiance**
changes, with year boundaries and a one-line source note per change. Seven
ports already carry `eraNames` (Louisbourg⇄St John's, Kingston⇄Port Royal,
Batavia⇄Jayakarta, Bombay⇄Goa, Madras⇄Masulipatnam, Calcutta⇄Hugli,
Gothenburg⇄Älvsborg) — verify those windows and sweep the remaining roster
systematically; ownership has no data field yet anywhere (`ports[].power` is
static), so this sweep is the data prerequisite for showing the flag of the
time in the UI.
**Output:** `research/port-eras.json` — per port, an ordered list of windows
`{from, to, name, power, source}` tiling the era exactly (the `eraNames`
validator pattern), ready to feed `ports[].eraNames` and a new
`ports[].eraPowers`, so the chart labels, port panel, and log speak both the
name and the allegiance of the time.

### T2 — Era blurbs: one sentence per port/name/ownership combination
For every distinct window from T1 — every (port, name, ownership)
combination — write **one sentence** describing the port in that state: what
it was, who ran it, what moved through it. When a port changes name OR
ownership, the sentence changes with it (Port Royal's sentence is not
Kingston's; Dutch Cochin's is not Portuguese Cochin's).
**Output:** a `blurb` field on each window in `research/port-eras.json`;
surfaced later in the port panel beneath the lifeline line.
**Register:** the chart's sober voice; the charter applies (no fabricated
precision — hedge where sources hedge; coerced human movement in the
Middle-Passage pattern, factual and never framed as value).

## Done

*(nothing yet)*
