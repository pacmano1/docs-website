---
title: Architecture
description: How OIE is structured internally
---

# Architecture

The Open Integration Engine (OIE) is an open source integration engine for healthcare. It receives messages from one system, filters and transforms them under rules you define, and delivers them to other systems, in the formats those systems speak (HL7, X12, EDI, DICOM, XML, among others).

## Core concepts

### Channels

Channels are the fundamental building blocks of OIE. A channel is an interface you configure to receive data from a source, take actions on that data (filter, transform, extract), and send it out to zero or more destinations.

Each channel has general properties including a unique ID, name, and description. Channels can also be configured with code template library links, library resources, deploy/start dependencies (to control deployment order), attachment handler settings, message storage and pruning settings, and custom metadata columns.

### Data types

A data type is the format of the message a channel is handling: HL7 v2.x, X12, DICOM, JSON, and so on. It is also the instruction for reading that format. The **inbound** data type **parses** the incoming message into an internal representation that filters and transformers can work with. The **outbound** data type **serializes** that representation into the format that leaves the channel.

The internal representation varies by data type. For example, HL7 v2.x data is parsed into an [E4X](./glossary.md#e4x) XML object, JSON data becomes a JavaScript Object, and Raw data remains a Java String, unparsed.

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

### Connectors

A channel consists of multiple **connectors**:

- **Source Connector**. Gets data into the channel. Every channel has exactly one.
- **Destination Connectors**. Sends data out. A channel is configured with at least one, and may have several. A given message may still reach none of them, if the source filter rejects it or destination set filtering removes them all. Each has an **enabled** flag and a **wait for previous destination** setting that decides its chain membership.

A connector's type decides its configuration. A TCP Listener asks for a local address and port, an HTTP Listener for a base context path, a Database Reader for a query and a polling schedule. The fields belong to the type, and no two types offer the same set, so picking the type is most of the configuration decision.

Every source connector also carries a common block of **source settings**, though not all of them apply to every type:

- a **source queue**, which when on accepts the message and responds immediately rather than waiting for processing to finish. Turning it on enables a queue buffer size and changes what the response can be set to
- a **response selector**, choosing which response goes back
- **batch processing**, splitting one inbound payload into several messages. Offered only by types that support batching
- **max processing threads**, controlling how many messages the channel processes at once

The **attachment handler** is a channel setting rather than a connector one, but it acts on data as it arrives: it pulls large or repeated content out of the message and stores it once, leaving a reference behind. On traffic carrying images, documents, or any payload that recurs across messages, this can cut storage dramatically.

For example, you may receive data over HTTP, then write it out to a file **and** insert pieces of it into a database.

See [Channels and Connectors](./channels_and_connectors.md), and [Source Connectors](./connector_reference_sources.md) and [Destination Connectors](./connector_reference_destinations.md) for what each type exposes.

### Filters

A filter decides whether a message should proceed to the next step or not. A filter returns **true** (accepted) or **false** (filtered). Filters are comprised of multiple **rules**, joined by **AND** or **OR** operators.

- If the source connector filters out a message, it will not be processed by any destination connectors.
- If a destination connector filters out a message, other destinations may still process it.

### Transformers

A transformer modifies a message, converts it from one format to another, and extracts pieces for later use. A transformer has an **inbound data type** and an **outbound data type** (e.g., HL7 v2.x to JSON). Transformers are comprised of multiple **steps**, each of which modifies or extracts data.

See [Filters and Transformers](./filters_and_transformers.md) for details.

### Response transformers

Every destination can have a **response transformer**, which runs on what the receiving system sends back. Use it to read an acknowledgement, decide whether the send really succeeded, and set the status the message ends up with. It is the only transformer that runs after a connector rather than before one.

### Channel scripts

Four special scripts are associated with each channel:

- **Deploy Script**. Runs once right before a channel is deployed.
- **Preprocessor Script**. Runs once for every message, after the attachment handler has optionally extracted data, but before the source filter/transformer. Used to modify the incoming message.
- **Post Processor Script**. Runs once for every message, after the source connector and all destinations have completed (excluding asynchronous processes like the destination queue). Has access to responses from all executed destinations and can return a custom response for the source connector to use.
- **Undeploy Script**. Runs once after the channel has been stopped and its connectors undeployed.

### How a message moves

<svg viewBox="0 0 900 500" role="img" aria-label="A message enters the source connector, passes the preprocessor and the source filter and transformer, then each destination filter and transformer and its connector, whose response is handled by that destination response transformer, then the postprocessor, which produces the response returned to the source system." style="width:100%;height:auto;font-family:system-ui,-apple-system,sans-serif">
<defs>
<marker id="cf-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="var(--vp-c-text-3)"/></marker>
</defs>
<rect x="170" y="16" width="520" height="468" rx="10" fill="var(--vp-c-bg-soft)" stroke="var(--vp-c-divider)"/>
<text x="186" y="40" font-size="13" font-weight="600" fill="var(--vp-c-text-2)">OIE Channel</text>
<g fill="none" stroke="var(--vp-c-text-3)" stroke-width="1.5">
<path d="M593,100 V122 H250 V300"/>
<path d="M666,163 H706 V238"/>
<path d="M666,300 H706 V238"/>
</g>
<g fill="none" stroke="var(--vp-c-text-3)" stroke-width="1.5" marker-end="url(#cf-arrow)">
<path d="M126,79 H184"/><path d="M338,79 H352"/><path d="M490,79 H504"/>
<path d="M250,163 H258"/><path d="M480,163 H492"/><path d="M581,184 V192"/>
<path d="M250,300 H258"/><path d="M480,300 H492"/><path d="M581,321 V329"/>
<path d="M706,238 H742"/>
<path d="M581,375 V433 H484"/>
</g>
<path d="M262,433 H200 V466 H67 V111" fill="none" stroke="var(--vp-c-text-3)" stroke-width="1.5" stroke-dasharray="5 4" marker-end="url(#cf-arrow)"/>
<text x="122" y="458" font-size="11" fill="var(--vp-c-text-2)">response</text>
<g fill="var(--vp-c-bg)" stroke="var(--vp-c-divider)">
<rect x="8" y="51" width="118" height="56" rx="6"/><rect x="746" y="210" width="136" height="56" rx="6"/>
<rect x="188" y="58" width="150" height="42" rx="5"/><rect x="356" y="58" width="134" height="42" rx="5"/><rect x="508" y="58" width="170" height="42" rx="5"/>
<rect x="262" y="142" width="218" height="42" rx="5"/><rect x="496" y="142" width="170" height="42" rx="5"/><rect x="496" y="196" width="170" height="42" rx="5"/>
<rect x="262" y="279" width="218" height="42" rx="5"/><rect x="496" y="279" width="170" height="42" rx="5"/><rect x="496" y="333" width="170" height="42" rx="5"/>
<rect x="262" y="412" width="218" height="42" rx="5"/>
</g>
<g font-size="12" fill="var(--vp-c-text-1)" text-anchor="middle" dominant-baseline="central">
<text x="67" y="70">Source</text><text x="67" y="88">System</text>
<text x="814" y="229">Destination</text><text x="814" y="247">System(s)</text>
<text x="263" y="79">Source Connector</text><text x="423" y="79">Preprocessor</text><text x="593" y="79">Source Filter/Transformer</text>
<text x="371" y="163">Destination 1 Filter/Transformer</text><text x="581" y="163">Connector 1</text><text x="581" y="217">Response Transformer 1</text>
<text x="371" y="300">Destination 2 Filter/Transformer</text><text x="581" y="300">Connector 2</text><text x="581" y="354">Response Transformer 2</text>
<text x="371" y="433">Postprocessor</text>
</g>
</svg>

Destination 2 follows destination 1 in the diagram because it waits for the previous destination, which is the default. With that setting off, each destination starts a chain of its own and the chains run concurrently.

Neither end of that diagram has to be outside OIE. A Channel Reader source receives from Channel Writers on other channels, a Channel Writer destination hands the message to another channel on the same engine, and a script can dispatch to one through `router`.

Each box in the diagram is a step, and every step after the first is optional or
conditional:

1. The **source connector** receives the message.
2. The **attachment handler**, if one is configured, pulls content out of the message and leaves a reference in its place.
3. The **preprocessor script** can modify the raw message before anything parses it.
4. The **source filter** decides whether the message goes on, and the **source transformer** converts and extracts from it. A message filtered here reaches no destination.
5. For each destination: its **filter and transformer** run, then its **connector** processes the message, which may or may not result in a send.
6. That destination's **response transformer** handles whatever comes back.
7. The **postprocessor script** runs once every destination has finished, and can build the response itself.
8. If something is waiting on the other end, the response goes back to it. A listener source such as an HTTP, TCP, or Web Service Listener returns it to the caller. A polling source such as a Database Reader or File Reader has no caller, so the response is selected and stored on the message but sent nowhere.

Four pages explain the mechanisms behind those steps:

- [Message Lifecycle and Storage](./message_lifecycle.md), the processing path, statuses, content types, and what each storage mode keeps
- [Queueing](./queueing.md), the source queue and destination queues
- [Threading and Ordering](./threading_and_ordering.md), which thread does the work, chains, and response selection
- [Deploy, Start, and Channel State](./channel_state.md), what deploy does and what each state means

The [Glossary](./glossary.md) collects the terms these pages use.

## Administration interfaces

- **Administrator**. A Java Swing desktop client for managing channels, viewing messages, configuring settings, and monitoring the system. Connects to the server over HTTPS using a RESTful API. Requires a compatible launcher; see [Desktop Administrator](./desktop_administrator.md) for the available options.
- **[Web Administrator](./web_administrator.md)**. A browser-based administrator installed as the Web Support extension and served by the engine's own embedded Jetty. Read/write against the same REST API, so it and the desktop client can be used against one engine at the same time. Requires 4.6.0.
- **Command Line Interface (CLI)**. A terminal-based client for scripting and headless administration. Uses the same REST API as the Administrator.

## Extensions

OIE uses a plugin architecture where connectors, data types, and other features are loaded as extensions. Extension types include:

- **Connectors**. Source and destination communication protocols
- **Data Type Plugins**. Message format parsers and serializers
- **Server Plugins**. Background services and event handlers
- **Transmission Mode Providers**. Frame-level protocol handling (e.g., [MLLP](./glossary.md#mllp))

Extensions are loaded from the extensions directory when the engine starts. An extension can ship a desktop UI, a web UI, or both; the web administrator serves the web side. A growing set of open source extensions is available beyond those bundled with the engine. See the [Plugin Guide](./plugins.md), and [openintegrationengine.org/plugins](https://openintegrationengine.org/plugins/) for the community catalog.
