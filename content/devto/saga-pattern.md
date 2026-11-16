---
title: "The Saga pattern in practice: compensations, pivots and the hard parts"
published: false
description: "How the Saga pattern replaces one database transaction with a chain of local ones, why the pivot step matters most, and what goes wrong in production, with an AWS (Amazon Web Services) Step Functions example."
tags: architecture, aws, microservices, serverless
cover_image: https://luka-engels.de/images/writing/saga-pattern-cover.jpg
canonical_url: https://luka-engels.de/writing/saga-pattern/
series: "Cloud design patterns"
---

In a monolith with one database, a business operation runs inside a single ACID (Atomicity, Consistency, Isolation, Durability) transaction. Either everything commits or nothing does. Once each service owns its own database, that guarantee is gone.

A distributed two-phase commit is technically possible, but it locks resources across services, needs every participant to be online at the same time, and most cloud services don't support it at all. DynamoDB doesn't, Amazon Simple Queue Service doesn't, and neither does any third-party payment provider.

A Saga replaces that one big transaction with a **sequence of local transactions**. Each one commits on its own. If a later step fails, the earlier steps are undone by **compensating transactions**. You give up immediate consistency and get **eventual consistency** with an explicit, business-level undo.

The idea is older than microservices. Hector Garcia-Molina and Kenneth Salem described it in their 1987 paper "Sagas", written for long-lived database transactions. In the [overview of 20 cloud design patterns](https://luka-engels.de/writing/cloud-design-patterns/) it's pattern D1, next to its partner D2, Compensating Transaction. This article goes into the detail that an overview has to skip.

## Three kinds of steps

This is the most useful idea when you design a real Saga. Every step belongs to one of three categories:

1. **Compensatable steps** come before the point of no return, and each has an undo action. Examples are "reserve stock" (undo: release the stock) and "authorise payment" (undo: void the authorisation).
2. **The pivot step** is the go or no-go decision. Once it commits, the Saga must complete. Examples are "capture payment" and "sign contract".
3. **Retriable steps** come after the pivot. They can't be undone and must not fail permanently, so they are retried until they succeed. Examples are "send confirmation email" and "update search index".

**Design rule:** order the steps so that risky steps, the ones likely to fail, run early while they can still be compensated. Only steps that are guaranteed to succeed belong after the pivot.

## Try it: a rental onboarding Saga

The running example in this article is a rental contract onboarding in proptech. It has five steps:

1. Reserve the property, so the listing shows as "under offer". Compensatable.
2. Run the tenant credit check. Compensatable.
3. The tenant signs the contract. This is the pivot.
4. Collect the deposit. Retriable.
5. Update the listing portals. Retriable.

If the credit check fails, or the tenant doesn't sign within seven days, the Saga discards the credit check and releases the reservation, so the listing goes back on the market. A timeout counts as a failure too.

The four animations below show the Saga in each scenario that matters.

![Happy path: all five steps of the rental onboarding Saga commit one after another](https://luka-engels.de/images/writing/saga-happy-light.gif)
*Happy path: every step commits and the tenant is onboarded.*

![The credit check fails and the property reservation is released](https://luka-engels.de/images/writing/saga-credit-light.gif)
*Failure at the credit check: the one step before it is compensated.*

![The tenant does not sign, so the credit check is discarded and the reservation released](https://luka-engels.de/images/writing/saga-sign-light.gif)
*Failure at the pivot: everything before it is compensated.*

![The deposit service fails, is retried and then succeeds, with no compensation](https://luka-engels.de/images/writing/saga-deposit-light.gif)
*Failure after the pivot: the step is retried, never compensated.*

Try the interactive version on my site: [The Saga pattern in practice](https://luka-engels.de/writing/saga-pattern/#try-it-a-rental-onboarding-saga).

## Choreography versus orchestration

Someone has to decide which step runs next. There are two ways to do that.

![Comparison diagram. Left, choreography: the Order, Inventory and Payment services publish to and subscribe from a shared event bus such as EventBridge or Kafka. Right, orchestration: a central Saga orchestrator holds the state machine, sends commands to the Order, Inventory and Payment services and receives their replies.](https://luka-engels.de/images/writing/choreography-vs-orchestration.png)

### Choreography: no central coordinator

Each service listens for events and reacts by doing its local work and publishing the next event.

```text
Order Service      → publishes OrderCreated
Inventory Service    hears OrderCreated  → reserves stock → publishes StockReserved
Payment Service      hears StockReserved → charges card  → publishes PaymentFailed
Inventory Service    hears PaymentFailed → releases stock
Order Service        hears PaymentFailed → marks order Cancelled
```

- **Good for:** short flows of two to four steps, loosely coupled teams, and systems that are already event-driven with EventBridge or Kafka.
- **Problems:** the flow exists only implicitly, spread across many services. It's hard to answer "where is order 4711 right now?" Cyclic event dependencies creep in, and adding a step means changing several services.

### Orchestration: a central coordinator

An orchestrator holds the state machine and tells each service what to do with commands.

- **Good for:** longer flows, complex branching, timeouts, human approval steps, and any flow where auditors or support staff need to see the current state.
- **Problems:** the orchestrator is one more component to run, and business logic tends to collect in it until you have a "god orchestrator".
- **Tools:** AWS (Amazon Web Services) Step Functions, Temporal, Camunda and Zeebe, Azure Durable Functions, and the sagas in `@nestjs/cqrs` for in-process cases.

**Practical rule:** start with choreography for simple reactions. Switch to orchestration once a flow has more than about four steps, needs timeouts, or has to be explainable to people who aren't engineers.

## Where Sagas are used

### 1. E-commerce order fulfilment

The textbook case. Create the order, reserve inventory, authorise the payment, **capture the payment (pivot)**, schedule the shipment, send a confirmation. If the payment authorisation fails, release the inventory and cancel the order.

### 2. Travel booking

Book a flight, book a hotel, book a rental car. If the car rental fails, cancel the hotel and the flight. This is the example most often used to explain Sagas. Compensations here often carry business costs, such as cancellation fees, which is why compensation is a business decision, not a technical rollback.

### 3. Banking and payments

A transfer between accounts held in different systems: debit the source account, credit the target account, notify both parties. The compensation is a reversing booking, never a delete, because ledgers are append-only. This fits naturally with Event Sourcing.

### 4. Insurance claims

Register the claim, verify policy coverage, run a fraud check, wait for the assessor's approval (a human step that can take days), pay out, close the claim. Long-running Sagas with human steps are where orchestration with durable timers really pays off, for example Step Functions with task tokens, or Temporal.

### 5. Proptech: rental contract onboarding

The running example from the demo above. Reserve the property, run the credit check, **the tenant signs (pivot)**, collect the deposit, update the listing portals. A failed credit check or a missing signature after seven days releases the property again.

### 6. Customer and account provisioning in SaaS (Software as a Service)

Create the tenant, provision a database or schema, create the admin user in the identity provider, set up the billing subscription, send a welcome email. If identity provisioning fails, drop the schema and delete the tenant record. This is common after acquisitions, when accounts have to be created across several merged platforms.

### 7. Agentic workflows

An AI (Artificial Intelligence) agent run that creates side effects across tools is a Saga, whether it was designed as one or not. For example: create a branch, generate code, open a pull request, link the ticket, notify the team channel. If the review agent rejects the change, the compensations are closing the pull request, deleting the branch and reverting the ticket status.

Treating agent tool calls as Saga steps with explicit compensations means a failed agent run leaves a clean state instead of orphaned branches and half-updated tickets. Orchestration fits best here, because the agent harness already acts as the orchestrator.

## Implementation with Step Functions and the CDK (Cloud Development Kit)

Here is the rental onboarding Saga as a Step Functions state machine, defined with the AWS CDK in TypeScript. Three mechanisms do the work:

- **Retry** handles temporary errors inside a step.
- **Catch plus a compensation chain** handles a permanent failure before the pivot.
- **After the pivot** there is no compensation, only patient retries and an alert for a human.

```typescript
import { Duration, Stack, StackProps } from 'aws-cdk-lib'
import { Construct } from 'constructs'
import * as lambda from 'aws-cdk-lib/aws-lambda'
import * as sfn from 'aws-cdk-lib/aws-stepfunctions'
import * as tasks from 'aws-cdk-lib/aws-stepfunctions-tasks'

interface RentalSagaProps extends StackProps {
  reserveFn: lambda.IFunction
  creditFn: lambda.IFunction
  signFn: lambda.IFunction
  depositFn: lambda.IFunction
  portalsFn: lambda.IFunction
  releaseFn: lambda.IFunction
  discardCreditFn: lambda.IFunction
  alertOpsFn: lambda.IFunction
}

export class RentalOnboardingSaga extends Stack {
  constructor(scope: Construct, id: string, props: RentalSagaProps) {
    super(scope, id, props)
    const invoke = (name: string, fn: lambda.IFunction, resultPath?: string) =>
      new tasks.LambdaInvoke(this, name, { lambdaFunction: fn, resultPath: resultPath ?? sfn.JsonPath.DISCARD })

    // Forward steps
    const reserveProperty = invoke('ReserveProperty', props.reserveFn, '$.reservation')
    const creditCheck = invoke('CreditCheck', props.creditFn, '$.credit')

    // Pivot: wait for the tenant's signature via a task token, fail after 7 days
    const signContract = new tasks.LambdaInvoke(this, 'SignContract', {
      lambdaFunction: props.signFn,
      integrationPattern: sfn.IntegrationPattern.WAIT_FOR_TASK_TOKEN,
      payload: sfn.TaskInput.fromObject({ taskToken: sfn.JsonPath.taskToken, input: sfn.JsonPath.entirePayload }),
      taskTimeout: sfn.Timeout.duration(Duration.days(7)),
      resultPath: '$.contract',
    })

    // Retriable steps after the pivot
    const collectDeposit = invoke('CollectDeposit', props.depositFn)
    const updatePortals = invoke('UpdatePortals', props.portalsFn)

    // Compensations, run in reverse order
    const failed = new sfn.Fail(this, 'OnboardingCancelled')
    const releaseProperty = invoke('ReleaseProperty', props.releaseFn).next(failed)
    const discardCredit = invoke('DiscardCreditCheck', props.discardCreditFn).next(releaseProperty)

    // Manual intervention if a post-pivot step still fails after all retries
    const alertOps = invoke('AlertOperations', props.alertOpsFn).next(new sfn.Fail(this, 'NeedsManualIntervention'))

    // Before the pivot: a few quick retries, then compensate
    creditCheck.addRetry({ errors: ['States.Timeout', 'Lambda.TooManyRequestsException'], maxAttempts: 3, backoffRate: 2 })
    creditCheck.addCatch(releaseProperty, { resultPath: '$.error' })
    signContract.addCatch(discardCredit, { resultPath: '$.error' })

    // After the pivot: retry patiently, never compensate
    for (const step of [collectDeposit, updatePortals]) {
      step.addRetry({ errors: ['States.ALL'], maxAttempts: 10, interval: Duration.seconds(5), backoffRate: 2 })
      step.addCatch(alertOps, { resultPath: '$.error' })
    }

    const definition = reserveProperty
      .next(creditCheck)
      .next(signContract)
      .next(collectDeposit)
      .next(updatePortals)
      .next(new sfn.Succeed(this, 'Onboarded'))

    new sfn.StateMachine(this, 'RentalOnboardingSaga', {
      definitionBody: sfn.DefinitionBody.fromChainable(definition),
    })
  }
}
```

The code type-checks with `tsc --strict` against `aws-cdk-lib` 2.277.0. Step Functions also gives you a visual execution history, so "where is this onboarding stuck?" can be answered in the console.

## The hard parts

The diagrams make Sagas look tidy. These seven things are where they go wrong in production.

### 1. Idempotency everywhere

Messages get delivered twice and orchestrators retry. Every step and every compensation must be safe to run more than once. Pass the Saga ID (identifier) plus the step name as an idempotency key and store the keys you have processed, for example in DynamoDB with a conditional write.

### 2. The dual-write problem

A service must update its database and publish an event. If it crashes between the two, the Saga stalls or diverges. The fix is the Transactional Outbox: write the event into an outbox table in the same local transaction, then publish it from there. Change data capture, such as DynamoDB Streams or Debezium for PostgreSQL, or a polling relay can do the publishing.

### 3. Missing isolation

A Saga gives up the "I" in ACID. Other requests can see intermediate states: a second tenant might see a property as available while the first tenant's Saga is still running. Countermeasures:

- **Semantic lock:** a status field like `PENDING_ONBOARDING` that other flows respect.
- **Commutative updates:** design operations so their order doesn't matter, for example increment and decrement instead of "set to value".
- **Re-read value:** check that the data hasn't changed before the pivot step.
- **Version check:** optimistic locking with a version number.

### 4. Compensations can fail too

A refund call can time out. Compensations must be retriable and must not give up. When one finally can't succeed, route it to a dead-letter queue and alert a human. Always design a path for manual intervention.

### 5. Not everything can be undone

A sent email or text message can't be unsent. Either move such steps after the pivot, or compensate semantically with a "sorry, your booking was cancelled" email.

### 6. Timeouts are failures

A step that never answers is worse than one that fails. Each step needs a timeout that leads into compensation. Long-running Sagas need durable timers, not an in-memory `setTimeout`.

### 7. Observability

Propagate a correlation ID, the Saga ID, through every message and log line. Store the Saga state (current step, status, history) so support can answer "what happened to this order?" With choreography, distributed tracing with OpenTelemetry or AWS X-Ray is close to mandatory.

## When not to use a Saga

- **All the data lives in one database.** Use a normal local transaction. A Saga there is pure overhead.
- **The service boundaries are wrong.** If two services always have to change together in one transaction, they probably belong in the same service. Merging them is often better than building a Saga between them.
- **The business requires strict immediate consistency** and can't tolerate visible intermediate states. Then you need a different design, such as a single owner of the data, or reservations with hard locks.
- **One simple step plus a notification.** Publisher-Subscriber with a retriable consumer is enough.

## How it connects to the other patterns

The Saga sits in the middle of several patterns from the [overview of 20 cloud design patterns](https://luka-engels.de/writing/cloud-design-patterns/):

- **[Compensating Transaction (D2)](https://luka-engels.de/writing/cloud-design-patterns/#d2-compensating-transaction):** the undo half of every Saga.
- **[Retry (A1)](https://luka-engels.de/writing/cloud-design-patterns/#a1-retry) and [Circuit Breaker (A2)](https://luka-engels.de/writing/cloud-design-patterns/#a2-circuit-breaker):** used inside each step, before giving up and compensating.
- **[Publisher-Subscriber (B3)](https://luka-engels.de/writing/cloud-design-patterns/#b3-publisher-subscriber) and [queues (B1)](https://luka-engels.de/writing/cloud-design-patterns/#b1-queue-based-load-leveling):** the transport for choreographed Sagas and for orchestrator commands.
- **[Event Sourcing (C3)](https://luka-engels.de/writing/cloud-design-patterns/#c3-event-sourcing):** makes Saga state and compensations natural, because a compensation means appending a reversing event.
- **[Sharding (C4)](https://luka-engels.de/writing/cloud-design-patterns/#c4-sharding) and a database per service:** the reason Sagas are needed in the first place.
- **Transactional Outbox:** not one of the 20, but the pattern that makes Sagas reliable in practice.

## Further reading

- Hector Garcia-Molina and Kenneth Salem, ["Sagas"](https://doi.org/10.1145/38713.38742), Proceedings of SIGMOD (Special Interest Group on Management of Data) 1987
- Microsoft Azure Architecture Center, [Saga design pattern](https://learn.microsoft.com/azure/architecture/patterns/saga)
- Chris Richardson, [Pattern: Saga](https://microservices.io/patterns/data/saga.html)
- AWS Prescriptive Guidance, [Saga choreography pattern](https://docs.aws.amazon.com/prescriptive-guidance/latest/cloud-design-patterns/saga-choreography.html) and [Saga orchestration pattern](https://docs.aws.amazon.com/prescriptive-guidance/latest/cloud-design-patterns/saga-orchestration.html)
