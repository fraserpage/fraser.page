# What proper RAG tuning looks like

Working notes, prompted by the chunking arc in `case-study-rag-arc.md` — chunk size set to 4000/800
on reasoning, reversed to 200/60 on reasoning, neither measured.

The short version: **retrieval tuning is a cheap, deterministic, fully automatable search problem,
and it is much easier than the answer-quality evaluation people conflate it with.** The reason it
gets done by intuition isn't that it's hard. It's that nobody builds the harness.

---

## 0. The precondition nobody states: you need a corpus and you need users

Every guide to RAG evaluation assumes a real knowledge base and real traffic. GRACE had neither, and
that changes the correct answer rather than just making the right answer harder.

The knowledge base stayed small throughout. What was in it was mostly written by the dev team —
context on how the application works, for students trying to navigate it — because content the client
owned never really materialised. Student adoption was also slow, so query volume never arrived either.

**With a near-empty corpus, retrieval tuning is close to meaningless.** Recall@k over a dozen
documents is noise; there isn't enough material for chunk size to matter, and no real query
distribution to tune against. Building an eval harness in that situation would have been
sophisticated infrastructure pointed at nothing.

Two things follow, and both are worth holding onto:

1. **Not building retrieval evals was correct prioritisation, not a discipline failure.** The honest
   "what I'd do differently" is not "I should have built an eval harness." It's *"the December-to-March
   chunk-size argument was unresolvable, and rather than argue it a second time I'd have said: this
   corpus is too small for the answer to matter, park it."* Recognising a question isn't worth
   answering yet is the more senior move.

2. **It makes the buy decision stronger, not weaker.** A second Postgres, a dedicated queue, two jobs,
   two debug commands and a composer dependency — to serve a handful of documents and very few users.
   Stated that way, the migration isn't a close call at all. The elaborate self-hosted pipeline was
   badly out of proportion to what it was serving, and the managed store put the cost back in
   proportion.

**Where the golden dataset comes from when you have no traffic:** you write it. Take the documents you
do have, generate candidate questions per document, hand-correct, and accept that it measures the
corpus you have rather than the queries you'll get. That's worth doing at, say, fifty documents. At a
dozen, it isn't.

---

## The separation that makes it tractable

Keep two evals apart. Almost everything follows from this.

| | Retrieval eval | End-to-end answer eval |
|---|---|---|
| Question | Did the right chunk come back? | Was the answer good? |
| Ground truth | (query → relevant chunk ids) | (query → acceptable answer) |
| Metric | Recall@k, MRR, NDCG | LLM-as-judge, human review |
| Cost per run | Fractions of a cent, no LLM | Real money, one judge call per case |
| Speed | Thousands of configs in minutes | Minutes to hours |
| Determinism | Total | Needs a pinned judge, still wobbles |

Tune retrieval first, alone. If you change chunk size and answer quality moves, you can't tell
whether retrieval improved or the generation step happened to like the new context shape. Settle
retrieval on cheap deterministic metrics, *then* run the expensive eval once to confirm the win
survives to the answer.

This is the structural mistake in most RAG work: reaching for an LLM judge to answer a question that
plain information-retrieval metrics answer for free.

---

## 1. The golden dataset

The only genuinely hard part, and the part that gets skipped.

You need pairs of `(query, ids of chunks that should be retrieved)`. Three ways to get them:

**Mine real queries.** Best signal by far — pull a few hundred from production logs and label which
documents actually answer them. Requires that you have production queries, which is a bigger *if*
than most write-ups admit (see §0).

**Synthesise.** For each chunk, have a model write the question that chunk answers. Gets you to a few
hundred pairs in an hour for a couple of dollars. The bias to know about: generated questions tend to
echo the source wording, which flatters lexical matching and makes retrieval look better than it is.
Fine for comparing configurations against each other, misleading as an absolute number.

**Both.** Synthesise to bootstrap, then replace with real labelled queries as they accumulate.

**Size:** 50–100 pairs gives usable signal. 200–500 is comfortable. It does not need to be big — it
needs to cover the query *types* you care about (a policy lookup, an acronym, a "how do I", a
school-specific question, something deliberately out of scope).

**Discipline:** label at chunk or document level, and keep the dataset in version control next to the
code. It's an asset with a longer life than any particular pipeline.

---

## 2. Metrics

All deterministic, all cheap, none need a model:

- **Recall@k** — of the known-relevant chunks, how many are in the top k? **The one that matters most
  for RAG.** If the right chunk isn't in the retrieved set, nothing downstream can save you.
- **MRR** — mean reciprocal rank, `1/rank` of the first relevant hit. Rewards getting it to the top.
- **NDCG@k** — the standard IR metric; handles graded relevance and discounts by position.
- **Precision@k** — how much of what you retrieved was relevant. Matters because context is a budget.

Track recall@k as the headline and MRR as the tiebreaker. That's enough.

---

## 3. The sweep

Because scoring is free, grid search is entirely reasonable here.

Axes worth sweeping:

| Axis | Typical range |
|---|---|
| Chunk size | 128 / 256 / 512 / 1024 tokens |
| Overlap | 0 / 10% / 25% |
| Splitter | fixed · recursive · markdown-structure-aware · semantic |
| Context enrichment | none · heading prefix · LLM-written context |
| Embedding model | and dimension, where truncation is supported |
| top-k | 5 / 10 / 20 / 50 |
| Hybrid weighting | dense-only → BM25-only, or RRF `k` |
| Reranker | off / on, and rerank depth |

**Structure the sweep around what forces a re-embed.** Chunk size, overlap, splitter, enrichment and
embedding model all require re-embedding the corpus — that's the expensive axis, so sweep it in an
outer loop. top-k, hybrid weighting and reranking are pure post-processing on an existing index and
can be swept almost for free in an inner loop.

**Cost:** re-embedding a few hundred policy documents with a small embedding model is cents per
configuration. A fifty-configuration sweep is a few dollars and an afternoon of compute. That's the
number to hold against two engineers disagreeing in a meeting for three months.

---

## 4. What the sweep would probably have told you

Worth knowing, since it makes the point concrete: received practice puts useful chunk sizes for
prose corpora in roughly the 200–500 token range. **4000 tokens is unusually large** and typically
underperforms, because a single embedding vector averaged over 4000 tokens is too diffuse to match a
specific question — the signal you want gets washed out by everything else in the chunk.

So the March instinct was probably right and the December instinct probably wrong. But "probably" is
exactly the problem. A harness would have settled it in an afternoon, in December, with a number.

It would also have told you whether the heading-prefix enrichment actually helped — which is precisely
the kind of change that sounds obviously good and sometimes measures flat.

---

## 5. Tooling

- **Ragas** — RAG-specific metrics (context precision/recall, faithfulness, answer relevance) plus
  synthetic testset generation. The obvious starting point in Python.
- **promptfoo** — config-driven eval runner, good at sweeps and at running in CI.
- **DeepEval** — pytest-style, if you want evals to feel like tests.
- **Phoenix / Arize, TruLens** — tracing plus eval, stronger on the observability half.
- **Roll your own.** Genuinely viable — the metrics are a dozen lines each. For a PHP shop, extending
  the existing `AiIntegrationTestCase` pattern is probably less friction than adopting a Python
  framework and maintaining a second toolchain.

**Note the shape you already had.** `AiIntegrationTestCase` + `AssertsAiResponses` — deterministic
assertions layered before an LLM judge, with tool traces in the failure output — is an eval harness.
It evaluates agent *behaviour*. The missing sibling evaluates *retrieval*, and it's the cheaper,
easier one.

---

## 6. Why this matters beyond the postmortem

Three things this unlocks, in order of practical value:

1. **It's the honest "what I'd do differently"** for the case study, and it's specific rather than
   generic.
2. **It's the single strongest hiring signal in AI work right now** — eval design against a
   ground-truth dataset is what separates having shipped from having demoed.
3. **It's a well-scoped side project.** A retrieval eval harness over a public corpus, with a sweep
   and a results table, is a weekend or two and produces a chart. That's portfolio-able in a way most
   AI side projects aren't, because the output is a *measurement*, not another chatbot.

---

## 7. If building it

Rough order:

1. Pick a corpus you can label — ideally the real one.
2. Generate 100 synthetic query→chunk pairs, hand-correct the obviously wrong ones.
3. Write recall@k and MRR. Maybe forty lines.
4. Sweep chunk size × overlap first, holding everything else fixed. Chart it.
5. Add the free axes: top-k, then hybrid weighting, then reranking.
6. Keep the golden set in version control and re-run when the corpus or the embedding model changes.

Step 4 alone would have answered the December-versus-March question, and it's the smallest possible
version of the thing.
