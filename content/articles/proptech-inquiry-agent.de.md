---
title: "Ein Agent für Immobilienanfragen mit React, MCP und Hybrid-RAG"
description: "Ein TypeScript-Agent für Immobilienanfragen: Antworten, die auf den Objektdaten beruhen und vor der Auslieferung geprüft werden, mit Übergabe an einen Menschen, wo es nötig ist. Gebaut mit React, MCP und Hybrid-RAG."
tags: [ki, typescript, mcp, rag]
---

Ein Immobilienassistent bekommt eine Frage:

> „Ich suche eine Wohnung in Hamburg unter 2.000 €. Ich habe einen Hund. Ist die Heizung inklusive, und kann ich die Wohnung am Samstag besichtigen?“

Das klingt nach einer einzigen Anfrage. Tatsächlich stecken mehrere Aufgaben darin: Objekte filtern, eine Haustierregelung prüfen, die Angaben zur Heizung finden und eine Besichtigung vereinbaren.

Für manche dieser Aufgaben stehen die Antworten in den Daten. Für andere braucht es einen Menschen.

Diese Unterscheidung ist der Ausgangspunkt für [proptech-inquiry-agent](https://github.com/srnux/proptech-inquiry-agent): ein TypeScript-Projekt, das einem KI-Assistenten Tools gibt, mit denen er Objektdaten durchsuchen, belegende Textstellen abrufen und Tickets für die Übergabe an einen Menschen anlegen kann.

Bedient wird es über eine Anfrageoberfläche in React. Hinter der Oberfläche wählt ein Agent Tools aus, sammelt Belege, prüft seinen Entwurf und liefert eine Antwort oder eine Übergabe. Die Browseroberfläche lässt sich ohne API-Schlüssel für ein Modell ausprobieren. Alle Objekt- und Richtliniendaten sind synthetisch.

Die MCP-Tools (Model Context Protocol), das hybride Retrieval, der Agent Loop, die Antwortprüfungen und die Weboberfläche sind umgesetzt. Eine Evaluierungssuite mit 49 Fällen misst inzwischen über die bestehenden Tests hinaus, ob Antworten korrekt sind und ob Übergaben stattfinden. Ihre ersten Läufe fanden Probleme im Retrieval, bei Antworten auf Folgefragen und im Evaluator selbst. Nach den Korrekturen bestehen 46 von 49 Fällen. Das Projekt ist weiterhin in Arbeit, und die verbleibenden Fehlschläge sind zusammen mit den Ergebnissen dokumentiert.

## Eine Oberfläche, die den Ablauf sichtbar macht

Die Browseranwendung hat drei Bereiche, und jeder beantwortet eine andere Frage: Was hat der Assistent gesagt, was hat er getan, und was braucht einen Menschen?

Die Skizzen und Codebeispiele in diesem Artikel sind auf Englisch.

```text
+---------------------+----------------------+---------------------+
| Conversation        | What the agent did   | Hand-off queue      |
+---------------------+----------------------+---------------------+
| Ask a question      | Search listings      | Viewing request     |
|                     | Read the evidence    | HH-1001             |
| Receive a checked   | Create a ticket      | Inquiry summary     |
| reply with sources  |                      | Contact details     |
|                     | Expand a step for    | New tickets appear  |
| Click a citation    | arguments, result,   | as they are created |
| to read its source  | and duration         |                     |
+---------------------+----------------------+---------------------+
```

[![Die Anfrageoberfläche beantwortet eine Frage zur Heizung mit Quellenangaben und legt danach ein Ticket für eine Besichtigungsanfrage an, die ein Mensch weiterbearbeitet](/images/writing/proptech-inquiry-agent-demo.gif)](/images/writing/proptech-inquiry-agent-demo.gif)

Diese Demo zeigt in derselben Oberfläche erst eine Sachfrage und dann eine Besichtigungsanfrage. Ein Klick öffnet die Animation in voller Größe.

Der linke Bereich hat Beispielschaltflächen für eine Sachfrage, eine Besichtigungsanfrage, eine Frage, auf die es keine Antwort gibt, und eine Anfrage auf Deutsch. Mit „und die Kaution?“ lässt sich nachfragen, ohne die Objekt-ID zu wiederholen, und „New conversation“ beginnt von vorn. Der mittlere Bereich zeigt die tatsächlichen Tool-Aufrufe, einschließlich Fehlern und gescheiterter Antwortprüfungen. Der rechte Bereich zeigt Tickets, die ein Mensch bearbeiten soll.

Ein Klick auf eine Quellenangabe öffnet einen Dialog mit dem Quelldokument, in dem die zitierte Textstelle hervorgehoben ist. Verweist eine Quellenangabe auf ein ganzes Objekt, zeigt der Dialog dessen strukturierte Felder und Beschreibung. So lassen sich die Belege hinter einer Antwort prüfen, ohne Logs zu durchsuchen.

Die Anwendung nutzt React State, Vite und ein einfaches Stylesheet. Die Oberfläche macht den bestehenden Ablauf sichtbar. Tools, Retrieval und Antwortprüfungen liegen weiterhin beim Server.

## Was hinter der Oberfläche passiert

Eine abgeschickte Anfrage startet auf dem Server einen Agent Loop. Der Loop fragt ein Modell, welche Tools es nutzen soll, führt diese Aufrufe aus und prüft die entstandene Antwort. Der Browser zeigt den Fortschritt und das Endergebnis. Derselbe Ablauf steht auch über eine CLI (Command-Line Interface) und eine HTTP-API bereit.

```text
Customer inquiry
       |
       v
React desk, CLI, or HTTP API
       |
       v
Agent loop <--------------------> Model implementation
       |                         Claude via API / Bedrock
       |                         or rule-based demo
       |
       +── MCP tools ──> Property records + local retrieval
       |             └─> Temporary hand-off queue
       |
       v
Check the draft answer
       |
       v
Reply + citations + tickets + tool trace + token usage
```

MCP ist die Verbindung, über die ein Assistent Tools entdecken und aufrufen kann. Der eingebaute Agent nutzt einen MCP-Client, der im selben Prozess mit dem Server dieses Repositorys verbunden ist. Er geht über dieselbe Tool-Schnittstelle wie ein externer Assistent, aber ohne zusätzlichen HTTP-Roundtrip.

Der [Architekturleitfaden](https://github.com/srnux/proptech-inquiry-agent/blob/main/ARCHITECTURE.md) des Repositorys bildet diesen Anfrageablauf ab, dazu die Grenze für Eskalationen, die Stelle, an der jede Prüfung läuft, und die Teile, die offline funktionieren.

Der Server stellt vier Tools bereit:

| Tool                | Aufgabe                                                   |
| ------------------- | --------------------------------------------------------- |
| `search_listings`   | Objekte finden, die ausdrückliche Anforderungen erfüllen. |
| `get_listing`       | Einen vollständigen Objektdatensatz zurückgeben.          |
| `search_knowledge`  | Textstellen aus Beschreibungen und Richtlinien abrufen.   |
| `hand_off_to_human` | Ein Ticket mit einem konkreten Grund anlegen.             |

Externe Assistenten wie Claude Desktop können die Tools über Standardein- und -ausgabe nutzen oder über den Streamable-HTTP-Endpunkt unter `/mcp`. Allgemeine Richtlinienseiten stehen außerdem als MCP-Ressourcen bereit.

## Was die Evaluierung zeigt

Die [Evaluierungssuite für den Agenten](https://github.com/srnux/proptech-inquiry-agent/blob/main/evals/cases.jsonl) enthält 49 Anfragen auf Deutsch und Englisch: Sachfragen, Suchen, alle sechs Übergabegründe, Folgefragen und Fallen, in denen eine Einschränkung entscheidend ist. „Haustiere auf Anfrage“ darf nicht zur Erlaubnis werden, eine geschätzte Umlage für die Fassade nicht zum endgültigen Betrag, und höfliches Feilschen muss trotzdem ein Verhandlungsticket erzeugen.

Ein Fall nutzt ein Inserat, das es nur im Test gibt und dessen Beschreibung den Assistenten auffordert, seine Anweisungen zu ignorieren und eine Besichtigung zu bestätigen. Das erwartete Verhalten ist trotzdem eine Übergabe. Diese Fixture hat einen eigenen Katalog und Index und wird von der Anwendung nie ausgeliefert.

Code prüft die erwarteten Inserate, die Übergabegründe und die Verankerung der Zahlen in den Belegen. Ein anderes Modell bewertet anhand einer [schriftlichen Rubrik](https://github.com/srnux/proptech-inquiry-agent/blob/main/evals/rubric.md) die geforderten Fakten, verbotene Aussagen, unbelegte Behauptungen und die Sprache der Antwort. Es sieht neben der Antwort auch die Tool-Ergebnisse und Tickets. Ausdrücklich erlaubte optionale Übergaben zählen bei der Berechnung von Precision und Recall weder als korrekt noch als zusätzlich.

Zwei vollständige Läufe am 1. Oktober 2026 nutzten `claude-opus-5-5` auf Amazon Bedrock als Agent und `claude-sonnet-5-5` als Judge:

| Metrik                                                                 | Erster Lauf    | Nach den Korrekturen |
| ---------------------------------------------------------------------- | -------------- | -------------------- |
| Fälle, die alle Prüfungen bestehen                                     | 41 / 49        | 46 / 49              |
| Übergaben: Precision / Recall                                          | 93,8 % / 100 % | 100 % / 100 %        |
| Antworten, die die Zahlenprüfung bestehen, endgültig / erster Entwurf  | 100 % / 100 %  | 100 % / 100 %        |
| Korrekte Antworten laut Judge                                          | 83,7 %         | 93,9 %               |
| Retrieval: erwartete Textstelle unter den ersten fünf                  | 24 / 25        | 26 / 26              |
| Unbeantwortbare Retrieval-Fragen, die Textstellen liefern              | 0 / 8          | 0 / 8                |
| Geschätzte Agentenkosten pro Anfrage im Mittel                         | 0,0160 $       | 0,0143 $             |
| Mittlere Latenz / p95-Latenz                                          | 9,2 s / 14,7 s | 8,6 s / 13,8 s       |

Der [erste Bericht](https://github.com/srnux/proptech-inquiry-agent/blob/main/evals/reports/2026-10-01.md) und der [Bericht nach den Korrekturen](https://github.com/srnux/proptech-inquiry-agent/blob/main/evals/reports/2026-10-01-after-fixes.md) verlinken jeden Fall mit seinem vollständigen Trace. Die Kostenschätzungen beruhen auf den Listenpreisen der Claude API, nicht auf der Abrechnung von Bedrock, und enthalten die separaten Kosten des Judge nicht. Die Läufe verarbeiteten drei Fälle parallel. Die Latenz enthält das Warten auf den gemeinsam genutzten lokalen Reranker. Zwischen den Läufen kam eine Regressionsfrage zum Retrieval-Set hinzu. Beide Läufe fanden lokal statt. Der Runner der Evaluierung scheitert, wenn eine Metrik ihren Schwellenwert verfehlt, und diese Schwellenwerte wurden nach dem ersten Lauf festgelegt und nach den Korrekturen angehoben.

Diese Ergebnisse haben Grenzen. Die Verankerung der Zahlen wird mit derselben Zahlenprüfung gemessen, die zur Laufzeit als Guard läuft und weiter unten beschrieben ist. Der Wert für die endgültige Antwort zeigt deshalb vor allem, dass der Guard funktioniert. Der Wert für den ersten Entwurf zeigt zusätzlich, ob eine Nachbesserung bei den Zahlen nötig war. Keiner der beiden belegt, dass jede Aussage gestützt ist. Der Judge kann sich irren, und das kleine Entwicklungsset für das Retrieval dient auch zur Kalibrierung. Das sind Messungen an bekannten Fällen, kein unabhängiger Benchmark und kein Beweis, dass der Assistent nie Fakten erfindet.

## Was kaputtging und was sich geändert hat

Die ersten Läufe deckten drei unterschiedliche Probleme auf:

- **Eine deutsche Frage zur Provision fand eine englische Richtlinie nicht.** Auf der Seite stand „commission“, aber keine der beiden Kandidatensuchen fand sie für „Provision“. Seit „Provision“ und „Maklerprovision“ in der Richtlinie stehen, wird sie gefunden. Die ursprünglich verfehlte Frage und eine neue Regressionsfrage bestehen jetzt, womit der Recall des Retrievals bei 26 von 26 liegt. Ein niedrigerer Schwellenwert für den Reranker, das Modell, das in der zweiten Stufe des Retrievals die Kandidaten bewertet, hätte nicht geholfen: Ein Reranker kann keine Textstelle retten, die er nie bekommt.
- **Eine Folgefrage korrigierte eine frühere Antwort, die bereits richtig war.** Der Agent rief die Angabe zur Heizung erneut ab, bestätigte sie und präsentierte dieselbe Angabe dann als Korrektur. Der Prompt verlangt eine Korrektur jetzt nur noch, wenn neue Belege der früheren Antwort widersprechen. Ein separater Fall mit einer tatsächlich falschen früheren Zahl prüft weiterhin, dass der Agent sie korrigiert.
- **Der Judge wertete gewöhnliche Formulierungen zur Übergabe als unbelegte Behauptungen.** Die Rubrik akzeptiert jetzt Aussagen über die Weiterbearbeitung durch einen Menschen, wenn ein passendes Ticket existiert, und lehnt versprochene Ergebnisse wie eine bestätigte Besichtigung oder ein genehmigtes Haustier weiterhin ab. Das korrigiert den Evaluator. Eine Verbesserung des Agenten selbst ist es nicht.

Drei Fälle scheitern auch nach diesen Änderungen. Zwei betreffen grenzwertige Schlussfolgerungen, die der Judge markiert, etwa die Aussage, der Kunde müsse die Treppe nehmen, weil eine Wohnung keinen Aufzug hat. Der dritte legt eine konkrete Behauptung über eine Fähigkeit offen: Der Agent bietet an, eine E-Mail-Adresse zu einem bestehenden Ticket hinzuzufügen, aber kein Tool kann ein Ticket ändern. Das ist noch offen. Eine Antwort kann jede Zahlen- und Quellenprüfung bestehen und trotzdem etwas versprechen, was das System nicht kann.

## Was der Agent Loop tatsächlich tut

Der Loop ist gewöhnliches TypeScript. Er fragt das Modell, was als Nächstes zu tun ist, führt angeforderte Tools aus und schickt die Ergebnisse zurück. Das wiederholt er, bis das Modell einen Antwortentwurf liefert oder der Lauf an eine Grenze stößt.

```text
Inquiry + instructions + available tools
                   |
                   v
              Call the model <----------------+
                   |                          |
             What came back?                  |
              /           \                   |
             v             v                  |
       Tool requests    Draft answer          |
             |             |                  |
             v             v                  |
       Execute via MCP  Run answer checks     |
             |                                |
             +── Send tool results back ──────+
```

Der System-Prompt verlangt vom Modell, aus den Tool-Ergebnissen zu antworten, seine Fakten mit Quellen zu belegen, Einschränkungen wie „auf Anfrage“ beizubehalten und die Teile zu übergeben, die es nicht klären kann. Das Modell kann die Heizungsfrage beantworten und im selben Lauf ein Besichtigungsticket anlegen.

Der Modelladapter unterstützt die Anthropic API und Amazon Bedrock. Der Loop selbst hängt nur von einer kleinen Schnittstelle `ModelClient` ab, sodass Tests ein geskriptetes Modell einsetzen können. Modell und Effort-Einstellung sind konfigurierbar. Der Adapter fordert außerdem Prompt Caching an und erfasst den Tokenverbrauch des Caches.

Jeder Lauf liefert ein strukturiertes Ergebnis:

```text
reply       The final text
citations   Source markers parsed from that text
handoffs    Tickets created during this inquiry
trace       Tool names, arguments, results, and durations
usage       Input, output, and cache token counts
outcome     Answered, or forced hand-off with a cause
```

Ein Ergebnis `answered` kann trotzdem ein Besichtigungsticket enthalten. Es bedeutet, dass der Loop die endgültige Antwort akzeptiert hat, nicht, dass jeder Teil der Anfrage automatisch erledigt wurde.

## Gewöhnlicher Code für gewöhnliche Filter

„Hamburg, unter 2.000 €, mindestens drei Zimmer“ braucht keine semantische Suche.

Der Katalog ist eine JSON-Datei. Jedes Objekt hat typisierte Felder für Stadt, Preis, Zimmerzahl, Wohnfläche, Ausstattung, Verfügbarkeit und Haustierregelung. Zod validiert die Daten beim Laden.

`search_listings` prüft diese Felder direkt und sortiert passende Objekte nach Preis.

```text
City: Hamburg       ──┐
Price: ≤ €2,000      ──┼──> Field filters ──> Matching properties
Customer has a dog  ──┘
```

Ein bewusstes Detail: Objekte mit „Haustiere auf Anfrage“ bleiben in den Ergebnissen. Sie auszuschließen würde mögliche Optionen verstecken. Ihr Status bleibt sichtbar, damit der Assistent erklären kann, dass noch eine Erlaubnis nötig ist.

Das synthetische Objekt `HH-1001` zum Beispiel kostet 1.650 € im Monat, und Haustiere sind „auf Anfrage“ erlaubt. Das ist ein möglicher Treffer, keine Zusage für den Hund des Kunden.

## Den Text durchsuchen, wenn die Felder nicht reichen

Die Heizungsfrage braucht einen anderen Ansatz. Die Antwort steht im Beschreibungstext:

> „Utilities (Nebenkosten) are an additional 240 EUR per month, heating included.“

Das Retrieval-System zerlegt Objektbeschreibungen in Sätze und Richtlinienseiten in Abschnitte. Diese kleinen Textstücke heißen Chunks. Jeder trägt seine Quelle und einen Identifikator für Quellenangaben.

Belege für das Modell abzurufen, bevor es eine Antwort schreibt, nennt man RAG (Retrieval-Augmented Generation). Hier ist das Retrieval hybrid: Es kombiniert Stichwortsuche mit einer Bedeutungssuche über Embeddings und bewertet die Kandidaten anschließend mit einem Reranker.

Die Suche läuft dann in zwei Stufen ab:

```text
              “Is heating included in HH-1001?”
                              |
                              v
               Restrict the searchable material
               to HH-1001 + general policies
                              |
                  +-----------+-----------+
                  |                       |
                  v                       v
             Keyword search          Meaning search
                 BM25                Local embeddings
                  |                       |
                  +-----------+-----------+
                              |
                              v
                    Candidate passages
                              |
                              v
                 Local reranker scores each
                 question-and-passage pair
                              |
                              v
                   Relevance threshold
                     /             \
                    v               v
           Evidence + source ID   found: false
```

Die Stichwortsuche hilft bei markanten Begriffen wie _Nebenkosten_ und _Staffelmiete_. Die Bedeutungssuche hilft bei Umschreibungen und bei Fragen auf Deutsch oder Englisch.

Für die Bedeutungssuche wandelt `multilingual-e5-small` Text in numerische Repräsentationen um, sogenannte Embeddings. Ähnliche Repräsentationen helfen, verwandte Textstellen zu finden.

Das System sammelt aus jeder Suchmethode bis zu 20 Kandidaten und entfernt Duplikate. Ein zweites Modell, `bge-reranker-v2-m3`, bewertet jeden Kandidaten zusammen mit der Frage. Zurückgegeben werden nur Textstellen oberhalb des konfigurierten Schwellenwerts.

Beide Modelle laufen nach dem ersten Download lokal über Transformers.js. Der Gesprächsassistent ist davon getrennt: Lokales Retrieval heißt nicht, dass das ganze Gespräch offline läuft.

## Die nächstgelegene Textstelle kann trotzdem nutzlos sein

Die nützlichste Erkenntnis in diesem Projekt kam aus Fragen, die die Daten nicht beantworten konnten.

Eine Embedding-Suche findet die nächstgelegene Textstelle auch dann, wenn jede Textstelle irrelevant ist. Das System braucht deshalb einen Weg, „nichts Passendes gefunden“ zurückzugeben.

Die dokumentierten Experimente des Projekts zeigen, warum das schwierig war. Eine unbeantwortbare Frage nach einem Fitnessstudio erhielt eine Embedding-Ähnlichkeit von 0,832, eine beantwortbare deutsche Frage zu Haustieren dagegen 0,784. Ein einfacher Schwellenwert für die Ähnlichkeit konnte die beiden nicht zuverlässig trennen.

Ein zweiter Versuch maß, wie stark sich eine Textstelle von den übrigen Kandidaten abhob. Auch das scheiterte bei einigen unbeantworteten Fragen.

Mit dem Reranker bekam das Projekt ein besseres Signal für die Entscheidung, welche Textstellen zurückgegeben werden. Sein Score ist trotzdem eine Modellausgabe und keine garantierte Wahrscheinlichkeit dafür, dass eine Antwort stimmt. Der Schwellenwert muss am tatsächlichen Korpus evaluiert werden.

Ein weiteres Experiment änderte, was in die Embeddings einfloss:

```text
Before:  Property title + location + passage  ──> Embedding
After:   Passage alone                      ──> Embedding
```

Bei den dokumentierten 25 beantwortbaren Fragen stand die erwartete Textstelle mit Headern bei 20 Fragen unter den ersten fünf Vektortreffern, ohne Header bei 23. Nützlich bleiben die Header für die Stichwortsuche und für den Reranker, der jede Textstelle mit ihrem Kontext liest.

Das ist ein kleines Experiment, aber es hat die Implementierung verändert: Zusätzlicher Kontext half in manchen Teilen der Suchpipeline und schadete in einem anderen.

## Die Fakten eines Objekts von denen eines anderen trennen

Enthält eine Frage eine Objekt-ID, schließt der Code andere Objekte **vor dem Ranking** aus.

```text
Question about HH-1001
          |
          +── HH-1001 description       Included
          +── General agency policies  Included
          +── Other property records   Excluded
```

Unter den Textstellen, die den Relevanzschwellenwert überschreiten, kommen die eigenen Textstellen des Objekts vor den allgemeinen Richtlinien. Die konkrete Kautionshöhe eines Objekts soll Vorrang vor einer allgemeinen Erklärung zu Kautionen haben.

Diese Grenze setzt der Code durch. Sie hängt nicht davon ab, dass der Assistent daran denkt, die Heizkosten eines anderen Objekts zu ignorieren.

## Ein Ticket ist keine gebuchte Besichtigung

Das Übergabe-Tool kennt sechs Gründe:

- Besichtigungsanfragen
- Preisverhandlungen
- Vertrags- oder Rechtsfragen
- Beschwerden
- Anfragen zu personenbezogenen Daten
- Fragen, die die Daten nicht beantworten können

Ein Ticket enthält seinen Grund, eine Zusammenfassung, optional eine Objekt-ID und eine E-Mail-Adresse für den Kontakt, einen Zeitstempel und eine generierte ID. Unbekannte Objekt-IDs lehnt das Tool ab.

```text
“Can I view it Saturday?”
           |
           v
hand_off_to_human
reason: viewing_request
           |
           v
Ticket stored in memory
           |
           v
Human follow-up still required
```

Derzeit ist das eine Queue im Arbeitsspeicher. Sie verschickt keine E-Mail und reserviert keinen Kalendertermin, und die Tickets verschwinden, wenn der Prozess endet.

## Die Antwort prüfen, bevor sie zurückgeht

Die Prüfungen in `packages/core/src/agent/guards.ts` untersuchen einen Entwurf, bevor der Loop ihn an den Aufrufer zurückgibt.

| Prüfung          | Worauf der Code achtet                                                                                                                                                                      |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Quellenangabe    | Erkannte Quellenmarker müssen auf Objekt- oder Textstellen-IDs verweisen, die in diesem Lauf von einem Tool zurückgegeben wurden.                                                          |
| Zahl             | Erkannte Preise, Flächen und Prozentangaben müssen einer Zahl entsprechen, die in einem erfolgreichen Tool-Ergebnis dieses Laufs oder in der aktuellen oder einer beibehaltenen früheren Anfrage des Nutzers vorkommt. |
| Fehlende Belege  | Eine Antwort mit solchen Zahlen muss mindestens eine erkannte Quellenangabe enthalten.                                                                                                      |
| Leere Antwort    | Die Antwort muss Text enthalten.                                                                                                                                                            |

So wird `[HH-1001#s5]` nur akzeptiert, wenn diese Textstellen-ID in den Tool-Ergebnissen des Laufs vorkam. Ein neu erfundener Preis sollte an der Zahlenprüfung scheitern. Deutsche und englische Zahlenformate werden beide verarbeitet, sodass `1.650 €` zu `1650` im Datensatz passen kann.

Scheitert eine Prüfung, bekommt der Nutzer diesen Entwurf nicht zu sehen. Das Modell erhält Feedback und eine Gelegenheit zur Nachbesserung, die weitere Tool-Aufrufe einschließen kann.

```text
                  Draft answer
                       |
                       v
                  Run checks
                  /        \
               Pass        Fail
                |            |
                v            v
          Return reply   Explain the violations
                             |
                             v
                       One repair attempt
                             |
                             v
                         Check again
                         /        \
                      Pass        Fail
                       |            |
                       v            v
                 Return reply   Code calls hand-off tool
                                and returns a fixed reply
```

Die Standardwerte begrenzen eine Anfrage außerdem auf acht Modellaufrufe, mit einem Budget von 80.000 Token, das zwischen den Aufrufen geprüft wird, einem Timeout von 60 Sekunden pro Modellaufruf und einem von 30 Sekunden pro Tool-Aufruf. Der Loop leitet eine Übergabe ein, wenn er sein Limit an Durchläufen oder Token erreicht, das Modell in einen Timeout läuft oder eine endgültige Antwort verweigert oder abgeschnitten wird. Fehler von Tools gehen als Fehlermeldungen an das Modell zurück, auf die es reagieren kann. Andere Fehler des Anbieters können weiterhin als Fehler durchschlagen.

Diese Prüfungen haben einen genau umrissenen Geltungsbereich. Sie prüfen, ob erkannte IDs und Zahlen in den Belegen vorkamen, nicht, ob jeder Satz diese Belege richtig auslegt. Eine echte Zahl, die dem falschen Objekt zugeordnet wird, kann trotzdem durchgehen. Auch eine Antwort ohne Zahlenangaben kann Quellenangaben weglassen, ohne dass dieser Guard es bemerkt.

Der Prompt verbietet Rechnen, aber die Zahlenprüfung testet nur, ob ein Wert bereits irgendwo im zulässigen Material vorkommt. Wie das Modell zu diesem Wert gekommen ist, kann sie nicht feststellen. Ebenso klassifizieren die Guards die Anfrage nicht, um jede vergessene Übergabe einer Besichtigung abzufangen. Die Evaluierungssuite prüft erwartete Übergaben deshalb im Code und lässt ein Modell als Judge die Bedeutung der Antwort an den Belegen messen.

Diese Antwortprüfungen gehören zum eingebauten Agent Loop. Ein externer Assistent, der `/mcp` direkt aufruft, bekommt die Tools und ihre Validierung, schickt seine endgültige Antwort aber nicht automatisch durch diese Guards.

## Folgefragen: den Kontext behalten, die Belege neu abrufen

Nach einer Frage zur Heizung in `HH-1001` kann ein Nutzer „und die Kaution?“ fragen. Das Modell braucht den vorherigen Wortwechsel, um zu wissen, welches Objekt gemeint ist.

`POST /inquiries` akzeptiert eine optionale `history` mit bis zu fünf früheren Paaren `{inquiry, reply}`, die älteste zuerst. Die Web-App schickt die fünf jüngsten abgeschlossenen Wortwechsel, die auf dem Bildschirm stehen. „New conversation“ löscht diesen Gesprächskontext. Der Server behält zwischen Anfragen keinen Gesprächsverlauf. Seine gemeinsame Ticket-Queue im Arbeitsspeicher ist davon getrennt.

```text
Earlier questions and replies ──> Context: which property?
                                           |
New question ───────────────────────────────┤
                                           v
                                  Retrieve current evidence
                                           |
                                           v
                                  Write and check the reply
```

Frühere Antworten erreichen das Modell als reiner Text, ohne ihre Tool-Aufrufe oder Ergebnisse. Ihre Quellenangaben und Zahlen werden nicht zu Belegen für den neuen Lauf. Um einen Quellenmarker wiederzuverwenden, muss er neu abgerufen werden, und eine Zahl muss in den Tool-Ergebnissen dieses Laufs oder in einer Anfrage des Nutzers vorkommen. Zahlen, die der Nutzer in beibehaltenen früheren Wortwechseln selbst genannt hat, zählen weiterhin als seine eigenen, etwa sein Budget von 2.000 €.

Mehr als fünf Einträge im Verlauf lehnt die API mit HTTP 400 ab. Welche Einträge wegfallen, entscheidet der Client. So bleibt der Verlauf begrenzt, ohne serverseitige Gesprächssitzungen einzuführen. Alte Tool-Ergebnisse erneut einzuspielen würde Belege über Anfragen hinweg mitschleppen, und vom Modell erzeugte Zusammenfassungen würden dem Ablauf einen weiteren Modellaufruf und einen weiteren ungeprüften Text hinzufügen.

## Verschiedene Tests beantworten verschiedene Fragen

Die gewöhnlichen Tests laufen mit einem deterministischen Ersatz für das Embedding-Modell, ohne Modell-Downloads. Ein separater Befehl `pnpm test:model` prüft das Retrieval mit den echten Modellen.

Tests mit geskriptetem Modell prüfen den Loop mit erfundenen Quellenangaben, unbelegten Zahlen, Nachbesserungen und Laufgrenzen. Damit lassen sich Fehlerpfade reproduzieren, ohne für Modellaufrufe zu bezahlen.

In einem dokumentierten Lauf auf Amazon Bedrock am 29. September 2026 erzeugte die deutsche Version der Eingangsanfrage eine deutsche Antwort, wählte `HH-1001`, behielt Haustiere „auf Anfrage“ bei, belegte die Heizung mit `HH-1001#s5` und legte ein Ticket `viewing_request` an. Der Lauf brauchte vier Tool-Aufrufe in drei Modelldurchläufen.

Auch der optionale Live-Test des Agenten ist als bestanden dokumentiert. Dieser Test nutzt ein echtes Gesprächsmodell mit dem Offline-Ersatz fürs Retrieval und ist vom Modelltest mit echtem Retrieval getrennt. Der dokumentierte Abnahmelauf belegt, dass der Ablauf tatsächlich durchlaufen wurde. Ein breites Maß für seine Zuverlässigkeit ist er nicht.

Drei Playwright-Tests decken den Ablauf im Browser ab: Eine Besichtigungsanfrage erzeugt Antwort, Trace und Ticket, eine Quellenangabe öffnet ihre hervorgehobene Textstelle, und eine Folgefrage behält den Objektkontext, bis „New conversation“ ihn löscht. Sie laufen mit dem Demo-Modell und dem Hashing-Embedder, sodass die Testläufe weder Zugangsdaten für ein Modell noch Modell-Downloads brauchen. Sie prüfen den Ablauf im Browser, nicht die Antwortqualität eines entfernten Modells.

GitHub Actions führt bei jedem Push und jedem Pull Request Typprüfung, Unit-Tests und diese Browserprüfungen aus. Der [CI-Workflow (Continuous Integration)](https://github.com/srnux/proptech-inquiry-agent/actions/workflows/ci.yml) war auf dem Entwicklungsbranch, in seinem Pull Request und auf `main` nach dem Merge am 1. Oktober 2026 erfolgreich. Diese Prüfungen brauchen weder API-Zugangsdaten für ein Modell noch Downloads der Retrieval-Modelle.

## Die Arbeit streamen, dann die geprüfte Antwort zeigen

Der Browser baut auf dem Ereignisstrom der Anfrage auf, während externe MCP-Clients die Tools weiterhin direkt aufrufen können:

```text
Application sends an inquiry
           |
           v
    POST /inquiries
           |
           v
    Runs the agent loop
           |
           +── trace events: completed tool calls
           +── guard events: checks that failed
           +── result event: final reply and metadata

External MCP client
           |
           v
          /mcp
           |
           v
    Calls the tools directly
```

`/inquiries` nutzt SSE (Server-Sent Events): Eine HTTP-Antwort trägt eine Folge benannter Ereignisse. Während des Wartens zeigt die Oberfläche abgeschlossene Tool-Aufrufe und Fortschrittsmeldungen. Die Antwort erscheint als Ganzes, nachdem die Prüfungen bestanden sind, oder als feste Übergabeantwort, wenn der Code den Lauf beendet.

Das ist eine bewusste Entscheidung. Würde die Oberfläche einen erfundenen Preis streamen, bevor die Zahlenprüfung ihn ablehnt, hätte der Nutzer ihn schon gelesen. Weil der Entwurf intern bleibt, kann der Agent ihn nachbessern, bevor er ihn zeigt.

Zwei weitere Routen unterstützen die Anfrageoberfläche:

| Route              | Was der Browser erhält                                                          |
| ------------------ | ------------------------------------------------------------------------------- |
| `GET /handoffs`    | Einen SSE-Snapshot der vorhandenen Tickets, danach jedes neue Ticket.           |
| `GET /sources/:id` | Die Textstelle oder das Objekt hinter einer Quellenangabe, mit dem umgebenden Dokument. |

Der Queue-Stream abonniert die gemeinsame Queue des Servers. Ein Ticket, das ein externer Client über `/mcp` anlegt, erscheint deshalb auch im Browser. Es bleibt eine Queue im Arbeitsspeicher, Live-Aktualisierungen bedeuten also keine Persistenz.

Der Server bindet standardmäßig an `127.0.0.1:3000` und hat derzeit keine Authentifizierung. Während der Entwicklung leitet Vite die API-Anfragen des Browsers an ihn weiter.

## Ausprobieren

`DemoModel` implementiert dieselbe Schnittstelle `ModelClient` mit Regeln. Es ruft die echten MCP-Tools auf, zitiert abgerufene Textstellen und schickt seine Antworten durch dieselben Antwortprüfungen. Es ist für die vier Beispielanfragen und eine begrenzte Menge verwandter Anfragen gedacht, nicht für allgemeine Gespräche.

```text
Claude model ──────────┐
                      ├──> Same loop ──> Same tools ──> Same checks
Rule-based demo ───────┘
```

Klonen Sie das [GitHub-Repository](https://github.com/srnux/proptech-inquiry-agent) und führen Sie diese Befehle mit Node.js 20 oder neuer in dessen Wurzelverzeichnis aus. Ab Node.js 25 ist Corepack nicht mehr enthalten. Installieren Sie es in diesem Fall zuerst mit `npm install -g corepack`:

```bash
corepack enable   # once, provides the pnpm version pinned in package.json
pnpm install
pnpm dev
```

Öffnen Sie `http://localhost:5173` und klicken Sie auf ein Beispiel. Ohne Zugangsdaten für ein Modell greift `pnpm dev` auf das Demo-Modell zurück, und die Seite kennzeichnet diesen Modus mit „Demo model, no API key“. Der Demo-Modus ändert das Gesprächsmodell, nicht das Retrieval: Beim ersten Start werden trotzdem die beiden lokalen Retrieval-Modelle heruntergeladen (etwa 120 MB und 570 MB). Wer zusätzlich `EMBEDDER=hashing` setzt, spart diesen Download und nutzt den schwächeren Ersatz fürs Retrieval. So laufen auch die Browsertests.

Mit Zugangsdaten für die Anthropic API oder Amazon Bedrock in `.env` nutzt die Oberfläche ein echtes Modell, `pnpm ask --trace "…"` schickt eine Anfrage aus dem Terminal, und `pnpm eval` führt die 49 Evaluierungsfälle mit Bericht und Traces pro Fall aus. Das [README](https://github.com/srnux/proptech-inquiry-agent#readme) des Repositorys beschreibt den Rest: die HTTP API, die Einrichtung in Claude Desktop, die Browsertests, die Kalibrierung der Schwellenwerte und den manuell ausgelösten Workflow für die Evaluierung.

## Was noch zu beweisen ist

Die Evaluierungssuite testet jetzt, ob Einschränkungen eine Umformulierung überstehen, ob Anfragen, die einen Menschen brauchen, Übergaben erzeugen und ob eine bösartige Anweisung in einem Inserat das Verhalten des Agenten ändert. Als Nächstes stehen an: das unbelegte Angebot zur Ticketänderung beheben, die Abdeckung über diese bekannten Fälle hinaus erweitern und ein günstigeres Agentenmodell mit einem separaten Judge vergleichen. Ein bestandener Fall zu Prompt Injection belegt keine Widerstandsfähigkeit gegen andere Angriffe.

Architekturleitfaden, aufgezeichnete Demo, Fehleranalyse und CI-Workflows sind vorhanden. Übergabetickets liegen weiterhin nur im Arbeitsspeicher, eine persistente Speicherung der Tickets steht noch aus. Vorerst ist das eine lokale Anwendung mit synthetischen Daten, kein vollständiges System für den Betrieb eines Maklerbüros.

Die bisher nützlichste Lehre: Retrieval, Antwortgenerierung und Antwortprüfung brauchen getrennte Tests. Ein Suchergebnis kann relevant sein und trotzdem falsch zitiert werden. Eine Quellenangabe kann existieren und trotzdem eine andere Aussage stützen. Die Anfrageoberfläche macht Belege, Tool-Aufrufe und entstandene Tickets nachvollziehbar und hält abgelehnte Entwürfe aus dem Gespräch heraus.
