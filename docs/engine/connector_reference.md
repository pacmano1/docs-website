---
title: Connector Reference
description: All available source and destination connectors
---

# Connector Reference

Connectors are the protocol-specific endpoints that handle message I/O. Each connector type has both source (inbound) and/or destination (outbound) variants.

## TCP / MLLP

**Source:** TCP Listener | **Destination:** TCP Sender

The most common connector for HL7 messaging over TCP using the MLLP (Minimum Lower Layer Protocol) framing.

### TCP Listener (Source)
| Setting | Description |
|---|---|
| **Host** | IP address to bind to (`0.0.0.0` for all interfaces) |
| **Port** | Listening port |
| **Transmission Mode** | MLLP or Basic mode |
| **Receive Timeout** | Milliseconds to wait for a complete message |
| **Max Connections** | Maximum concurrent connections |
| **Keep Connection Open** | Persist connections between messages |
| **Response** | ACK generation settings |

### TCP Sender (Destination)
| Setting | Description |
|---|---|
| **Host** | Remote host address |
| **Port** | Remote port |
| **Transmission Mode** | MLLP or Basic mode |
| **Send Timeout** | Connection and send timeout |
| **Keep Connection Open** | Reuse connections |
| **Queue on Response Timeout** | Queue message if no response received |
| **Template** | Outgoing message content |

### Transmission modes
| Mode | Description |
|---|---|
| **MLLP** | Standard HL7 framing with start byte (`0x0B`), end bytes (`0x1C 0x0D`). Supports MLLPv2 with configurable ACK/NAK bytes. |
| **Basic** | Configurable start/end bytes |

## HTTP

**Source:** HTTP Listener | **Destination:** HTTP Sender

### HTTP Listener (Source)
| Setting | Description |
|---|---|
| **Host** | Bind address |
| **Port** | Listening port |
| **Context Path** | URL path to listen on (e.g., `/api/messages`) |
| **Content Type** | Expected request content type |
| **Response Content Type** | Content type of the response |
| **HTTP Authentication** | None, Basic, Digest, JavaScript, Custom, OAuth 2.0 Token Verification |
| **Response Status Code** | HTTP status code to return |

### HTTP Sender (Destination)
| Setting | Description |
|---|---|
| **URL** | Target URL (supports variable substitution) |
| **Method** | GET, POST, PUT, DELETE, PATCH |
| **Headers** | Custom HTTP headers |
| **Parameters** | Query/form parameters |
| **Content Type** | Request body content type |
| **Authentication** | None, Basic, Digest |
| **Template** | Request body content |
| **Multipart** | Send as multipart/form-data |

### HTTP Authentication Plugin (Listener only)
Supports configurable authentication methods:
- **Basic** - Username/password
- **Digest** - Digest authentication
- **JavaScript** - Custom authentication logic
- **Custom** - Custom Java class authentication
- **OAuth 2.0 Token Verification** - Validates incoming OAuth 2.0 tokens

## File / FTP / SFTP / S3 / SMB / WebDAV

**Source:** File Reader | **Destination:** File Writer

### File Reader (Source)
| Setting | Description |
|---|---|
| **Method** | File, FTP, SFTP, S3, SMB, WebDAV |
| **Directory** | Source directory path |
| **File Name Filter** | Filename pattern (wildcard or regex) |
| **Polling Frequency** | How often to check for new files |
| **Sort By** | Name, date, size |
| **After Processing** | Delete, move, or leave |
| **File Type** | Text or binary |
| **Encoding** | Character encoding |

### File Writer (Destination)
| Setting | Description |
|---|---|
| **Method** | File, FTP, SFTP, S3, SMB, WebDAV |
| **Directory** | Target directory path |
| **File Name** | Output filename (supports variables) |
| **File Exists** | Overwrite, append, or error |
| **Encoding** | Character encoding |
| **Template** | File content |

### Advanced settings (per protocol)
- **FTP** - Active/passive mode, timeout, secure mode (FTPS)
- **SFTP** - Key authentication, known hosts, algorithms
- **S3** - Bucket, region, access key, secret key
- **SMB** - Domain, credentials, SMB version

## Database (JDBC)

**Source:** Database Reader | **Destination:** Database Writer

### Database Reader (Source)
| Setting | Description |
|---|---|
| **Driver** | MySQL, PostgreSQL, Oracle, SQL Server, or custom |
| **URL** | JDBC connection URL |
| **Username / Password** | Database credentials |
| **SQL** | SELECT query to poll for records |
| **Update** | Post-read UPDATE/DELETE statement |
| **Polling Frequency** | How often to execute the query |
| **Fetch Size** | Number of rows per fetch |

Each row returned by the query becomes an individual message.

### Database Writer (Destination)
| Setting | Description |
|---|---|
| **Driver** | Database driver |
| **URL** | JDBC connection URL |
| **Username / Password** | Database credentials |
| **SQL** | INSERT/UPDATE/DELETE statement |
| **Use JavaScript** | Use JavaScript instead of SQL for complex operations |

### Supported database drivers

These are the drivers declared in `conf/dbdrivers.xml`, which is also where you add your own.

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

## Channel (VM)

**Source:** Channel Reader | **Destination:** Channel Writer

Internal connectors for passing messages between channels within the same OIE instance.

### Channel Reader (Source)
No configuration needed. The channel automatically receives messages sent to it by Channel Writers on other channels.

### Channel Writer (Destination)
| Setting | Description |
|---|---|
| **Channel** | Target channel name or ID |
| **Template** | Message content to send |
| **Map Variables** | Pass channel map variables to the target |

This is the primary mechanism for multi-channel workflows and message routing chains.

## Web Service (SOAP)

**Source:** Web Service Listener | **Destination:** Web Service Sender

### Web Service Listener (Source)
| Setting | Description |
|---|---|
| **Class Name** | Service class name |
| **Service Name** | WSDL service name |
| **Port / Host** | Listening endpoint |

Auto-generates a WSDL endpoint.

### Web Service Sender (Destination)
| Setting | Description |
|---|---|
| **WSDL URL** | URL of the WSDL definition |
| **Service / Port** | WSDL service and port to invoke |
| **Operation** | SOAP operation to call |
| **SOAP Envelope** | Full SOAP XML envelope template |
| **Authentication** | HTTP Basic |

## JMS (Java Message Service)

**Source:** JMS Listener | **Destination:** JMS Sender

### Common settings
| Setting | Description |
|---|---|
| **Connection Factory** | JNDI connection factory class |
| **Destination** | Queue or topic name |
| **Username / Password** | JMS credentials |
| **JNDI Properties** | Initial context factory and provider URL |
| **Durable** | Durable topic subscription (listener only) |

Supports JMS-compatible providers (ActiveMQ, RabbitMQ JMS, IBM MQ, etc.).

## JavaScript

**Source:** JavaScript Reader | **Destination:** JavaScript Writer

Fully custom connectors using JavaScript.

### JavaScript Reader (Source)
Write a script that returns messages. Useful for:
- Custom polling logic
- REST API consumption
- Complex data retrieval workflows

### JavaScript Writer (Destination)
Write a script that handles message delivery. Useful for:
- Custom protocol implementations
- Multi-step delivery workflows
- Complex business logic

## SMTP (email)

**Destination only:** SMTP Sender

| Setting | Description |
|---|---|
| **SMTP Host** | Mail server hostname |
| **SMTP Port** | Mail server port |
| **Encryption** | None, STARTTLS, SSL |
| **Username / Password** | SMTP authentication credentials |
| **From** | Sender email address |
| **To / CC / BCC** | Recipient addresses |
| **Subject** | Email subject |
| **Body** | Email body (HTML or plain text) |
| **Attachments** | File attachments |

## DICOM

**Source:** DICOM Listener | **Destination:** DICOM Sender

For medical imaging workflows using the DICOM protocol.

### DICOM Listener (Source)
| Setting | Description |
|---|---|
| **Host / Port** | Listening address |
| **AE Title** | Application Entity title |
| **TLS** | TLS encryption settings |

### DICOM Sender (Destination)
| Setting | Description |
|---|---|
| **Host / Port** | Remote PACS/modality address |
| **AE Title** | Local and remote AE titles |
| **Template** | DICOM data to send |

## Document Writer

**Destination only:** Document Writer

Generates PDF or RTF documents from message content.

| Setting | Description |
|---|---|
| **Directory** | Output directory |
| **File Name** | Output file name |
| **Document Type** | PDF or RTF |
| **Template** | HTML template for document content |
