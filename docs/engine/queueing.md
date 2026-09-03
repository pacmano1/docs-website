---
title: Queueing
description: How the source queue and destination queues work, what QUEUED means, and what ordering the engine promises
---

# Queueing

A queue in OIE is not a structure that holds messages in memory. It is a question the engine asks the database: which of this connector's messages are still waiting? The source queue is the set of source connector messages in RECEIVED status for this server. A destination queue is the set of that destination's connector messages in QUEUED status. Each queue keeps a small in-memory buffer, 1000 rows by default, filled from that query in message id order. The Queued figure on the Dashboard is the row count in the database, not the size of the buffer.

Because the queue is the database, nothing is lost when a channel stops, is undeployed, or the server restarts. The rows stay where they are and the buffer is rebuilt the next time the queue starts. This page explains how a message gets into each queue, what the settings do, what order the engine promises, and how the queues behave through the channel's states.

## The source queue

The setting is on the **Source** tab under Source Settings, labelled **Source Queue**, with two options.

| Option | What happens to a message |
|---|---|
| **OFF (Respond after processing)** | The thread that received the message runs the whole channel: preprocessor, source filter and transformer, every destination chain, postprocessor. The sender waits for all of it, and its response can come from any point in that path. |
| **ON (Respond before processing)** | The engine writes the raw message, responds to the sender at once, and processes the message later on a source queue thread. |

With the queue on, the sender's response is limited to **None** or **Auto-generate (Before processing)**, because nothing else exists yet when the response goes back. The Administrator restricts the Response list accordingly.

The number of source queue threads equals **Max Processing Threads**. With more than one, messages leave the queue in id order but are processed at the same time, so order is not preserved. See [Threading and Ordering](./threading_and_ordering.md).

A source queue message is recovered by the queue itself. On start, the source queue picks up every source connector message still in RECEIVED and processes it, which is also how messages that were received but never processed before a crash are handled in Development and Production storage modes.

**Queue Buffer Size** sets the in-memory buffer for this channel and is enabled only when the queue is on. It defaults to the server setting **Default Queue Buffer Size**, `server.queuebuffersize`, which is 1000 unless changed. The same default applies to destination queues.

## Destination queues

### Queue modes

**Queue Messages** on each destination has three options. Underneath they are two stored booleans, `queueEnabled` and `sendFirst`.

| Option | Behaviour |
|---|---|
| **Never** | Queueing off. The message is sent on the processing thread. A failure, after any retries, ends in ERROR. |
| **On Failure** | Try to send on the processing thread first. If that fails, or if the queue already holds messages, the message goes to the queue. |
| **Always** | The message goes to the queue at once and is sent by a queue thread. |

Two consequences of these rules matter in practice.

On Failure attempts a direct send only while the queue is empty. Once a backlog exists, every new message goes straight to the back of the queue. That is what stops a new message jumping ahead of older ones during an outage.

With Always, and with On Failure while a backlog exists, later destinations in the same chain and the postprocessor see this destination's response as QUEUED. Any script that expects to read the destination's real response must run after the send, which means the destination cannot be queued.

### How a failed send becomes QUEUED

Every destination connector starts its response with the status QUEUED and changes it to SENT only when the send succeeds. When queueing is Never, the engine converts a QUEUED result to ERROR, logging that the status cannot be QUEUED while queueing is disabled. That single conversion is why the same transport failure produces ERROR on one destination and QUEUED on another: the difference is only the queue mode.

### Retry Count and Retry Interval

Two fields in Advanced Queue Settings govern the attempts made on the processing thread, before the message is queued or errored.

| Field | Default | Effect |
|---|---|---|
| **Retry Count Before Queue/Error** | 0 | Extra attempts made on the processing thread. With Never, exhausting them produces ERROR. With On Failure, exhausting them queues the message. |
| **Retry Interval (ms)** | 10000 | Wait between those attempts, and also the wait a queue thread observes between attempts on the same message. |

Once a message is in the queue, retries are unlimited. No counter applies to queue attempts and a queued message never becomes ERROR because retries ran out. It is retried until it sends or until someone removes it. A queue thread produces ERROR only in three narrow cases: the destination's connector type changed after the message was queued, the message was queued before Include Filter/Transformer was turned off and was never transformed, or the response transformer throws.

### Queue threads and the thread assignment variable

**Queue Threads** sets how many threads send from this queue. The default is 1. Above 1, message order is not preserved unless a **Thread Assignment Variable** is set.

The variable names a map entry that the engine reads for each queued message, searching the response map, connector map, channel map, and source map in that order. Messages with the same value always go to the same thread, so they send in order relative to each other. The first N distinct values each get a thread of their own, where N is the thread count. Values after that are hashed onto the threads, so two unrelated values can share one. Messages that have no value for the variable all share a single thread, so they stay in order relative to each other but do not parallelise.

When **Regenerate Template** is off, the value is read from the sent content stored when the message was queued, not from the current channel. Changing the variable after messages have queued does not re-sort them.

### Rotate Queue, Regenerate Template, Include Filter/Transformer

**Rotate Queue** moves on to the next message after a failure instead of retrying the same one. It is implemented as a window over message ids: the queue works through the ids present when the pass started, then wraps to the beginning. Messages that arrive during a pass wait for the next one. Rotation drops ordering by design; the setting's own tooltip says to leave it off when order matters.

**Regenerate Template** rebuilds the destination's message from the current maps on every attempt, instead of resending the content built when the message was queued. **Include Filter/Transformer** goes one step further and re-runs the destination filter and transformer on every attempt. It requires Regenerate Template. Turning it off later forces any queued message that was never transformed to ERROR on its next attempt.

### What order the engine promises

| Configuration | Order |
|---|---|
| One queue thread, rotate off | Strict order by message id. A message that keeps failing blocks everything behind it. |
| Several threads, no assignment variable | None. Every thread takes the next available message. |
| Several threads with an assignment variable, rotate off | In order for messages sharing a value. No order across values. |
| Rotate on, any thread count | None. |
| Source queue with Max Processing Threads above 1 | None. The source queue has no assignment variable. |

## What the message storage mode has to do with it

A queue re-reads the message from the database later, so it needs the content that a send is built from. The engine checks this at deploy and refuses a channel whose storage mode cannot support its queues.

| Storage mode | Source queue | Destination queues |
|---|---|---|
| Development | Allowed | Allowed |
| Production | Allowed | Allowed |
| Raw | Allowed | Refused |
| Metadata | Refused | Refused |
| Disabled | Refused | Refused |

The source queue needs the raw content stored, plus either the maps or a durable raw write. A destination queue needs the source's encoded content, the sent content, and the maps. Raw mode keeps only raw content, which is why it can carry a source queue and not a destination queue.

The Administrator refuses to save the combination first, with a warning beside the Message Storage slider that queueing must be disabled before using that mode. The deploy-time check is the backstop for channels imported through the API or CLI. See [Message Lifecycle and Storage](./message_lifecycle.md) for what each mode keeps.

## Queues through the channel's states

| State or action | Source queue | Destination queues |
|---|---|---|
| **Started** | Draining | Draining |
| **Paused** | Draining | Draining |
| **Stopped** | Threads stopped. Rows stay in RECEIVED. | Threads stopped. Rows stay in QUEUED. |
| **Halt** | Threads interrupted, possibly mid-message | Threads interrupted, possibly mid-send |
| **Undeployed** | As Stopped | As Stopped |
| Initial state **Paused** | Starts and drains | Start and drain |
| Initial state **Stopped** | Does not start | Do not start |

Pause stops only the source connector, so a paused channel accepts nothing new but keeps working through both queues. Stop waits for in-flight messages to finish, then stops the queue threads. Halt does not wait; the engine's own comment on halt says that a message interrupted mid-send may or may not have been delivered, and that a duplicate is a possible consequence.

A single destination can be stopped on its own only when its queueing is enabled. While it is stopped, every message for it goes to its queue regardless of mode, and nothing sends until it is started again.

## Consequences worth knowing

- The Data Pruner never removes a message that has a connector message in QUEUED, PENDING, or ERROR status. A queue that never drains grows the database until someone deals with it.
- Queues are scoped to a server id. Each server processes only the rows it wrote.
- Removing a queued message from the Message Browser, or removing all messages, is handled by the queue but logs an error for the interrupted attempt with the text "This error is expected if the message was manually removed from the queue." Removing all messages requires the channel to be stopped.
- Reducing a queue's buffer size below the current buffer contents clears the buffer; it refills from the database.
