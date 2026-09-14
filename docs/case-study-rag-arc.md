# Case study source: the RAG arc

Raw material for a fifth case study. **Not copy** — beats, verified facts, and structure.
Per the design brief, you write the prose.

Source: `grace-2024` git history, verified 2026-09-10. Commit SHAs included so nothing needs
re-deriving. Everything below is checked against the repo unless marked ⚠️.

---

## The chunking arc — attribution resolved

Verified in git, cross-checked by Fraser against Slack and meeting history. The chunk size was tuned
by hand, in both directions, with no measurement either time — which turns out to be the whole point.

| When | Value | Who | Ref |
|---|---|---|---|
| 2025-08-21 | `RecursiveTextSplitter()` — library defaults | Ashley Hindle | `42736813c` · GRACE-2663 |
| 2025-12-05 | **4000 / 800** — *"We use a larger chunk size to capture more context while staying safe."* | **You** | `16ee861af` · GRACE-2865 |
| 2026-03-31 | **200 / 60**, plus a context prefix — *"Smaller chunks produce more focused embeddings that match specific queries better."* | Tony Phipps, on your ticket and direction | `17b870256` · GRACE-2985 |

**Yours:** both tuning decisions. You set 4000/800 in December on the reasoning that bigger chunks
carry more context. Three months later you'd reached the opposite conclusion — smaller chunks give
more specific embeddings — wrote the ticket and directed the work. You reversed your own parameter
by a factor of twenty.

**Tony's:** the context-prefix idea. `buildChunkContext()` / `findNearestHeading()` prefixes each
chunk with `[Document Title > Nearest Heading]`, so a 200-token fragment keeps the context that makes
it findable. His idea, his implementation. Credit him if the case study mentions it at all.

**This is better material than a clever chunking trick.** A twentyfold reversal of your own parameter,
made on intuition both times, with no measurement either way, is the thing that motivates everything
after it. Nobody on the team could tell whether 4000/800 or 200/60 was actually better except by feel.

That reframes the buy-vs-build decision from a preference into a conclusion: **you weren't trading
away a tuned system, you were trading away a system you had no way to tune.** Handing chunking to a
managed store costs you knobs you were never able to turn with confidence anyway.

If the case study lands one idea, this is a strong candidate for it.

---

## 1. The shape of the story

A buy-vs-build reversal, made deliberately, with the receipts.

You inherited a hand-rolled RAG pipeline that required running a **second database** alongside the
primary one. You worked inside it for six months, extending it. Then the framework caught up, and
you made the call to tear it out — replacing it with a managed vector store, deleting a net 3,727
lines and an entire database service, and **redesigning the access-control model on the way through**
so it was strictly better than what it replaced.

The interesting part is not that you deleted code. It's that you deleted code you'd been maintaining,
on a live system, and used the migration as the opportunity to fix a scoping flaw rather than port
it forward.

### Why this one earns a slot

The four existing case studies are all **product-decision** stories — turning a fuzzy brief into the
right thing to build. This is the register the site currently lacks: **architectural judgement**.
Buy vs. build, knowing when to reverse your own team's earlier decision, and carrying a schema change
through a production system without breaking it.

It's also the only one where the artifact is a *deletion*. That's a good, unusual thing to be able
to show.

**Framing risk:** told badly this becomes "we switched to a library," which is boring and reads as
someone else's decision. The story has to sit on the *judgement* — what you gave up, what you bought,
and why the trade was right for this system at this moment. Keep the reversal in the foreground.

---

## 2. Timeline (verified)

| When | What | Who | Ref |
|---|---|---|---|
| 2025-08-21 | Original RAG built: pgvector, second Postgres DB, custom embedding + retrieval pipeline | Ashley Hindle | `42736813c` · GRACE-2663 · PR #1430 |
| 2025-08–09 | Nova management for knowledge; school scoping on retrieval | Owen Conti | `706128c82`, `712e3f84d` |
| 2025-10-16 | System prompts made editable via Nova — prompts as data, not code | **You** | `713115938` · GRACE-2797 |
| 2025-10-31 | Upgraded to OpenAI Responses API; dropped Chat Completions | **You** | `d190d014a` · GRACE-2799 |
| 2025-11-04 | Enabled hosted `web_search` tool; TrustedSource models | **You** | `675a06437` · GRACE-2799 |
| 2025-12-05→16 | `llm_requests` linked to chats + knowledge items; **cost and token tracking**. Same commit sets chunking to **4000/800** | **You** | `74f1f0875`, `9a614d349` · GRACE-2865/2863 |
| 2026-01-16 | **Anonymiser** — student PII replaced with placeholders before it reaches OpenAI | **You** | `46db75d1c` · GRACE-2900 |
| 2026-02-05 | Tool-calling support added to the chatbot + first tool | **You** | `ba063d604` · GRACE-2928 |
| 2026-03-31 | Chunking reversed to **200/60** (your ticket, your call) + context prefix (Tony's idea) | Tony Phipps | `17b870256` · GRACE-2985 |
| 2026-04-01→09 | **AI integration test suite** — the eval harness | **You** | `a9b833ffd`…`4808451cb` · GRACE-2995 |
| **2026-04-02** | **Design spec written** for the whole migration, before any code | **You** | `109f31ef9` |
| 2026-04-02 | `knowledge_items` moved to MySQL; vector connection removed | **You** | `56a537b9e` |
| 2026-04-06 | **pgvector infrastructure removed** — docker-compose, devcontainer, setup script, docs | **You** | `0da3a619d` |
| **2026-04-15** | **Multi-scope design spec written**, then built — two-dimension access control | **You** | `2e75495ca`, `b5d201d45`, `22effe3a7` |
| 2026-04-22 | Migration merged | **You** | `cff13b793` · GRACE-3000 · PR #1736 |

Your involvement runs **October 2025 → April 2026**. You did not build the original; you inherited
it, extended it for six months, then replaced it. That sequence is the credibility — you'd earned
the right to an opinion about it.

---

## 3. The system before

From your own design spec (`109f31ef9`), describing what was there:

> Full pgvector pipeline: `AiKnowledgeService` generates embeddings (`text-embedding-3-small`,
> 1536 dims), `RecursiveTextSplitter` chunks content (200 size, 60 overlap), `KnowledgeChunk` model
> stores chunks + embeddings on a separate `vector` DB connection, `nearestNeighbors` does cosine
> similarity search scoped by school/program, results injected into the system prompt as
> `<knowledge-chunk>` tags.

Operational shape of that:

- A **second Postgres database**, running alongside MySQL purely to hold vectors — because the
  project's MySQL couldn't take a vector extension.
- A dedicated Horizon queue (`supervisor-vector`) for embedding generation.
- `ChunkKnowledgeItem` and `GenerateEmbeddingForChunk` jobs, with `WithoutOverlapping` middleware
  and unique-job constraints so a re-chunk couldn't race itself.
- Two bespoke console commands (`EmbedSearchTest`, `TestKnowledge`) just to inspect it.
- A Nova resource for browsing chunks.
- `pgvector/pgvector` as a composer dependency.
- Retrieval results injected into the system prompt as tagged text.

Every one of those is a thing that has to be documented, onboarded, kept running, and debugged at
2am. That's the cost side of the ledger — worth naming concretely, because "maintenance burden" as
an abstraction is unpersuasive and a list of seven concrete things isn't.

---

## 4. The decision

Three things changed between August 2025 and April 2026:

1. **The framework caught up.** `laravel/ai` shipped a first-party AI layer with agent classes,
   a tool contract, structured output, hosted vector stores, and an event-driven lifecycle.
2. **The custom layer had accumulated.** By then it was a monolithic `AiChatService` with fluent
   builders handling prompting, a tool-execution loop, streaming, anonymisation, and knowledge
   injection — all in one class.
3. **You'd been the one maintaining it.** Six months of extending it gave you an accurate read on
   what it cost.

Your spec states the motivation in three lines, which is a better summary than anything I'd write:

> 1. Standardize on a maintained, first-party AI layer — reduce custom code surface area
> 2. Gain multi-provider flexibility (OpenAI now, Anthropic/Gemini later without rewriting)
> 3. Leverage official features: proper agent classes, structured output, built-in tool contracts,
>    Vector Stores + FileSearch, event-driven lifecycle, and first-class testing support

**What you gave up — say this plainly, it's the honest core of the piece:** control of chunking,
embedding, and retrieval. OpenAI's hosted vector store does all three internally. You can no longer
tune chunk size, weight lexical against semantic matching, or swap the reranker. For a knowledge
base of school and program policy documents, that wasn't binding. If it became binding — or if a
client needed embeddings to stay in their own infrastructure — the pipeline would have to come back.

**What you bought:** a smaller surface area, one fewer database, one fewer queue, one fewer
dependency, multi-provider optionality, and a test story.

---

## 5. The multi-scope redesign — the technical centrepiece

**This is the strongest part and it's entirely yours.** Design spec `2026-04-15`, built the same week.

You could have ported the old scoping model straight across. You didn't, because it had a real flaw:

> Source (school/program) and user type are mutually exclusive: an item scoped to a school is visible
> to **all** user types at that school… A parent at school 42 sees all school-42 items, even ones
> intended only for students.

That's an information-disclosure bug, in a system holding minors' education records.

**The fix:** split scoping into two independent dimensions that AND together.

```
scope_key IN [user's school/program keys, "global"]
AND for_{user_morph_class} = true
```

A parent at school 42 resolves to `scope_key IN ["school:42", "global"] AND for_student_parent = true`
— so a student-only item at their own school is excluded.

**The constraint that shaped it** (good detail — a platform limitation driving a design decision):
OpenAI vector store attributes are flat key-value pairs with no array support, so one document can
only carry one `scope_key`. For an item scoped to several schools, the sync job writes **one vector
store document per scope key**, identical content, different key. Your spec also notes the attribute
dictionary caps at 16 keys and you used 5.

**Why it matters, in one sentence:** the filter runs *inside the retrieval query*, so the model never
sees a document the user isn't allowed to see. It isn't filtered out afterwards — it's never
retrieved. That's the distinction worth landing, because filtering after retrieval is the common
mistake and it doesn't actually work.

You also wrote the access-control tests as part of the spec — a parent at school 42 *cannot* reach a
student-scoped item at school 42, and so on. Access control specified as test cases before the code
existed.

---

## 6. The numbers

**Migration diff** (`cff13b793`):

| | |
|---|---|
| Files changed | 138 |
| Insertions | +4,585 |
| Deletions | −8,312 |
| **Net** | **−3,727 lines** |

**Infrastructure removed:** an entire Postgres service (from `docker-compose.services.yml` *and*
`.devcontainer/docker-compose.yml`), the pgvector wait loop in `setup.sh`, the `vector` DB connection
in `config/database.php`, the `supervisor-vector` Horizon queue, `config/openai.php`, the
`pgvector/pgvector` composer dependency, two console commands, a Nova resource, and a 501-line AI
test helper.

Note on the numbers rule in the design brief: the "round, defensible, not falsely precise" guidance
is about *user and scale figures* (advisers, students) where the underlying counts are soft. A diff
stat is a different category — it's exact, checkable, and precision is the point. `−3,727` is fine
to use as-is.

---

## 7. The spec-driven angle — possibly the real story

Before writing the migration you wrote **four documents totalling ~3,500 lines**, then deleted them
from the repo once the work shipped (`bc8fb20e4`, "remvove superpowers docs"):

| Document | Lines |
|---|---|
| `2026-04-02-laravel-ai-migration-design.md` | 442 |
| `2026-04-02-laravel-ai-migration.md` (plan) | 1,383 |
| `2026-04-15-knowledge-item-multi-scope-design.md` | 185 |
| `2026-04-15-knowledge-item-multi-scope.md` (plan) | 1,518 |

They're recoverable from git and are genuinely good — file-by-file change lists, before/after code
samples, a table mapping every old tool to its replacement, explicit test cases, and named platform
constraints.

This is **spec-driven development**, practised, before you had a name for it. The design doc is the
source of truth; the code is what gets built from it. That's a real and current methodology
conversation, and you have the artifacts.

**Two decisions to make:**

1. **Is this its own case study?** There's an argument it's a stronger and more distinctive piece
   than the RAG arc itself — "how I work with AI on a large change" is a question every hiring
   manager in 2026 has, and almost nobody can answer it with artifacts. The RAG migration would
   become the worked example inside it.
2. **Should the specs go back in the repo?** You removed them. If they're the evidence, they may be
   worth restoring to `grace-2024` (or at least keeping a copy) — a deleted spec is hard to point at.

**Caveat worth being straight about:** the specs are marked `Made-with: Cursor`, and the plans came
from a skill harness. That's not a weakness — the point of spec-driven development is that the spec
is reviewed and owned by a human regardless of who typed it — but if you show them, own that
provenance rather than letting someone discover it.

---

## 8. Draft structure

Scaffold only, matching `caseStudies.ts`. **The `p` values are beats, not copy.**

```ts
{
  slug: "second-database",        // alt: "pgvector-to-managed", "deleting-a-database"
  no: "05",
  title: "Second Database",       // alt: "The Reversal", "Buy, Build, Buy Back"
  tag: "Architecture",            // register the other four don't cover
  summary: "The best thing I shipped that year was a deletion.",
  blocks: [
    { h: "What I inherited" },
    // Hand-rolled RAG that needed a whole second Postgres running next to MySQL, because
    // our MySQL couldn't hold vectors. Plus a dedicated queue, two jobs, two debug
    // commands, a Nova resource, a composer dependency. I didn't build it — I spent six
    // months extending it, which is how I know what it cost.

    { h: "What changed" },
    // The framework shipped a first-party AI layer. Suddenly the question wasn't "is our
    // pipeline good" but "is it worth what it costs to keep." Wrote the design spec first.

    { visual: "stack" },  // needs building — see §9

    { h: "The trade" },
    // Gave up chunking, embedding and retrieval control — the managed store does all three
    // and I can't tune any of them. Bought back a database, a queue, a dependency, and
    // 3,727 lines. For a corpus of school policy docs that was the right side of the trade.
    // If a client needed embeddings in their own infrastructure it wouldn't be.

    { h: "Fixing it on the way through" },
    // The old scoping had one dimension, so a parent at a school could reach items meant
    // only for students there. Split it into two dimensions that AND together, so the
    // filter runs inside the retrieval query. The model never sees a document the user
    // isn't allowed to see — not filtered out after, never retrieved.

    { h: "What I'd tell you it proves" },
    // Reversing your own team's decision is harder than making a new one, and the receipt
    // is a smaller system than the one you started with.
  ],
}
```

**Title notes.** "Second Database" is the most concrete and most intriguing — it names the absurdity
without explaining it, which pulls the reader in. "The Reversal" is more abstract but signals the
judgement register. Your call; the summary line does a lot of work either way.

**Tone check against the brief:** the summary line is a claim about the *work*, not about you, which
is the mechanism the brief says works ("labels read as attributes to be judged"). Avoid anything that
lands as "I have good architectural judgement."

---

## 9. Visual

Existing visuals: `diff`, `notes`, `tasks`, `sms`. This needs a new one. Three options, best first:

1. **`stack` — the before/after infrastructure diagram.** Two columns. Left: MySQL + Postgres/pgvector
   + vector queue + 2 jobs + 2 commands + Nova resource + composer dep. Right: MySQL + a managed
   store. The deletion *is* the picture, and it reads instantly with no explanation. Fits the
   near-brutalist black/white direction — plain boxes and rules, no gradients. **Recommended.**

2. **`scope` — the two-dimension filter grid.** Rows = user types (student / parent / staff),
   columns = scope keys (school:42 / program:7 / global), cells filled or empty. Hover or tap a
   persona and watch the reachable set light up. More interesting technically but needs more
   explanation to land.

3. **`diffstat` — the raw stat.** `138 files · +4,585 · −8,312` set large in the mono axis of
   Recursive, with the net figure emphasised. Cheapest to build. Weakest on its own but could sit
   inside option 1 as a caption.

---

## 10. Facts you can rely on

Safe to state, all verified:

- Second Postgres ran alongside MySQL solely for vectors, because the project's MySQL version
  couldn't take a vector extension.
- Original pipeline: `text-embedding-3-small` (1536 dims), cosine nearest-neighbour with a
  similarity threshold, async embedding on a dedicated queue.
- Chunk size went defaults → 4000/800 (you, Dec 2025) → 200/60 (your ticket, Mar 2026). Both changes
  were made on reasoning, not measurement.
- You wrote the migration design spec on 2026-04-02, before the code.
- Migration merged 2026-04-22 as PR #1736: 138 files, +4,585 / −8,312, net −3,727.
- pgvector infrastructure removed across docker-compose, devcontainer, setup script, README and
  the module README in a single commit (`0da3a619d`).
- Multi-scope access control designed and built 2026-04-15; two AND-ed filter dimensions; one vector
  store document per scope key, forced by flat non-array attributes.
- Access-control test cases were written into the spec before implementation.
- Retrieval filtering happens inside the query, not after.

**Do not state without checking further:**

- ⚠️ The context-prefix idea as yours — that's Tony's (see top).
- ⚠️ Whether the managed store does hybrid lexical/semantic search and reranking internally. It very
  likely does, and it sharpens the trade-off ("I didn't lose hybrid and reranking, I lost the ability
  to *tune* them") — but confirm against current OpenAI docs before putting it in writing.
- ⚠️ Any retrieval-quality comparison before vs after. Nothing measured it. Don't imply it did.

  **But the reason is legitimate and it strengthens the piece.** The knowledge base stayed small —
  most of what was in it the dev team wrote themselves — and student adoption was slow, so there was
  never a real query distribution to tune against. With a corpus that size, retrieval tuning is noise
  and an eval harness would have been sophisticated infrastructure pointed at nothing.

  That reframes the whole decision: a second Postgres, a dedicated queue, two jobs, two debug commands
  and a composer dependency, serving a handful of documents and very few users. **The pipeline was
  wildly out of proportion to what it was serving.** Said that way the migration isn't a close call —
  it's obvious, and the interesting question becomes why it took until April to see it.

  It also fixes the chunking arc's ending: the December-vs-March argument wasn't just unmeasured, it
  was *unmeasurable and not worth measuring*. The mature version of that story isn't "I should have
  built an eval" — it's "I should have said this corpus is too small for the answer to matter."

  **Framing constraint:** none of this gets told as a client failing. No "the client didn't add
  content." The factual, non-blaming version is that the knowledge base was still early — a small set
  of documents the team had written — which is true, sufficient for the argument, and doesn't put a
  named client in a bad light on a public site. See `docs/rag-tuning-notes.md` §0.

---

## 11. Open questions

- Own case study, or fold the spec-driven material into this one? (§7)
- Restore the spec documents to `grace-2024`, or keep them only as recovered copies?
- Does a fifth case study fit the single-page architecture, or does one of the existing four get cut?
  The design brief specifies four, register-varied — this adds a fifth register rather than
  duplicating one, but that's a layout decision.
- Springloaded tense: you've left as of September 2026, so past tense throughout per the brief.

Recovered spec documents (all four, ~124KB) are saved at
`~/Documents/grace-rag-specs/`. They are client internal design docs and this repo goes public at launch, so they were deliberately kept out of it — decide what, if anything, is safe to excerpt.
