# T5 measurement note — name-pool pressure, 2026-07-16

The auditable record behind research task T5 (`TASKS.md`): every (culture,
role) name pool now sits under **70% peak pressure**, the gate for feature
pass 3.5 (unique active names + retirement).

**Harness:** `research/tools/name-pressure.mjs` — peak SIMULTANEOUS sailing
vessels per (naming culture, role), sampled every 5 sim-days across a full
270-year cycle, against the distinct-stem pool size the makeName themes give
that culture/role. Re-run it after ANY flow-matrix or spawn-pacing change;
it exits nonzero while any pool exceeds 70%.

**Seeds:** 42, 7, 23 (the harness default) · 59,130 samples.

## Before → after

Pools over the gate before expansion (2026-07-16 baseline), and where the
expansion left them:

| culture/role | peak | pool before | pressure | pool after | pressure |
|---|---|---|---|---|---|
| portugal/merchant | 26 | 12 | 217% | 44 | **59%** |
| hansa/merchant | 17 | 10 | 170% | 28 | **61%** |
| mughal/merchant | 12 | 9 | 133% | 20 | **60%** |
| ottoman/merchant | 12 | 10 | 120% | 20 | **60%** |
| britain/merchant | 58 | 66 | 88% | 90 | **64%** |
| china-junk-trade/merchant | 9 | 11 | 82% | 16 | **56%** |
| gowa/merchant | 6 | 8 | 75% | 12 | **50%** |
| spain/merchant | 9 | 12 | 75% | 16 | **56%** |

Two near-gate pools were padded as headroom (PLAN-6's adoption will raise
traffic and force a re-gate): dutch/merchant 15→19 byPower stems (59→45%),
france/merchant 15→19 (54→42%). All other pools were already comfortably
under and were left alone; naval pools all pass (worst: britain/naval 32%).

A live duplicate name existed in **97%** of samples before, **89%** after —
larger pools alone already thin collisions; pass 3.5's uniqueness rule does
the rest.

## Authoring register (per the T5 brief — no invented-sounding filler)

- **Portugal** (+32): Marian invocations and saints of the carreira record —
  *Nossa Senhora da Boa Viagem, do Bom Despacho, da Penha de França…*,
  *Santíssimo Sacramento*, *Cinco Chagas*, *Santa Catarina de Monte Sinai*,
  *São João Baptista*, and the attested carrack bird-names *Águia*, *Garça*.
- **Hansa** (+18): saint-and-city register — *Stadt Lübeck/Bremen/Danzig/
  Riga*, *Sankt Nikolaus/Jakob/Johannis/Gertrud/Annen*, *Engel Gabriel*,
  *Jungfrau Maria*, *König David*, *Salvator*, *Emanuel*.
- **Mughal** (+11): the Surat marine's blessing/honorific forms alongside
  the attested *Rahimi/Ganj-i-Sawai* pattern — *Husaini, Salamati, Rahmani,
  Fathi, Mubarak, Faizi, Nurani, Sultani, Darya Daulat, Madad-i-Ilahi,
  Khudabaksh*.
- **Ottoman** (+10): the mixed Greek/Turkish marine — *Agia Triada, Agios
  Spyridon/Georgios/Ioannis, Theotokos* beside *Hüdaverdi, Selamet, İnayet,
  Devlet, Hüma*.
- **Britain/USA shared merchant themes** (+24): women +10 (*Jenny, Polly,
  Esther, Rachel, Diana, Louisa, Isabella, Margaret, Catherine, Priscilla*),
  abstract +8 (*Happy Return, Blessing, Charity, Fidelity, Goodwill,
  Content, Delight, Olive Branch*), civic +6 (*Earl of Sandwich, Duke of
  Bedford, Countess of Scarborough, Marquis of Rockingham, Lady Penrhyn,
  Lord Camden*).
- **China junk trade** (+5): auspicious two-character compounds — *Wanshun,
  Deshun, Hesheng, Yongfeng, Ruitai*.
- **Gowa** (+4): Makassar-coast toponyms matching the existing register —
  *Galesong, Barombong, Mariso, Bantaeng*.
- **Spain** (+4): the religious register — *Nuestra Señora de la Soledad,
  Nuestra Señora del Carmen, Jesús María y José, San Cayetano*.

## Verification

- `npm run build:data` — validators clean; plausibility self-check 1,864
  vessels, 0 contradictions.
- `npm test` — 46/46 green (includes the pool-swap sim-inertness test:
  name-pool contents never move fates or counters).
- `node research/tools/name-pressure.mjs 42 7 23` — exit 0, all pools
  under gate.

## Standing caveat

**PLAN-6 (adopted 2026-07-16) re-raises pressure**: 35 more traffic-years,
higher late-era rates, and the new powers' pools change peak concurrency —
re-run the gate over the 310-year cycle at X-S2 (and again before pass 3.5
ships, whichever comes first). The gate is cheap; the target is standing.
