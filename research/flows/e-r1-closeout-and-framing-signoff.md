# E-R1 closeout (E4) + X-R2 framing sign-off — staged for the build

*Phase-RB campaign chunk 10, landed 2026-07-18. Two parts: **(A)** the last
unstamped PLAN-4 Tier-1 verification — **E4, the Hudson's Bay Company / York
Factory** — gathered and then attacked by an independent refuter (6 points,
**5 ✅ / 1 ⚠ / 0 ✂**, VERIFIED-WITH-RESTATEMENTS); and **(B)** the **X-R2
charter framing sign-off** — every coerced-flow framing text staged across the
campaign, assembled here FOR USER REVIEW before the validator enforces them at
X-S1. Raw E4 gather committed to `rb-campaign-wip/` and superseded here.*

---

## Part A — E4 verification stamp

**E4 (York Factory / Hudson's Bay Company): VERIFIED-WITH-RESTATEMENTS for the
build.** Every factual sub-claim survived independent re-checking; the counted
evidence class holds. **With E4 stamped, PLAN-4's E-R1 verification is COMPLETE**
(E1 Plata + E5 Mascarene stamped chunk 6; E2 Gulf 3–0 in the original sweep; E3
whaling passed chunk 2; E6 Jeddah passed chunk 3; E4 here).

**What verified (E4-01…06):**
- **The HBCA ships' histories register exists** (Archives of Manitoba; ~270+
  vessels 1668–1974; name · rig · service dates · service areas). ⚠ **Restate
  the citation:** the derived web table is HBCA's own "compiled reference…
  not a comprehensive source," so **cite the underlying archival series as the
  counted basis** — the York Factory **bills of health**, the **ships' logs**
  (HBCA Section C), the **post journals**, and the account-book study
  (*Archivaria*, "The Cycle of Commerce: York Factory Records of Hudson's Bay
  Company Supplies"). Counted is justified; the web table is the wrong pointer.
- **The 1668 voyage** (Deptford, 5 June 1668; *Eaglet* turned back; *Nonsuch*
  reached the bay, built **Charles Fort on the Rupert River — in JAMES Bay**;
  returned 9 Oct 1669; HBC chartered **2 May 1670**). ✅
- **York Factory founded 1684**, the correct central Bay depot node. ✅ The
  **French occupation ~1694–1714** (d'Iberville captured it 1694 = Fort Bourbon;
  contested, with English interludes 1695–96; France held it ~1697 until the
  **Treaty of Utrecht 1713**, handover 1714) genuinely **breaks "continuous
  1668–1815."** ✅
- **~1–3 supply ships/yr** (≈3–4 company-wide across 4–5 forts by 1749; ~1–2 to
  York specifically; no dramatic growth before the 1821 NWC merger, out of
  scope). ✅ Vessel count **counted**, York-specific split **reconstructed**.
- **Season-gating** (London ~31 May → the Hudson Strait window ~15 July–1 Oct →
  arrive Aug–Oct → return before freeze-up) — the best-attested part; validates
  the season-gated single-lane model, same shape as the Arkhangelsk corridor. ✅
- **Named ships:** *Nimble* (brigantine, 1792–93), *Beaver* (sloop→brig,
  1788–93; distinct from the 1835 PNW steamship *Beaver*). ✅

**Build recommendations (both from the refuter):**
1. **Era/node — Option A (recommended):** node era **1670–1815** with **York
   Factory as the era-name from 1684** and **Rupert House** the earlier James Bay
   era-name (NOT the short-lived "Charles Fort"). This matches the shipped
   `eraNames` idiom (Louisbourg⇄St John's spans a comparable cross-water shift;
   Batavia⇄Jayakarta, Bombay⇄Goa) and, unlike a strict 1684 start (Option B),
   does **not silently zero the 1670–1684 charter-era Bay traffic** the charter
   forbids dropping.
2. **The 1694–1714 occupation:** a **port-lifecycle `active {from,to}` gap on
   York** (Smeerenburg/Kaffa idiom) **+ reroute the counted London↔Bay lane to
   Fort Albany** (retaken by the English 1693, English thereafter) — historically
   accurate (HBC Bay commerce never actually stopped) and idiom-consistent. Model
   as one ~1694–1714 window, not year-by-year hand-offs.

**Sim shape (confirmed):** one node "York Factory (Hudson Bay)" (Rupert House
pre-1684), one London lane, season-gated Jun–Oct, evidence **counted**. The
low-volume "Dejima pattern" framing is apt — the only English sub-Arctic presence
on the chart.

---

## Part B — X-R2 charter framing sign-off  ·  ✅ APPROVED 2026-07-18

**What this is.** PLAN-3 §1 rule 6 (the charter): *coerced human movement carries
the sober framing — no value tier, no profit framing, never a reward.* The
validator (`tools/validate-flows.mjs`) hard-fails any system with `enslaved-people`
cargo that lacks a `framing{sober:true}` block. The campaign added several new
coerced flows (PLAN-4/PLAN-6); the user reviewed each text one at a time and
**approved all eight** below. Each lands at X-S1 wrapped in the standard block —
`framing: { sober: true, description: <the text>, rule: "No value framing, no
profit framing, never a reward. …" }`.

**Governing principle the user set in review (the "no tone-narration" rule):** the
`description` states **fact only** — it never narrates its own tone. The
"shown factually / never a reward / not cargo" meta-lines were removed from every
text; the no-reward commitment lives in the `rule` field (enforcement metadata),
not the player-visible prose. This was applied to the eight new texts AND
retroactively to the three enforced R3 descriptions (see below).

### The eight approved framing texts (final wording)

**1. `brazil-illegal-era`** (Atlantic, chunk 5; enslaved-people; counted) — *approved as written*:
> "After 1831 this trade was illegal under Brazilian law and it continued
> regardless, carrying more than three-quarters of a million people across these
> decades. Vessels on this lane carried enslaved people; many died on the passage.
> The trade ended only in 1850–52, under Brazilian law backed by naval pressure."

**2. `cuba-illegal-era`** (Atlantic, chunk 5; enslaved-people; counted) — *approved as written*:
> "This trade was conducted in defiance of treaty from 1820, sustained by Cuban
> plantation demand and sheltered late in the era by flags the patrols could not
> search. Vessels on this lane carried enslaved people; many died on the passage.
> It outlasted every suppression effort of this era, ending only in 1867."

**3. `neworleans-coastwise`** (Atlantic, chunk 8; enslaved-people; counted) — *edited: dropped the tone-narration sentence*:
> "These vessels carried enslaved people by sea from the ports of the Upper South
> — Baltimore, Alexandria, Norfolk, Richmond — to New Orleans, the largest slave
> market in the United States. Federal manifests recorded more than sixty thousand
> people on this coastwise passage between 1818 and 1860 — a domestic continuation
> of the Middle Passage. Many were separated from their families by the voyage."

**4. `plata-montevideo`** (Atlantic; the E1 slave trade; counted) — *drafted to close the audit gap; cleaned + de-duplicated*:
> "These vessels carried enslaved people to the Río de la Plata, where Montevideo
> was made the sole authorized port of entry in 1791 — most brought by way of
> Brazil, others direct from Mozambique and the Angolan coast. Many died on the
> passage. The estuary's salt-beef exports in turn provisioned enslaved
> plantations elsewhere."

**5. `west-africa-squadron`** (Atlantic naval pattern, chunk 5; a `note`, so no
`rule` field — kept so the suppression squadron never reads as a triumphal
counter-flow) — *cleaned: dropped "captures are shown as they were"*:
> "The squadron patrolled the African coast against the slave trade from 1808. It
> intercepted a minority of voyages — roughly one in ten or fewer; a capture meant
> a single vessel detained, its people landed at Freetown. Disease made this among
> the navy's deadliest stations."

**6. `indenture`** (Indian Ocean W, chunk 6; contract labour into a post-abolition
plantation regime) — *cleaned: dropped "The system is shown factually: people under
contract, not cargo"*:
> "These vessels carried indentured laborers from India to Mauritius under
> contract, into a plantation labor regime built directly on the site of slavery.
> Recruitment abuses were documented from the start — emigration was suspended
> from 1839 to 1842 for that reason — and mortality on the passage was real."

**7. `amoy-emigration`** (East Asia / nanyang, chunk 6; the coolie traffic from
1847) — *coercion-strengthened in the chunk-10 review + cleaned*:
> "From 1847 vessels carried indentured emigrants from Amoy toward Cuba and Peru
> — bound by contracts many could not read, and some taken by force; mortality on
> these passages was high."

**8. `sydney-convicts`** (Pacific/Australasia, chunk 8; convict transportation;
counted — indent records) — *cleaned: dropped "The people aboard are shown as what
they were…"*:
> "These ships carried men and women transported under sentence from Britain and
> Ireland to a penal colony on Gadigal land. Transportation to New South Wales ran
> from 1788 until 1840. Mortality on the early passage was severe — on the Second
> Fleet of 1790, roughly a quarter died at sea — and fell only after naval
> surgeons were placed aboard every ship from 1815."

### The three R3 blocks — CLEANED to match the principle (applied 2026-07-18)

The user extended the no-tone-narration rule to the three already-enforced R3
descriptions. Applied directly to the JSON (the `sober:true` flag and each `rule`
field are unchanged, so enforcement is intact; only the prose was trimmed). The
shared `label` was also trimmed from "coerced human movement — recorded, not
celebrated" to **"coerced human movement."**

- **`middle-passage`** (`atlantic.json`): → "Human beings trafficked against their
  will across the Atlantic — the largest forced migration in history. Mortality on
  the passage was immense."
- **`black-sea-slave-trade`** (`mediterranean.json`): → "Captive people carried
  across the Black Sea to Ottoman slave markets — the northern counterpart of the
  trans-Saharan routes, and for the 16th–17th centuries among the largest coerced
  flows anywhere."
- **`indian-ocean-slave-trades`** (`indian-ocean-west.json`): → "Captive people
  carried from East Africa into Arabian, Persian, Indian, and Mascarene bondage — a
  coerced flow spanning this whole era and beyond it at both ends."

### Completeness audit — both gaps resolved (ratified)

- **Plata / Montevideo** — has its own text (#4 above), ratified. Distinctive
  features a generic `middle-passage` inheritance would lose (the 1791 monopoly,
  the Brazil routing, the Mozambique source, the tasajo triangle) are carried.
- **The illegal-era Mascarene tail** (E5, ~52,550 to Mauritius to c.1827) —
  **INHERITS `indian-ocean-slave-trades.framing`** (ratified): it is the same
  East-African-to-Mascarene flow the R3 system already frames, now under
  prohibition. At X-S1, add a one-line `notes` on the system — *"the trade
  continued illegally into the 1820s"* — no second framing block.

*(Convict transportation to Van Diemen's Land — Hobart, to 1853 — is not a gap now:
Hobart is not a node; if promoted it would need its own text.)*

### Remaining at X-S1 (mechanical, no further sign-off needed)

The eight approved texts are written as `framing{sober:true, description, rule}`
blocks on their systems when those systems are authored at X-S1; the validator then
enforces presence, and S3 can surface the sober notes in the vessel ledger. The
three R3 cleanups are already live in the JSON.

---

## Verification record — chunk 10

**E4: 6 points — 5 ✅ / 1 ⚠ / 0 ✂, VERIFIED-WITH-RESTATEMENTS.** The ⚠: the HBCA
web ships'-histories table is a curated secondary compilation → cite the
underlying archival series (bills of health / logs / post journals) as the counted
basis. Restatements carried into the build: era-start Option A (1670 node, York
Factory as the ≥1684 era-name, Rupert House earlier); the 1694–1714 French
occupation modelled as a York lifecycle gap + reroute to Fort Albany.

**X-R2: APPROVED 2026-07-18.** The user reviewed the framing texts one at a time
and approved all eight (brazil/cuba/neworleans/plata illegal-era + west-africa-
squadron + indenture + amoy-emigration + sydney-convicts). Governing edit: the
**description states fact, never narrates its own tone** — the "shown factually /
never a reward / not cargo" meta-lines were stripped from all eight and, on the
user's instruction, retroactively from the three enforced R3 descriptions (the
`sober:true` flag + each `rule` field unchanged, so enforcement holds). Both audit
gaps ratified: Plata got its own text; the Mascarene tail inherits
`indian-ocean-slave-trades.framing` + a one-line `notes` at X-S1.

**With chunk 11 (T12) also complete, Phase RB is COMPLETE — and the X-R2 framing
sign-off, the campaign's one standing user-action item, is now closed.**
