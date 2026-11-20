---
title: "Das Saga Pattern in der Praxis: Kompensationen, Pivots und die schwierigen Stellen"
description: "Wie das Saga Pattern eine Datenbanktransaktion durch eine Kette lokaler Transaktionen ersetzt, warum der Pivot-Schritt am wichtigsten ist und was im Produktivbetrieb schiefgeht, mit einem Beispiel in AWS (Amazon Web Services) Step Functions."
tags: [architektur, aws, microservices, serverless]
---

In einem Monolithen mit einer Datenbank läuft ein fachlicher Vorgang in einer einzigen ACID-Transaktion (Atomicity, Consistency, Isolation, Durability). Entweder wird alles festgeschrieben oder nichts. Sobald jeder Dienst seine eigene Datenbank besitzt, ist diese Garantie weg.

Ein verteilter Two-Phase Commit ist technisch möglich, sperrt aber Ressourcen über Dienste hinweg, verlangt, dass alle Beteiligten gleichzeitig erreichbar sind, und wird von den meisten Cloud-Diensten gar nicht unterstützt. DynamoDB kann es nicht, Amazon Simple Queue Service kann es nicht, und übliche Zahlungsanbieter können es auch nicht.

Eine Saga ersetzt diese eine große Transaktion durch eine **Folge lokaler Transaktionen**. Jede wird für sich festgeschrieben. Schlägt ein späterer Schritt fehl, werden die früheren durch **kompensierende Transaktionen** rückgängig gemacht. Sie geben sofortige Konsistenz auf und erhalten **letztendliche Konsistenz** (Eventual Consistency) mit einem ausdrücklichen, fachlichen Rückgängigmachen.

Die Idee ist älter als Microservices. Hector Garcia-Molina und Kenneth Salem haben sie 1987 im Aufsatz „Sagas“ für langlaufende Datenbanktransaktionen beschrieben. In der [Übersicht über 20 Cloud Design Patterns](/de/writing/cloud-design-patterns/) ist sie Pattern D1, neben ihrem Partner D2, Compensating Transaction. Dieser Artikel geht in die Details, die eine Übersicht weglassen muss.

## Drei Arten von Schritten

Das ist die nützlichste Idee beim Entwurf einer echten Saga. Jeder Schritt gehört zu einer von drei Kategorien:

1. **Kompensierbare Schritte** liegen vor dem Point of No Return, und jeder hat eine Gegenaktion. Beispiele sind „Bestand reservieren“ (Gegenaktion: Bestand freigeben) und „Zahlung autorisieren“ (Gegenaktion: Autorisierung stornieren).
2. **Der Pivot-Schritt** ist die Entscheidung über Weitermachen oder Abbrechen. Sobald er festgeschrieben ist, muss die Saga zu Ende laufen. Beispiele sind „Zahlung einziehen“ und „Vertrag unterschreiben“.
3. **Wiederholbare Schritte** folgen nach dem Pivot. Sie haben keine Gegenaktion und dürfen nicht dauerhaft scheitern, deshalb werden sie wiederholt, bis sie gelingen. Beispiele sind „Bestätigungs-E-Mail senden“ und „Suchindex aktualisieren“.

**Entwurfsregel:** Ordnen Sie die Schritte so, dass riskante Schritte, die wahrscheinlich scheitern, früh laufen, solange sie sich noch kompensieren lassen. Nach dem Pivot gehören nur Schritte, die garantiert gelingen.

## Ausprobieren: eine Saga für das Mieter-Onboarding

Das durchgehende Beispiel in diesem Artikel ist das Onboarding eines Mietvertrags aus der Proptech-Welt. Es hat fünf Schritte:

1. Die Immobilie reservieren, damit das Angebot als „reserviert“ erscheint. Kompensierbar.
2. Die Bonitätsprüfung des Mieters durchführen. Kompensierbar.
3. Der Mieter unterschreibt den Vertrag. Das ist der Pivot.
4. Die Kaution einziehen. Wiederholbar.
5. Die Immobilienportale aktualisieren. Wiederholbar.

Die Wiederholung deckt einen kurz nicht erreichbaren Zahlungsdienst ab. Ein Mieter, der nie zahlt, ist ein fachlicher Vorgang, etwa ein Mahnverfahren, keine Kompensation.

Scheitert die Bonitätsprüfung oder unterschreibt der Mieter nicht innerhalb von sieben Tagen, verwirft die Saga das Ergebnis der Bonitätsprüfung und gibt die Reservierung frei, sodass das Angebot wieder auf den Markt kommt. Ein Timeout zählt ebenfalls als Fehler.

Wählen Sie ein Szenario und sehen Sie zu, was rückgängig gemacht wird. Die Demo ist auf Englisch.

<div class="saga-demo">
<saga-stepper theme="dark" style="--saga-font:Inter,-apple-system,'Segoe UI',sans-serif;--saga-text:#e8e8e8;--saga-muted:#9a9a9a;--saga-surface:#0c0c0c;--saga-card:#000;--saga-border:#2a2a2a;--saga-radius:2px"></saga-stepper>
<noscript><img src="/images/writing/saga-sign-dark.gif" width="896" height="465" alt="Animation der Onboarding-Saga, wenn der Mieter nicht unterschreibt. Der Vertragsschritt scheitert, danach wird das Ergebnis der Bonitätsprüfung verworfen und die Reservierung der Immobilie freigegeben."></noscript>
</div>

<script type="module" src="/js/saga-stepper.js"></script>

Die vier Szenarien decken die Fälle ab, auf die es ankommt. Im Normalfall wird jeder Schritt festgeschrieben. Eine gescheiterte Bonitätsprüfung kompensiert den einen Schritt davor. Unterschreibt der Mieter nicht, liegt der Fehler am Pivot selbst, also wird alles davor kompensiert. Ein unzuverlässiger Kautionsdienst scheitert nach dem Pivot, deshalb wird er wiederholt und nie kompensiert.

## Choreografie oder Orchestrierung

Jemand muss entscheiden, welcher Schritt als nächster läuft. Dafür gibt es zwei Wege.

<figure>
<img src="/images/writing/choreography-vs-orchestration-dark.svg" width="1200" height="600" alt="Vergleichsdiagramm. Links Choreografie: Die Dienste Order, Inventory und Payment veröffentlichen auf einem gemeinsamen Event Bus wie EventBridge oder Kafka und abonnieren ihn. Rechts Orchestrierung: Ein zentraler Saga-Orchestrator hält die Zustandsmaschine, sendet Befehle an die Dienste Order, Inventory und Payment und empfängt ihre Antworten.">
<figcaption>Das Diagramm ist auf Englisch.</figcaption>
</figure>

### Choreografie: ohne zentralen Koordinator

Jeder Dienst hört auf Ereignisse, erledigt daraufhin seine lokale Arbeit und veröffentlicht das nächste Ereignis.

```text
Order Service      → publishes OrderCreated
Inventory Service    hears OrderCreated  → reserves stock → publishes StockReserved
Payment Service      hears StockReserved → charges card  → publishes PaymentFailed
Inventory Service    hears PaymentFailed → releases stock
Order Service        hears PaymentFailed → marks order Cancelled
```

- **Geeignet für:** kurze Abläufe mit zwei bis vier Schritten, lose gekoppelte Teams und Systeme, die mit EventBridge oder Kafka ohnehin ereignisgetrieben sind.
- **Probleme:** Der Ablauf existiert nur implizit, verteilt über viele Dienste. Die Frage „wo steht Bestellung 4711 gerade?“ ist schwer zu beantworten. Zyklische Abhängigkeiten zwischen Ereignissen schleichen sich ein, und ein zusätzlicher Schritt bedeutet Änderungen an mehreren Diensten.

### Orchestrierung: ein zentraler Koordinator

Ein Orchestrator hält die Zustandsmaschine und sagt jedem Dienst per Befehl, was er tun soll.

- **Geeignet für:** längere Abläufe, komplexe Verzweigungen, Timeouts, Freigaben durch Menschen und jeden Ablauf, bei dem Prüfer oder Support den aktuellen Stand sehen müssen.
- **Probleme:** Der Orchestrator ist eine weitere Komponente, die betrieben werden will, und Geschäftslogik sammelt sich gern darin, bis ein „God Orchestrator“ entsteht.
- **Werkzeuge:** AWS (Amazon Web Services) Step Functions, Temporal, Camunda und Zeebe, Azure Durable Functions und die Sagas in `@nestjs/cqrs` für Fälle innerhalb eines Prozesses.

**Praxisregel:** Beginnen Sie mit Choreografie für einfache Reaktionen. Wechseln Sie zur Orchestrierung, sobald ein Ablauf mehr als etwa vier Schritte hat, Timeouts braucht oder auch für Menschen ohne Entwicklerhintergrund nachvollziehbar sein muss.

## Wo Sagas eingesetzt werden

### 1. Bestellabwicklung im Onlinehandel

Der Lehrbuchfall. Bestellung anlegen, Bestand reservieren, Zahlung autorisieren, **Zahlung einziehen (Pivot)**, Versand planen, Bestätigung senden. Scheitert die Autorisierung der Zahlung, wird der Bestand freigegeben und die Bestellung storniert.

### 2. Reisebuchung

Flug buchen, Hotel buchen, Mietwagen buchen. Scheitert der Mietwagen, werden Hotel und Flug storniert. Mit diesem Beispiel werden Sagas am häufigsten erklärt. Kompensationen verursachen hier oft Kosten, etwa Stornogebühren. Deshalb ist eine Kompensation eine fachliche Entscheidung und kein technisches Rollback.

### 3. Banken und Zahlungen

Eine Überweisung zwischen Konten in verschiedenen Systemen: Quellkonto belasten, Zielkonto gutschreiben, beide Seiten benachrichtigen. Die Kompensation ist eine Gegenbuchung, nie ein Löschen, denn Kontobücher werden nur fortgeschrieben. Das passt ganz natürlich zu Event Sourcing.

### 4. Versicherungsschäden

Schaden erfassen, Deckung prüfen, Betrugsprüfung durchführen, auf die Freigabe des Gutachters warten (ein menschlicher Schritt, der Tage dauern kann), auszahlen, Schaden schließen. Langlaufende Sagas mit menschlichen Schritten sind der Bereich, in dem sich Orchestrierung mit dauerhaften Timern wirklich auszahlt, zum Beispiel Step Functions mit Task Tokens oder Temporal.

### 5. Proptech: Onboarding eines Mietvertrags

Das durchgehende Beispiel aus der Demo oben. Immobilie reservieren, Bonität prüfen, **der Mieter unterschreibt (Pivot)**, Kaution einziehen, Immobilienportale aktualisieren. Eine gescheiterte Bonitätsprüfung oder eine fehlende Unterschrift nach sieben Tagen gibt die Immobilie wieder frei.

### 6. Bereitstellung von Kunden und Konten in SaaS (Software as a Service)

Mandanten anlegen, eine Datenbank oder ein Schema bereitstellen, den Admin-Benutzer im Identity Provider anlegen, das Abrechnungsabonnement einrichten, eine Begrüßungs-E-Mail senden. Scheitert die Einrichtung der Identität, wird das Schema gelöscht und der Mandanteneintrag entfernt. Das kommt häufig nach Übernahmen vor, wenn Konten auf mehreren zusammengeführten Plattformen angelegt werden müssen.

### 7. Agentische Workflows

Ein Lauf eines KI-Agenten, der über mehrere Werkzeuge hinweg Nebenwirkungen erzeugt, hat die Form einer Saga, ob er als solche entworfen wurde oder nicht: mehrere lokale Schritte und keine Transaktion, die sie umspannt. Was ihm fehlt, solange niemand sie ergänzt, sind die Kompensationen. Zum Beispiel: Branch anlegen, Code generieren, Pull Request öffnen, Ticket verknüpfen, das Team im Channel benachrichtigen. Lehnt der Review-Agent die Änderung ab, bestehen die Kompensationen darin, den Pull Request zu schließen, den Branch zu löschen und den Ticketstatus zurückzusetzen.

Werden die Werkzeugaufrufe eines Agenten als Saga-Schritte mit ausdrücklichen Kompensationen behandelt, hinterlässt ein gescheiterter Lauf einen sauberen Zustand statt verwaister Branches und halb aktualisierter Tickets. Orchestrierung passt hier am besten, weil das Agenten-Harness ohnehin als Orchestrator arbeitet.

## Umsetzung mit Step Functions und dem CDK (Cloud Development Kit)

Hier ist die Onboarding-Saga als Zustandsmaschine in Step Functions, definiert mit dem AWS CDK in TypeScript. Drei Mechanismen erledigen die Arbeit:

- **Retry** behandelt vorübergehende Fehler innerhalb eines Schritts.
- **Catch plus eine Kompensationskette** behandelt ein endgültiges Scheitern vor dem Pivot.
- **Nach dem Pivot** gibt es keine Kompensation, nur geduldige Wiederholungen und eine Benachrichtigung an einen Menschen.

Der Code und seine Kommentare sind auf Englisch, wie im Quelltext üblich.

<!-- site-only -->
<div class="gist-embed">
<script src="https://gist.github.com/srnux/367d79f3f3e03c258542d55c0b2a8741.js"></script>
<noscript><p><a href="https://gist.github.com/srnux/367d79f3f3e03c258542d55c0b2a8741">Code auf GitHub Gist ansehen</a></p></noscript>
</div>
<!-- /site-only -->

Der Code besteht die Typprüfung mit `tsc --strict` gegen `aws-cdk-lib` 2.277.0. Das Beispiel zeigt den Kontrollfluss. Produktivcode braucht zusätzlich eine dauerhafte Wiederaufnahme und Eskalation gescheiterter Kompensationen sowie Idempotenz in jedem Handler. Step Functions liefert außerdem einen visuellen Ausführungsverlauf, sodass sich die Frage „wo hängt dieses Onboarding?“ in der Konsole beantworten lässt.

## Die schwierigen Stellen

In den Diagrammen sehen Sagas aufgeräumt aus. An diesen sieben Stellen gehen sie im Produktivbetrieb schief.

### 1. Idempotenz überall

Nachrichten werden doppelt zugestellt, und Orchestratoren wiederholen Aufrufe. Jeder Schritt und jede Kompensation muss sich gefahrlos mehrfach ausführen lassen. Geben Sie die Saga-ID zusammen mit dem Schrittnamen als Idempotenzschlüssel mit und speichern Sie die verarbeiteten Schlüssel, etwa in DynamoDB mit einem bedingten Schreibzugriff.

### 2. Das Dual-Write-Problem

Ein Dienst muss seine Datenbank aktualisieren und ein Ereignis veröffentlichen. Stürzt er zwischen beidem ab, bleibt die Saga stehen oder läuft auseinander. Die Lösung ist die Transactional Outbox: Das Ereignis wird in derselben lokalen Transaktion in eine Outbox-Tabelle geschrieben und von dort veröffentlicht. Das Veröffentlichen kann Change Data Capture übernehmen, etwa DynamoDB Streams oder Debezium für PostgreSQL, oder ein Relay, das die Tabelle regelmäßig abfragt.

### 3. Fehlende Isolation

Eine Saga gibt das „I“ in ACID auf. Andere Anfragen sehen Zwischenzustände: Ein zweiter Mieter könnte eine Immobilie als verfügbar sehen, während die Saga des ersten noch läuft. Gegenmaßnahmen:

- **Semantische Sperre:** ein Statusfeld wie `PENDING_ONBOARDING`, das andere Abläufe respektieren.
- **Kommutative Änderungen:** Operationen so entwerfen, dass ihre Reihenfolge keine Rolle spielt, zum Beispiel Erhöhen und Verringern statt „auf Wert setzen“.
- **Erneutes Lesen:** vor dem Pivot-Schritt prüfen, dass sich die Daten nicht geändert haben.
- **Versionsprüfung:** optimistisches Sperren mit einer Versionsnummer.

### 4. Auch Kompensationen können scheitern

Ein Erstattungsaufruf kann in einen Timeout laufen. Kompensationen müssen wiederholbar sein und dürfen nicht aufgeben. Gelingt eine endgültig nicht, kommt sie in eine Dead-Letter-Queue, und ein Mensch wird benachrichtigt. Planen Sie immer einen Weg für manuelle Eingriffe ein.

### 5. Nicht alles lässt sich rückgängig machen

Eine versendete E-Mail oder Textnachricht lässt sich nicht zurückholen. Solche Schritte gehören entweder hinter den Pivot, oder sie werden fachlich kompensiert, mit einer E-Mail wie „Ihre Buchung wurde leider storniert“.

### 6. Timeouts sind Fehler

Ein Schritt, der nie antwortet, ist schlimmer als einer, der scheitert. Jeder Schritt braucht einen Timeout und einen ausdrücklichen Wiederherstellungspfad. Vor dem Pivot kann das eine Kompensation sein. Nach dem Pivot wird der Schritt wiederholt oder zur manuellen Bearbeitung eskaliert. Langlaufende Sagas brauchen dauerhafte Timer, kein `setTimeout` im Arbeitsspeicher.

Ein Timeout beweist allerdings nicht, dass nichts passiert ist. Der Aufruf kann erfolgreich gewesen sein, und nur die Antwort ging verloren. Im Beispiel kann der Zahlungsdienstleister die Kaution eingezogen haben, obwohl die Saga nie eine Antwort erhielt, und eine Wiederholung ohne Idempotenzschlüssel belastet den Mieter dann zweimal. Nach einem Timeout gilt es deshalb zuerst herauszufinden, was der Teilnehmer tatsächlich getan hat. Eine Wiederholung mit demselben Idempotenzschlüssel ist sicher, weil ein Schritt, der schon gelaufen ist, sein ursprüngliches Ergebnis zurückgibt, statt erneut zu laufen. Bietet ein Teilnehmer eine Statusabfrage über diesen Schlüssel an, beantwortet sie die Frage direkt. Klärt beides die Lage nicht, markieren Sie den Schritt als ungeklärt und lassen einen Abgleich später beide Seiten vergleichen, statt in die eine oder andere Richtung zu raten.

### 7. Beobachtbarkeit

Reichen Sie eine Korrelations-ID, die Saga-ID, durch jede Nachricht und jede Logzeile. Speichern Sie den Zustand der Saga (aktueller Schritt, Status, Verlauf), damit der Support die Frage „was ist mit dieser Bestellung passiert?“ beantworten kann. Bei Choreografie ist verteiltes Tracing mit OpenTelemetry oder AWS X-Ray nahezu Pflicht.

## Wann Sie keine Saga brauchen

- **Alle Daten liegen in einer Datenbank.** Nehmen Sie eine normale lokale Transaktion. Eine Saga ist dort reiner Mehraufwand.
- **Die Dienstgrenzen stimmen nicht.** Wenn zwei Dienste immer gemeinsam in einer Transaktion geändert werden müssen, gehören sie vermutlich in einen Dienst. Sie zusammenzulegen ist oft besser, als eine Saga zwischen ihnen zu bauen.
- **Das Geschäft verlangt strikte, sofortige Konsistenz** und verträgt keine sichtbaren Zwischenzustände. Dann brauchen Sie einen anderen Entwurf, etwa einen einzigen Eigentümer der Daten oder Reservierungen mit harten Sperren.
- **Ein einfacher Schritt plus eine Benachrichtigung.** Publisher-Subscriber mit einem wiederholbaren Verbraucher reicht.

## Wie es mit den anderen Patterns zusammenhängt

Die Saga steht in der Mitte mehrerer Patterns aus der [Übersicht über 20 Cloud Design Patterns](/de/writing/cloud-design-patterns/):

- **[Compensating Transaction (D2)](/de/writing/cloud-design-patterns/#d2-compensating-transaction):** die Kompensationsseite jeder Saga.
- **[Retry (A1)](/de/writing/cloud-design-patterns/#a1-retry) und [Circuit Breaker (A2)](/de/writing/cloud-design-patterns/#a2-circuit-breaker):** innerhalb jedes Schritts, bevor aufgegeben und kompensiert wird.
- **[Publisher-Subscriber (B3)](/de/writing/cloud-design-patterns/#b3-publisher-subscriber) und [Queues (B1)](/de/writing/cloud-design-patterns/#b1-queue-based-load-leveling):** der Transportweg für choreografierte Sagas und für Befehle des Orchestrators.
- **[Event Sourcing (C3)](/de/writing/cloud-design-patterns/#c3-event-sourcing):** macht Saga-Zustand und Kompensationen natürlich, weil eine Kompensation ein angehängtes Gegenereignis ist.
- **[Sharding (C4)](/de/writing/cloud-design-patterns/#c4-sharding) und eine Datenbank pro Dienst:** der Grund, warum Sagas überhaupt nötig sind, sobald keine einzelne Transaktion die Daten umspannt.
- **Transactional Outbox:** keines der 20 Patterns, aber das, was Sagas in der Praxis zuverlässig macht.

## Weiterführende Literatur

Alle Quellen sind auf Englisch.

- Hector Garcia-Molina und Kenneth Salem, [„Sagas“](https://doi.org/10.1145/38713.38742), Proceedings of SIGMOD (Special Interest Group on Management of Data) 1987
- Microsoft Azure Architecture Center, [Saga design pattern](https://learn.microsoft.com/azure/architecture/patterns/saga)
- Chris Richardson, [Pattern: Saga](https://microservices.io/patterns/data/saga.html)
- AWS Prescriptive Guidance, [Saga choreography pattern](https://docs.aws.amazon.com/prescriptive-guidance/latest/cloud-design-patterns/saga-choreography.html) und [Saga orchestration pattern](https://docs.aws.amazon.com/prescriptive-guidance/latest/cloud-design-patterns/saga-orchestration.html)
