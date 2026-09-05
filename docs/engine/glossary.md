---
title: Glossary
description: Key terms used across the OIE documentation, with the engine behavior behind each one
---

# Glossary

| Term | Definition |
|---|---|
| **ACK** | Acknowledgment message sent back to a sender confirming receipt of a message (common in HL7) |
| **Attachment** | Binary or large content extracted from a message and stored separately |
| **Batch** | A single inbound payload that is split into multiple discrete messages |
| **Channel** | The fundamental processing unit in OIE; defines a complete message pipeline from source to destination(s) |
| **Channel Group** | An organizational container for grouping related channels |
| **Channel Map** | A key-value store scoped to a single message across all connectors in a channel. Shorthand `$c`. Read-only in the postprocessor |
| **Channel Writer/Reader** | Internal connectors for routing messages between channels within the same OIE instance |
| **Code Template** | A reusable JavaScript function or code snippet shared across channels |
| **Configuration Map** | Server-wide key-value pairs accessible in all channel scripts; configured in Settings. Shorthand `$cfg` |
| **Connector** | A protocol-specific endpoint (source or destination) that handles message I/O |
| **Connector Map** | A key-value store scoped to a single message within a single connector. Shorthand `$co` |
| **Dashboard** | The main operational view showing deployed channels and their real-time statistics |
| **Data Pruner** | A background process that automatically removes old message data |
| **Data Type** | A message format parser/serializer (e.g., HL7 v2.x, XML, JSON, DICOM). The data type decides what `msg` and `tmp` are: E4X XML for XML-serialized types, a JavaScript object for JSON, a String for Raw |
| **Deploy** | Turning a saved channel definition into a running object. Scripts are compiled, connectors created, tables reconciled, and the channel is then started, paused, or left stopped according to its Initial State. See [Deploy, Start, and Channel State](./channel_state.md) |
| **Derby** | Apache Derby; the embedded database used by default for development |
| **Destination** | A connector that sends processed messages to an external system or another channel |
| **Destination Set** | The set of destinations that will process a given message. Available on the source connector only, and modifiable from the source filter or transformer via `destinationSet` |
| **DICOM** | Digital Imaging and Communications in Medicine; a standard for medical imaging |
| **Donkey** | The internal message processing engine that handles queuing, storage, and message lifecycle |
| **E4X** | ECMAScript for XML; the syntax used to access message fields when the data type is XML-serialized (HL7 v2.x, HL7 v3.x, XML, EDI/X12, NCPDP, Delimited Text, DICOM). JSON and Raw messages are not E4X |
| **EDI** | Electronic Data Interchange; a standard for business document exchange |
| **Extension** | A plugin that adds functionality to OIE (connectors, data types, plugins, etc.) |
| **Filter** | A set of rules that determine whether a message should be processed or rejected. Compiled into the same script as its transformer, so the two share one scope |
| **Global Channel Map** | A key-value store shared across all messages within a specific channel. Shorthand `$gc`. Not present in the global deploy and undeploy scripts |
| **Global Map** | A key-value store shared across all channels on the server. Shorthand `$g` |
| **HL7** | Health Level Seven; a set of international standards for healthcare data exchange |
| **Iterator** | A transformer step type that loops over repeating segments or elements |
| **Mapper** | A transformer step type that extracts a value from the source message into a variable |
| **Message** | A discrete unit of data processed by a channel |
| **Message Browser** | The UI for searching, viewing, and managing individual messages. Channel and connector map entries appear on its Mappings tab |
| **Message Builder** | A transformer step type that sets a field in the outbound message |
| **Message Storage Mode** | Controls how much message content is persisted (Development, Production, Raw, Metadata, Disabled) |
| **MLLP** | Minimum Lower Layer Protocol; the standard framing protocol for HL7 over TCP |
| **NACK** | Negative Acknowledgment; indicates a message was received but could not be processed |
| **NCPDP** | National Council for Prescription Drug Programs; a pharmacy transaction standard |
| **OIE** | Open Integration Engine; this project |
| **Postprocessor** | A channel script that runs after all destinations have processed a message. Its maps are read-only |
| **Preprocessor** | A channel script that runs before the source filter and transformer, receiving the raw message as a String in `message` |
| **Pruning** | The process of removing old message data from the database |
| **Queue** | Not an in-memory structure. A queue is a set of rows in the database: the source queue is this connector's messages in RECEIVED status, a destination queue is that destination's messages in QUEUED status. Each keeps a small in-memory buffer filled from that query. See [Queueing](./queueing.md) |
| **Response** | Data returned by a destination system after receiving a message |
| **Response Map** | A key-value store for destination responses, used to return responses to the source. Shorthand `$r` |
| **Rhino** | Mozilla Rhino; the JavaScript engine used by OIE. Language version is set by `rhino.languageversion` in `mirth.properties` |
| **Rule** | A single condition within a filter (Rule Builder, JavaScript, or External Script) |
| **Serialization** | Converting an internal message representation to an output format string |
| **Source** | The connector that receives inbound messages for a channel |
| **Source Map** | A key-value store populated by the source connector with metadata (e.g., remote address). Shorthand `$s` |
| **Step** | A single operation within a transformer (Mapper, Message Builder, JavaScript, etc.) |
| **Tag** | A label applied to channels for organizational filtering |
| **Template** | The content pattern used by a destination connector, supporting variable substitution |
| **Transformer** | A chain of steps that modify message content as it passes through a connector |
| **Transmission Mode** | The framing protocol used by TCP connectors (MLLP, Basic) |
| **Undeploy** | Removing a channel from the engine so it stops processing messages |
| **VM** | The underlying connector protocol for channel-to-channel routing; exposed in the UI as Channel Reader (source) and Channel Writer (destination) |
