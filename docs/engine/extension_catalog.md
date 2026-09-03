---
title: Extension Catalog
description: Available plugins and how to install them
---

# Extension Catalog

OIE is built around a modular extension model. Most of what looks like core functionality is in fact an extension: connectors, data types, filter and transformer steps, attachment viewers, and transmission modes are all loaded the same way a third-party plugin is.

Extensions are discovered at runtime. One install therefore serves both the desktop [Desktop Administrator](./desktop_administrator.md) and the [Web Administrator](./web_administrator.md), with no separate web build to maintain and no way for a plugin to drift out of step with the engine it sits on.

Installing, enabling, disabling, and removing extensions is covered in the [Plugin Guide](./plugins.md).

## Bundled extensions

OIE ships with 40 extensions in `OIE_HOME/extensions/`.

### Connectors

| Extension | Description |
|---|---|
| `dicom` | DICOM Listener and Sender |
| `doc` | Document Writer, producing RTF or PDF from an HTML template. PDFs can be password protected |
| `file` | File Reader and Writer, covering local paths, FTP, SFTP, Amazon S3, SMB, and WebDAV |
| `http` | HTTP Listener and Sender |
| `jdbc` | Database Reader and Writer, using Insert, Update, or JavaScript statements |
| `jms` | JMS Listener and Sender |
| `js` | JavaScript Reader and Writer, for connecting to an arbitrary endpoint in code |
| `smtp` | SMTP Sender, with a template for building the message body |
| `tcp` | TCP Listener and Sender |
| `vm` | Channel Reader and Writer, for routing between channels in the same instance |
| `ws` | Web Service (SOAP) Listener and Sender |

### Data types

| Extension | Format |
|---|---|
| `datatype-delimited` | Delimited text (CSV, TSV, custom) |
| `datatype-dicom` | DICOM |
| `datatype-edi` | EDI / X12 |
| `datatype-hl7v2` | HL7 v2.x |
| `datatype-hl7v3` | HL7 v3.x / CDA |
| `datatype-json` | JSON |
| `datatype-ncpdp` | NCPDP |
| `datatype-raw` | Raw (unstructured) |
| `datatype-xml` | XML |

### Filter and transformer steps

| Extension | Description |
|---|---|
| `destinationsetfilter` | Destination Set Filter step, for excluding destinations from the source transformer |
| `javascriptrule` | JavaScript filter rule |
| `javascriptstep` | JavaScript transformer step |
| `mapper` | Mapper transformer step |
| `messagebuilder` | Message Builder transformer step |
| `rulebuilder` | Rule Builder filter rule |
| `scriptfilerule` | External Script filter rule |
| `scriptfilestep` | External Script transformer step |
| `xsltstep` | XSLT transformer step |

### Viewers

| Extension | Description |
|---|---|
| `dicomviewer` | DICOM attachment viewing in the message browser |
| `imageviewer` | Image attachment viewing in the message browser |
| `pdfviewer` | PDF attachment viewing in the message browser |
| `textviewer` | Text and RTF attachment viewing in the message browser |

### Plugins

| Extension | Description |
|---|---|
| `dashboardstatus` | Real-time connector status column on the Dashboard |
| `datapruner` | Automated message data pruning |
| `directoryresource` | Use a directory as a source of libraries to include in channels |
| `globalmapviewer` | View the global map and global channel maps in the Administrator |
| `httpauth` | Authentication providers for HTTP-based source connectors |
| `serverlog` | Real-time server log viewer in the Administrator |

### Transmission modes

| Extension | Description |
|---|---|
| `mllpmode` | MLLP framing for socket and serial connectors |

## Extension directory structure

Each extension lives in its own subdirectory under `OIE_HOME/extensions/`. Connectors describe themselves with `source.xml` and `destination.xml`, while plugins and data types use `plugin.xml`.

```
extensions/
├── http/                         # Connector example
│   ├── http-server.jar           # Server-side classes
│   ├── http-client.jar           # Client-side classes (downloaded to the Administrator)
│   ├── http-shared.jar           # Shared classes
│   ├── source.xml                # Source connector metadata
│   └── destination.xml           # Destination connector metadata
└── datapruner/                   # Plugin example
    ├── datapruner-server.jar
    ├── datapruner-client.jar
    ├── datapruner-shared.jar
    └── plugin.xml                # Plugin metadata descriptor
```

Some extensions also carry a `lib/` or `libs/` subdirectory for third-party dependencies. Client-only extensions, such as the Mapper and Rule Builder steps, ship no server jar at all.

## Extension metadata

A metadata descriptor declares:

- Extension name, author, and version
- Server-side and client-side class names
- Library JAR paths and their type (server, client, or shared)
- API provider classes, meaning servlet interfaces and their implementations

## Community plugins

None of the following ship with OIE. Each is installed separately, and each is open source. Several add a tab or panel to both administrators from a single install, because extensions are discovered at runtime rather than built into a particular client.

The current catalog is maintained at [openintegrationengine.org/plugins](https://openintegrationengine.org/plugins/).

### Web Support

Installs the [Web Administrator](./web_administrator.md) into the engine's embedded web server, along with the server-side APIs it uses for message serialization, JavaScript validation, and serving other plugins' web interfaces.

Requires OIE 4.6.0. MPL 2.0.
[gibson9583/oie-web-support-plugin](https://github.com/gibson9583/oie-web-support-plugin)

### Role Based Access Control

Replaces the engine's default always-allow authorization controller with roles you define. Each role carries per-permission grants and can be restricted to specific channels, so a role only sees and operates on the channels it is meant to. Enforcement is server-side, meaning a denied operation fails at the server regardless of which client asked and regardless of what the UI chose to hide.

On first startup it creates its own `rbac_*` tables and seeds an admin role assigned to the initial admin user. Ships role management and task gating for both administrators in one zip; the web half is inert on servers that do not run the Web Administrator.

Requires OIE 4.6.0. MPL 2.0.
[diridium-com/role-based-access-control](https://github.com/diridium-com/role-based-access-control)

### OIE Sentinel

Monitoring and alerting for channel activity. Monitors are scoped to a channel, a channel group, a channel tag, or everything, with group and tag membership resolved live so reorganising channels does not mean revisiting monitors.

Seven monitor types: inactivity, low volume, anomaly against a rolling baseline, connection status, error rate (with a minimum-volume guard so one error on a quiet channel is not reported as 100%), queue depth, and channel state.

When a monitor breaches, Sentinel opens a problem, dispatches its actions, and tracks the problem until it clears or somebody resolves it. Delivery is by email, channel (VM Router), AWS SNS, or webhook, with per-monitor severity, a consecutive-breach threshold, storm control, escalation chains, and dependency suppression so a parent monitor silences its dependents on the same channel.

Runs in the Web Administrator only. There is no Swing client and no separate web application; it loads inside the console on the existing session.

Requires OIE 4.6.0. MPL 2.0.
[gibson9583/oie-sentinel](https://github.com/gibson9583/oie-sentinel)

### Channel and Code Template History

Captures a version snapshot every time a channel or code template is saved, stored in the OIE database so history travels with ordinary database backups. No external Git server is involved.

Diffs are decomposed: a navigable tree lets you drill into individual scripts, connectors, filter and transformer steps, and plugin properties, with a side-by-side viewer showing word-level inline highlighting. Any version can be reverted to from a right-click, older versions can be pruned, and deleting a channel or code template writes a final snapshot so it can still be recovered.

Supports PostgreSQL, MySQL, Oracle, SQL Server, and Derby. Requires OIE 4.5.2 or later and Java 17. MPL 2.0.
[diridium-com/simple-channel-history](https://github.com/diridium-com/simple-channel-history)

### TLS Manager

Certificate management for OIE, available both in the Administrator and from the browser. Inspect the Java trust store, add trusted certificates, and manage local key pairs, with search, validity dates, and fingerprints. The browser-based certificate manager is served at `https://<host>:8443/tls-manager/`.

[NovaMap-Health/tls-manager-plugin](https://github.com/NovaMap-Health/tls-manager-plugin)

### Cache Manager

In-memory key-value lookups against external databases. The first call for a key queries the database; every call after that is served from memory. Built on Guava's `LoadingCache` with HikariCP connection pooling to avoid connection storms under load, with lazy per-key loading and eviction driven by a configurable maximum size and TTL.

Caches are defined in an admin UI, then called from a channel in one line. A cache inspector reports hit rates, memory use, and entry counts, and lets you browse what is currently cached. Database credentials are encrypted at rest using OIE's own encryptor, and activity is written to OIE's event system. A full REST API is included.

MPL 2.0.
[diridium-com/oie-cache-manager](https://github.com/diridium-com/oie-cache-manager)

### Source Code Search

Grep-style search across channel scripts, code templates, global scripts, and message templates, run from the Administrator. Literal or regex, case-sensitive or not, with scope control per artifact type and per channel, hierarchical results with location breadcrumbs and match highlighting, and export to JSON or CSV. The dialog is non-modal, so it stays open while you work.

MPL 2.0.
[diridium-com/oie-source-code-search](https://github.com/diridium-com/oie-source-code-search)

### Thread Viewer

A dashboard tab showing live JVM thread activity: state, CPU time, and blocked and waited counts for every thread, with the full stack trace for whichever one is selected. Threads are classified by category (channel processing, database pool, HTTP/servlet, system/JVM, and others) and, where OIE's thread naming permits, correlated back to the channel and connector running them, which turns "the engine is busy" into a named channel.

Includes deadlock detection via `ThreadMXBean.findDeadlockedThreads()`, filtering by text, channel, category, or thread state, and jstack-compatible thread dump export. Contention tracking is only enabled while monitoring runs, and the last snapshot stays browsable after monitoring stops. Access is restricted to administrators through OIE's extension permission system.

Requires OIE 4.6.0. MIT.
[gibson9583/engine-thread-viewer](https://github.com/gibson9583/engine-thread-viewer)

### AWS SQS Source Connector

Polls AWS SQS queues as a source connector, receiving up to ten messages per long-polling request and delivering each to the channel as a `RawMessage` with its SQS metadata in the source map. Successfully processed messages are deleted from the queue; failures are left in place and reappear after the visibility timeout.

Wait time, maximum messages, and visibility timeout are configurable. Authentication supports the default credential chain, static credentials, and STS assume-role. SQS message attributes and FIFO metadata land in the source map, and S3 event notifications are handled in both S3 native and EventBridge formats, with SNS envelopes unwrapped automatically. Every configuration field accepts OIE replacement variables.

[gibson9583/sqs-source-connector](https://github.com/gibson9583/sqs-source-connector)

## Developing custom extensions

Server-side extension points are implemented against these types:

| Extension Type | Class/Interface |
|---|---|
| **Server Plugin** | `ServerPlugin` (interface) |
| **Service Plugin** | `ServicePlugin` (interface, extends ServerPlugin) |
| **Channel Plugin** | `ChannelPlugin` (interface, extends ServerPlugin) |
| **Data Type** | `DataTypeServerPlugin` (abstract class) |
| **Resource Plugin** | `ResourcePlugin` (interface, extends ServerPlugin) |
| **Library Plugin** | `LibraryPlugin` (interface, extends ResourcePlugin) |
| **Authorization Plugin** | `AuthorizationPlugin` (interface, extends ServerPlugin) |
| **Transmission Mode** | `TransmissionModeProvider` (abstract class, implements ServerPlugin) |
| **Code Template Plugin** | `CodeTemplateServerPlugin` (interface, extends ServerPlugin) |
| **Multi-Factor Auth Plugin** | `MultiFactorAuthenticationPlugin` (abstract class, extends ServicePlugin) |

All ten live in `com.mirth.connect.plugins`.

Building an extension means:

1. Producing server-side and client-side JARs
2. Writing the metadata descriptor (`plugin.xml`, or `source.xml` and `destination.xml` for connectors)
3. Packaging it into the extension directory layout
4. Testing against a running OIE instance

To add a browser interface to an extension, the server half stays as it is and you write only the web UI against the REST endpoints the extension already exposes. See [Web Administrator](./web_administrator.md) for the extension points available there.
