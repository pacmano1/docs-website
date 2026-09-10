---
title: Destination Connectors
description: Every destination connector and the settings it exposes
---

# Destination connectors

A channel has at least one destination and may have many. Each has its own filter, transformer, and connector, and processing it may or may not result in something being sent. Eleven types ship with the engine.

| Connector | Sends data by |
|---|---|
| [Channel Writer](#channel-writer) | Handing the message to another channel on the same engine |
| [Database Writer](#database-writer) | Running a statement against a JDBC database |
| [DICOM Sender](#dicom-sender) | Opening a DICOM association to a remote AE |
| [Document Writer](#document-writer) | Rendering a PDF or RTF |
| [File Writer](#file-writer) | Writing to a local directory, FTP, SFTP, S3, SMB, or WebDAV |
| [HTTP Sender](#http-sender) | Making an HTTP request |
| [JavaScript Writer](#javascript-writer) | Running a script |
| [JMS Sender](#jms-sender) | Publishing to a JMS queue or topic |
| [SMTP Sender](#smtp-sender) | Sending email |
| [TCP Sender](#tcp-sender) | Opening a TCP connection, MLLP included |
| [Web Service Sender](#web-service-sender) | Calling a SOAP operation |

## Settings outside the connector's own fields

One block sits above the connector's own configuration, and unlike the source side every type gets it. These control the queue and what happens when a send fails.

| Setting | Default | Description |
|---|---|---|
| **Queue Messages** | Never | Never, On Failure, or Always. Decides whether a failed send, or every send, goes to this destination's queue |
| **Retry Count Before Queue/Error** | 0 | Attempts before the message queues or errors |
| **Retry Interval (ms)** | 10000 | Wait between those attempts |
| **Rotate Queue** | No | Move a failing message to the back of the queue instead of blocking behind it |
| **Queue Threads** | 1 | Threads draining the queue. More than one drains it in parallel, so order is no longer guaranteed except within a **Thread Assignment Variable** group |
| **Thread Assignment Variable** | | Groups messages onto the same queue thread, so ordering is kept within a group |
| **Queue Buffer Size** | 0 | Messages held in memory before falling back to the database. Applied only when above 0; otherwise the queue keeps the server-wide buffer size from Settings |
| **Include Filter/Transformer** | No | Re-run the destination's filter and transformer on each queue retry |
| **Regenerate Template** | No | Rebuild the template from the message on each retry, picking up map changes |
| **Validate Response** | No | Treat the response transformer's status as the send result. The TCP Sender is the only type that ships with this on |
| **Reattach Attachments** | Yes | Re-insert attachment content before sending |

The queue is **off by default on every destination**; `queueEnabled` is false in the shared constructor and no connector overrides it.

Field values are run through [Velocity replacement](./velocity_variable_replacement.md) before the send, so a directory, a filename, a URL, a subject line, or a header can carry data from the message. The JavaScript Writer is the exception: it has no templated fields because the script reads the message itself.

## Channel Writer

Hands the message to another channel on the same engine, where a Channel Reader picks it up.

| Setting | Default | Description |
|---|---|---|
| **Channel Id** | none | The receiving channel |
| **Template** | `${message.encodedData}` | What the receiving channel gets as its raw message |
| **Message Metadata** | | Map variables to pass along. They arrive in the receiving channel's **source map**, not its channel map |

## Database Writer

Runs an insert, update, or delete against a database. Write it in SQL or build it in JavaScript.

| Setting | Default | Description |
|---|---|---|
| **Driver** | Please Select One | JDBC driver. Required, JavaScript mode included. See [drivers and URL templates](./connector_reference_sources.md#jdbc-drivers-and-url-templates) |
| **URL** | | JDBC connection URL |
| **Username** / **Password** | | Database credentials |
| **Use JavaScript** | No | Build the statement in JavaScript instead of SQL |
| **SQL** / **JavaScript** | | The statement. The **Generate** buttons above it build a starting statement, or in JavaScript mode a connection block, from the settings above |

**JavaScript mode**

As on the [Database Reader](./connector_reference_sources.md#database-reader), the connector opens no database connection in this mode and the script opens its own. **Driver** is required either way. The Administrator refuses to save while it reads *Please Select One*. **URL** is validated only when Use JavaScript is No, and the credentials are never validated. **Generate: Connection**, enabled only in this mode, pastes all four values, the password in plain text among them, into a connection block at the top of the script, and **Generate: Insert** inserts a `dbConn.executeUpdate(...)` line at the caret for the table you pick. Those values are string literals in the script from then on. Editing the fields does not change them, and the connector's own copies are never read at runtime.

The generated block opens a connection and closes it in a `finally`, with nothing in between until you add the statements yourself. What the script returns decides the response: nothing at all is a SENT with *Database write success*, a `Response` is used as-is, a `Status` sets only the status, and anything else becomes the response data.

Clicking the **Use JavaScript** radio rewrites the script field: Yes replaces its contents with the generated block, No empties it. Reopening a saved channel does not.

## DICOM Sender

Opens an association to a remote application entity and sends the message as DICOM.

| Setting | Default | Description |
|---|---|---|
| **Remote Host** | 127.0.0.1 | Destination host |
| **Remote Port** | 104 | Destination port |
| **Remote Application Entity** | | AE title being called |
| **Local Host** / **Local Port** / **Local Application Entity** | | Identity this connector presents |
| **Template** | `${DICOMMESSAGE}` | Content sent |
| **User Name** / **Pass Code** | | Credentials for user identity negotiation |
| **Request Positive User Identity Response** | No | Require the remote AE to confirm the identity |
| **Request Storage Commitment** | No | Ask for a storage commitment after the send |
| **Priority** | med | Priority carried on the DIMSE operation |
| **Max Async operations** | 0 | Outstanding asynchronous operations. 0 is synchronous |
| **Pack PDV** | No | Pack command and data PDVs into one P-DATA-TF PDU |
| **Default Presentation Syntax** | No | Offer only the default presentation syntax |
| **TCP Delay** | Yes | Leave Nagle's algorithm on |

**Timing**

| Setting | Default | Description |
|---|---|---|
| **TCP Connection Timeout (ms)** | 0 | Connect timeout. 0 waits indefinitely |
| **Timeout A-ASSOCIATE-AC (ms)** | 5000 | Wait for the association to be accepted |
| **DIMSE-RSP timeout (s)** | 60 | Wait for a DIMSE response |
| **DIMSE-RSP interval period (s)** | 10 | Interval for the association reaper |
| **A-RELEASE-RP timeout (s)** | 5 | Wait for a release response |
| **Socket Close Delay After A-ABORT (ms)** | 50 | Delay before closing after an abort |
| **Shutdown delay (ms)** | 1000 | Delay before shutting the association down |

**Buffers**

| Setting | Default | Description |
|---|---|---|
| **P-DATA-TF PDUs max length sent (KB)** | 16 | Maximum PDU length sent |
| **P-DATA-TF PDUs max length received (KB)** | 16 | Maximum PDU length accepted |
| **Send Socket Buffer Size (KB)** | 0 | 0 leaves the OS default |
| **Receive Socket Buffer Size (KB)** | 0 | 0 leaves the OS default |
| **Transcoder Buffer Size (KB)** | 1 | Buffer used when transcoding |

**TLS**

| Setting | Default | Description |
|---|---|---|
| **TLS** | No TLS | No TLS, 3DES, AES, or Without |
| **Client Authentication TLS** | | Present a client certificate |
| **Accept ssl v2 TLS handshake** | | Accept the SSLv2-style handshake |
| **Keystore** / **Keystore Password** / **Key Password** | | Identity presented to the remote AE |
| **Trust Store** / **Trust Store Password** | | Certificates this connector will trust |

## Document Writer

Renders the message as a document and writes it out.

| Setting | Default | Description |
|---|---|---|
| **Output** | File | Write to a file, or attach the rendered document to the message |
| **Directory** | | Where the file goes |
| **File Name** | | Name of the file written |
| **Document Type** | PDF | PDF or RTF |
| **Page Size** | 8.5 x 11 inches | Width, height, and unit |
| **Encrypted** | No | Encrypt the PDF |
| **Password** | | Password on the encrypted PDF |
| **HTML Template** | | The HTML rendered into the document |

## File Writer

Writes the message to a file. **Method** is the first choice: it decides how the location is addressed, whether credentials apply, which connection fields are available, and even which **File Exists** options you get.

### Method

| Method | Location | Credentials | Also enables |
|---|---|---|---|
| **file** | **Directory**, a single field | none | nothing |
| **ftp** | `ftp://` host, then a path | Anonymous, or a username and password | Passive Mode, Validate Connection, Timeout, Advanced Options |
| **sftp** | `sftp://` host, then a path | always required | Timeout, Advanced Options |
| **smb** | `smb://` host, then a path | always required | Timeout, Advanced Options |
| **webdav** | `http://` or `https://` host, then a path | Anonymous, or a username and password | Secure Mode |
| **Amazon S3** | **S3 Bucket**, then a path | Anonymous, or an AWS Access Key ID and Secret Access Key | Timeout, Advanced Options |

Two methods restrict what else you can choose. **Append is not available under S3 or WebDAV**, so File Exists offers only Overwrite and Error, and selecting either method switches an existing Append setting to Overwrite. S3 additionally forces **Create Temp File** to No. Under S3 the credential fields are relabelled **AWS Access Key ID** and **AWS Secret Access Key**.

| Setting | Default | Description |
|---|---|---|
| **Timeout (ms)** | 10000 | How long to wait when connecting |
| **Secure Mode** | Yes | WebDAV over HTTPS |
| **Passive Mode** | Yes | FTP passive transfers |
| **Validate Connection** | Yes | Test the connection before writing |

Per-protocol extras sit behind **Advanced Options**; see [file protocol advanced settings](./connector_reference_sources.md#file-protocol-advanced-settings).

### Writing the file

| Setting | Default | Description |
|---|---|---|
| **File Name** | | Name of the file written |
| **File Exists** | Append | Append, Overwrite, or Error when the file is already there. Append is unavailable under S3 and WebDAV |
| **Create Temp File** | No | Write under a temporary name and rename on completion, so a reader never picks up a half-written file. Not available under S3 |
| **File Type** | Text | Text or Binary. Binary base64 decodes the content before writing |
| **Encoding** | Default | Character set, Text only |
| **Template** | | Content written |

## HTTP Sender

Makes an HTTP request and treats the reply as the response.

| Setting | Default | Description |
|---|---|---|
| **URL** | | Address the request goes to |
| **Method** | post | post, get, put, delete, patch, or options |
| **Content** | | Request body |
| **Content Type** | text/plain | Value of the request's Content-Type header |
| **Data Type** | Text | Text or Binary. Binary base64 decodes the content before sending |
| **Charset Encoding** | UTF-8 | Character set for the body |
| **Multipart** | No | Send the request as multipart |
| **Send Timeout (ms)** | 30000 | Socket timeout |
| **Headers** | | Request headers. **Use Map** takes them from a map variable instead of the table |
| **Query Parameters** | | Query string parameters, same **Use Map** option |
| **Authentication** | No | Send credentials with the request |
| **Authentication Type** | Basic | Basic or Digest |
| **Username** / **Password** | | Credentials |
| **Use Proxy Server** | No | Route through a proxy |
| **Proxy Address** / **Proxy Port** | | The proxy |
| **Response Content** | Plain Body | Plain Body passes the reply through. XML Body wraps status, headers, and body in XML |
| **Parse Multipart** | Yes | Split a multipart reply into parts. XML Body only |
| **Include Metadata** | No | Include status line and headers. XML Body only |
| **Binary MIME Types** | `application/.*(?<!json\|xml)$\|image/.*\|video/.*\|audio/.*` | Reply content types treated as binary and base64 encoded |

## JavaScript Writer

Runs a script instead of sending anywhere. The script's return value becomes the response.

| Setting | Description |
|---|---|
| **JavaScript** | The script to run |

Unlike the JavaScript Reader, this connector has the full message scope: `channelMap`, `connectorMap`, `sourceMap`, `responseMap`, and `connectorMessage` are all available. See [JavaScript Scripting Reference](./javascript_scripting_reference.md).

## JMS Sender

Publishes to a JMS queue or topic. The connection fields are the same as the [JMS Listener](./connector_reference_sources.md#jms-listener): **Use JNDI**, the connection factory, **Initial Context Factory** and **Provider URL**, **Connection Properties**, credentials, and the destination type and name.

| Setting | Default | Description |
|---|---|---|
| **Template** | `${message.encodedData}` | Message body published |

## SMTP Sender

Sends email.

| Setting | Default | Description |
|---|---|---|
| **SMTP Host** | | Mail server |
| **SMTP Port** | 25 | Mail server port |
| **Override Local Binding** | No | Bind a specific local address and port for the outbound connection |
| **Local Address** / **Local Port** | 0.0.0.0 / 0 | The local binding. Enabled only when **Override Local Binding** is Yes |
| **Send Timeout (ms)** | 5000 | Connection timeout |
| **Encryption** | None | None, STARTTLS, or SSL |
| **Use Authentication** | No | Authenticate to the server. No greys out **Username** and **Password** |
| **Username** / **Password** | | SMTP credentials |
| **To** | | Recipients, comma separated |
| **From** | | Sender address |
| **Subject** | | Subject line of the email |
| **Charset Encoding** | Default | Character set for the body |
| **HTML Body** | No | Send the body as HTML rather than plain text |
| **Body** | | Body of the email |
| **Headers** | | Additional headers. **Use Map** takes them from a map variable |
| **Attachments** | | Files attached, each with a name, content, and MIME type. **Use List** takes them from a list variable |

The connector exposes **To** and **From** only. `cc`, `bcc`, and `replyTo` exist on the underlying properties but have no control in the Administrator, so they cannot be set from the UI.

## TCP Sender

Opens a TCP connection and sends the message, MLLP framing included.

| Setting | Default | Description |
|---|---|---|
| **Mode** | Client | Client connects out, and is the only mode with **Remote Address**, **Remote Port**, **Override Local Binding**, and **Keep Connection Open**. Server binds and waits, and is the only mode with **Max Connections** |
| **Remote Address** | 127.0.0.1 | Where to connect |
| **Remote Port** | 6660 | Port to connect to |
| **Override Local Binding** | No | Bind a specific local address and port. Client mode only |
| **Local Address** / **Local Port** | 0.0.0.0 / 0 | The local binding. Enabled in Server mode, or in Client mode when **Override Local Binding** is Yes |
| **Send Timeout (ms)** | 5000 | Connection and write timeout. Enabled only when **Keep Connection Open** is Yes |
| **Buffer Size (bytes)** | 65536 | Socket write buffer |
| **Max Connections** | 10 | Concurrent connections accepted. Server mode only |
| **Keep Connection Open** | No | Hold the connection open between messages. Client mode only, and Yes is what enables **Send Timeout** and **Check Remote Host** |
| **Check Remote Host** | No | Test the connection is still alive before sending. Enabled only when **Keep Connection Open** is Yes |
| **Response Timeout (ms)** | 5000 | Wait for a reply |
| **Ignore Response** | No | A checkbox beside **Response Timeout**. Sends without waiting for a reply, and ticking it disables **Queue on Response Timeout** |
| **Queue on Response Timeout** | Yes | Queue the message when no reply arrives, rather than erroring |
| **Data Type** | Text | Text or Binary. Binary base64 decodes before sending |
| **Encoding** | Default | Character set, Text only |
| **Transmission Mode** | MLLP | MLLP or Basic. **Sample Frame** previews the framing bytes. See [transmission modes](./connector_reference_sources.md#transmission-modes) |
| **Template** | `${message.encodedData}` | Content sent |

This is the only destination that ships with **Validate Response** on, so by default the response transformer's status decides whether the send succeeded.

## Web Service Sender

Calls a SOAP operation.

| Setting | Default | Description |
|---|---|---|
| **WSDL URL** | | WSDL to read. **Get Operations** populates the fields below from it |
| **Service** | | Service from the WSDL |
| **Port / Endpoint** | | Port from the WSDL |
| **Location URI** | | Endpoint address, when it differs from the one in the WSDL |
| **SOAP Action** | | SOAPAction header |
| **Operation** | | Operation from the WSDL to invoke |
| **SOAP Envelope** | | The envelope sent. Generated from the WSDL, then edited |
| **Invocation Type** | Two-way | Two-way waits for a response, one-way does not |
| **Socket Timeout (ms)** | 30000 | How long to wait on the socket before giving up |
| **Authentication** | No | Send credentials with the request |
| **Username** / **Password** | | Credentials |
| **Headers** | | Request headers. **Use Map** takes them from a map variable |
| **Use MTOM** | No | Send attachments as MTOM |
| **Attachments** | | Attachments, each with a name, content, and MIME type. **Use List** takes them from a list variable |
