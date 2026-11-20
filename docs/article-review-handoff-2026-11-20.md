# Article review handoff, 20 November 2026

## Request and scope

The user asked: “review this branch especially the context of the articles and suggest improvements on them”, then requested a handout for another session.

The review is complete. Recommendations have been delivered, but **implementation has not been requested**. Use this document to continue discussion or implement changes if the user authorizes that in the next session. Do not treat a suggestion below as an already accepted edit.

Repository: `C:\Users\LukaEngels\Learn\cv-2026`

- Branch reviewed: `feature/writing-index-page`
- HEAD reviewed: `b5859f7`
- Comparison: `main...HEAD`
- Working tree was clean before this handout was created.
- Shell: PowerShell. Package manager: pnpm.
- No article, implementation, or generated files were changed during this review.

Read `CLAUDE.md` for repository conventions. The existing `docs/article-review-handout.md` and `docs/article-review-second-opinion.md` describe an earlier review. Their file counts, line numbers, and unresolved findings can be stale. This review covers the current five English articles, with targeted checks of German counterparts; it is not a complete translation audit.

## Main assessment

The collection has a coherent theme: making agent workflows inspectable and putting specific checks in code. Concrete examples of failures are its strongest material. The most important improvement is to make opening promises and conclusions as precise as the limitations already documented in the body.

Distinguish among:

- A check that validates structure or matches values.
- Evidence that a specific demonstration worked.
- A measured result on known evaluation cases.
- A guarantee about factual correctness or production behaviour.

## Priority corrections

Line numbers below refer to the reviewed HEAD and will shift after edits. Apply corresponding corrections to German sources after checking their current wording.

### 1. Listing agent: narrow the guarantee

Source: `content/articles/listing-creation-agent.md:247`, with supporting context at lines 138–155 and 185–187.

The conclusion says invented numbers and guessed room counts have “no way around” the checks. However, the body explains that a number passes if any reading matches a recorded value, zero and one are exempt, and a real number attached to the wrong thing passes. This establishes numerical consistency, not factual correctness.

Suggested replacement:

> The tools enforce required fields, selected source comparisons and numerical consistency. They reject many unsupported outputs, but do not establish that every claim in the exposé is true.

Also distinguish a fact's recorded source from proof that the model extracted it correctly. A source label alone does not verify the extracted value.

Preserve the bathtub example: the agent raised a concern in its closing message even though the accepted exposé still contained the disputed feature. It makes the boundary concrete.

### 2. Listing agent: separate legal requirements from demo policy

Source: `content/articles/listing-creation-agent.md:134`, also opening at line 15 and required fields at line 57.

The article makes the advertising obligation sound unconditional and links it to six required certificate fields. The official section 87 text consulted conditions the advertising obligation on an energy certificate being available when the advertisement is published. It lists five categories for residential properties; certificate expiry is not among them.

Suggested direction:

- Describe the statutory condition accurately.
- State separately that this demonstration requires six fields as application policy.
- Identify the additional field and why the demo requires it.
- Do not present this demo policy or fallback XML check as proof of legal compliance.

Primary source: https://www.gesetze-im-internet.de/geg/__87.html

Check the current official title and applicable version when editing. The fetched page used the title “Gebäudemodernisierungsgesetz”, while the article calls it GEG. The review did not investigate that naming/version discrepancy, so do not silently infer its history or effective dates.

### 3. Saga: qualify broad architectural claims

Source: `content/articles/saga-pattern.md:139`.

The claim that any agent run with side effects “is a Saga” remains in the current source. Side effects alone do not establish coordinated local transactions and recovery.

Suggested replacement:

> An agent workflow with side effects across tools can benefit from Saga-style coordination when partial completion needs explicit recovery.

Related sources:

- `content/articles/cloud-design-patterns.md:126` and `:214`
- `content/articles/saga-pattern.md:215`

The overview still presents Saga and compensation as necessary when an operation spans shards. Qualify this according to the available transaction guarantees and business recovery requirements. DynamoDB is listed as a sharding example, but supports atomic multi-item transactions within documented limits.

Primary sources:

- https://learn.microsoft.com/en-us/azure/architecture/patterns/saga
- https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/transaction-apis.html

Do not confuse DynamoDB's own transaction support with participation in an arbitrary cross-service two-phase commit.

### 4. Cloud patterns: remove the exactly-once implication

Source: `content/articles/cloud-design-patterns.md:79`.

The competing-consumers definition says each message is processed by exactly one worker, then warns about duplicates. Make the definition consistent with that warning and the SQS example.

Suggested replacement:

> Workers compete for messages from a shared queue. Redelivery is possible, so processing must be idempotent.

Primary source: https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/standard-queues-at-least-once-delivery.html

## Editorial improvements by article

These are recommendations, not confirmed defects or approved restructuring.

### Listing creation agent

Keep the workshop context, synthetic-data disclosure, recorded run, failed run and lack-of-evaluation caveat. Move a short version of the bathtub contradiction closer to the opening so readers immediately understand the limits of the checks. Link recorded evidence to a stable trace or repository revision, if available; do not invent a trace URL or results.

### Property inquiry agent

Source: `content/articles/proptech-inquiry-agent.md`.

Bring “What the evaluation tells us” (line 335) and “What broke, and what changed” (line 360) forward. The 46/49 result and unsupported ticket-update promise are more distinctive than package layout and endpoint inventory. Move much of the installation and operational detail into the project README, retaining a short route to trying the project.

Preserve the qualifications already present:

- The judge and rubric changed, so improvement is not solely agent improvement.
- Retrieval gained a regression question between runs.
- These are known development cases, not an independent benchmark.
- Costs are estimates using Claude API list prices, not verified Bedrock billing.
- Passing numerical/citation guards does not establish semantic correctness.

Do not rewrite a linked external README unless the next task authorizes work in that repository.

### Executable playbooks

Source: `content/articles/gates-not-prompts.md`.

Use one running requirement through missing plan, blocked implementation, approval, and pinned snapshot. The current article explains the machinery in depth but gives less space to the experience of using it. Preserve the distinctions between procedural instructions, executable checks, editable files, and independently verified human approval.

### Cloud design patterns

Source: `content/articles/cloud-design-patterns.md`.

Add one worked selection example showing which patterns solve a concrete problem and which add unnecessary complexity. This would better fulfil the opening promise to help readers choose patterns. Keep the grouped overview and links to the Saga deep dive.

### Saga

Source: `content/articles/saga-pattern.md`.

Keep rental onboarding as the main example. Consider shortening the seven-domain catalogue and using the space to explain an ambiguous timeout: the remote action may have succeeded even when its response was lost. Explain how idempotency, reconciliation, and recovery relate rather than treating every timeout as proof that no action occurred.

## Collection and index context

Source: `scripts/build-articles.ts:156`, with German counterpart around line 176.

The current index introduction, “On technology, work, and the ideas shaping both”, is too generic for these five articles.

Suggested English introduction:

> Practical notes on building inspectable AI workflows and designing cloud systems that recover from failure.

Suggested reading paths:

- Agent case studies and development workflows: inquiry agent, listing agent, executable playbooks.
- Cloud architecture patterns: overview, then Saga.

Consider an “Updated” date distinct from publication date for evolving articles. The inquiry article's September publication predates its October evaluation results. The generator currently sets JSON-LD `dateModified` to `meta.date` around line 398. A real update-date feature would need consistent source metadata, display, structured data, and sitemap handling; do not simply overwrite publication dates.

## Verification performed and limits

- Inspected branch history and diff against local `main`.
- Read English article content, existing review documents, repository guidance, and relevant generator/navigation changes.
- Made targeted German wording checks; did not certify full semantic translation parity.
- Consulted the four official sources linked above for legal and architectural claims.
- `pnpm typecheck` completed without reported errors.
- `pnpm test` initially failed to start esbuild with sandbox `spawn EPERM`. It passed when rerun outside the sandbox: 3 test files, 39 tests.
- Did not run article regeneration, a production build, build-output tests, or visual browser QA.
- Did not reproduce external projects' model evaluations, inspect all external implementations, or verify historical model availability and billing.
- No implementation bug was established in the writing-index changes by this review. This is not a claim of exhaustive code coverage.

## If implementation is authorized next

1. Recheck branch and working-tree state; preserve unrelated changes.
2. Resolve the four priority content corrections in English and German.
3. Agree on any larger restructuring through the user's new instructions; do not assume every optional suggestion must be implemented.
4. Edit `content/articles/` sources. Generated HTML and dev.to copies are not source files.
5. Run `pnpm articles` after source changes and inspect the generated diff.
6. Run checks appropriate to any generator or metadata changes. For a production verification, use `pnpm build` followed by `pnpm test:build`, along with typechecking and relevant unit tests.
7. Report the final changes and any unresolved factual verification without presenting demonstrations as production guarantees.
