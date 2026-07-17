# Phase-RB campaign tracker — movement & flows (one source pass)

The working state of the Phase-RB research campaign (`TASKS.md`: T4 + T8 +
T9 + T10, with PLAN-4 E-R1 verification woven in). **Any session resumes
here**: find the first chunk not marked done, read its scope, continue. Every
chunk lands as a complete artifact section + a commit before the next begins,
so usage limits never strand partial work.

**Campaign decisions (user, 2026-07-16):** chunk order = naval & convoys
first · verification = FULL ADVERSARIAL (every quantitative claim gets an
independent refuter pass; stamps recorded per claim) · pacing = 2–3 chunks
per session, then report · commit each landed chunk.

**Method per chunk:** (1) parallel gather agents per source family →
structured claims with sources; (2) independent refuter agents attack every
quantitative claim (an agent never refutes its own gathering); (3) synthesize
into the artifact with per-claim verification stamps (✅ verified ·
⚠ contested, both readings given · ✂ refuted, removed); (4) sync TASKS.md /
RANKING queue if a task completes; (5) commit.

## Chunks

| # | Scope (tasks) | Artifact | Status |
|---|---|---|---|
| 1 | **Convoy institutions & rates + naval movement patterns** (T9 complete + T4 naval strand): flota, Brazil frotas, carreira, Manila pairing, VOC retourvloot, EIC/CdI homeward, Convoy Acts 1793/98 wartime convoy, caravane/Levant convoy; guarda-costas & revenue cruisers, station-keeping/blockade, privateer cruising grounds & the Pirate Round | `research/ambient-flows.md` §1 (+ PLAN-convoys §1 table refresh) | **✅ done 2026-07-16** |
| 2 | **Fisheries & whaling as grounds-traffic** (T4 fisheries strand + PLAN-4 E3 verification + T8 Iceland/North-Atlantic + Bergen/Trondheim stockfish) | `ambient-flows.md` §2 + E3 stamps + T8 partial | **✅ done 2026-07-16** |
| 3 | **Scheduled & state services** (T4: Falmouth packets, correo marítimo, caravane services, Surat–Jeddah hajj + PLAN-4 E6 verification; T10 packet lines 1818–50) | `ambient-flows.md` §3 | queued |
| 4 | **Local metabolisms** (T4: colliers, shachuan, coastwise circuits — short-circuit representability) | `ambient-flows.md` §4 + mappability verdicts | queued |
| 5 | **T10 basin extensions, Atlantic** (1820/30/40 decades; illegal-era Brazil/Cuba trade — counted, sober framing staged for review; Latin American independence; suppression squadron) | `research/flows/atlantic.json` decades + framing texts staged | queued |
| 6 | **T10 basin extensions, East Asia + Indian Ocean W** (Canton→treaty ports, opium named honestly, Mascarene/Plata coerced systems with E1/E5 verification) | basin files + stamps | queued |
| 7 | **T10 basin extensions, Baltic/Med/Bengal** (Sound Toll to 1857, échelles after Barbary ends, country trade) | basin files | queued |
| 8 | **T10 new-port dossiers + wars sweep** (Singapore, Hong Kong, Valparaíso, Sydney, New Orleans; wars 1815–50 incl. Navarino, Opium War) | `port-flow-candidates` pattern dossiers + wars.json inputs | queued |
| 9 | **T8 remaining candidates** (Ostend & Trieste companies, New Julfa carriage, Aceh/Bantam pepper) | new dated candidates doc + register entries | queued |
| 10 | **E-R1 re-verification closeout** (any PLAN-4 Tier-1 claim still unstamped: Jumar/Borucki E1, HBCA E4, Allen E5) + X-R2 framing sign-off texts | stamps + staged texts | queued |

## Done

- **Chunk 1 (2026-07-16):** T9 complete + T4 naval strand — 84 claims,
  62 ✅ / 22 ⚠ / 0 ✂; `ambient-flows.md` §1 landed; PLAN-convoys §1 table
  refreshed (caravane re-scoped to Smyrna convoys; galeones end 1739;
  frotas added). Deferred follow-ups flagged in the section: 1658 Brazil
  return-only rule (check Costa), 18th-c Carreira rate (check Duncan),
  convoyed-trade share (check Knight). Commit 027718c.
- **Chunk 2 (2026-07-16):** T4 fisheries strand + PLAN-4 **E3 verification
  PASSED** + T8's Iceland & Bergen items — 84 claims, 74 ✅ / 10 ⚠ / 0 ✂;
  `ambient-flows.md` §2 landed. Key outcomes: herring fishery QUANTIFIED
  (register entry can graduate when the pattern ships); the sack-ship
  triangle mappable today; **Bergen recommended to the promotion queue**;
  northern whaling counted-class (two dated grounds nodes, 1660/1719);
  the "Brazil Banks" node belongs off the Plata beside Montevideo (E1).
  Follow-ups: tally the BSWF CSV; read SEHR 2025's body; van Bochove page
  citation for the GDP-share figure. One session-limit interruption
  mid-gather — no data lost (chunked writes held).
