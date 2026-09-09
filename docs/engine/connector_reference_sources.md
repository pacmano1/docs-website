---
title: Source Connectors
description: Every source connector and the settings it exposes
---

# Source connectors

A channel has exactly one source connector, and its type decides what the channel accepts and how. Nine types ship with the engine.

| Connector | Gets data by |
|---|---|
| [Channel Reader](#channel-reader) | Receiving from other channels on the same engine |
| [Database Reader](#database-reader) | Polling a JDBC database |
| [DICOM Listener](#dicom-listener) | Accepting DICOM associations |
| [File Reader](#file-reader) | Polling a local directory, FTP, SFTP, S3, SMB, or WebDAV |
| [HTTP Listener](#http-listener) | Serving HTTP requests |
| [JavaScript Reader](#javascript-reader) | Running a script on a schedule |
| [JMS Listener](#jms-listener) | Consuming from a JMS queue or topic |
| [TCP Listener](#tcp-listener) | Accepting TCP connections, MLLP included |
| [Web Service Listener](#web-service-listener) | Serving SOAP requests |

## Settings outside the connector's own fields

Three blocks sit above the connector's own configuration, and the type decides which of them you get.

**Listener settings**, on the four that bind a port: TCP Listener, HTTP Listener, Web Service Listener, and DICOM Listener.

| Setting | Description |
|---|---|
| **Local Address** | Interface to bind to. `0.0.0.0` binds all of them |
| **Local Port** | Port to bind. Defaults differ per connector and are given below |

**Polling settings**, on the three that poll rather than listen: Database Reader, File Reader, and JavaScript Reader. Interval, time, or cron, covered in [Polling Settings](./polling_settings.md).

**Source settings**, the only block all nine have: the source queue, the response selector, batch processing where the type supports it, and max processing threads. See [Architecture](./architecture_overview.md#connectors).

## Channel Reader

Receives messages from Channel Writer destinations on other channels, and from `router` calls in scripts. It has no fields of its own, and the Administrator shows **No configurable settings** in their place. The source settings block above still applies, and what arrives is decided entirely by the sending side.

## Database Reader

Polls a database for a result set. Whether that set becomes one message or one message per row is decided by **Aggregate Results** below. Write the query in SQL or build it in JavaScript.

| Setting | Default | Description |
|---|---|---|
| **Driver** | | JDBC driver. See [drivers and URL templates](#jdbc-drivers-and-url-templates) |
| **URL** | | JDBC connection URL |
| **Username** / **Password** | | Database credentials |
| **Use JavaScript** | No | Build the query in JavaScript instead of SQL. Switches the **SQL** field below to **JavaScript** |
| **Keep Connection Open** | Yes | Reuse the connection between polls rather than reconnecting. Unavailable in JavaScript mode |
| **Aggregate Results** | No | Yes turns the whole result set into one message. No turns each row into its own message |
| **Cache Results** | Yes | Hold the whole result set in memory before processing. No streams from the cursor instead, and is what enables **Fetch Size**. Unavailable in JavaScript mode |
| **Fetch Size** | 1000 | JDBC ResultSet fetch size used when reading from the current cursor position. **Applies only when Cache Results is No**, and is greyed out otherwise, so at the default settings it does nothing |
| **# of Retries on Error** | 3 | Attempts after a failed poll before giving up |
| **Retry Interval (ms)** | 10000 | Wait between those attempts |
| **Encoding** | Default | Character set used to read column values |
| **SQL** / **JavaScript** | | The select. **Generate** builds a starting statement from a table you pick |
| **Run Post-Process SQL** / **Run Post-Process Script** | Never | Never, After each message, or Once after all messages. Runs a second statement after the message has been processed. What that statement does is up to you |

The select runs again on every poll, so unless something changes the data it reads or the query itself, the same rows come back.

Choosing **Use JavaScript** disables three of the settings above: Keep Connection Open, Cache Results, and Fetch Size. A script builds and manages its own connection, so the connector does not manage one for it.

## DICOM Listener

Accepts DICOM associations and stores received objects as messages. Default port **104**.

| Setting | Default | Description |
|---|---|---|
| **Application Entity** | | AE title this listener answers to. Blank accepts any |
| **Store Received Objects in Directory** | | Directory received objects are written to |
| **Max Async operations** | 0 | Maximum outstanding asynchronous operations. 0 is synchronous |
| **Pack PDV** | | Pack the command and data PDVs into a single P-DATA-TF PDU |
| **Only Accept Default Transfer Syntax** | No | Refuse anything but implicit VR little endian |
| **Only Uncompressed Pixel Data** | No | Refuse compressed transfer syntaxes |
| **Accept Explict VR Big Endian** | No | Accept the big endian transfer syntax. The label carries the engine's own spelling |
| **TCP Delay** | Yes | Leave Nagle's algorithm on. No sets `TCP_NODELAY` |

**Timing**

| Setting | Default | Description |
|---|---|---|
| **DIMSE-RQ timeout (ms)** | 60 | Wait for a DIMSE request |
| **DIMSE-RSP delay (ms)** | 0 | Artificial delay before responding |
| **DIMSE-RSP interval period (s)** | 10 | Interval for the association reaper |
| **ASSOCIATE-RQ timeout (ms)** | 5 | Wait for an association request |
| **A-RELEASE-RP timeout (s)** | 5 | Wait for a release response |
| **Socket Close Delay After A-ABORT (ms)** | 50 | Delay before closing the socket after an abort |

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
| **Client Authentication TLS** | No | Require a client certificate |
| **Accept ssl v2 TLS handshake** | Yes | Accept the SSLv2-style handshake |
| **Keystore** / **Keystore Password** / **Key Password** | | Identity presented by the listener |
| **Trust Store** / **Trust Store Password** | | Certificates the listener will trust |

## File Reader

Polls a location and turns files into messages.

**Method** is the first field on the panel and it governs the rest of it. It decides how the location is addressed, whether credentials apply, and which connection settings are available at all. Anything greyed out is greyed out because of it.

| Method | Location fields | Credentials | Connection settings enabled |
|---|---|---|---|
| **file** | **Directory** | none | none |
| **ftp** | `ftp://` host, path | Anonymous, or username and password | Timeout, Passive Mode, Validate Connection, Advanced Options |
| **sftp** | `sftp://` host, path | no Anonymous option; the fields stay editable | Timeout, Advanced Options |
| **smb** | `smb://` host, path | no Anonymous option; the fields stay editable | Timeout, Advanced Options |
| **webdav** | `http://` or `https://` host, path | Anonymous, or username and password | Secure Mode |
| **Amazon S3** | **S3 Bucket**, path | Anonymous, or AWS Access Key ID and Secret Access Key | Timeout, Advanced Options |

Timeout must not be left blank for FTP, SFTP, or SMB. `file` is the only method with a single **Directory** field; the others split the location into a host and a path, with the protocol prefix as the host's label. Secure Mode is what switches WebDAV between `http://` and `https://`, and the FTP prefix reads `ftps://` when TLS is configured. Under S3 the credential fields are relabelled **AWS Access Key ID** and **AWS Secret Access Key**, and the move-to fields become **Move-to S3 Bucket / Directory**.

The rest of the panel, in the order it appears:

| Setting | Default | Description |
|---|---|---|
| **Filename Filter Pattern** | `*` | Wildcard by default; the **Regular Expression** checkbox switches it to a regex |
| **Include All Subdirectories** | No | Recurse |
| **Ignore . files** | Yes | Skip dotfiles |
| **Anonymous** | Yes | Offered by FTP, WebDAV, and S3 only. Choosing Yes disables the two fields below and refills them with `anonymous`, except under S3, which clears them |
| **Username** / **Password** | `anonymous` / `anonymous` | Both fields carry `anonymous` by default, so SFTP and SMB, which have no Anonymous option, open with it already filled in and editable. S3 starts them empty. A username is required whenever Anonymous is off; a password is too, unless the method is SFTP and the Advanced Options use a key file |
| **Timeout (ms)** | 10000 | How long to wait when connecting. Not available for `file` or WebDAV |
| **Secure Mode** | Yes | WebDAV over HTTPS. WebDAV only |
| **Passive Mode** | Yes | FTP passive transfers. FTP only |
| **Validate Connection** | Yes | Test the connection before each poll. FTP only |
| **After Processing Action** | None | None, Move, or Delete. None leaves the file in place, so the next poll reads it again |
| **Move-to Directory** / **Move-to File Name** | | Where a moved file goes |
| **Error Reading Action** | None | None, Move, or Delete, for a file that could not be read |
| **Error in Response Action** | After Processing | What to do with a file whose message ended in an error response |
| **Error Move-to Directory** / **Error Move-to File Name** | | Destination for either error action |
| **Check File Age** | Yes | Skip files younger than **File Age** |
| **File Age (ms)** | 1000 | Minimum age before a file is read |
| **File Size (bytes)** | 0, no maximum | Minimum and maximum a file must fall between. **Ignore Maximum** leaves the upper bound open, and is checked by default |
| **Sort Files By** | Date | Date, Name, or Size. Decides the order files are processed in |
| **File Type** | Text | Text or Binary. Binary base64 encodes the content |
| **Encoding** | Default | Character set, Text only |

**Advanced Options** opens a per-protocol dialog, and the read-only summary beside **Method** shows what is set in it. See [file protocol advanced settings](#file-protocol-advanced-settings).

## HTTP Listener

Serves HTTP requests. Default port **80**, and the **HTTP URL** / **HTTPS URL** shown on the panel is built from the address, port, and context path.

| Setting | Default | Description |
|---|---|---|
| **Base Context Path** | | Path this connector answers on |
| **Receive Timeout (ms)** | 30000 | Idle timeout for a request |
| **Message Content** | Plain Body | Plain Body passes the body through. XML Body wraps method, headers, parameters, and body in XML |
| **Parse Multipart** | Yes | Split a multipart request into parts. XML Body only |
| **Include Metadata** | No | Include method, context path, headers, and query parameters. XML Body only |
| **Binary MIME Types** | `application/.*(?<!json\|xml)$\|image/.*\|video/.*\|audio/.*` | Content types treated as binary and base64 encoded. **Regular Expression** switches it between a regex and a plain list |
| **Response Content Type** | text/plain | Value of the response's Content-Type header |
| **Response Data Type** | Text | Text or Binary. Binary base64 decodes the response before sending |
| **Response Status Code** | | HTTP status to return. Blank returns 200, or 400 for an errored message |
| **Response Headers** | | Headers to return. **Use Map** takes them from a map variable instead of the table |
| **Charset Encoding** | UTF-8 | Character set. Disabled when **Response Data Type** is Binary |
| **Static Resources** | | Paths served directly by the connector, each with its own content type and value, without producing a message |

Authentication is a separate plugin; see [HTTP authentication](#http-authentication).

## JavaScript Reader

Runs a script on the polling schedule. The script's return value becomes the message, and returning nothing produces no message.

| Setting | Description |
|---|---|
| **JavaScript** | The script to run |

This connector's scope is narrower than most: it has no `channelMap`, `connectorMap`, `sourceMap`, `responseMap`, or `connectorMessage`. `JavaScriptReceiver` builds its scope from the no-message variant, unlike the JavaScript Writer. See [JavaScript Scripting Reference](./javascript_scripting_reference.md).

## JMS Listener

Consumes from a JMS queue or topic.

| Setting | Default | Description |
|---|---|---|
| **Use JNDI** | | Off names a factory class, on names a JNDI lookup |
| **Connection Factory Class** | | Vendor `ConnectionFactory` implementation, JNDI off |
| **Connection Factory Name** | | JNDI lookup name, JNDI on. Not a class name |
| **Initial Context Factory** / **Provider URL** | | JNDI context, JNDI on |
| **Connection Properties** | | Additional properties passed to the factory |
| **Username** / **Password** | | Broker credentials |
| **Destination Type** | | Queue or Topic |
| **Destination Name** | | Queue or topic to consume from |
| **Client ID** | | JMS client identifier, required for a durable subscription |
| **Selector** | | JMS message selector expression, filtering at the broker |
| **Reconnect Interval (ms)** | 10000 | Wait before reconnecting after a broker failure |
| **Durable** | No | Durable topic subscription, which needs a **Client ID** to be set |

The provider's client jar goes in the channel's library resources.

## TCP Listener

Accepts TCP connections. With MLLP framing this is the usual HL7 v2 entry point. Default port **6661**.

| Setting | Default | Description |
|---|---|---|
| **Mode** | Server | Server binds and accepts, and is the only mode with **Max Connections**. Client connects out, and is the only mode with **Remote Address**, **Remote Port**, **Override Local Binding**, and **Reconnect Interval** |
| **Remote Address** / **Remote Port** | | Where to connect, Client mode only |
| **Override Local Binding** | No | Bind a specific local address and port for the outbound connection. Client mode only |
| **Reconnect Interval (ms)** | 5000 | Wait before reconnecting, Client mode |
| **Receive Timeout (ms)** | 0 | Idle timeout on a connection. 0 waits indefinitely |
| **Buffer Size (bytes)** | 65536 | Socket read buffer |
| **Max Connections** | 10 | Concurrent connections accepted. Server mode only |
| **Keep Connection Open** | Yes | Hold the connection open between messages |
| **Data Type** | Text | Text or Binary. Binary base64 encodes the payload |
| **Encoding** | Default | Character set, Text only |
| **Transmission Mode** | MLLP | MLLP or Basic. **Sample Frame** previews the framing bytes. See [transmission modes](#transmission-modes) |
| **Respond on New Connection** | No | Yes, No, or Message Recovery. No sends the response back on the same connection |
| **Response Address** / **Response Port** | | Where the response goes. Enabled when **Respond on New Connection** is Yes or Message Recovery |

## Web Service Listener

Publishes a SOAP endpoint. Default port **8081**.

| Setting | Default | Description |
|---|---|---|
| **Service Name** | Mirth | Service name in the published WSDL |
| **Service Class Name** | `com.mirth.connect.connectors.ws.DefaultAcceptMessage` | Class implementing the service. The default publishes a single `acceptMessage(String)` operation |
| **Method** | | Operations offered by the class. The default class offers `String acceptMessage(String message)` |
| **Binding** | Default | SOAP binding the published service uses |
| **WSDL URL** | | The generated WSDL location, shown once the channel is deployed |

Naming a different class here repopulates **Method** with the operations that class offers.

## Shared reference

### Transmission modes

Used by both the TCP Listener and the [TCP Sender](./connector_reference_destinations.md#tcp-sender).

| Mode | Description |
|---|---|
| **MLLP** | HL7 framing: start byte `0x0B`, end bytes `0x1C 0x0D`. MLLPv2 adds configurable acknowledgement bytes |
| **Basic** | Start and end bytes you choose |

### JDBC drivers and URL templates

Used by both the Database Reader and the [Database Writer](./connector_reference_destinations.md#database-writer). These are the drivers declared in `conf/dbdrivers.xml`, which is also where you add your own.

| Driver | Class | URL Template |
|---|---|---|
| MySQL | `com.mysql.cj.jdbc.Driver` | `jdbc:mysql://host:port/dbname` |
| Oracle | `oracle.jdbc.driver.OracleDriver` | `jdbc:oracle:thin:@host:port:dbname` |
| PostgreSQL | `org.postgresql.Driver` | `jdbc:postgresql://host:port/dbname` |
| SQL Server/Sybase (jTDS) | `net.sourceforge.jtds.jdbc.Driver` | `jdbc:jtds:sqlserver://host:port/dbname` |
| Microsoft SQL Server | `com.microsoft.sqlserver.jdbc.SQLServerDriver` | `jdbc:sqlserver://host:port;databaseName=dbname` |
| SQLite | `org.sqlite.JDBC` | `jdbc:sqlite:dbfile.db` |

::: info
These are the databases a channel can *read from and write to*. They are not the same set OIE supports for its own message repository. See [Database Support](./database_support.md) for that. SQLite, for instance, is available to channels but is not a supported backing store for OIE itself.
:::

### File protocol advanced settings

Reached through **Advanced Options** on the File Reader and the [File Writer](./connector_reference_destinations.md#file-writer). The dialog's contents depend on the selected method. Passive mode, secure mode, and the timeout are not in these dialogs; they are on the main connector panel. There is no bucket field for S3, the bucket is the leading element of the Directory path, and there is no domain field for SMB.

- **FTP** - Initial Commands
- **SFTP** - Authentication, Public/Private Key File, Passphrase, Host Key Checking, Known Hosts File, and a free-form Configuration Options map
- **S3** - Use Default Credential Provider Chain, Use Temporary Credentials, Duration (seconds), Region, Custom HTTP Headers
- **SMB** - SMB Minimum Version, SMB Maximum Version

For S3 the generic Username and Password fields are relabelled AWS Access Key ID and AWS Secret Access Key on the main panel.

### HTTP authentication

An extension that adds an authentication layer to the HTTP Listener and the Web Service Listener. The methods offered:

- **Basic Authentication** - username and password
- **Digest Authentication** - digest challenge and response
- **JavaScript** - authentication logic you write
- **Custom Java Class** - authentication delegated to a class you supply
- **OAuth 2.0 Token Verification** - validates an incoming OAuth 2.0 token
