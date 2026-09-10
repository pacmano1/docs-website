---
title: Channels
description: The fundamental building blocks
---

# Channels

Channels are the primary building blocks in OIE. A channel defines where data comes from, how it gets transformed, and where it ultimately goes.

## Channel lifecycle

You create and edit a channel in the channel editor. Your changes stay in the editor until you save. Saving stores the channel on the server. A saved channel does not process messages.

Deploying turns the saved channel into a running one. The scripts are compiled, the connectors are created, and **Initial State** decides whether the channel comes up started, paused, or stopped. The engine does not read the saved channel again, so an edit you make after that does nothing until the next deploy.

Start, pause, and stop apply to a deployed channel. Undeploying undoes the deploy. The saved channel stays on the server. Deleting removes the saved channel.

[Deploy, Start, and Channel State](./channel_state.md) has the detail.

## About channels and connectors

A channel is made up of **connectors**. There are two kinds: a **source connector** brings data into the channel, and a **destination connector** sends it back out. Neither end has to be an external system. A Channel Reader receives messages from another channel. A Channel Writer sends messages to another channel. A JavaScript Writer runs a script, which need not send the message anywhere at all. Every channel has one source connector and one or more destinations. This means a single channel can take data from one place and deliver it to several different targets. For instance, receiving an HL7 message over TCP and simultaneously writing it to a file and inserting selected fields into a database.

```text
┌────────────────────────────────────────────────────────────┐
│                          Channel                           │
│                                                            │
│  ┌────────────┐    ┌──────────────┐    ┌──────────────┐    │
│  │   Source   │───>│   Filters    │───>│ Destination  │    │
│  │ Connector  │    │ Transformers │    │ Connector(s) │    │
│  └────────────┘    └──────────────┘    └──────────────┘    │
│                                                            │
│  Scripts: Deploy | Preprocessor | Postprocessor | Undeploy │
└────────────────────────────────────────────────────────────┘
```

The filters and transformers are drawn once here for simplicity. Every connector, source and destination alike, has its own filter and transformer; see [Connector components](#connector-components).

## General channel properties

These are configured on the Summary tab of the channel editor and cover the overall behavior of the channel:

- **Name and description**. The channel's unique ID is assigned automatically, not entered
- **Code Template Libraries**. Controls which reusable JavaScript functions are accessible within the channel
- **Library Resources**. Specifies which custom Java classes can be referenced by the channel's connectors or scripts
- **Deploy/Start Dependencies**. Lets you define ordering relationships between channels so certain channels come online before others
- **Attachment Handler**. Provides a way to extract pieces of incoming messages and store them separately. As a message moves through the channel, multiple copies of its content are held in memory at the same time (raw, transformed, and encoded versions). Attachment data is stored only once rather than being duplicated in each copy, which can significantly reduce memory usage
- **Message Storage Settings**. Governs what message data gets persisted, whether encryption is applied, and whether connectors can use persistent queuing
- **Message Pruning Settings**. Defines retention periods for message data and offers the option to archive messages to disk before they are removed
- **Custom Metadata Columns**. Lets you pull specific values out of messages and store them as searchable columns in the Message Browser
- **Channel Tags**. Labels for organizing channels into logical groups

## Source connector

Each channel has exactly one source connector responsible for bringing data into OIE. Beyond the standard filter and transformer components, source connectors offer several additional features:

- **Source Queue**. When turned on, the channel operates in store-and-forward mode: it accepts the incoming data and immediately sends back an acknowledgement without waiting for the full processing pipeline to finish. See [Queueing](./queueing.md).
- **Batch Processor**. When activated, a single inbound payload gets broken apart into individual messages, each of which travels through the channel independently.
- **Response Selector**. Configures what gets sent back to the system that delivered the message. Options include auto-generating a response based on the source data type, forwarding the reply from a particular destination, or providing an entirely custom response.
- **Max Processing Threads**. Defaults to 1, meaning messages go through the channel one at a time. Raising this value increases throughput but sacrifices guaranteed message ordering. This setting does not affect asynchronous processes such as destination queuing.

## Destination connectors

A channel has at least one destination connector, and at least one of them has to be enabled. That does not make destinations the only way data leaves a channel. A script anywhere in the channel can send data out on its own, and a source-side one does it before any destination is reached.

How many destinations a given message reaches is anywhere from none of them to all of them. The [destination set](./glossary.md#destination-set) decides which ones it is queued for, and each destination's own filter can still drop it after that. Destinations have a few features beyond the standard filter and transformer:

- **Enabled**. Whether the destination takes part in processing. A disabled one is skipped entirely.
- **Wait for previous destination**. Determines which **chain** the destination belongs to (see [Destination Chains](#destination-chains) below).
- **Response Transformer**. A second transformer that runs on the reply the destination got back, not on the message it sent. It has its own inbound and outbound data types. It can rewrite the response data, and it can set the response's status, status message, and error message. It runs only when a reply actually came back, so a destination that failed to connect skips it. The exception is a response inbound data type of **Raw**, which runs it either way.

## Channel scripts

Each channel has four configurable scripts that run at specific points in the lifecycle:

| Script | When It Runs |
|---|---|
| **Deploy Script** | Executes once immediately before the channel is deployed |
| **Preprocessor Script** | Fires for each message, after the source connector receives it and after any attachment extraction, but before filtering and transformation begin. Used to modify the raw message. A common use is stripping a byte order mark (BOM) from the front of the message before the engine parses it. |
| **Postprocessor Script** | Fires for each message after the source and all destinations have finished (not counting asynchronous queue processing), but before the source connector sends its response. Has access to destination responses and can return a custom reply for the source to use. |
| **Undeploy Script** | Executes once after the channel is undeployed |

## Connector components

Every connector, whether source or destination, shares a common set of building blocks:

### General connector properties

Each connector is identified by a name and a **metadata ID**. The source connector is always named "Source" with a metadata ID of 0. Destination connectors have user-defined names and metadata IDs that start at 1 and increment from there. Renaming a destination does not change its metadata ID.

### Connector-specific properties

The configuration fields vary by connector type. A TCP Listener has completely different settings from a Database Writer, for instance. See [Source Connectors](./connector_reference_sources.md) and [Destination Connectors](./connector_reference_destinations.md) for specifics.

### Filter

A filter decides whether a message goes on. Whatever you build in the filter editor becomes plain JavaScript, and the **Generated Script** tab shows you exactly what it built. The one requirement is that the script returns true or false.

That requirement is what separates a filter from a transformer. Code you would write in a transformer step also runs in a filter rule. It can set a map variable, reshape the message, or call a code template.

See [Filters and Transformers](./filters_and_transformers.md) for details.

### Transformer

Modifies messages, converts between formats, and extracts values for use in templates and downstream steps. Every transformer has an **inbound data type** and an **outbound data type** that control how data is parsed and converted. See [Filters and Transformers](./filters_and_transformers.md) for details.

## Destination chains

Chains are a byproduct of the **Wait for previous destination** checkbox on each destination.

It sits on the **Destinations** tab beside the connector type dropdown, and applies to the destination selected in the table above it. If it is checked, the destination joins the chain of the destination above it. If it is cleared, the destination starts a new chain. On the first destination it is cleared and greyed out, because the first destination always starts the first chain.

Chains run concurrently. Within a chain, destinations run one at a time, in order.

The engine builds the chains when the channel deploys, reading the destination list from top to bottom and skipping disabled destinations. Reordering the list changes the chains. So does disabling a destination: disable the one that starts a chain and the destinations below it join the chain above.

For example, with 5 destinations where Destination 3 does not wait on Destination 2 (starting a new chain):

```text
Source Connector
       │
       ▼
   Preprocessor
       │
  ┌────┴────┐
  │         │
Chain 1   Chain 2
  │         │
Dest 1    Dest 3
  │         │
Dest 2    Dest 4
  │         │
  │       Dest 5
  │         │
  └────┬────┘
       │
  Postprocessor
```

Here, Chain 1 (Dest 1 and 2) and Chain 2 (Dest 3, 4, and 5) run concurrently. If each destination takes 1 second, total processing time is 3 seconds (the longer chain) rather than 5. The source connector's filter and transformer, which run after the preprocessor and before the chains start, are left out of the diagram.

## Channel groups

Channels can be organized into **groups**. Groups have no effect on processing behavior.

- Create groups in the Channels panel
- Drag and drop channels between groups
- Deploy/undeploy entire groups at once

## Channel states

| State | Description |
|---|---|
| **Started** | Channel is actively processing messages |
| **Stopped** | Channel is deployed but not processing |
| **Paused** | Channel is deployed, source is paused (queued messages still process) |
| **Undeployed** | Saved on the server, not running |

## Connector types

See [Source Connectors](./connector_reference_sources.md) and [Destination Connectors](./connector_reference_destinations.md) for every type and every setting it exposes.

Additional connectors are available as community extensions, cataloged at [openintegrationengine.org/plugins](https://openintegrationengine.org/plugins/). See the [Plugin Guide](./plugins.md) for installing them.
