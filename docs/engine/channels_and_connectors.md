---
title: Channels and Connectors
description: The fundamental building blocks
---

# Channels and Connectors

Channels are the primary building blocks in OIE. A channel represents a complete integration workflow. It defines where data comes from, how it gets transformed, and where it ultimately goes.

## About channels and connectors

A channel is made up of **connectors**. There are two kinds: a **source connector** brings data into OIE, while a **destination connector** pushes data out to an external system. Every channel has one source connector and one or more destinations. This means a single channel can take data from one place and deliver it to several different targets. For instance, receiving an HL7 message over TCP and simultaneously writing it to a file and inserting selected fields into a database.

```
┌──────────────────────────────────────────────────────────┐
│                        Channel                           │
│                                                          │
│  ┌────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │   Source    │───>│   Filters    │───>│ Destination  │  │
│  │ Connector   │    │ Transformers │    │ Connector(s) │  │
│  └────────────┘    └──────────────┘    └──────────────┘  │
│                                                          │
│  Scripts: Deploy | Preprocessor | Post Processor | Undeploy│
└──────────────────────────────────────────────────────────┘
```

## General channel properties

These are configured on the Summary tab of the channel editor and cover the overall behavior of the channel:

- **Unique ID, name, and description**
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

A channel needs at least one destination connector to deliver data outward. Destinations also have some features beyond the standard filter and transformer:

- **Enabled**. A toggle that controls whether the destination participates in processing. At least one destination must remain enabled at all times.
- **Wait for previous destination**. Determines which **chain** the destination belongs to (see [Destination Chains](#destination-chains) below).
- **Response Transformer**. A secondary transformer that operates on the reply received from the external system rather than the outbound message itself. It has its own pair of data types (response inbound and response outbound). A destination response includes the response data, the **status** (e.g. SENT, ERROR), a **status message**, and an **error message**. The response transformer can modify all of these. For example, overriding an ERROR status to SENT based on custom logic, or forcing a message into the queue. Note that response transformers only execute when there is an actual response payload to transform (e.g. they will not run if a connection to the remote server fails entirely). The exception is when the response inbound data type is set to Raw, in which case the response transformer always executes regardless of whether a response payload exists.

## Channel scripts

Each channel has four configurable scripts that run at specific points in the lifecycle:

| Script | When It Runs |
|---|---|
| **Deploy Script** | Executes once immediately before the channel is deployed |
| **Preprocessor Script** | Fires for each message, after the source connector receives it and after any attachment extraction, but before filtering and transformation begin. Used to modify the raw message. |
| **Post Processor Script** | Fires for each message after the source and all destinations have finished (not counting asynchronous queue processing), but before the source connector sends its response. Has access to destination responses and can return a custom reply for the source to use. |
| **Undeploy Script** | Executes once after the channel is undeployed |

## Connector components

Every connector, whether source or destination, shares a common set of building blocks:

### General connector properties

Each connector is identified by a name and a **metadata ID**. The source connector is always named "Source" with a metadata ID of 0. Destination connectors have user-defined names and metadata IDs that start at 1 and increment from there. Renaming a destination does not change its metadata ID.

### Connector-specific properties

The configuration fields vary by connector type. A TCP Listener has completely different settings from a Database Writer, for instance. See the [Connector Reference](./connector_reference.md) for specifics.

### Filter

Evaluates incoming messages and decides whether they should continue through the pipeline. See [Filters and Transformers](./filters_and_transformers.md) for details.

### Transformer

Modifies messages, converts between formats, and extracts values for use in templates and downstream steps. Every transformer has an **inbound data type** and an **outbound data type** that control how data is parsed and converted. See [Filters and Transformers](./filters_and_transformers.md) for details.

## Destination chains

Destinations within a channel are organized into **chains**. Chains run in parallel with each other, but within a single chain, destinations are processed sequentially. A destination whose **Wait for previous destination** setting is unchecked marks the beginning of a new chain. The first destination in a channel always starts the first chain. See [Threading and Ordering](./threading_and_ordering.md).

For example, with 5 destinations where Destination 3 does not wait on Destination 2 (starting a new chain):

```
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
            │
          Dest 5
  │         │
  └────┬────┘
       │
  Postprocessor
```

Here, Chain 1 (Dest 1 and 2) and Chain 2 (Dest 3, 4, and 5) run concurrently. If each destination takes 1 second, total processing time is 3 seconds (the longer chain) rather than 5.

## Channel groups

Channels can be sorted into **groups** for organizational purposes. Groups have no effect on processing behavior.

- Create groups in the Channels panel
- Drag and drop channels between groups
- Deploy/undeploy entire groups at once

## Channel states

| State | Description |
|---|---|
| **Started** | Channel is actively processing messages |
| **Stopped** | Channel is deployed but not processing |
| **Paused** | Channel is deployed, source is paused (queued messages still process) |
| **Undeployed** | Channel exists but is not loaded into the engine |

## Connector types

See [Connector Reference](./connector_reference.md) for detailed documentation on each connector type.

### Source connectors
| Connector | Protocol/Method |
|---|---|
| Channel Reader | Internal channel-to-channel |
| DICOM Listener | DICOM protocol |
| Database Reader | JDBC polling |
| File Reader | File/FTP/SFTP/S3/SMB/WebDAV |
| HTTP Listener | HTTP/HTTPS |
| JMS Listener | Java Message Service |
| JavaScript Reader | Custom scripted source |
| TCP Listener | TCP/MLLP |
| Web Service Listener | SOAP/WSDL |

### Destination connectors
| Connector | Protocol/Method |
|---|---|
| Channel Writer | Internal channel-to-channel |
| DICOM Sender | DICOM protocol |
| Database Writer | JDBC insert/update |
| Document Writer | PDF/RTF document generation |
| File Writer | File/FTP/SFTP/S3/SMB/WebDAV |
| HTTP Sender | HTTP/HTTPS |
| JMS Sender | Java Message Service |
| JavaScript Writer | Custom scripted destination |
| SMTP Sender | Email |
| TCP Sender | TCP/MLLP |
| Web Service Sender | SOAP/WSDL |

Additional connectors are available as community extensions. See the [Extension Catalog](./extension_catalog.md).
