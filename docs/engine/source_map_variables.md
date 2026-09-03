---
title: Source and Connector Map Variables
description: Auto-populated variables per connector type
---

# Source and Connector Map Variables

Each connector type automatically populates certain map variables with metadata about the connection and message. These variables are available in transformers, filters, and scripts.

## Source connector map variables

### TCP Listener
| Variable | Description |
|---|---|
| `remoteAddress` | IP address of the sending system |
| `remotePort` | Port of the sending system |
| `localAddress` | Local IP address |
| `localPort` | Local listening port |

### HTTP Listener
| Variable | Description |
|---|---|
| `remoteAddress` | IP address of the HTTP client |
| `remotePort` | Port of the HTTP client |
| `localAddress` | Local IP address |
| `localPort` | Local listening port |
| `method` | HTTP method (GET, POST, PUT, DELETE) |
| `url` | Full request URL |
| `uri` | Request URI path |
| `protocol` | HTTP protocol version |
| `query` | Query string |
| `contextPath` | Request context path |
| `parameters` | Map of query/form parameters |
| `headers` | Map of HTTP request headers |

### File Reader
| Variable | Description |
|---|---|
| `originalFilename` | Original filename of the file being read |
| `fileDirectory` | Directory the file was read from |
| `fileSize` | Size of the file in bytes |
| `fileLastModified` | Last modified timestamp of the file |
| `pollId` | ID of the current poll cycle |
| `pollSequenceId` | Sequence number within the current poll |
| `pollComplete` | `true` on the last message in the poll cycle |

### Database Reader
No automatic source map variables.

### Channel Reader
| Variable | Description |
|---|---|
| `sourceChannelId` | Channel ID of the sending channel |
| `sourceChannelIds` | List of source channel IDs (when routed through multiple channels) |
| `sourceMessageId` | Message ID from the sending channel |
| `sourceMessageIds` | List of source message IDs (when routed through multiple channels) |

### JMS Listener
No automatic source map variables.

### DICOM Listener
| Variable | Description |
|---|---|
| `localApplicationEntityTitle` | Local AE title |
| `remoteApplicationEntityTitle` | Remote AE title |
| `localAddress` | Local IP address |
| `localPort` | Local listening port |
| `remoteAddress` | IP address of the sending DICOM node |
| `remotePort` | Port of the sending node |
| `associateACProtocolVersion` | ASSOCIATE-AC protocol version |
| `associateACImplClassUID` | ASSOCIATE-AC implementation class UID |
| `associateACImplVersionName` | ASSOCIATE-AC implementation version name |
| `associateACApplicationContext` | ASSOCIATE-AC application context |
| `associateACPresentationContexts` | Map of ASSOCIATE-AC presentation contexts |
| `associateRQProtocolVersion` | ASSOCIATE-RQ protocol version |
| `associateRQImplClassUID` | ASSOCIATE-RQ implementation class UID |
| `associateRQImplVersionName` | ASSOCIATE-RQ implementation version name |
| `associateRQApplicationContext` | ASSOCIATE-RQ application context |
| `associateRQPresentationContexts` | Map of ASSOCIATE-RQ presentation contexts |
| `username` | User identity username (if provided) |
| `passcode` | User identity passcode (if provided) |
| `userIdentityType` | User identity type (if provided) |

### Web Service Listener
No automatic source map variables.

### JavaScript Reader
No automatic variables. The JavaScript Reader script returns the raw message string.

## Destination connector map variables

These variables are populated in the `connectorMap` after a destination connector executes.

### HTTP Sender
| Variable | Description |
|---|---|
| `responseStatusLine` | HTTP response status line |
| `responseStatusCode` | HTTP response status code |
| `responseHeaders` | Map of response headers |

### TCP Sender (Server mode)
| Variable | Description |
|---|---|
| `localAddress` | Local IP address of the server socket |
| `localPort` | Local port of the server socket |
| `numberOfClients` | Total number of connected clients |
| `successfulSends` | Count of successful message sends |
| `allResponses` | List of Response objects from each connected client |

## Accessing map variables

### In transformers/filters (JavaScript)
```javascript
// Read source map variables
var remoteIP = sourceMap.get('remoteAddress');
var filename = sourceMap.get('originalFilename');

// Read connector map variables (destination)
var statusCode = connectorMap.get('responseStatusCode');
```

### In templates (Velocity)
```
Remote address: ${remoteAddress}
Original file: ${originalFilename}
```

### In postprocessor
```javascript
var sourceAddr = sourceMap.get('remoteAddress');
logger.info('Message from: ' + sourceAddr);
```

## Custom map variables

You can add your own variables to writable maps:

```javascript
// In a transformer
channelMap.put('processedTimestamp', DateUtil.getCurrentDate('yyyy-MM-dd HH:mm:ss'));
connectorMap.put('customFlag', 'URGENT');
```

These custom variables are then available in subsequent JavaScript steps via the corresponding map's `.get()` method, and in Velocity template fields using `${variableName}`.

::: info
The `sourceMap` is read-only. Use `channelMap` to store custom variables that need to be accessible across all connectors in the channel, or `connectorMap` for variables scoped to the current connector.
:::
