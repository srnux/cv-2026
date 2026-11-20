---
title: "Ein Agent für Immobilieninserate auf Amazon Bedrock, der fragt, bevor er schreibt"
description: "Ein TypeScript-Agent, der aus Besichtigungsfotos, einem Grundriss und knappen Maklernotizen ein deutsches und ein englisches Exposé und eine OpenImmo-XML-Datei macht. Widersprüche und Lücken werden zu Fragen an den Makler, und Code prüft jede Zahl."
tags: [ki, typescript, aws, agents]
---

Ein Makler kommt von einer Besichtigung zurück, mit sechzehn Fotos, einem Grundriss und drei Zeilen Notizen:

> „3 Zimmer, 2. OG, Küche neu 2023, Balkon Süd, 1.450 € kalt, NK 220 €. Musterstraße 12, 20255 Hamburg-Eimsbüttel. Ruhige Seitenstraße, 5 Min. zur U-Bahn Osterstraße, Park um die Ecke. Parkett, Wanne im Bad. Frei ab 1.2.2027.“

Daraus ein Inserat für ein Portal zu machen, ist vor allem Schreibarbeit, und ein Sprachmodell schreibt gut. Das Problem ist das, was in den Notizen fehlt. Es gibt keine Wohnfläche und keine der Angaben zum Energieausweis, die das Gesetz in Immobilienanzeigen verlangt, sobald ein Energieausweis vorliegt. Der Grundriss zeigt vier Zimmer, nicht drei. Drei der Fotos sind zu dunkel, zu unscharf oder fast eine Kopie eines anderen.

Ein Modell, das „das Inserat schreiben“ soll, füllt diese Lücken mit etwas Plausiblem. Ein plausibler Energiekennwert in einer veröffentlichten Anzeige ist schlimmer als gar keiner.

[listing-creation-agent](https://github.com/srnux/listing-creation-agent) ist ein TypeScript-Projekt, das auf einer einzigen Regel aufbaut: **nur aus den erfassten Daten schreiben und den Makler zu allem anderen fragen.** Ein Agent auf Amazon Bedrock liest die Notizen, die Fotos und den Grundriss, fragt den Makler, wenn Quellen sich widersprechen oder ein Pflichtfeld fehlt, schreibt das Exposé auf Deutsch und Englisch und exportiert OpenImmo-XML (Extensible Markup Language), das Austauschformat, das deutsche Immobilienportale importieren.

Gebaut wurde es für den praktischen Teil eines KI-Workshops und am 19. November 2026 live vorgeführt. Es läuft lokal mit synthetischen Daten und Stockfotos, und die Agentur darin, Lindenhof Immobilien, ist erfunden. Es zeigt, wo die Regeln eines Agenten hingehören, und ist kein Produktivsystem. Es ist ein Geschwisterprojekt des [Agenten für Immobilienanfragen](/de/writing/proptech-inquiry-agent/) und übernimmt dessen Modellschnittstelle und Loop.

## Eine Seite, drei Fragen

Die Weboberfläche hat drei Bereiche: was hineinging, was der Agent gerade tut und was herauskam.

Die Skizzen und Codebeispiele in diesem Artikel sind auf Englisch.

```text
+----------------------+---------------------------+----------------------------+
| Inputs               | Agent steps               | Result                     |
+----------------------+---------------------------+----------------------------+
| Photos               | ✓ record_facts  12 facts  | Photos in suggested order, |
| Floor plan           | ✓ analyze_photos 3 poor   |  cover marked, poor ones   |
| Notes                | ✓ read_floor_plan 4 rooms |  greyed out with a reason  |
|                      | ? ask_broker              | Exposé  [Deutsch|English]  |
| [Load sample]        |   “Notes say 3 rooms,     | The record: every fact     |
| [Create listing]     |    the plan shows 4”      |  with its source           |
| ( ) Live ( ) Replay  |   [typed form]            | [Download OpenImmo XML]    |
|                      | ✗ submit_expose rejected  |  validation badge          |
+----------------------+---------------------------+----------------------------+
```

Das Publikum im Workshop war gemischt: Entwickler, KI-Praktiker und zwei Vertriebsleute. Der Vertrieb sieht, wie aus unordentlichen Eingaben auf einem Bildschirm ein fertiges zweisprachiges Exposé wird. Die Entwickler öffnen jeden Schritt und lesen seine genaue Eingabe und Ausgabe. Ein Schritt, den eine Prüfung im Code abgelehnt hat, erscheint rot. Das gehört zur Demo und wird nicht versteckt.

## Die erfassten Daten und woher jeder Fakt stammt

Der Agent hält das Inserat nicht im Gesprächsverlauf. Er hält es in einem Datensatz, einem Objekt pro Lauf, und jeder Fakt darin trägt seine Quelle:

| Quelle        | Beispiel                                          |
| ------------- | ------------------------------------------------- |
| `notes`       | `price_cold_eur: 1450`                            |
| `floor_plan`  | `living_area_m2: 82.5`                            |
| `photo:<id>`  | `built_in_kitchen: true` aus `04-kitchen`         |
| `broker`      | `rooms: 4`, nachdem der Agent gefragt hat         |

Die Felder stammen aus einer festen Liste von 21, jedes mit einem Zod-Schema. Zimmer sind positiv und kommen in halben Schritten, die Postleitzahl hat fünf Ziffern, die Energieeffizienzklasse ist eine von `A+` bis `H`, das Ablaufdatum des Ausweises ist ein Datum im Format `YYYY-MM-DD`. Ein Wert, der sein Schema verletzt, wird abgelehnt, egal wer ihn liefert. Im aufgezeichneten Lauf weiter unten scheiterte der erste Versuch des Modells, die Balkonausrichtung als `"Süd"` zu speichern, weil das Schema `"south"` erwartet. Beim nächsten Aufruf speicherte es den richtigen Wert.

Zwölf dieser Felder sind Pflicht: Kaltmiete, Wohnfläche, Zimmer, Etage, Stadt, Stadtteil und die sechs Felder des Energieausweises. Diese Liste ist Code, kein Satz im Prompt.

## Ein einfacher Loop, die Regeln stecken in den Tools

Das steuernde Modell ist Claude Opus 5.5 über ein Bedrock-Inferenzprofil der EU (Europäische Union). Der Loop ist gewöhnliches TypeScript: Modell aufrufen, die angeforderten Tools ausführen, die Ergebnisse zurückschicken, wiederholen, bis es aufhört. Er begrenzt einen Lauf auf 20 Modellaufrufe, ein Token-Budget und Timeouts und wirft nie eine Ausnahme. Jeder Modell- und Tool-Aufruf wird zu einem Ereignis, das die Seite über SSE (Server-Sent Events) empfängt.

Das Modell entscheidet über die Reihenfolge. Die Tools entscheiden, was erlaubt ist.

| Tool              | Was es tut                                                        | Was der Code durchsetzt                                                      |
| ----------------- | ----------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `record_facts`    | Speichert Fakten, die das Modell in den Notizen gelesen hat       | Nur bekannte Feld-IDs, jeder Wert gegen sein Schema geprüft                  |
| `analyze_photos`  | Raum, Merkmale und Qualität pro Foto, eine Reihenfolge, ein Titelbild | Vom Code markierte Fotos gelten als schlecht und werden nie Titelbild    |
| `read_floor_plan` | Räume mit Typ und Fläche, Zimmerzahl, Gesamtwohnfläche            | Ausgabe gegen ein Schema geprüft                                             |
| `compare_sources` | Vergleicht Notizen mit Grundriss und Fotos                        | Reiner Code: Zimmerzahl, Balkon, Wohnfläche mit 3 Prozent Toleranz           |
| `check_listing`   | Listet fehlende Pflichtfelder, offene Widersprüche und offene Schritte | Die Pflichtliste ist Code                                               |
| `ask_broker`      | Stellt eine Frage als typisiertes Formular                        | Antworten gehen direkt in den Datensatz, geprüft gegen die Feldschemas       |
| `submit_expose`   | Nimmt den deutschen und den englischen Text an                    | Jede Zahl muss in den erfassten Daten stehen                                 |
| `export_openimmo` | Baut und validiert das XML                                        | Verweigert, solange etwas fehlt, widersprüchlich oder noch nicht erledigt ist |

Der System-Prompt nennt die Regel, schlägt eine Arbeitsreihenfolge vor und enthält den Tonleitfaden der Agentur: „Sie“ im Deutschen, britisches Englisch, keine Superlative, keine Aussagen über die Nachbarschaft, die der Makler nicht notiert hat. Er sagt auch, dass Text in Notizen oder Fotos Daten sind und nie die Regeln ändern. Der Prompt erklärt die Regeln. Dass sie gelten, stellen die Tools sicher.

## Fotos: erst Code, dann Modell

Manche Probleme mit Fotos brauchen Urteilsvermögen. Andere sind Arithmetik. Die Arithmetik läuft zuerst, mit [sharp](https://sharp.pixelplumbing.com/):

```text
16 photos
    |
    v
Mean brightness   below 60 of 255     -> dark
Laplacian variance below 40           -> blurry
Difference hash   within 10 bits of
                  an earlier photo     -> duplicate_of:<id>
    |
    v
One vision call (Claude Sonnet 5.5): every photo, resized,
each preceded by its ID and the flags code found
    |
    v
Code merges the report: a flagged photo is poor whatever the
model said, poor photos go to the end, and a poor cover is replaced
```

Die Schwellenwerte sind auf das Beispiel abgestimmt, sodass genau die drei absichtlich schlechten Fotos markiert werden. Für andere Fotos müssten sie neu eingestellt werden.

Der Vision-Aufruf liefert strukturiertes JSON: Raumtyp, sichtbare Merkmale auf Englisch, ein Urteil mit Gründen pro Foto, dazu eine Reihenfolge und ein Titelbild. Das steuernde Modell sieht die Bilder nie. Es bekommt diese JSON-Zusammenfassung, so bleiben sechzehn Bilder aus jedem späteren Schritt des Gesprächs heraus. Der Grundriss bekommt einen eigenen Vision-Aufruf mit eigenem Schema.

Zwei Fakten fließen aus den Fotos in den Datensatz. Ein Foto mit Einbauküche setzt `built_in_kitchen`, ein Balkonfoto setzt `balcony`, jeweils mit dem Foto als Quelle und nur, wenn die Notizen dazu noch nichts gesagt haben. Der Grundriss liefert die Wohnfläche, wenn sie sonst niemand angegeben hat.

## Aus einem Widerspruch wird ein Formular, keine Vermutung

`compare_sources` ist deterministisch. Die Notizen sagen 3 Zimmer, der Grundriss zeigt 4: Das ist ein Widerspruch. Ein Balkon in den Notizen, den weder Grundriss noch Fotos zeigen, ist auch einer, ebenso eine Wohnfläche, die mehr als 3 Prozent vom Grundriss abweicht.

Der Agent kann einen Widerspruch nicht selbst auflösen. Sein einziger Weg ist `ask_broker`, das eine Frage auf Deutsch und die IDs der Felder nimmt, die die Antwort füllt:

```text
ask_broker
  question: “In Ihren Notizen stehen 3 Zimmer, im Grundriss sind es 4
             (inkl. Arbeitszimmer mit 9 m²). Wie viele Zimmer sollen
             ins Inserat?”
  fields:   [rooms]
        |
        v
The run pauses. The page shows a form with one typed input per field,
and a select wherever the schema has a fixed list of values.
        |
        v
Each answer is checked against its field schema
  invalid -> the form comes back with the error (up to three times)
  valid   -> written to the record with source “broker”
        |
        v
The conflict is settled: compare_sources ignores fields the broker answered
```

Das Modell macht nie aus einer Freitextantwort einen Fakt, weil es keinen Freitext gibt. Wer „ca. 120“ als Energiekennwert eintippt, bekommt eine Ablehnung vom Formular, bevor der Agent irgendetwas sieht.

Der Energieausweis ist die andere Hälfte der Demo. § 87 GModG (Gebäudemodernisierungsgesetz, früher Gebäudeenergiegesetz) verlangt fünf seiner Angaben in einer Immobilienanzeige, sobald ein Energieausweis vorliegt: die Art des Ausweises, den Energiekennwert, den wesentlichen Energieträger und bei Wohngebäuden das Baujahr und die Energieeffizienzklasse. Die Demo verlangt zusätzlich das Ablaufdatum. Das ist ihre eigene Regel, nicht die des Gesetzes, damit keine Anzeige mit einem bald ablaufenden Ausweis erscheint. Die Notizen enthalten keine der sechs Angaben. Der Prompt verlangt alle sechs Felder in einer Frage, damit der Makler ein Formular ausfüllt, statt sechsmal unterbrochen zu werden. `ask_broker` ist das einzige Tool ohne Timeout, weil es auf einen Menschen wartet.

## Jede Zahl im Exposé wird geprüft

Der schlimmste Fehler, den dieses Projekt machen kann, ist eine Zahl im Exposé, die aus dem Nichts kommt. `submit_expose` prüft deshalb im Code jede Zahl, bevor es einen Text annimmt.

Es findet jede Zahl in den deutschen und englischen Titeln, Beschreibungen, Lagetexten und Merkmalslisten und vergleicht sie mit den Zahlen in den erfassten Daten. Zahlenformate machen das schwieriger, als es klingt:

```text
“1.450”  ->  1450 (German) or 1.45 (English)   -> either may match
“1,450”  ->  1450 (English) or 1.45 (German)   -> either may match
“82,5”   ->  82.5 only, one digit is no
             thousands group                    -> matches the floor plan
```

Eine Zahl besteht, wenn eine ihrer Lesarten in den Daten steht. Datumsangaben zählen auch in ihren deutschen Formen, ein gespeichertes `2027-02-01` macht also `1.2.2027` zulässig. Die Zahlen 0 und 1 bestehen immer, für Formulierungen wie „1 Balkon“.

Die bekannten Zahlen stammen aus den aktuellen Fakten, nicht aus den rohen Notizen. Sobald der Makler 4 Zimmer angegeben hat, scheitert eine „3-Zimmer-Wohnung“, obwohl die 3 in den Notizen steht.

Bei einem Fehler lehnt das Tool das ganze Exposé ab, nennt jede erfundene Zahl mit zwanzig Zeichen Kontext und weist das Modell an, nichts zu addieren oder zu runden. Der Prompt verbietet berechnete Werte schon, etwa eine Warmmiete als Summe aus Kaltmiete und Nebenkosten. Die Prüfung fängt es ab, wenn das Modell es vergisst. Der Agent hat zwei Korrekturversuche. Ein dritter Fehlschlag beendet den Lauf mit den betroffenen Zahlen, denn ein Lauf, der nicht ohne erfundene Zahlen schreiben kann, soll aufhören, statt zu exportieren.

Der Umfang ist bewusst eng. Die Prüfung sieht Zahlen, keine Aussagen. Ein falsches Wort, ein Merkmal, das es nicht gibt, oder eine echte Zahl an der falschen Stelle kommen durch. Der aufgezeichnete Lauf unten hat ein Beispiel.

## Der Export verweigert, bis die Daten vollständig sind

`export_openimmo` prüft, bevor es etwas baut: kein fehlendes Pflichtfeld, kein offener Widerspruch, Fotos analysiert, ein Exposé angenommen. Sonst verweigert es mit Begründung, und das Modell muss das zuerst beheben.

Das XML zielt auf OpenImmo 1.2.7 mit einem Anbieter und einer Immobilie: Kategorie, Adresse, Kaltmiete, Flächen, Ausstattung, Energieausweis, die deutschen Texte, die Fotos mit dem Titelbild als `TITELBILD` und der Block für die technische Verwaltung. Deutsch ist der Portaltext. Die englische Fassung wird daneben als JSON gespeichert.

Die Validierung hat zwei Modi. Die offizielle XSD (XML Schema Definition) darf nicht weitergegeben werden und liegt deshalb nicht im Repository. Unter `schemas/openimmo_127b.xsd` abgelegt, wird sie über `xmllint-wasm` genutzt, das unter Windows ohne native Bindings auskommt. Ohne sie läuft eine handgeschriebene Prüfung der Pflichtelemente und ihrer Reihenfolge, und die Seite kennzeichnet das Ergebnis als „fallback check“. Der aufgezeichnete Lauf nutzte diese Ersatzprüfung.

## Ein aufgezeichneter Lauf

Am Morgen des 19. November 2026 brauchte ein Live-Lauf mit dem Beispiel 84,5 Sekunden vom Start bis zum Export, darin etwa 30 Sekunden, in denen ein Mensch die beiden Formulare ausfüllte:

```text
  5.4 s  record_facts      12 facts, 1 rejected (“Süd” is not an orientation)
 20.9 s  analyze_photos    16 photos, 3 poor (14-dark, 15-blurry, 16-duplicate)
                           cover 01-living
 23.3 s  read_floor_plan   4 rooms, 82.5 m², balcony
 24.9 s  record_facts      balcony_orientation: south
 24.9 s  check_listing     6 energy fields missing, 1 conflict
 31.4 s  ask_broker        rooms: notes 3, plan 4  ->  answered 4
 35.7 s  ask_broker        all six energy certificate fields in one form
 75.7 s  submit_expose     accepted: “4-Zimmer-Wohnung mit Südbalkon in
                           Hamburg-Eimsbüttel”
 77.3 s  export_openimmo   openimmo.xml valid (fallback check)
```

Der Lauf verbrauchte etwa 21.000 Eingabe-Tokens, 3.600 Ausgabe-Tokens und 15.000 aus dem Prompt-Cache gelesene Tokens. Das Exposé nennt 4 Zimmer, 82,5 m² aus dem Grundriss und schreibt Datumsangaben aus, wie der Prompt es verlangt. Die Zahlenprüfung nahm es beim ersten Versuch an.

Am interessantesten war die Abschlussnachricht des Agenten an den Makler. Die Beispielfotos stammen aus einer Stockfoto-Serie, nicht aus einer echten Wohnung, und der Agent hat das bemerkt. Er meldete, dass das Flurfoto in Wahrheit eine zweite Küche mit Gasherd zeigt, dass zwei Fotos ein Fischgrätparkett haben, das es im Rest der Wohnung nicht gibt, und dass auf dem Badfoto keine Wanne zu sehen ist, obwohl die Notizen eine nennen.

Diese Nachricht zeigt auch am deutlichsten, wo die Prüfungen enden. Das Exposé, das er gerade eingereicht hatte, sagte weiterhin „Bad mit Wanne“, weil die Notizen es so sagten und die Zahlenprüfung keine Wörter liest. Es war richtig, dass der Agent den Zweifel an den Makler weitergab, statt die Notizen zu überstimmen. Ein System, das sich darauf verlässt, dass der Agent den Zweifel äußert, garantiert ihn aber nicht.

## Was vor dem Workshop kaputtging

Ein früherer Lauf am selben Morgen exportierte gar nicht. Das Foto- und das Grundriss-Tool teilen sich eine Hilfsfunktion für strukturierte Vision-Aufrufe, und diese zwang das Modell, über genau ein bestimmtes Tool zu antworten. Opus 5.5 und Sonnet 5.5 lehnen ein erzwungenes `tool_choice` auf Bedrock mit HTTP 400 ab. Jeder Aufruf von `analyze_photos` und `read_floor_plan` scheiterte.

Der Rest des Systems verhielt sich wie vorgesehen:

- Weil der Grundriss nicht lesbar war, fragte der Agent den Makler nach der Wohnfläche, statt sie zu schätzen.
- Der Export verweigerte mit „photos not analysed“, also ging kein Inserat mit ungeprüften Fotos hinaus.
- Der Lauf endete als `incomplete`, und die Abschlussnachricht listete, was erledigt war, was nicht und warum.
- Außerdem bemerkte er, dass der eingetippte Energieausweis am 1. Januar 2027 ablief, einen Monat bevor die Wohnung frei wird, und bat den Makler, das zu bestätigen.

Die Korrektur: das Tool mit `tool_choice: auto` und einer Zeile im System-Prompt anfordern und die Eingabe des Tools weiterhin im Code gegen das Schema prüfen. Antwortet das Modell doch einmal in Prosa, scheitert der Aufruf deutlich, statt eine leere Fotoanalyse zu liefern.

## Ein Sicherheitsnetz für die Bühne

Eine Live-Demo hängt davon ab, dass ein entferntes Modell rechtzeitig antwortet. Jeder Lauf wird mit den Zeitpunkten seiner Ereignisse und den Antworten des Maklers in `runs/` gespeichert. Der Replay-Modus spielt einen gespeicherten Lauf in seinem ursprünglichen Tempo ab. Eine Frage hält weiterhin an, mit den aufgezeichneten Antworten vorausgefüllt, sodass der Vortragende denselben Moment durchklickt wie live. Ein guter Lauf, kopiert nach `runs/known-good.json`, ist einen Klick entfernt, wenn Bedrock langsam ist oder ausfällt.

## Tests ohne Modell

Alle Tests laufen offline mit geskripteten Modellen: 65 Tests für die Zahlenprüfung, den Datensatz, die Fotomessungen, den OpenImmo-Builder, die Tools, den Loop, den Bedrock-Adapter, die HTTP-API, das Replay und das Antwortformular. Die Loop-Tests spielen den ganzen Weg durch, von einem Widerspruch über `ask_broker` und eine gespeicherte Antwort bis zum Export. Ein Live-Test der beiden Vision-Aufrufe läuft nur mit `LIVE=1`.

Was es noch nicht gibt, ist eine Evaluierungssuite wie beim [Agenten für Immobilienanfragen](/de/writing/proptech-inquiry-agent/). Die Belege hier sind Tests, zwei aufgezeichnete Läufe und ein Live-Workshop. Das zeigt, dass der Ablauf mit dem Beispiel funktioniert. Es misst nicht, wie oft der Agent ein Inserat richtig erstellt.

## Orientierung im Code

```text
packages/core     record (facts and sources), photo checks, vision calls,
                  number check, OpenImmo, tools, loop
packages/server   Bedrock adapter, HTTP API with SSE, run registry,
                  replay, CLI
apps/web          the three-pane page
data/sample       13 stock photos, 3 planted bad ones, a floor plan,
                  the notes, the agency's tone guide
```

Wie beim Agenten für Immobilienanfragen hat `core` keine Imports von Modellanbietern oder HTTP. Das Modell ist eine `ModelClient`-Schnittstelle, und der Bedrock-Adapter in `server` ist eine Implementierung davon.

Die interessanten Dateien sind kurz. [`guards/numbers.ts`](https://github.com/srnux/listing-creation-agent/blob/main/packages/core/src/guards/numbers.ts) ist die Zahlenprüfung, [`domain/compare.ts`](https://github.com/srnux/listing-creation-agent/blob/main/packages/core/src/domain/compare.ts) die Erkennung von Widersprüchen, [`agent/tools.ts`](https://github.com/srnux/listing-creation-agent/blob/main/packages/core/src/agent/tools.ts) jede Regel, an der das Modell nicht vorbeikommt.

## Ausprobieren

Nötig sind Node.js 20 oder neuer, pnpm und Zugriff auf Claude Opus 5.5 und Sonnet 5.5 auf Bedrock im EU-Inferenzprofil:

```bash
git clone https://github.com/srnux/listing-creation-agent
cd listing-creation-agent
pnpm install
cp .env.example .env   # AWS_REGION and AWS_BEARER_TOKEN_BEDROCK, or your AWS profile
pnpm check-models      # are both models reachable?
pnpm dev
```

Die Seite öffnen, die Vite ausgibt (standardmäßig Port 6014), „Load sample“ und dann „Create listing“ klicken. Bei den Zimmern 4 antworten und das Formular zum Energieausweis ausfüllen.

Im Terminal führt `pnpm sample` denselben Ablauf aus und stellt die Fragen, `pnpm sample --auto` beantwortet sie mit Beispielwerten. `pnpm test` und `pnpm typecheck` brauchen kein AWS-Konto (Amazon Web Services).

## Was noch offen ist

Die nützliche Erkenntnis deckt sich mit der aus dem Agenten für Immobilienanfragen: Ein Prompt kann eine Regel beschreiben, aber nur Code kann sie durchsetzen. Das Modell wählte eine sinnvolle Reihenfolge und schrieb gutes Deutsch. Die Teile, die stimmen mussten, keine Zahl, die nicht im Datensatz steht, kein Export ohne Energieausweis, keine geratene Zimmerzahl, sind die Teile, die der Code durchsetzt.

Die Lücken sind die, die dieser Artikel nennt. Die Zahlenprüfung sieht keine Aussagen, ein Merkmal aus den Notizen, dem die Fotos widersprechen, landet also trotzdem im Exposé. Andere Uploads als das Beispiel funktionieren nach bestem Bemühen, und die Schwellenwerte für Fotos sind auf dieses Beispiel abgestimmt. Sprachnotizen, Upload an Portale und ein MCP-Server (Model Context Protocol) sind bisher nicht vorgesehen. Und es gibt noch keine Evaluierungssuite, also keine gemessene Genauigkeit, nur einen Ablauf, der nachweislich funktioniert hat.
