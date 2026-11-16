---
title: "20 cloud design patterns, grouped by the problem they solve"
description: "Twenty cloud design patterns sorted into six groups by the problem they solve, with when to use each one, where it shows up in real cloud services, and how they combine."
date: 2026-11-16
tags: [architecture, cloud, aws, microservices]
coverImage: /images/writing/cloud-design-patterns-cover.jpg
devtoPublished: false
series: Cloud design patterns
---

Most lists of cloud design patterns are exactly that: lists. Twenty names in alphabetical order, each with a definition. You can read them all and still not know which one to reach for when a downstream service starts timing out in the middle of the night.

The patterns are easier to learn and to choose between when you group them by the problem they solve. Most of their connections run inside those groups: Retry and Circuit Breaker belong together because both deal with failing calls, Saga and Compensating Transaction because both deal with work that spans several databases. So this article sorts 20 well-known patterns into six groups, from A (resilience) to F (operations and evolution), and numbers them A1 to F3 so you can match the text to the infographic.

For each pattern you get what it does, when it helps, where you meet it in real services, what to watch out for, and how it connects to the others. The examples lean on AWS (Amazon Web Services), with Azure and open source equivalents where they are common.

<!-- site-only -->
<figure>
<a href="/images/writing/cloud-design-patterns-grouped-dark.png"><img src="/images/writing/cloud-design-patterns-grouped-dark-1600.png" width="1600" height="1848" alt="Infographic of 20 cloud design patterns in six groups. A Resilience: Retry, Circuit Breaker, Bulkhead, Health Endpoint Monitoring. B Messaging and load: Queue-Based Load Leveling, Competing Consumers, Publisher-Subscriber. C Data: Cache-Aside, CQRS (Command Query Responsibility Segregation), Event Sourcing, Sharding. D Distributed transactions: Saga, Compensating Transaction. E Gateway and edge: Backends for Frontends, Gateway Routing, Gateway Aggregation, Gateway Offloading. F Operations and evolution: Sidecar, Strangler Fig, External Configuration Store."></a>
<figcaption>The 20 patterns in six groups. Select the image to open the full-size version.</figcaption>
</figure>

<nav class="toc" aria-label="Contents">

**Jump to a group:** [A Resilience](#group-a-resilience) · [B Messaging and load](#group-b-messaging-and-load) · [C Data](#group-c-data) · [D Distributed transactions](#group-d-distributed-transactions) · [E Gateway and edge](#group-e-gateway-and-edge) · [F Operations and evolution](#group-f-operations-and-evolution) · [How they cluster](#how-the-patterns-cluster-in-practice) · [Rule of thumb](#rule-of-thumb-for-choosing)

</nav>
<!-- /site-only -->
<!-- devto-only -->
![Infographic of 20 cloud design patterns in six groups. A Resilience: Retry, Circuit Breaker, Bulkhead, Health Endpoint Monitoring. B Messaging and load: Queue-Based Load Leveling, Competing Consumers, Publisher-Subscriber. C Data: Cache-Aside, CQRS (Command Query Responsibility Segregation), Event Sourcing, Sharding. D Distributed transactions: Saga, Compensating Transaction. E Gateway and edge: Backends for Frontends, Gateway Routing, Gateway Aggregation, Gateway Offloading. F Operations and evolution: Sidecar, Strangler Fig, External Configuration Store.](/images/writing/cloud-design-patterns-grouped-light.png)
<!-- /devto-only -->

## Group A: Resilience

Surviving failure without taking the whole system down.

### A1. Retry

- **What:** Automatically repeats a call that failed for a temporary reason, such as a timeout, throttling or a network blip. It usually waits longer before each new attempt (exponential backoff) and adds random variation to that wait (jitter).
- **When:** Calls to databases, queues and external services where failures are short-lived.
- **Where:** The AWS Software Development Kit retries throttled calls by default. Other common places are HttpClient interceptors in Angular and Polly in .NET.
- **Caution:** Only retry operations that are safe to repeat (idempotent). Never retry validation errors. Retrying without limits makes outages worse, which is how "retry storms" happen.
- **Connections:** Retry handles short failures and Circuit Breaker handles long ones, so they almost always appear together.

### A2. Circuit Breaker

- **What:** After a set number of failures, the breaker "opens" and fails fast without calling the dependency. After a cooldown it lets one test call through (the "half-open" state). If that call succeeds, the breaker closes again.
- **When:** A downstream service is slow or down, and waiting on it would tie up your threads and connections.
- **Where:** Libraries such as opossum (Node.js), resilience4j (Java) and Polly (.NET). Service meshes such as Istio provide it as outlier detection. A typical case is a NestJS service calling a flaky third-party property portal.
- **Connections:** It wraps Retry. Bulkhead limits the damage while the breaker is open. Health Endpoint Monitoring can feed its state.

### A3. Bulkhead

- **What:** Splits resources into isolated pools, such as separate thread pools, connection pools, queues or clusters, so one failure can't sink everything. The name comes from a ship's watertight compartments.
- **When:** Several features or tenants share infrastructure, and one noisy consumer could starve the rest.
- **Where:** Separate Lambda reserved concurrency per function, separate node pools in Azure Kubernetes Service, a dedicated database connection pool for reporting versus transactional traffic.
- **Connections:** Circuit Breaker stops the calls and Bulkhead contains the damage. Sharding works as a bulkhead at the data level.

### A4. Health Endpoint Monitoring

- **What:** Exposes endpoints like `/health/live` and `/health/ready` that report whether the service and its dependencies work.
- **When:** Anything behind a load balancer or orchestrator that needs to decide where to send traffic or whether to restart something.
- **Where:** Kubernetes liveness and readiness probes, Application Load Balancer target health checks, Route 53 health checks. NestJS has `@nestjs/terminus` for this.
- **Connections:** Load balancers and Gateway Routing use it to drop unhealthy instances. Gateway Offloading often centralises it.

## Group B: Messaging and load

Handling volume without overwhelming the backend.

### B1. Queue-Based Load Leveling

- **What:** Puts a queue between the producer and the consumer, so traffic spikes are absorbed and the backend processes them at its own pace.
- **When:** Spiky workloads like imports, email sending or document processing, or a backend that can't scale as fast as incoming traffic.
- **Where:** Amazon Simple Queue Service in front of Lambda, Azure Service Bus, RabbitMQ. A typical example is bulk uploads of property listings.
- **Connections:** Competing Consumers is the natural next step. The queue also absorbs the burst a retry storm would otherwise cause.

### B2. Competing Consumers

- **What:** Several worker instances read from the same queue, and each message is processed by exactly one of them.
- **When:** You need to scale processing throughput horizontally.
- **Where:** Lambda polling Simple Queue Service, where concurrency scales automatically. Kubernetes deployments scaled by queue depth with Kubernetes Event-driven Autoscaling.
- **Caution:** Messages can arrive out of order or more than once, so handlers must be idempotent. Send failing messages to a dead-letter queue.
- **Connections:** It depends on Queue-Based Load Leveling. It's the opposite of Publisher-Subscriber, where every subscriber gets a copy of each message.

### B3. Publisher-Subscriber

- **What:** A publisher emits an event to a topic, and every interested subscriber gets its own copy. The publisher doesn't know who listens.
- **When:** One event triggers several independent reactions. For example, "contact created" leads to a welcome email, a search index update and an analytics event.
- **Where:** Amazon Simple Notification Service fanning out to several Simple Queue Service queues, Amazon EventBridge, Kafka, Azure Event Grid.
- **Connections:** It's the transport for Event Sourcing, for CQRS (Command Query Responsibility Segregation) projections and for choreographed Sagas. Each subscriber often uses Competing Consumers internally.

## Group C: Data

Scaling storage while keeping reads fast and data consistent.

### C1. Cache-Aside

- **What:** The application checks the cache first. On a miss it loads from the database, writes the result into the cache and returns it. On writes it updates the database and invalidates the cache entry.
- **When:** Read-heavy data that changes rarely, like reference data, configuration, user profiles or listing details.
- **Where:** Redis or Amazon ElastiCache in front of PostgreSQL or DynamoDB. DynamoDB Accelerator is a managed variant, strictly speaking read-through rather than cache-aside.
- **Caution:** Stale data, and a "thundering herd" of requests when a popular key expires. Always set a time-to-live.
- **Connections:** It's a lightweight alternative to a full CQRS read model.

### C2. CQRS

- **What:** Separate models, and often separate stores, for writes (commands) and reads (queries). Each side can be optimised and scaled on its own.
- **When:** Reads vastly outnumber writes, read shapes differ a lot from the write model, or a complex domain has rich business rules on the write side.
- **Where:** Writes go to PostgreSQL and reads come from OpenSearch or a denormalised DynamoDB table. NestJS has an `@nestjs/cqrs` module.
- **Caution:** The read side is eventually consistent, and there are more moving parts. Don't use it for simple create, read, update and delete applications.
- **Connections:** Very often paired with Event Sourcing, where events build the read models, and with Publisher-Subscriber, which carries those events.

### C3. Event Sourcing

- **What:** Stores every state change as an immutable event ("PriceChanged", "ListingPublished") instead of only the current state. The current state is rebuilt by replaying the events.
- **When:** You need a full audit trail, temporal queries ("what did this look like last Tuesday?"), or the ability to build new projections later. Typical domains are banking, insurance claims and compliance-heavy systems.
- **Where:** EventStoreDB, Kafka, or DynamoDB used as an append-only log with DynamoDB Streams. Core banking is the classic domain for this.
- **Caution:** Changing event schemas over time (versioning) and replay performance both need snapshots and planning.
- **Connections:** It's the write side of CQRS. Its events feed Publisher-Subscriber, and it makes Compensating Transactions natural, because a compensation is just another appended event.

### C4. Sharding

- **What:** Splits data horizontally across several databases or partitions by a shard key, such as a tenant ID (identifier) or a region.
- **When:** A single database hits storage, throughput or connection limits, or you need tenant isolation or data residency.
- **Where:** DynamoDB partition keys (built-in sharding), Citus for PostgreSQL, MongoDB sharded clusters, a database-per-tenant model in multi-tenant software as a service.
- **Caution:** Queries and transactions across shards become hard. A bad key creates "hot" shards.
- **Connections:** It's a Bulkhead at the data level. It's also what makes the distributed transaction patterns in group D necessary.

## Group D: Distributed transactions

Staying consistent when one business action spans several services.

### D1. Saga

- **What:** Breaks a business transaction that spans several services into a sequence of local transactions. Each step publishes an event or triggers the next step.
- **Two styles:** In choreography, services react to each other's events. It's simple, but hard to trace. In orchestration, a central coordinator drives the steps, which makes the flow easier to see and debug.
- **When:** Each microservice owns its database and a two-phase commit isn't possible. Booking, ordering, onboarding and payment flows are typical.
- **Where:** AWS Step Functions (orchestration), Temporal, Camunda, choreography based on EventBridge.
- **Connections:** It can't exist without Compensating Transaction. It usually runs over Publisher-Subscriber or queues.

Saga is the pattern in this list with the most hidden detail: which steps can be undone, where the point of no return sits, and what happens when the undo fails too. The next article in this series, [The Saga pattern in practice](/writing/saga-pattern/), goes through all of that with an interactive demo and a Step Functions implementation.

### D2. Compensating Transaction

- **What:** When a later step fails, it undoes earlier completed steps with explicit reversing actions, such as refunding a payment or releasing a reservation. A compensation is a new business action, not a database rollback.
- **When:** Inside every Saga, and whenever an operation across services can't be rolled back atomically.
- **Where:** Step Functions catch blocks that call "undo" Lambda functions. It's also part of agent workflows: when an AI (Artificial Intelligence) agent step fails after side effects such as a sent email or a created ticket, a compensation is the clean way out.
- **Connections:** It's the failure half of Saga, used once Retry is exhausted. With Event Sourcing it's simply another appended event.

## Group E: Gateway and edge

Controlling how clients reach your services.

### E1. Backends for Frontends

- **What:** A dedicated backend per client type (web, mobile, partner) that shapes data exactly for that client.
- **When:** Clients need very different payloads, authentication flows or release cycles, and a single "one size fits all" interface keeps getting bloated.
- **Where:** A NestJS backend for an Angular web app and a separate one for a mobile app. GraphQL is sometimes used instead.
- **Connections:** A Backend for Frontends often does Gateway Aggregation for its client. It sits behind or alongside Gateway Routing.

### E2. Gateway Routing

- **What:** One entry point that routes requests to the right backend service based on path, header or version.
- **When:** You have many microservices and don't want clients to know every service address. It also enables canary releases and versioning.
- **Where:** Amazon API (Application Programming Interface) Gateway, Application Load Balancer path rules, CloudFront behaviours, Kubernetes Ingress, Azure Front Door.
- **Connections:** It's the backbone of Strangler Fig, which routes `/old` to the legacy system and `/new` to new services. It's usually combined with Offloading and Aggregation in the same gateway product.

### E3. Gateway Aggregation

- **What:** The gateway calls several services and merges the results into one response, so the client makes one request instead of many.
- **When:** Chatty clients, high-latency networks such as mobile, or a screen that needs data from five services.
- **Where:** GraphQL federation or Apollo Gateway, a Backend for Frontends endpoint, AWS AppSync resolvers.
- **Caution:** The aggregator becomes a hotspot. It should use Circuit Breaker and a timeout per downstream call.
- **Connections:** Closely linked with Backends for Frontends. It needs the resilience patterns from group A, because one slow dependency slows the whole response.

### E4. Gateway Offloading

- **What:** Moves shared, cross-cutting work into the gateway: TLS (Transport Layer Security) termination, authentication, rate limiting, caching, compression and logging.
- **When:** Every service would otherwise re-implement the same concerns, often inconsistently.
- **Where:** Amazon API Gateway with Cognito or Lambda authorisers, usage plans and throttling. CloudFront with AWS WAF (Web Application Firewall). Azure API Management.
- **Connections:** It's the gateway-level version of Sidecar. Sidecars offload per service, gateways offload at the edge.

## Group F: Operations and evolution

Running services well and modernising them safely.

### F1. Sidecar

- **What:** Deploys a helper process next to the main application, in the same pod or on the same host, to handle cross-cutting tasks such as proxying, mutual TLS, log shipping or fetching secrets.
- **When:** You want those capabilities without changing application code, or across services written in different languages.
- **Where:** Envoy in Istio or Linkerd service meshes, Dapr, Fluent Bit log collectors, the AWS Distro for OpenTelemetry collector, and Lambda Extensions as the serverless equivalent. A local MCP (Model Context Protocol) server running beside an AI agent follows the same idea.
- **Connections:** Service meshes deliver Retry, Circuit Breaker and Health Endpoint Monitoring as a sidecar, so they don't have to live in application code.

### F2. Strangler Fig

- **What:** Replaces a legacy system gradually. You put a routing layer in front, move one feature at a time to new services, and keep routing the rest to the old system until nothing is left.
- **When:** Modernising a monolith where a "big bang" rewrite is too risky. Consolidating platforms after an acquisition is a classic case.
- **Where:** CloudFront or Amazon API Gateway path routing between a legacy application and new Lambda or NestJS services.
- **Connections:** It needs Gateway Routing. It's often combined with an anti-corruption layer, and with Event Sourcing or change data capture to keep old and new data in sync.

### F3. External Configuration Store

- **What:** Keeps configuration outside the deployed artefact, in a central store that can be changed at runtime and shared across services.
- **When:** Many services or environments, feature flags, or changes that shouldn't require a redeploy.
- **Where:** AWS Systems Manager Parameter Store, AWS AppConfig, AWS Secrets Manager, Azure App Configuration, Kubernetes ConfigMaps, LaunchDarkly.
- **Connections:** It holds the settings for the other patterns: retry counts, circuit breaker thresholds, routing weights for Strangler Fig, cache time-to-live values. It's usually cached with Cache-Aside.

## How the patterns cluster in practice

Few of these patterns show up alone. Six combinations come up again and again:

1. **The resilience stack:** Retry, Circuit Breaker, Bulkhead and Health Endpoint Monitoring. Retry handles short failures, the breaker handles long ones, the bulkhead contains the damage, and health checks drive automated recovery. A service mesh sidecar often delivers all four.
2. **The asynchronous backbone:** Queue-Based Load Leveling plus Competing Consumers for distributing work, Publisher-Subscriber for fan-out. Use a queue when one worker should process a message, and a topic when everyone should hear about it.
3. **The event-driven data trio:** Event Sourcing holds the truth as events, Publisher-Subscriber distributes them, and CQRS read models answer queries fast. Cache-Aside is the cheaper alternative when you only need faster reads.
4. **The distributed transaction pair:** Saga plus Compensating Transaction. They become necessary as soon as you split data with Sharding or a database per service.
5. **The edge layer:** Gateway Routing, Offloading and Aggregation usually live in one product, such as Amazon API Gateway or Azure API Management, with Backends for Frontends added when clients diverge.
6. **The modernisation path:** Strangler Fig through Gateway Routing, an External Configuration Store with feature flags to switch traffic, and Health Endpoint Monitoring to verify the new path before cutting over.

## Rule of thumb for choosing

Start with the problem, not the pattern.

- Calls fail → the resilience stack.
- Load spikes → queues.
- Reads are slow → a cache first, CQRS only if the cache isn't enough.
- Transactions span services → Saga.
- Clients differ → Backends for Frontends.
- Replacing something old → Strangler Fig.

Most of these patterns add moving parts, so use them when the problem actually exists, not because it might one day.

## Next in the series

Of the six groups, distributed transactions is where good intentions most often turn into half-finished bookings and orphaned reservations. [The Saga pattern in practice](/writing/saga-pattern/) takes D1 and D2 apart: compensatable, pivot and retriable steps, choreography versus orchestration, a rental onboarding example you can click through, and the production pitfalls that the textbook diagrams leave out.

## Further reading

- Microsoft Azure Architecture Center, [Cloud design patterns](https://learn.microsoft.com/azure/architecture/patterns/)
- AWS Prescriptive Guidance, [Cloud design patterns, architectures, and implementations](https://docs.aws.amazon.com/prescriptive-guidance/latest/cloud-design-patterns/introduction.html)
