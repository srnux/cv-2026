---
title: "Fehler in KI-Workflows mit ausführbaren Playbooks abfangen"
description: "Ein dateibasierter Ablauf für die Auslieferung mit Claude Code und Codex, der Vorbedingungen im Workflow in ausführbare Prüfungen übersetzt, mit klar benannten Grenzen."
tags: [ki, produktivität, architektur, webdev, claude-code, codex, playbooks]
---

Ein Coding-Agent auf Basis von KI kann funktionierenden Code liefern und dabei genau die Schritte überspringen, die sicherstellen, dass das Richtige gebaut wird. Die Umsetzung beginnt ohne Plan. Eine Freigabe wird einfach angenommen. Ein Prototyp ändert sich, nachdem die Arbeit begonnen hat, und der Agent folgt der neuen Version statt der, auf die Sie sich geeinigt hatten.

Das sind Fehler im Workflow, und grüne Tests decken sie nicht unbedingt auf. Sie müssen prüfen, was spezifiziert wurde, was freigegeben wurde und welcher Version die Arbeit folgen soll.

Ich habe [**sdlc-playbooks**](https://github.com/srnux/sdlc-playbooks) gebaut, um diese Prüfungen ausführbar zu machen. Jedes Playbook beschreibt eine Phase der Auslieferung: welche Eingaben sie braucht, welche Arbeit zu tun ist und welches Artefakt dabei entsteht. Skripte prüfen die Voraussetzungen anhand der Dateien im Repo und melden fehlende Artefakte oder einen inkonsistenten Zustand, bevor die nächste Phase beginnt.

Das Gate für die Implementierung verweigert zum Beispiel die Arbeit, wenn eine Story keinen Plan hat oder ihr festgepinnter Prototyp-Snapshot fehlt. Ein Prompt kann den Agenten anweisen, das zu prüfen. Ein Skript kann die Dateien selbst untersuchen und einen konkreten Fehler samt Lösung zurückgeben.

Der Ablauf führt von Design System → Anforderungen → Prototyp → Freigabe durch einen Menschen → Produkt, mit einer einzigen Quelle für Claude Code und Codex. Der Agent folgt den Playbooks, die Skripte prüfen die Teile des Workflows, die sich mechanisch prüfen lassen.

Diese Unterscheidung ist wichtig: Eine ausführbare Prüfung kann feststellen, dass ein Plan existiert. Sie kann nicht feststellen, ob der Plan gut ist, und auch nicht unabhängig beweisen, dass ein Mensch den Prototyp freigegeben hat. Diese Entscheidungen brauchen weiterhin Menschen und Reviews.

Dieser Artikel geht diese Prüfungen durch: wo sie laufen, was sie erkennen und was nicht.

---

## Der Ablauf

```
  design system                 PO requirements (text)
          │                              │
          ▼                              ▼
   0 lock-design-system          1 capture-requirements
   tokens.css                    REQ-### + acceptance criteria
   components.md                          │
          └──────────────┬─────────────────┘
                         ▼
                 2 build-prototype
             single-file React page
            every screen, every state
                         │
                         ▼
                  ◆ HUMAN APPROVES ◆
                   3 freeze-approval
            frozen snapshot v<N> + stories
                         │
                         ▼
        4 plan-story → 5 implement-story → 6 review-change
                         │
                         ▼
                    the product
```

Es gibt sieben Phasen, jede mit einem Playbook und einem Gate. Alles, was der Ablauf weiß, steht in einer Datei:

| Artefakt                                    | Geschrieben von                  |
| ------------------------------------------- | -------------------------------- |
| `design-system/tokens.css`, `components.md` | Phase 0, danach gesperrt         |
| `work/items/REQ-###.md`                     | Phase 1                          |
| `prototype/<slug>.html`                     | Phase 2                          |
| `prototype/.approved/<slug>-v<N>.html`      | Phase 3, versionierte Baseline   |
| `work/items/ST-###.md`                      | Phase 3, eine Story pro Screen   |
| `work/plans/ST-###.md`                      | Phase 4                          |

Mit dem standardmäßigen Datei-Tracker liegt der Zustand des Workflows im Repo. **Löschen Sie alle Playbooks, kann ein Mensch die Arbeit trotzdem anhand der Artefakte zu Ende bringen.** Genau in diese Richtung soll die Abhängigkeit zeigen.

---

## Warum Playbooks statt Agenten

Die meisten Agenten-Setups, die ich gesehen habe, beginnen mit Personas: _„Du bist ein Senior Reviewer.“_ Das beschreibt eine Identität, überlässt die Festlegung des eigentlichen Arbeitsablaufs aber einer anderen Stelle. Hier ist das Playbook die Einheit, nach der alles organisiert ist. Es benennt Eingaben, Gate, Ausgaben und Abschlussbedingung einer Phase. Zum Beispiel:

```markdown
## Contract

|               |                                                                       |
| ------------- | --------------------------------------------------------------------- |
| **Phase**     | 5 — the only phase that writes product code                           |
| **Gate**      | `node .claude/tools/gate.mjs implement ST-###`                        |
| **Inputs**    | the plan, the pinned snapshot, the catalog, the component lib         |
| **Produces**  | product code, one test per AC                                         |
| **Done when** | every `verify.commands` entry is green, story is `in-review`          |
| **Never**     | copy the prototype into the product; build against the live prototype |
```

Jedes Playbook leitet außerdem angrenzende Entscheidungen weiter: Neue Tokens gehen an `lock-design-system`, ein geänderter Scope an `capture-requirements` und fertige Arbeit an `review-change`.

Die frühere Version hatte eigene Agentendefinitionen. Die meisten ihrer Anweisungen standen bereits in den passenden Playbooks, die übrigen Regeln zur Zuständigkeit gehörten an die Grenzen zwischen den Phasen. Seit diese Dateien entfernt sind, gibt es für jedes Vorgehen genau eine Stelle, die gepflegt werden muss. Zwei Kopien einer Regel bedeuten: eine Regel und ein künftiger Widerspruch.

Übergaben laufen über gespeicherte Artefakte. Die Anforderungen liefern die Akzeptanzkriterien für das Prototyping, ein freigegebener Snapshot liefert die Baseline für Planung und Implementierung, Plan und daraus entstandener Code liefern die Eingaben für das Review. Die nächste Phase kann in einer frischen Session laufen, weil ihre Eingaben im Repo liegen. Sie braucht weder die Persona noch den Gesprächsverlauf des vorherigen Agenten, um nachzuvollziehen, was vereinbart wurde.

---

## Ebene 1: Gates entscheiden, ob eine Phase beginnen darf

Jede Phase beginnt mit:

```bash
node .claude/tools/gate.mjs <phase> [id] [flags]
```

Das Gate prüft die Vorbedingungen der Phase anhand des Repos. Schlägt eine fehl, **endet es mit Exit-Code 2, einem benannten Grund und einer Lösung**. Die Command-Dateien von Claude Code rufen es per Inline-Shell-Expansion auf:

```markdown
---
description: Record a human's approval — freeze the prototype and cut the stories.
---

Gate — this runs before you read any further; a non-zero exit aborts the command:

!`node .claude/tools/gate.mjs approve $0 $1 2>&1`
```

Damit sitzt eine konkrete Prüfung am Einstiegspunkt des Commands. Das Playbook weist den Agenten an, bei einem Fehlschlag anzuhalten. Direkte Skriptaufrufe und andere Wege, Dateien zu ändern, brauchen weiterhin eigene Kontrollen.

| Phase           | Verweigert, wenn                                                              |
| --------------- | ----------------------------------------------------------------------------- |
| `design-system` | bereits gesperrt und `--refresh` nicht übergeben                              |
| `requirements`  | keine Eingabe                                                                 |
| `prototype`     | Design System nicht gesperrt · falscher Status · **keine Akzeptanzkriterien** |
| `approve`       | nicht `prototyped` · kein `data-screen`-Markup · **kein `--human-approved`**  |
| `plan`          | übergeordnetes Item nicht freigegeben · kein Versions-Pin · **Snapshot fehlt** |
| `implement`     | **kein Plan** · Story nicht `in-progress` · Snapshot fehlt                    |
| `review`        | Story nicht `in-review` · **bereits bei `loops.reviewRounds`**                |

### Die Freigabe ausdrücklich machen

Die alte Version von `/approve` sagte: _„Dieser Command steht für eine menschliche Entscheidung. Führe ihn nicht nach eigenem Ermessen aus.“_

Jetzt verlangt das Gate ein ausdrückliches Flag:

```js
if (!args["human-approved"]) {
  throw new Blocked(
    `approval is a human decision and has not been recorded for ${id}`,
    `ask the person to open ${req.prototype} and say yes, then run: /approve ${id} --human-approved`,
  );
}
```

Das mitgelieferte Seaside-Beispiel zeigt die Prüfung: Selbst wenn ein Prototyp zur Ansicht bereitliegt, wird ein Aufruf des Approval-Gates ohne das Flag verweigert:

```text
$ node .claude/tools/gate.mjs approve REQ-003
BLOCKED — approve: approval is a human decision and has not been recorded for REQ-003

  ask the person to open prototype/seaside-zadar-landing.html and say yes,
  then run: /approve REQ-003 --human-approved

Nothing was changed. Report this reason verbatim and stop; do not work around it.
$ echo $?
2
```

Das Flag bedeutet „ein Mensch hat in diesem Gespräch Ja gesagt“. Es macht diese Aussage ausdrücklich und nachprüfbar, verifiziert sie aber nicht unabhängig: Der Agent kann das Flag selbst setzen, und das Snapshot-Werkzeug lässt sich direkt aufrufen. Ob die menschliche Freigabe respektiert wird, hängt weiterhin davon ab, dass das Vorgehen eingehalten wird.

### Die Review-Schleife ist begrenzt

Ein Review kann eine Story freigeben oder zurückschicken. Das Gate liest das höchste `round N:`, das in den Notizen der Story steht, und verweigert jede Runde über `loops.reviewRounds` hinaus (standardmäßig zwei). Diese Grenze funktioniert nur, wenn der Reviewer jede Runde festhält. Ist die Obergrenze erreicht, sieht das Vorgehen vor, die Meinungsverschiedenheit an einen Menschen zu übergeben.

Bei Erfolg geben die Gates den aufgelösten Kontext als JSON aus: Pfade, die festgepinnte Prototyp-Version, die IDs der Akzeptanzkriterien und, wo relevant, die Review-Runde. Der Agent bekommt konkrete Eingaben für seinen nächsten Schritt.

---

## Ebene 2: Hooks entscheiden, ob eine Änderung landen darf

Hooks ergänzen Prüfungen an unterstützten Einstiegspunkten für Änderungen. In Claude Code sind zwei Shell-Skripte als `PreToolUse`-Hooks auf `Edit|Write` registriert:

**`require-plan.sh` blockiert eine überwachte Änderung, wenn es eine Story ohne Plan erkennt.** Die Story ermittelt es aus dem Branch-Namen (`story/ST-007-…`) oder, falls das nicht geht, aus genau einer Story mit Status `in-progress` im Tracker. Zum Beispiel:

```text
BLOCKED — no plan for ST-007.

  expected: work/plans/ST-007.md
  editing:  src/contacts/list/ArchiveButton.tsx

Run the plan-story skill first. The plan is a gate, not paperwork.
```

Die Begründung: Ein Plan, der nach dem Code geschrieben wird, ist nur eine Zusammenfassung, und eine Zusammenfassung findet nie das, was Ihnen vor dem Start aufgefallen wäre.

**`check-hardcoded-colors.sh` warnt.** Es markiert ein rohes `#hex`, `rgb()` oder `hsl()` in dem Moment, in dem es geschrieben wird, solange die Korrektur noch eine Änderung in einer einzigen Zeile ist. Die blockierende Variante dieser Regel läuft beim Review.

Die Hooks haben Grenzen: Schreibzugriffe über die Shell fallen nicht unter den `Edit|Write`-Matcher von Claude, einige Dateitypen sind ausgenommen, und der Plan-Hook lässt eine Änderung zu, wenn sich keine Story ermitteln lässt. Beide Skripte akzeptieren `file_path` oder `path`. Wie weit sie tatsächlich greifen, hängt außerdem davon ab, dass das Harness sie mit einem unterstützten Payload aufruft.

---

## Ebene 3: Prüfungen zeigen Lücken vor der Übergabe

**`check-tokens.mjs`** durchsucht Prototypen und die konfigurierten Produktverzeichnisse nach rohen Farbwerten in Hex, RGB und HSL sowie nach literalen Werten in ausgewählten Eigenschaften: Schriftgröße, Radius, Schatten, Padding, Margin und Gap. Außerdem prüft es auf Verweise auf nicht definierte Tokens. `width: 100%` und `z-index` liegen außerhalb dieser Prüfungen von Design-Eigenschaften.

```text
$ node .claude/tools/check-tokens.mjs
ok — 139 tokens defined, 134 used, no raw design values in 1 files
```

Die Regel des Vorgehens lautet: **Ein Designwert darf nur in Phase 0 entstehen.** Der Scanner findet die häufigen Verstöße, ist aber kein vollständiger Validator für CSS. Er lässt Blöcke mit Token-Definitionen in Prototypen zu, die ihre Tokens inline enthalten, ohne zu prüfen, ob deren Werte mit der gesperrten Datei übereinstimmen.

**`check-coverage.mjs`** prüft strukturelle Verknüpfungen:

```
requirement → approved snapshot → screen → story → plan file
```

Es meldet Lücken wie `screen-without-story`, `story-without-plan`, `stale-pin` und `done-story-screen-vanished` und endet mit Exit-Code 2, sobald es eine findet. Es prüft, ob Akzeptanzkriterien existieren, ordnet aber nicht jedes Akzeptanzkriterium einem Screen zu und untersucht weder Implementierung noch Testabdeckung.

Nach der Konvention für Prototypen bekommt das Wurzelelement jedes Screens zwei Attribute:

```html
<section data-screen="SCR-booking-enquiry" data-req="REQ-003"></section>
```

Der Checker findet Screens über `data-screen`, und das Approve-Gate verweigert einen Prototyp ohne Screen-Markierungen. `data-req` hält fest, zu welcher Anforderung der Screen gehören soll.

**Strukturelle Lücken werden abfragbar.** Ob das Produkt die Anforderungen erfüllt, müssen weiterhin Tests und Reviews zeigen.

---

## Der Prototyp und der Pin

Phase 2 sieht eine HTML-Datei pro Anforderung vor: React 18 als UMD-Build plus `@babel/standalone` aus einem CDN, eingebettete Tokens, Komponenten aus dem Katalog, Hash-Routing und realistische Mock-Daten. Sie braucht keinen Build-Schritt und öffnet sich per Doppelklick, zum Laden ihrer Abhängigkeiten aus dem CDN ist aber Netzwerkzugriff nötig. Das Playbook verlangt, dass **jeder Zustand gezeichnet wird**: leer, ladend, befüllt, Fehler _und Erfolg_. „Die Liste aktualisiert sich“ zeigt einem Menschen nicht, wie Erfolg aussieht.

Nach der Freigabe durch einen Menschen legt das Vorgehen mit `approve.mjs` die Datei `prototype/.approved/<slug>-v<N>.html` an und schneidet dann eine Story pro Screen, jeweils mit dem Pin `prototypeVersion: v<N>`. Das sind versionierte Snapshots, die das Vorgehen als unveränderlich behandelt. Das Werkzeug prüft vor dem Kopieren, ob das Ziel schon existiert, die entstandenen Dateien bleiben auf der Festplatte aber bearbeitbar.

**Das Implementierungs-Playbook weist den Agenten an, gegen den festgepinnten Snapshot zu bauen.** Nimmt jemand „noch eine kleine Änderung“ an der Live-Datei vor, meldet `gate.mjs implement` den Unterschied:

```json
{
  "liveHasMovedPastThePin": true,
  "note": "prototype/bulk-archive.html has moved past v2. You build v2. The difference is new scope for the PO — record it under Divergence, do not absorb it."
}
```

Den neuesten Prototyp zu bauen, obwohl die Story v2 festgepinnt hat, ist Scope Drift, und im Diff sehen Sie das nur, wenn jemand es sagt. So wird aus einem Feature für zwei Wochen still und leise eines für vier, ohne dass irgendwer das entschieden hätte.

---

## Eine Quelle, zwei Harnesses

Die Abläufe liegen an genau einer Stelle: `playbooks/<name>/SKILL.md`, geschrieben ohne Bezug auf ein bestimmtes Werkzeug. `sync.mjs` kopiert diesen Baum nach `.claude/skills/` für Claude Code und nach `.agents/skills/` für Codex:

```bash
node .claude/tools/sync.mjs          # write the projections
node .claude/tools/sync.mjs --check  # exit 2 if one is stale (for CI)
```

Jedes generierte Verzeichnis enthält eine Markierungsdatei `.generated` mit dem Hash der Quelle, sodass eine Änderung von Hand an einer Projektion erkannt und nicht stillschweigend behalten wird.

Kopien vermeiden die zusätzlichen Berechtigungen oder den Entwicklermodus, die Symlinks unter Windows erfordern können.

Claude Code hat Slash Commands wie `/requirements`, `/prototype` und `/build`. Die projizierten Skills stellen dieselben Playbooks bereit, darunter `build-prototype`, jeweils mit einem Gate-Aufruf als Schritt 0. Das gemeinsame Vorgehen macht die Durchsetzung in den beiden Harnesses aber nicht identisch.

---

## Der Tracker ist ein Adapter

Kein Playbook spricht direkt mit einem Tracker. Alles läuft über `node .claude/tools/tracker.mjs <verb>`, das JSON ausgibt und an einen Provider weiterleitet:

```bash
node .claude/tools/tracker.mjs create --type requirement --title "Bulk archive contacts"
node .claude/tools/tracker.mjs set ST-007 --status in-review
node .claude/tools/tracker.mjs next --type story
```

Der Standard-Provider ist `files` und speichert Markdown mit Front Matter in YAML in `work/items/`. Die Anbindung an Jira ist unfertig: Mapping und Code für REST-Aufrufe gibt es, aber die asynchrone Provider-Behandlung im Gate und die direkten Dateizugriffe im Coverage-Checker brauchen noch Integrationsarbeit.

Zwei Regeln im Vorgehen halten Aktualisierungen konsistent: **Bearbeiten Sie nie ein Work Item von Hand, und wählen Sie nie selbst eine ID.** `create` vergibt IDs zentral, damit Agenten sie nicht selbst wählen. Gegen gleichzeitige Schreibzugriffe ist die Vergabe nicht geschützt.

Der Adapter soll es ermöglichen, Status und Diskussion in einen anderen Tracker zu verlagern, während Design-, Prototyp- und Plan-Artefakte im Repo bleiben.

---

## Jedes Werkzeug läuft ohne Modell

Keine der Kontrollen braucht ein LLM. Den Zustand des Repos können Sie aus einer einfachen Shell prüfen:

```bash
node .claude/tools/status.mjs --gaps
node .claude/tools/check-coverage.mjs
node .claude/tools/check-tokens.mjs
node .claude/tools/gate.mjs plan ST-001
```

Die lokalen Werkzeuge brauchen Node 18+ und reines ESM, ohne npm-Abhängigkeiten. Die Hooks setzen Bash voraus, unter Windows also eine Bash-Installation wie Git Bash.

---

## Was bewusst fehlt

Es gibt keine Stufe für CI und Deployment, keine QA-Phase, kein paralleles Fan-out, keine Isolation über Worktrees und keine Board-Integration. Das alles ist real und manchmal notwendig. Es ist aber auch genau die Stelle, an der ein Vorgehen aufhört, leicht lesbar zu sein.

Die Regel für jede Ergänzung: Bauen Sie sie ein, wenn ein konkreter Fehler sie verlangt, und schreiben Sie auf, welcher.

> **Ein Gate ohne Vorfall dahinter ist Zeremonie.**

---

## Ausprobieren

Klonen Sie das Repo und erzeugen Sie die Projektionen der Skills im Terminal:

```bash
git clone https://github.com/srnux/sdlc-playbooks
cd sdlc-playbooks
node .claude/tools/sync.mjs
```

Passen Sie `.claude/sdlc.config.json` an Ihr Produkt und Ihre Verifikations-Commands an, und schreiben Sie den Stack-spezifischen Teil von `.claude/rules/coding-standards.md` neu.

Das Repo enthält ein gesperrtes Seaside-Design-System für Ferienvermietungen, einen Prototyp mit neun markierten Screens und drei Anforderungen. Sie können sich dieses Beispiel zuerst ansehen. Für Ihr eigenes Design aktualisieren Sie die konfigurierte Design-Quelle und führen in Claude Code `/design-system --refresh` aus. Ein einfaches `/design-system` wird verweigert, weil das mitgelieferte System bereits gesperrt ist.

Dann in Claude Code:

```text
/requirements 'PO text here…'
```

Verwenden Sie die ID der Anforderung, die dieser Command zurückgibt, in `/prototype <returned-id>`. Öffnen Sie das Ergebnis und prüfen Sie seine Screens und Zustände. Erst nachdem Sie es freigegeben haben, führen Sie `/approve <returned-id> --human-approved` aus, danach `/build`.

Mein einziger Rat: **Spielen Sie eine echte Anforderung von Anfang bis Ende durch, bevor Sie das Backlog füllen.** So finden Sie Lücken im Vorgehen auf konkrete Weise, solange der Umfang noch klein ist.

Wenn Sie etwas Ähnliches gebaut haben oder versucht haben, einen Agenten allein mit Prompts an einen Prozess zu binden, und zugesehen haben, wie er davon abweicht: Mich interessiert, was zuerst kaputtging.
