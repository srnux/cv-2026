---
title: "20 Cloud Design Patterns, gruppiert nach dem Problem, das sie lösen"
description: "Zwanzig Cloud Design Patterns in sechs Gruppen, sortiert nach dem Problem, das sie lösen: wann jedes hilft, wo es in echten Cloud-Diensten vorkommt und wie die Patterns zusammenspielen."
tags: [architektur, cloud, aws, microservices]
---

Die meisten Übersichten zu Cloud Design Patterns sind genau das: Listen. Zwanzig Namen in alphabetischer Reihenfolge, jeder mit einer Definition. Man kann sie alle lesen und weiß trotzdem nicht, wozu man greifen soll, wenn ein nachgelagerter Dienst mitten in der Nacht in Timeouts läuft.

Leichter zu lernen und leichter auszuwählen sind die Patterns, wenn man sie nach dem Problem gruppiert, das sie lösen. Die meisten Verbindungen zwischen ihnen verlaufen innerhalb dieser Gruppen: Retry und Circuit Breaker gehören zusammen, weil beide mit fehlschlagenden Aufrufen umgehen, Saga und Compensating Transaction, weil beide Arbeit über mehrere Datenbanken hinweg betreffen. Deshalb sortiert dieser Artikel 20 bekannte Patterns in sechs Gruppen, von A (Resilienz) bis F (Betrieb und Weiterentwicklung), und nummeriert sie von A1 bis F3, damit Sie Text und Infografik einander zuordnen können.

Zu jedem Pattern steht hier, was es tut, wann es hilft, wo es in echten Diensten vorkommt, worauf zu achten ist und wie es mit den anderen zusammenhängt. Die Beispiele stützen sich auf AWS (Amazon Web Services), mit Entsprechungen aus Azure und Open Source, wo diese verbreitet sind.

<figure>
<a href="/images/writing/cloud-design-patterns-grouped-dark.png"><img src="/images/writing/cloud-design-patterns-grouped-dark-1600.png" width="1600" height="1848" alt="Infografik mit 20 Cloud Design Patterns in sechs Gruppen. A Resilienz: Retry, Circuit Breaker, Bulkhead, Health Endpoint Monitoring. B Nachrichten und Last: Queue-Based Load Leveling, Competing Consumers, Publisher-Subscriber. C Daten: Cache-Aside, CQRS (Command Query Responsibility Segregation), Event Sourcing, Sharding. D Verteilte Transaktionen: Saga, Compensating Transaction. E Gateway und Edge: Backends for Frontends, Gateway Routing, Gateway Aggregation, Gateway Offloading. F Betrieb und Weiterentwicklung: Sidecar, Strangler Fig, External Configuration Store."></a>
<figcaption>Die 20 Patterns in sechs Gruppen. Ein Klick auf das Bild öffnet die Version in voller Größe. Die Infografik ist auf Englisch.</figcaption>
</figure>

<nav class="toc" aria-label="Inhalt">

**Direkt zur Gruppe:** [A Resilienz](#gruppe-a-resilienz) · [B Nachrichten und Last](#gruppe-b-nachrichten-und-last) · [C Daten](#gruppe-c-daten) · [D Verteilte Transaktionen](#gruppe-d-verteilte-transaktionen) · [E Gateway und Edge](#gruppe-e-gateway-und-edge) · [F Betrieb und Weiterentwicklung](#gruppe-f-betrieb-und-weiterentwicklung) · [Typische Kombinationen](#wie-die-patterns-in-der-praxis-zusammenspielen) · [Faustregel](#faustregel-für-die-auswahl)

</nav>

## Gruppe A: Resilienz

Ausfälle überstehen, ohne dass das ganze System mitfällt.

### A1. Retry

- **Was:** Wiederholt automatisch einen Aufruf, der aus einem vorübergehenden Grund fehlgeschlagen ist, etwa durch einen Timeout, Drosselung oder eine kurze Netzwerkstörung. Meist wartet es vor jedem neuen Versuch länger (exponentielles Backoff) und streut diese Wartezeit zufällig (Jitter).
- **Wann:** Bei Aufrufen von Datenbanken, Queues und externen Diensten, deren Fehler nur kurz andauern.
- **Wo:** Das AWS Software Development Kit wiederholt gedrosselte Aufrufe standardmäßig. Weitere typische Stellen sind HttpClient-Interceptors in Angular und Polly in .NET.
- **Vorsicht:** Nur Operationen wiederholen, die sich gefahrlos mehrfach ausführen lassen (idempotent). Validierungsfehler nie wiederholen. Wiederholungen ohne Obergrenze verschlimmern Ausfälle, so entstehen „Retry Storms“.
- **Verbindungen:** Retry fängt kurze Ausfälle ab, Circuit Breaker lange. Deshalb treten die beiden fast immer gemeinsam auf.

### A2. Circuit Breaker

- **Was:** Nach einer festgelegten Zahl von Fehlern „öffnet“ der Breaker und schlägt sofort fehl, ohne die Abhängigkeit aufzurufen. Nach einer Abkühlphase lässt er einen Testaufruf durch (der Zustand „half-open“). Gelingt dieser, schließt der Breaker wieder.
- **Wann:** Ein nachgelagerter Dienst ist langsam oder ausgefallen, und das Warten darauf würde Threads und Verbindungen blockieren.
- **Wo:** Bibliotheken wie opossum (Node.js), resilience4j (Java) und Polly (.NET). Service Meshes wie Istio bieten es als Outlier Detection an. Ein typischer Fall ist ein NestJS-Dienst, der ein unzuverlässiges Immobilienportal eines Drittanbieters aufruft.
- **Verbindungen:** Er umschließt Retry. Bulkhead begrenzt den Schaden, solange der Breaker offen ist. Health Endpoint Monitoring kann seinen Zustand speisen.

### A3. Bulkhead

- **Was:** Teilt Ressourcen in isolierte Pools auf, etwa getrennte Thread-Pools, Connection-Pools, Queues oder Cluster, damit ein einzelner Fehler nicht alles versenkt. Der Name kommt von den wasserdichten Schotten eines Schiffs.
- **Wann:** Mehrere Funktionen oder Mandanten teilen sich Infrastruktur, und ein besonders ressourcenhungriger Verbraucher könnte den übrigen die Ressourcen entziehen.
- **Wo:** Getrennte Reserved Concurrency pro Lambda-Funktion, getrennte Node-Pools in Azure Kubernetes Service, ein eigener Datenbank-Connection-Pool für Reporting neben dem für Transaktionen.
- **Verbindungen:** Circuit Breaker stoppt die Aufrufe, Bulkhead begrenzt den Schaden. Sharding wirkt als Bulkhead auf Datenebene.

### A4. Health Endpoint Monitoring

- **Was:** Stellt Endpunkte wie `/health/live` und `/health/ready` bereit, die melden, ob der Dienst und seine Abhängigkeiten funktionieren.
- **Wann:** Für alles hinter einem Load Balancer oder Orchestrator, der entscheiden muss, wohin er Traffic schickt oder ob er etwas neu startet.
- **Wo:** Liveness- und Readiness-Probes in Kubernetes, Target Health Checks des Application Load Balancer, Health Checks in Route 53. NestJS bietet dafür `@nestjs/terminus`.
- **Verbindungen:** Load Balancer und Gateway Routing nutzen es, um ungesunde Instanzen auszusortieren. Gateway Offloading bündelt es oft zentral.

## Gruppe B: Nachrichten und Last

Volumen bewältigen, ohne das Backend zu überlasten.

### B1. Queue-Based Load Leveling

- **Was:** Setzt eine Queue zwischen Erzeuger und Verbraucher, damit Lastspitzen abgefedert werden und das Backend sie in seinem eigenen Tempo abarbeitet.
- **Wann:** Bei schwankender Last wie Importen, E-Mail-Versand oder Dokumentverarbeitung, oder wenn ein Backend nicht so schnell skaliert, wie der Traffic ankommt.
- **Wo:** Amazon Simple Queue Service vor Lambda, Azure Service Bus, RabbitMQ. Ein typisches Beispiel ist der Massen-Upload von Immobilienangeboten.
- **Verbindungen:** Competing Consumers ist der natürliche nächste Schritt. Die Queue fängt auch die Welle ab, die ein Retry Storm sonst auslösen würde.

### B2. Competing Consumers

- **Was:** Mehrere Worker-Instanzen lesen aus derselben Queue, und jede Nachricht geht jeweils an eine davon. Scheitert die Verarbeitung oder läuft sie in einen Timeout, wird die Nachricht wieder sichtbar, und ein anderer Worker kann sie erhalten.
- **Wann:** Sie müssen den Verarbeitungsdurchsatz horizontal skalieren.
- **Wo:** Lambda, das Simple Queue Service abfragt und dabei automatisch skaliert. Kubernetes-Deployments, die mit Kubernetes Event-driven Autoscaling nach Queue-Tiefe skaliert werden.
- **Vorsicht:** Nachrichten können in anderer Reihenfolge oder mehrfach ankommen, deshalb müssen Handler idempotent sein. Fehlschlagende Nachrichten gehören in eine Dead-Letter-Queue.
- **Verbindungen:** Es setzt Queue-Based Load Leveling voraus. Es ist das Gegenstück zu Publisher-Subscriber, wo jeder Abonnent eine Kopie jeder Nachricht erhält.

### B3. Publisher-Subscriber

- **Was:** Ein Publisher sendet ein Ereignis an ein Topic, und jeder interessierte Abonnent bekommt seine eigene Kopie. Der Publisher weiß nicht, wer zuhört.
- **Wann:** Ein Ereignis löst mehrere unabhängige Reaktionen aus. Zum Beispiel führt „Kontakt angelegt“ zu einer Begrüßungs-E-Mail, einer Aktualisierung des Suchindex und einem Analytics-Ereignis.
- **Wo:** Amazon Simple Notification Service, das an mehrere Simple-Queue-Service-Queues verteilt, Amazon EventBridge, Kafka, Azure Event Grid.
- **Verbindungen:** Es ist der Transportweg für Event Sourcing, für Projektionen in CQRS (Command Query Responsibility Segregation) und für choreografierte Sagas. Jeder Abonnent nutzt intern oft Competing Consumers.

## Gruppe C: Daten

Speicher skalieren und dabei Lesezugriffe schnell und Daten konsistent halten.

### C1. Cache-Aside

- **Was:** Die Anwendung prüft zuerst den Cache. Bei einem Fehltreffer lädt sie aus der Datenbank, schreibt das Ergebnis in den Cache und gibt es zurück. Beim Schreiben aktualisiert sie die Datenbank und invalidiert den Cache-Eintrag.
- **Wann:** Bei Daten, die oft gelesen und selten geändert werden, wie Stammdaten, Konfiguration, Benutzerprofile oder Angebotsdetails.
- **Wo:** Redis oder Amazon ElastiCache vor PostgreSQL oder DynamoDB. DynamoDB Accelerator ist eine verwaltete Variante, genau genommen Read-Through statt Cache-Aside.
- **Vorsicht:** Veraltete Daten und eine „Thundering Herd“ von Anfragen, wenn ein beliebter Schlüssel abläuft. Immer eine Ablaufzeit (Time-to-Live) setzen.
- **Verbindungen:** Es ist eine leichtgewichtige Alternative zu einem vollständigen CQRS-Lesemodell.

### C2. CQRS

- **Was:** Getrennte Modelle, oft auch getrennte Speicher, für Schreibzugriffe (Commands) und Lesezugriffe (Queries). Jede Seite lässt sich für sich optimieren und skalieren.
- **Wann:** Lesezugriffe überwiegen Schreibzugriffe deutlich, die Leseformen weichen stark vom Schreibmodell ab, oder eine komplexe Domäne hat umfangreiche Geschäftsregeln auf der Schreibseite.
- **Wo:** Schreiben in PostgreSQL, Lesen aus OpenSearch oder einer denormalisierten DynamoDB-Tabelle. NestJS bietet ein Modul `@nestjs/cqrs`.
- **Vorsicht:** Die Leseseite ist meist nur letztendlich konsistent (Eventual Consistency), und es gibt mehr bewegliche Teile. Für einfache Anwendungen, die nur anlegen, lesen, ändern und löschen, ist es nicht gedacht.
- **Verbindungen:** Sehr oft kombiniert mit Event Sourcing, dessen Ereignisse die Lesemodelle aufbauen, und mit Publisher-Subscriber, das diese Ereignisse transportiert.

### C3. Event Sourcing

- **Was:** Speichert jede Zustandsänderung als unveränderliches Ereignis („PriceChanged“, „ListingPublished“) statt nur des aktuellen Zustands. Der aktuelle Zustand entsteht durch Abspielen der Ereignisse.
- **Wann:** Sie brauchen einen vollständigen Audit-Trail, zeitbezogene Abfragen („wie sah das letzten Dienstag aus?“) oder die Möglichkeit, später neue Projektionen aufzubauen. Typische Domänen sind Banken, Versicherungsschäden und stark regulierte Systeme.
- **Wo:** EventStoreDB, Kafka oder DynamoDB als Append-only-Log mit DynamoDB Streams. Kernbankensysteme sind die klassische Domäne dafür.
- **Vorsicht:** Die Weiterentwicklung von Ereignisschemata (Versionierung) und die Performance beim Abspielen brauchen Snapshots und Planung.
- **Verbindungen:** Es ist oft die Schreibseite von CQRS. Seine Ereignisse speisen Publisher-Subscriber, und es macht Compensating Transactions natürlich, weil eine Kompensation einfach ein weiteres angehängtes Ereignis ist.

### C4. Sharding

- **Was:** Teilt Daten horizontal auf mehrere Datenbanken oder Partitionen auf, anhand eines Shard-Schlüssels wie einer Mandanten-ID oder einer Region.
- **Wann:** Eine einzelne Datenbank stößt an Grenzen bei Speicher, Durchsatz oder Verbindungen, oder Sie brauchen Mandantentrennung oder Datenresidenz.
- **Wo:** Partition Keys in DynamoDB (eingebautes Sharding), Citus für PostgreSQL, Sharded Cluster in MongoDB, eine Datenbank pro Mandant in mandantenfähiger Software as a Service.
- **Vorsicht:** Abfragen und Transaktionen über Shards hinweg werden schwierig, es sei denn, der Datenspeicher übernimmt sie selbst, wie es Transaktionen in DynamoDB innerhalb ihrer dokumentierten Grenzen tun. Ein schlechter Schlüssel erzeugt „heiße“ Shards.
- **Verbindungen:** Es ist ein Bulkhead auf Datenebene. Sobald eine Operation Shards oder Datenbanken ohne gemeinsame Transaktion umfasst, ist es auch der Grund, warum die Patterns für verteilte Transaktionen aus Gruppe D nötig werden.

## Gruppe D: Verteilte Transaktionen

Konsistent bleiben, wenn eine fachliche Aktion mehrere Dienste umfasst.

### D1. Saga

- **Was:** Zerlegt eine fachliche Transaktion über mehrere Dienste in eine Folge lokaler Transaktionen. Jeder Schritt veröffentlicht ein Ereignis oder stößt den nächsten Schritt an.
- **Zwei Varianten:** Bei der Choreografie reagieren Dienste auf die Ereignisse der anderen. Das ist einfach, aber schwer nachzuverfolgen. Bei der Orchestrierung steuert ein zentraler Koordinator die Schritte, der Ablauf ist dadurch leichter zu sehen und zu debuggen.
- **Wann:** Jeder Microservice besitzt seine eigene Datenbank, und ein Two-Phase Commit ist nicht möglich. Typisch sind Buchungs-, Bestell-, Onboarding- und Zahlungsabläufe.
- **Wo:** AWS Step Functions (Orchestrierung), Temporal, Camunda, Choreografie auf Basis von EventBridge.
- **Verbindungen:** Ohne Compensating Transaction kann es nicht existieren. Es läuft meist über Publisher-Subscriber oder Queues.

Saga ist das Pattern in dieser Liste mit den meisten versteckten Details: welche Schritte sich rückgängig machen lassen, wo der Point of No Return liegt und was passiert, wenn auch das Rückgängigmachen scheitert. Der nächste Artikel dieser Reihe, [Das Saga Pattern in der Praxis](/de/writing/saga-pattern/), geht all das durch, mit einer interaktiven Demo und einer Umsetzung mit Step Functions.

### D2. Compensating Transaction

- **Was:** Schlägt ein späterer Schritt fehl, macht es frühere, bereits abgeschlossene Schritte durch ausdrückliche Gegenaktionen rückgängig, etwa eine Zahlung erstatten oder eine Reservierung freigeben. Eine Kompensation ist eine neue fachliche Aktion, kein Datenbank-Rollback.
- **Wann:** In jeder Saga, und immer dann, wenn sich eine dienstübergreifende Operation nicht atomar zurückrollen lässt.
- **Wo:** Catch-Blöcke in Step Functions, die Lambda-Funktionen zum Rückgängigmachen aufrufen. Es gehört auch zu Agenten-Workflows: Scheitert ein Schritt eines KI-Agenten, nachdem er schon Nebenwirkungen hatte, etwa eine versendete E-Mail oder ein angelegtes Ticket, ist eine Kompensation der saubere Ausweg.
- **Verbindungen:** Es ist die Fehlerhälfte der Saga und kommt zum Einsatz, wenn Retry ausgeschöpft ist. Mit Event Sourcing ist es einfach ein weiteres angehängtes Ereignis.

## Gruppe E: Gateway und Edge

Steuern, wie Clients Ihre Dienste erreichen.

### E1. Backends for Frontends

- **Was:** Ein eigenes Backend pro Client-Typ (Web, Mobile, Partner), das die Daten genau für diesen Client aufbereitet.
- **Wann:** Clients brauchen sehr unterschiedliche Payloads, Authentifizierungsabläufe oder Release-Zyklen, und eine einzige Schnittstelle für alle wird immer aufgeblähter.
- **Wo:** Ein NestJS-Backend für eine Angular-Web-App und ein separates für eine Mobile-App. Manchmal wird stattdessen GraphQL eingesetzt.
- **Verbindungen:** Ein Backend for Frontends übernimmt oft Gateway Aggregation für seinen Client. Es sitzt hinter oder neben Gateway Routing.

### E2. Gateway Routing

- **Was:** Ein einziger Einstiegspunkt, der Anfragen anhand von Pfad, Header oder Version an den richtigen Backend-Dienst leitet.
- **Wann:** Sie haben viele Microservices und wollen nicht, dass Clients jede Dienstadresse kennen. Es ermöglicht außerdem Canary Releases und Versionierung.
- **Wo:** Amazon API Gateway, Pfadregeln im Application Load Balancer, CloudFront Behaviors, Kubernetes Ingress, Azure Front Door.
- **Verbindungen:** Es ist das Rückgrat von Strangler Fig, das `/old` an das Altsystem und `/new` an neue Dienste leitet. Meist wird es im selben Gateway-Produkt mit Offloading und Aggregation kombiniert.

### E3. Gateway Aggregation

- **Was:** Das Gateway ruft mehrere Dienste auf und führt die Ergebnisse zu einer Antwort zusammen, sodass der Client eine Anfrage statt vieler stellt.
- **Wann:** Bei Clients mit vielen einzelnen Anfragen, Netzen mit hoher Latenz wie im Mobilfunk oder einer Ansicht, die Daten aus fünf Diensten braucht.
- **Wo:** GraphQL Federation oder Apollo Gateway, ein Endpunkt in einem Backend for Frontends, Resolver in AWS AppSync.
- **Vorsicht:** Der Aggregator wird zum Engpass. Er sollte Circuit Breaker und einen Timeout pro nachgelagertem Aufruf verwenden.
- **Verbindungen:** Eng verwandt mit Backends for Frontends. Es braucht die Resilienz-Patterns aus Gruppe A, weil eine langsame Abhängigkeit die ganze Antwort verlangsamt.

### E4. Gateway Offloading

- **Was:** Verlagert gemeinsame, querschnittliche Aufgaben ins Gateway: Terminierung von TLS (Transport Layer Security), Authentifizierung, Rate Limiting, Caching, Komprimierung und Logging.
- **Wann:** Jeder Dienst würde dieselben Aufgaben sonst selbst umsetzen, oft uneinheitlich.
- **Wo:** Amazon API Gateway mit Cognito oder Lambda Authorizers, Usage Plans und Drosselung. CloudFront mit AWS WAF (Web Application Firewall). Azure API Management.
- **Verbindungen:** Es ist die Gateway-Variante von Sidecar. Sidecars entlasten pro Dienst, Gateways am Rand des Systems.

## Gruppe F: Betrieb und Weiterentwicklung

Dienste gut betreiben und sicher modernisieren.

### F1. Sidecar

- **Was:** Stellt einen Hilfsprozess neben die Hauptanwendung, im selben Pod oder auf demselben Host, der querschnittliche Aufgaben übernimmt, etwa Proxying, Mutual TLS, Log-Versand oder das Abrufen von Secrets.
- **Wann:** Sie wollen diese Fähigkeiten, ohne den Anwendungscode zu ändern, oder über Dienste in verschiedenen Programmiersprachen hinweg.
- **Wo:** Envoy in Istio, der eigene Proxy von Linkerd, Dapr, Fluent-Bit-Log-Collectors, der Collector der AWS Distro for OpenTelemetry und Lambda Extensions als serverlose Entsprechung. Ein lokaler MCP-Server (Model Context Protocol) neben einem KI-Agenten folgt derselben Idee.
- **Verbindungen:** Service Meshes liefern Retry, Circuit Breaker und Health Endpoint Monitoring als Sidecar, sodass diese nicht im Anwendungscode stecken müssen.

### F2. Strangler Fig

- **Was:** Löst ein Altsystem schrittweise ab. Sie setzen eine Routing-Schicht davor, verlagern eine Funktion nach der anderen in neue Dienste und leiten den Rest weiter an das alte System, bis nichts mehr übrig ist.
- **Wann:** Bei der Modernisierung eines Monolithen, wenn eine Neuentwicklung in einem Schritt zu riskant ist. Die Konsolidierung von Plattformen nach einer Übernahme ist ein klassischer Fall.
- **Wo:** Pfad-Routing in CloudFront oder Amazon API Gateway zwischen einer Altanwendung und neuen Lambda- oder NestJS-Diensten.
- **Verbindungen:** Es braucht Gateway Routing. Oft wird es mit einem Anti-Corruption Layer kombiniert und mit Event Sourcing oder Change Data Capture, um alte und neue Daten synchron zu halten.

### F3. External Configuration Store

- **Was:** Hält Konfiguration außerhalb des ausgelieferten Artefakts, in einem zentralen Speicher, der sich zur Laufzeit ändern und zwischen Diensten teilen lässt.
- **Wann:** Bei vielen Diensten oder Umgebungen, bei Feature Flags oder bei Änderungen, die kein neues Deployment erfordern sollen.
- **Wo:** AWS Systems Manager Parameter Store, AWS AppConfig, AWS Secrets Manager, Azure App Configuration, Kubernetes ConfigMaps, LaunchDarkly.
- **Verbindungen:** Es hält die Einstellungen der anderen Patterns: Anzahl der Wiederholungen, Schwellwerte für Circuit Breaker, Routing-Gewichte für Strangler Fig, Ablaufzeiten für Caches. Meist wird es selbst mit Cache-Aside gecacht.

## Wie die Patterns in der Praxis zusammenspielen

Kaum eines dieser Patterns tritt allein auf. Sechs Kombinationen kommen immer wieder vor:

1. **Der Resilienz-Stack:** Retry, Circuit Breaker, Bulkhead und Health Endpoint Monitoring. Retry fängt kurze Ausfälle ab, der Breaker lange, das Bulkhead begrenzt den Schaden, und Health Checks steuern die automatische Wiederherstellung. Ein Sidecar aus einem Service Mesh liefert oft alle vier.
2. **Das asynchrone Rückgrat:** Queue-Based Load Leveling plus Competing Consumers, um Arbeit zu verteilen, und Publisher-Subscriber für das Auffächern. Eine Queue nehmen Sie, wenn ein Worker eine Nachricht verarbeiten soll, ein Topic, wenn alle davon erfahren sollen.
3. **Das ereignisgetriebene Daten-Trio:** Event Sourcing hält die Wahrheit als Ereignisse, Publisher-Subscriber verteilt sie, und CQRS-Lesemodelle beantworten Abfragen schnell. Cache-Aside ist die günstigere Alternative, wenn Sie nur schnellere Lesezugriffe brauchen.
4. **Das Paar für verteilte Transaktionen:** Saga plus Compensating Transaction. Beide werden nötig, sobald eine fachliche Operation Daten umfasst, die mit Sharding oder einer Datenbank pro Dienst aufgeteilt sind, und keine einzelne Transaktion sie abdeckt.
5. **Die Edge-Schicht:** Gateway Routing, Offloading und Aggregation stecken meist in einem Produkt wie Amazon API Gateway oder Azure API Management, ergänzt um Backends for Frontends, wenn sich die Clients auseinanderentwickeln.
6. **Der Modernisierungspfad:** Strangler Fig über Gateway Routing, ein External Configuration Store mit Feature Flags zum Umschalten des Traffics und Health Endpoint Monitoring, um den neuen Pfad vor dem Umschalten zu prüfen.

## Faustregel für die Auswahl

Beginnen Sie beim Problem, nicht beim Pattern.

- Aufrufe schlagen fehl → der Resilienz-Stack.
- Lastspitzen → Queues.
- Lesezugriffe sind langsam → zuerst ein Cache, CQRS erst, wenn der Cache nicht reicht.
- Transaktionen umfassen mehrere Dienste → Saga.
- Clients unterscheiden sich → Backends for Frontends.
- Etwas Altes wird abgelöst → Strangler Fig.

Die meisten dieser Patterns bringen zusätzliche bewegliche Teile mit. Setzen Sie sie ein, wenn das Problem tatsächlich besteht, nicht weil es eines Tages bestehen könnte.

## Weiter in der Reihe

Von den sechs Gruppen sind verteilte Transaktionen die, bei der gute Absichten am häufigsten in halb fertigen Buchungen und verwaisten Reservierungen enden. [Das Saga Pattern in der Praxis](/de/writing/saga-pattern/) nimmt D1 und D2 auseinander: kompensierbare Schritte, Pivot und wiederholbare Schritte, Choreografie gegenüber Orchestrierung, ein Beispiel aus dem Mieter-Onboarding zum Durchklicken und die Fallstricke im Produktivbetrieb, die in den Lehrbuchdiagrammen fehlen.

## Weiterführende Literatur

- Microsoft Azure Architecture Center, [Cloud design patterns](https://learn.microsoft.com/azure/architecture/patterns/) (Englisch)
- AWS Prescriptive Guidance, [Cloud design patterns, architectures, and implementations](https://docs.aws.amazon.com/prescriptive-guidance/latest/cloud-design-patterns/introduction.html) (Englisch)
