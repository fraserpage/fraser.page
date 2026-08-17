# fraser.page — design brief

## Goal

Personal portfolio site to support a job search for a product-focused software developer role. Primary job of the site: get a hiring manager or founder to read a case study and believe Fraser makes good product decisions, not just that he can code.

## Audience

Deliberately not narrowed to one company archetype — Fraser doesn't yet know where he'll land, ranging from design-forward product startups to more structured scale-ups. The site should work as a wide net with a strong point of view rather than hedge toward a guessed persona. It needs to read as credible to a technical hiring manager and as tasteful to a design-forward founder simultaneously — the actual differentiators (product ownership instinct + design fluency + AI-native engineering) hit both.

## Positioning thesis

Fraser spent 12 years as the de facto technologist for an organization with no dedicated tech function (IT/ops/marketing at a law firm). He then deliberately retrained as an engineer (top of his bootcamp class), spent two years earning design-to-dev craft at an agency (Briteweb) building award-winning sites, and landed at a client (via Springloaded, a dev agency) with no in-house product leadership — where he became the de facto product owner again, this time on an AI-native platform. The pattern: **he consistently ends up owning the product when nobody else is, and has the design fluency to make the decisions well.** Not "backend guy who does AI now" — someone who translates ambiguous problems into concrete, working decisions, backed by usage data rather than assumption.

Calibration note: the claim is specifically "decides what to build when the brief's still fuzzy," not "runs full product lifecycle including user research." Evidence for the former is strong (see case studies below); evidence for the latter (direct user research, outcome tracking) is thin and should not be overclaimed. Fraser is close to usage-data signal and support/bug-triage, which is the honest version of this.

Tense note: Fraser leaves Springloaded in September 2026. Write all Springloaded-related copy in tense that survives the transition (e.g. "led development on," not "leads development on") since the site will likely launch after he's left.

Numbers: use "hundreds of advisers" and "hundreds of thousands of students nationally" rather than precise figures — actual counts fluctuate seasonally (478–735 advisers, 300k–400k+ students depending on time of year) and are based on soft proxies (e.g. password-update counts), so precise-looking numbers would overclaim methodology rigor that isn't there.

## Content architecture

Single page, not multi-page — a forced navigation choice at the top breaks narrative momentum before the reader has bought in. Depth is handled via in-page expand/zoom interactions instead (see Visual direction).

Section order:
1. **Hero** — small "Fraser Page" label + giant headline built from two cycling word slots (adjective + role noun, e.g. "Creative" / "AI-native" × "developer" / "builder"), tag line ("Throw me your fuzziest briefs. What? No, not underpants."), tightened sub-line about the working method (data first, not assumptions).
2. **Latest** — short status paragraph on the Grace platform and Fraser's role, tense-safe, honest scale.
3. **Case studies** (see below) — compact cards that expand/zoom in place, not separate pages.
4. **Heritage** — pre-Grace agency work, TransLash (Webby Award, D3 dashboard, designer collaboration) as the lead story; Acumen and Arts Midwest compressed to one line each.
5. **Arc** — compact/visual timeline treatment (not prose) of the 2009–2026 career arc, reframed as evidence of range/maturity rather than downplayed.
6. **Personality** — the wedding RSVP site (Firebase, playful interactivity) and the SPF chart-label geometry piece. Bootcamp exercises (Game of Life, Tic-Tac-Toe) cut from the main showcase — the same "goes past the spec for love of it" trait is already covered, better, by the SPF piece (real client work, higher stakes).
7. **Close** — brief statement of what Fraser is looking for (room to grow, design carries real weight) + contact.

## Case studies (four, register-varied)

Each should stay tight — beats below, not full prose; Fraser is drafting the actual copy himself to keep it in his voice (his direct feedback: earlier full-prose drafts from Claude read as "AI wrote this").

**1. Data Requests / AI tool design.** Students submit data changes as diffs; advisers approve before merge. First attempt gave the AI agent the backend's own data shape as its tool interface; testing showed the agent conflating things it shouldn't (e.g. application status vs. data-submission status). Fix: tools need their own shape, independent of the backend. Real judgment earned through testing — this is probably the single best evidence of AI-engineering maturity in the whole site.

**2. Smart Interaction.** Vague brief ("make interaction-logging better"). Usage data showed advisers batching entries. Three solutions for three working styles: extended bulk-import to fully support interactions via table view (improved all bulk tools, not just this one); a "keep window open" toggle for dialog-flow advisers; AI smart-fill from notes for single-entry (button reads adviser docs baked into the agent, filters student names for privacy, runs on the fastest model that held up in testing). Presented alongside the real (redacted) Linear ticket as proof artifact — paraphrased recap → ticket → narrative resolution. Colleague handle in the ticket screenshot must be redacted/anonymized before publishing; platform name "Grace" is cleared to use.

**3. Tasks system (greenfield).** New student portal needed a "tasks" concept; client couldn't articulate what these should be, designer lacked workflow context. Fraser's reasoning: the platform's job is data collection, so tasks should represent journey steps completed by updating data, not a checklist disconnected from it. Built v1 hardcoded but designed to expose existing filtering tools as a config screen later.

**4. Scripts to prompts.** Brief: replace a clunky, expensive external SMS platform. Client was stuck thinking in "scripts." Fraser reframed to AI-driven "prompts" triggered by live student data changes — a real pushback moment ("that's not how we should work anymore"), not just fulfilling the brief as given.

## Tone / voice rules

- No AI-voice. Concretely: avoid spec-sheet bullet lists ("AI assistant with RAG over scoped knowledge bases..."), avoid corporate phrasing, avoid self-aggrandizing declarative claims about himself.
- Fraser defaults to modesty — self-praise in his own voice ("I'm a creative leader") reads wrong to him. Cycling-word labels and light self-deprecating humor (the "briefs/underpants" line) work *because* they sidestep making a claim in his own voice — labels read as attributes to be judged, jokes aren't claims at all. Lean on this mechanism rather than declarative sentences.
- Sentence case, active voice, contractions fine, specific over clever.
- Numbers: round, defensible, not falsely precise (see above).

## Visual direction

**Base aesthetic: stark black/white, near-brutalist.** This is a deliberate choice, not a fallback — it's the native look of Fraser's own bootcamp-era work (Tic-Tac-Toe, Game of Life), so it has real continuity rather than being borrowed from an external reference. Serves "dev portfolio, not frontend showcase," direct communication over indirection, and reads credibly to a technical/structured audience.

**No scroll-jacking, no scroll-driven cinematic sections.** Direct, fast, content-forward. This ruled out an earlier "scroll-driven case-study cinema" concept — explicitly rejected.

**Typography:** Recursive (variable font — axes wght/slnt/CASL/MONO already in use on the current fraser.page) is the leading candidate; Fraser is not married to it and is open to an alternative with equal character. Fraser has hands-on prior art here: he built a bootcamp app for varying variable-font properties across a word/phrase, so this direction has personal technical heritage, not just aesthetic preference.

**Signature interaction motif: zoom, at two tempos.**
- Fast/utilitarian: case-study cards sit small-but-present on the page; click/tap zooms them to full detail in place. This replaces the earlier "modal/expand-in-place" concept with the same function, unified under one grammar.
- Slow/cinematic (optional, gated, not the default path): a Powers-of-Ten-style (Eames) zoom easter egg — cosmos → galaxy → solar system → Earth → Canada → forest → a laptop on the ground → into the laptop → into the site. This is Fraser's own long-held idea, preferred specifically because it's a single authored vision rather than a generated menu of options (see below) — ties to the positioning thesis itself (taste = conviction, not a menu). Must be skippable/optional, never blocking access to content — same principle as the "craft & experiments" section: built for love of it, not load-bearing for the job-search function.

**Rejected direction:** generating many AI-produced visual variants and shipping them all as a "choose your favorite" or name-spelling grid experience. Concept is visually interesting (tile grid assembling into an image on zoom) but the framing undermines the positioning thesis — a portfolio meant to prove good taste/decision-making shouldn't present itself as a menu of options with no conviction behind the final choice. The tile-assembly *mechanic* may still be reusable elsewhere (e.g. the case-study grid) on its own merits.

**Text motion mechanic:** per-character variable-font animation (weight/slant/casual axis genuinely changing, not an image-based effect) over WebGL/SVG liquid distortion — chosen specifically because it's native to Recursive's actual engineered axes rather than a generic effect that would look identical on any typeface or image. Two working prototypes exist (see `/docs` history / conversation) comparing both techniques directly.

## Tech stack

- **Astro**, static output by default, islands for the interactive bits only (wobble text, zoom/expand states, cycling headline). Solid or Svelte to be layered in for islands only if/when needed — default to plain JS/TS islands first.
- **Hosting: Cloudflare Pages** (marginal edge/config advantage over GitHub Pages, not a dramatic speed difference — the real performance lever is asset discipline, e.g. subsetting the 304KB Recursive font file to the glyphs/weights actually used).
- Repo: `fraserpage/fraser.page` (private, will go public at launch).
- Node: this environment manages Node via Herd; v22+ required for the Astro CLI (project scaffolded with v22.23.2 located in Herd's nvm-style version directory).

## Assets available in this repo

- `public/fonts/recursive-latin.woff2` — the real variable font file from the current live site.
- `public/images/` — fraser.jpg (headshot), grace.jpg, translash.jpeg, wedding.png, spf.jpeg, acumen.jpg, artsmidwest.jpeg, favicon.png — pulled from the current live site's asset library.
- Not yet in repo: the redacted Linear ticket screenshot for the Smart Interaction case study (needs redaction of colleague's handle before use), final case-study copy (Fraser drafting in his own voice), final headline word lists, final typeface decision if not Recursive.

## Open decisions

- Exact cycling-headline word lists (adjective slot, role-noun slot) — placeholders used so far: Creative / Product-minded / Thoughtful / Data-driven / AI-native × developer / builder / engineer.
- Final typeface if Recursive is dropped.
- Heritage / Arc / Personality / Close section copy — not yet drafted (Fraser deferred these to write himself).
