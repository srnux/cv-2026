# Handout: review all articles on luka-engels.de

You are reviewing the articles on Luka Engels' personal site (luka-engels.de) before they go live. There are four articles, each in English and German, so eight source files. Your job is to **find problems and report them**. Do not edit any file unless Luka tells you to.

Luka works on Windows with PowerShell. Give any commands in that form.

---

## 0. Read first

1. `CLAUDE.md` at the repo root. Its **Articles** section and its **editorial rules** are binding. Where this handout and `CLAUDE.md` disagree, `CLAUDE.md` wins.
2. This handout.
3. Ignore `docs/blog-handout-cloud-patterns/HANDOUT.md` for rules. It is an older brief, and its abbreviation rule ("expand at every use") has since been replaced (see section 2).

**State of the repo.** Work on the branch `feature/writing-index-page`. The two newest German translations, `proptech-inquiry-agent.de.md` and `gates-not-prompts.de.md`, may still be uncommitted working-tree files. Review them as they are on disk.

---

## 1. What to review

All sources live in `content/articles/`:

| Slug | English | German |
|---|---|---|
| `saga-pattern` | `saga-pattern.md` | `saga-pattern.de.md` |
| `cloud-design-patterns` | `cloud-design-patterns.md` | `cloud-design-patterns.de.md` |
| `proptech-inquiry-agent` | `proptech-inquiry-agent.md` | `proptech-inquiry-agent.de.md` (new) |
| `gates-not-prompts` | `gates-not-prompts.md` | `gates-not-prompts.de.md` (new) |

**Review the sources only.** Everything under `public/writing/`, `public/de/writing/`, `content/devto/`, `src/content/articles.json` and `public/sitemap.xml` is generated from them by `pnpm articles`. Look at the generated files only to check how a source renders. A problem you find there is a problem in the source or in the generator, so report it against that.

Out of scope: the generator code (`scripts/build-articles.ts`), the React site, and the visual design.

---

## 2. Editorial rules (Luka's, non-negotiable)

These apply to prose, headings, captions, alt text and the frontmatter `title` and `description`. Code blocks are exempt.

1. **No em dashes (—) or en dashes (–).** Use a comma, a colon or a full stop instead. The only exceptions are date ranges and structural separators in titles.
2. **No semicolons.**
3. **Abbreviations: spell out once, at first use in each article**, as `AWS (Amazon Web Services)`. After that, use the short form only. Every article and every language version is checked on its own. Expanding the same abbreviation a second time is also a finding.
4. **Collective voice for delivery claims.** Use "we" / "our team" ("wir" / "unser Team") for anything the team built or shipped. First person singular is only for Luka's title, his leadership scope, his opinions and his working style.
5. **No career length or age signals.** Never write a total number of years, "two decades" or anything similar.
6. **Availability.** Luka is looking for permanent, fully remote employment only. Nothing may suggest that he is open to freelance, contract or project work, or that he is available immediately.
7. **One language per document.** German files are German. Two things are allowed in them: established English technical terms that German developers actually use (Pattern, Prompt, Agent, Pull Request), and a one-line note that a diagram, a demo or code is in English.
8. **Tone.** Plain and practical, engineer to engineer. No hype words ("game-changer", "unlock", "seamless", „bahnbrechend“).

---

## 3. What to check

### Every article, both languages
- **Rule violations** from section 2. Scan for `;`, `—` and `–` outside code blocks, and walk through the abbreviations one by one.
- **Facts and claims.** Look for claims that contradict each other within one article or across articles, numbers that don't add up, and technical statements that are wrong or outdated (AWS service behaviour, protocol details, library APIs). Mark anything you are not sure of as "verify", not as a finding.
- **Links.** Every link inside the site must resolve. German articles must link to `/de/writing/<slug>/`, and anchors (`#heading-id`) must match a real heading slug on the target page. Images and scripts named in the Markdown or in raw HTML must exist under `public/`.
- **Frontmatter.** English needs `title`, `description`, `date` and `tags`. German needs `title` and `description`, and optionally `tags`. German files must not set `date`, `coverImage`, `repoUrl` or `devtoUrl`, because they inherit those from the English file. `description` should read well as a search result snippet.
- **Markers.** Each `<!-- site-only -->` and `<!-- devto-only -->` block must be balanced, and the dev.to stand-in must say the same thing as the site version.

### English against German (translation parity)
- Same headings in the same order, the same code blocks, tables, images and links.
- **No added, dropped or softened claims.** Report every sentence that exists in only one version. The "… ist auf Englisch" notes are the only allowed additions.
- Numbers match, in German format (2.000 €, 93,8 %).
- **German quality.** It should read like it was written in German, not translated. Report awkward calques, wrong register (the articles address the reader as „Sie“), inconsistent terms within one article, and domain words that a German practitioner would say differently.

### The two new translations: open wording questions
Give an opinion on each of these.
- `proptech-inquiry-agent.de.md`: „Anfrage-Desk“ for "inquiry desk" (alternatives: "Inquiry Desk", „Anfrageoberfläche“). „Umlage für die Fassade“ for "facade levy". „Weiterbearbeitung durch einen Menschen“ for "human follow-up". The added sentence „Die Skizzen und Codebeispiele in diesem Artikel sind auf Englisch.“ The sample listing text about *Nebenkosten* is kept in English on purpose.
- `gates-not-prompts.de.md`: „übergeordnetes Item nicht freigegeben“ for "Parent not approved". „Zwei Kopien einer Regel bedeuten: eine Regel und ein künftiger Widerspruch.“

### Known, not a finding
- `pnpm articles` warns that `gates-not-prompts` has 7 tags and that dev.to keeps only 4. This is accepted.
- Code blocks keep English comments and text in the German versions.

---

## 4. Commands

```powershell
pnpm install --frozen-lockfile   # only if node_modules is missing
pnpm articles                    # regenerates everything; afterwards git diff should show no content changes
pnpm build
pnpm test:build                  # checks the built site in dist/
```

Do not run `npm`. pnpm is the only package manager here.

---

## 5. What to hand back

Write your findings as one Markdown report, grouped by article. Each finding has:

- **Where:** `content/articles/<file>.md:<line>`
- **Rule or check:** for example "rule 3, abbreviation", "parity", "fact", "link"
- **Quote:** the exact text
- **Fix:** the replacement wording you propose, in the same language
- **Severity:** `must fix` (a rule violation, a wrong fact, a broken link, an added or dropped claim) or `suggestion` (style or wording)

End with a short list of anything you marked "verify" and the answers to the open wording questions. Do not apply the fixes. Luka decides which ones go in.
