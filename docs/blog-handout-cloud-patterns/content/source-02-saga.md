# Source material: the Saga pattern in practice

> Raw material for article 2. Facts and structure are final. Wording may be edited into Luka's voice.
> The interactive `<saga-stepper>` and the GIFs (Graphics Interchange Format animations) use the same rental onboarding example as the code below. Keep them in sync.

## Why Saga exists

In a monolith with one database, a business operation runs inside a single ACID (Atomicity, Consistency, Isolation, Durability) transaction. Either everything commits or nothing does. When each service owns its own database, that guarantee is gone. A distributed two-phase commit is technically possible, but it locks resources across services, needs every participant to be online at the same time, and most cloud services (DynamoDB, Amazon Simple Queue Service, third-party payment providers) don't support it at all.

A Saga replaces that one big transaction with a **sequence of local transactions**. Each one commits on its own. If a later step fails, earlier steps are undone by **compensating transactions**. You give up immediate consistency and get **eventual consistency** with explicit business-level undo.

The idea is older than microservices. Hector Garcia-Molina and Kenneth Salem described it in the 1987 paper "Sagas" for long-lived database transactions.

## How a Saga is built: three kinds of steps

This is the most useful idea when designing a real Saga. Every step belongs to one of three categories:

1. **Compensatable steps** come before the point of no return and each has an undo action. Examples are "reserve stock" (undo: release stock) and "authorise payment" (undo: void the authorisation).
2. **The pivot step** is the go/no-go decision. Once it commits, the Saga must complete. Examples are "capture payment" and "sign contract".
3. **Retriable steps** come after the pivot. They can't be undone and must not fail permanently, so they are retried until they succeed. Examples are "send confirmation email" and "update search index".

**Design rule:** order the steps so that risky, likely-to-fail steps run early (while they can still be compensated) and only guaranteed-to-succeed steps run after the pivot.

> VISUAL: the interactive stepper shows exactly this split (compensatable zone, pivot, retriable zone). Place it here or right after the rental example below.

## Coordination: choreography versus orchestration

> VISUAL: `assets/saga/choreography-vs-orchestration.svg` (or the PNG (Portable Network Graphics)) belongs in this section.

### Choreography (event-driven, no central coordinator)

Each service listens for events and reacts by doing its local work and publishing the next event.

```
Order Service      → publishes OrderCreated
Inventory Service    hears OrderCreated  → reserves stock → publishes StockReserved
Payment Service      hears StockReserved → charges card  → publishes PaymentFailed
Inventory Service    hears PaymentFailed → releases stock
Order Service        hears PaymentFailed → marks order Cancelled
```

- **Good for:** short flows (2 to 4 steps), loosely coupled teams, systems that are already event-driven (EventBridge, Kafka).
- **Problems:** the flow exists only implicitly across many services. It's hard to answer "where is order 4711 right now?" Cyclic event dependencies creep in, and adding a step means changing several services.

### Orchestration (a central coordinator)

An orchestrator holds the state machine and tells each service what to do with commands.

- **Good for:** longer flows, complex branching, timeouts, human approval steps, and any flow where auditors or support staff need to see the current state.
- **Problems:** the orchestrator is an extra component, and there's a risk that business logic gets centralised in it ("god orchestrator").
- **Tools:** AWS (Amazon Web Services) Step Functions, Temporal, Camunda/Zeebe, Azure Durable Functions, and the `@nestjs/cqrs` sagas for in-process cases.

**Practical rule:** start with choreography for simple reactions. Switch to orchestration once a flow has more than about four steps, needs timeouts, or has to be explainable to non-engineers.

## Where Sagas are used

### 1. E-commerce order fulfilment (the textbook case)
Create order → reserve inventory → authorise payment → **capture payment (pivot)** → schedule shipment → send confirmation.
If the payment authorisation fails, release the inventory and cancel the order.

### 2. Travel booking
Book flight → book hotel → book car rental. If the car rental fails, cancel the hotel and the flight. This is the example most often used to explain Sagas. Compensations here often carry business costs, such as cancellation fees, which is why compensation is a business decision, not a technical rollback.

### 3. Banking and payments
A transfer between accounts held in different systems: debit source account → credit target account → notify both parties. Compensation is a reversing booking, never a delete, because ledgers are append-only. This fits naturally with Event Sourcing.

### 4. Insurance claims
Register claim → verify policy coverage → fraud check → wait for assessor approval (human step, possibly days) → pay out → close claim. Long-running Sagas with human steps are where orchestration with durable timers (Step Functions with task tokens, Temporal) really pays off.

### 5. Proptech: rental contract onboarding (the running example)
Reserve the property (mark as "under offer") → run the tenant credit check → **tenant signs the contract (pivot)** → collect the deposit → update listing portals.
If the credit check fails or the tenant doesn't sign within 7 days (a timeout is a failure too), discard the credit check and release the reservation so the listing goes back on the market.

> VISUAL: the interactive stepper (personal site) or the four GIFs (dev.to) belong here:
> - Happy path → `saga-happy-*.gif`
> - Fail at credit check → `saga-credit-*.gif` (compensation of one step)
> - Tenant does not sign → `saga-sign-*.gif` (failure at the pivot, everything before it is compensated)
> - Deposit service flaky → `saga-deposit-*.gif` (failure after the pivot, retried, never compensated)

### 6. Customer and account provisioning in SaaS (Software as a Service)
Create tenant → provision database or schema → create admin user in the identity provider → set up billing subscription → send welcome email. If identity provisioning fails, drop the schema and delete the tenant record. This is common after acquisitions when accounts must be created across several merged platforms.

### 7. Agentic workflows
An AI (Artificial Intelligence) agent run that creates side effects across tools is a Saga, whether it's designed as one or not. For example: create branch → generate code → open pull request → link the ticket → notify the team channel. If the review agent rejects the change, the compensations are closing the pull request, deleting the branch and reverting the ticket status. Treating agent tool calls as Saga steps with explicit compensations means failed agent runs leave a clean state instead of orphaned branches and half-updated tickets. Orchestration fits best here, because the agent harness already acts as the orchestrator.

## Implementation: orchestration with AWS Step Functions and the AWS CDK (Cloud Development Kit)

This is the rental onboarding Saga from the stepper. Retry handles temporary errors inside a step. Catch plus a compensation chain handles permanent failure before the pivot. After the pivot there is no compensation, only patient retries and an alert for a human.

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

Step Functions also gives you the visual execution history, so "where is this onboarding stuck?" can be answered in the console.

## The hard parts (where Sagas go wrong in production)

**1. Idempotency everywhere.**
Messages get delivered twice and orchestrators retry. Every step and every compensation must be safe to run more than once. Pass a Saga ID (identifier) plus step name as an idempotency key and store processed keys, for example in DynamoDB with a conditional write.

**2. The dual-write problem → Transactional Outbox.**
A service must update its database and publish an event. If it crashes between the two, the Saga stalls or diverges. The fix is the Transactional Outbox: write the event into an outbox table in the same local transaction, then publish it from there. Change data capture (DynamoDB Streams, Debezium for PostgreSQL) or a polling relay can do the publishing.

**3. Missing isolation (the "I" in ACID).**
Other requests can see intermediate states. A second tenant might see a property as available while the first tenant's Saga is still running. Countermeasures:
- **Semantic lock:** a status field like `PENDING_ONBOARDING` that other flows respect.
- **Commutative updates:** design operations so their order doesn't matter (increment and decrement instead of "set to value").
- **Re-read value:** check that data hasn't changed before the pivot step.
- **Version check:** optimistic locking with a version number.

**4. Compensations can fail too.**
A refund call can time out. Compensations must be retriable and must not give up. When they finally can't succeed, route them to a dead-letter queue and alert a human. Always design a manual intervention path.

**5. Not everything can be undone.**
A sent email or text message can't be unsent. Either move such steps after the pivot, or compensate semantically ("sorry, your booking was cancelled" email).

**6. Timeouts are failures.**
A step that never answers is worse than one that fails. Each step needs a timeout that leads into compensation. Long-running Sagas need durable timers, not in-memory `setTimeout`.

**7. Observability.**
Propagate a correlation ID (identifier), the Saga ID, through every message and log line. Store the Saga state (current step, status, history) so support can answer "what happened to this order?". With choreography, distributed tracing (OpenTelemetry, AWS X-Ray) is close to mandatory.

## When not to use a Saga

- **All the data lives in one database.** Use a normal local transaction. A Saga there is pure overhead.
- **The service boundaries are wrong.** If two services always have to change together in one transaction, they probably belong to the same service. Merging them is often better than building a Saga between them.
- **The business requires strict immediate consistency** and can't tolerate visible intermediate states. Then you need a different design (a single owner of the data, or reservations with hard locks).
- **One simple step plus a notification.** Publisher-Subscriber with a retriable consumer is enough.

## How it connects to the other patterns (link back to article 1)

- **Compensating Transaction (D2):** the undo half of every Saga.
- **Retry (A1) and Circuit Breaker (A2):** used inside each step, before giving up and compensating.
- **Publisher-Subscriber (B3) and queues (B1):** the transport for choreographed Sagas and for orchestrator commands.
- **Event Sourcing (C3):** makes Saga state and compensations natural (compensation means appending a reversing event).
- **Sharding (C4) and database per service:** the reason Sagas are needed in the first place.
- **Transactional Outbox:** not one of the 20, but the pattern that makes Sagas reliable in practice.

## Further reading (verify links before publishing)

- Garcia-Molina and Salem, "Sagas", SIGMOD (Special Interest Group on Management of Data) 1987
- Microsoft Azure Architecture Center, "Saga distributed transactions pattern": https://learn.microsoft.com/azure/architecture/reference-architectures/saga/saga
- Chris Richardson, "Pattern: Saga": https://microservices.io/patterns/data/saga.html
- AWS (Amazon Web Services) Prescriptive Guidance, "Saga patterns": https://docs.aws.amazon.com/prescriptive-guidance/latest/cloud-design-patterns/saga.html
