---
title: Architecture
description: How OIE is structured internally
---

# Architecture

The Open Integration Engine (OIE) is an open source standards-based healthcare integration engine that enables interoperability between two systems by accepting incoming information packets, called messages, and processing them according to rules you provide. It speeds message routing, filtering, and transformation between health-info systems using various message formats (e.g., HL7, X12, EDI, DICOM, XML).

## Core concepts

### Channels

Channels are the fundamental building blocks of OIE. A channel is an interface you configure to receive data from a source, take actions on that data (filter, transform, extract), and send it out to one or more destinations.

```
┌──────────┐    ┌─────────────────────────────────────────┐    ┌─────────────────┐
│  Source   │───>│            OIE Channel                  │───>│  Destination     │
│  System   │    │  Source Connector → Filter/Transformer  │    │  System(s)       │
└──────────┘    │               → Destination Connector(s) │    └─────────────────┘
                └─────────────────────────────────────────┘
```

Each channel has general properties including a unique ID, name, and description. Channels can also be configured with code template library links, library resources, deploy/start dependencies (to control deployment order), attachment handler settings, message storage and pruning settings, and custom metadata columns.

### Connectors

A channel consists of multiple **connectors**:

- **Source Connector**. Gets data into OIE from an external system. Every channel has exactly one source connector. Source connectors may also include a **source queue** (when ON, messages are queued and a response is sent immediately before processing completes), a **batch processor** (to split incoming data into multiple messages), a **response selector** (to choose which response to return), and a **max processing threads** setting (to control concurrent processing).
- **Destination Connectors**. Sends data out to external systems. A channel has at least one, and may have multiple destination connectors. Each destination has an **enabled** flag and a **wait for previous destination** setting that determines its chain membership. Destinations also include a **response transformer** for processing responses received from external systems.

For example, you may receive data over HTTP, then write it out to a file **and** insert pieces of it into a database.

See [Channels and Connectors](./channels_and_connectors.md) and [Connector Reference](./connector_reference.md) for details.

### Filters

A filter decides whether a message should proceed to the next step or not. A filter returns **true** (accepted) or **false** (filtered). Filters are comprised of multiple **rules**, joined by **AND** or **OR** operators.

- If the source connector filters out a message, it will not be processed by any destination connectors.
- If a destination connector filters out a message, other destinations may still process it.

See [Filters and Transformers](./filters_and_transformers.md) for details.

### Transformers

A transformer modifies a message, converts it from one format to another, and extracts pieces for later use. A transformer has an **inbound data type** and an **outbound data type** (e.g., HL7 v2.x to JSON). Transformers are comprised of multiple **steps**, each of which modifies or extracts data.

See [Filters and Transformers](./filters_and_transformers.md) for details.

### Data types

A data type tells a filter/transformer how to parse a certain format. The **inbound** data type **serializes** raw data into an internal representation that filters and transformers can work with. The **outbound** data type **deserializes** transformed data back into the actual outbound format.

The internal representation varies by data type. For example, HL7 v2.x data is serialized into an E4X XML object, JSON data becomes a JavaScript Object, and Raw data remains a Java String with no serialization.

Supported data types include:
- Delimited Text
- DICOM
- EDI / X12
- HL7 v2.x
- HL7 v3.x
- JSON
- NCPDP
- Raw
- XML

See [Data Types and Formats](./data_types_and_formats.md) for details.

## How a message moves

A message enters through the source connector, passes the source filter and transformer, is handed to each destination chain, and produces a response for the sender. Four pages explain the mechanisms behind that sentence:

- [Message Lifecycle and Storage](./message_lifecycle.md), the processing path, statuses, content types, and what each storage mode keeps
- [Queueing](./queueing.md), the source queue and destination queues
- [Threading and Ordering](./threading_and_ordering.md), which thread does the work, chains, and response selection
- [Deploy, Start, and Channel State](./channel_state.md), what deploy does and what each state means

## Channel scripts

Four special scripts are associated with each channel:

- **Deploy Script**. Runs once right before a channel is deployed.
- **Preprocessor Script**. Runs once for every message, after the attachment handler has optionally extracted data, but before the source filter/transformer. Used to modify the incoming message.
- **Post Processor Script**. Runs once for every message, after the source connector and all destinations have completed (excluding asynchronous processes like the destination queue), but before a response is sent back to the originating system. Has access to responses from all executed destinations and can return a custom response for the source connector to use.
- **Undeploy Script**. Runs once right before a channel is undeployed.

## Administration interfaces

- **Administrator**. A Java Swing desktop client for managing channels, viewing messages, configuring settings, and monitoring the system. Connects to the server over HTTPS using a RESTful API. Requires a compatible launcher; see [Desktop Administrator](./desktop_administrator.md) for the available options.
- **[Web Administrator](./web_administrator.md)**. A browser-based administrator installed as the Web Support extension and served by the engine's own embedded Jetty. Read/write against the same REST API, so it and the desktop client can be used against one engine at the same time. Requires 4.6.0.
- **Command Line Interface (CLI)**. A terminal-based client for scripting and headless administration. Uses the same REST API as the Administrator.

## Extensions

OIE uses a plugin architecture where connectors, data types, and other features are loaded as extensions. Extension types include:

- **Connectors**. Source and destination communication protocols
- **Data Type Plugins**. Message format parsers and serializers
- **Server Plugins**. Background services and event handlers
- **Transmission Mode Providers**. Frame-level protocol handling (e.g., MLLP)

Extensions are discovered at runtime, so one install serves both the desktop and web administrators. A growing set of open source extensions is available beyond those bundled with the engine. See [Plugins and Extensions](./extension_catalog.md).
