---
title: Global Scripts
description: Server-wide deploy, undeploy, preprocessor, and postprocessor scripts
---

# Global Scripts

Global Scripts are server-wide scripts that execute during server-level events. They are distinct from channel-level deploy/undeploy/preprocessor/postprocessor scripts, which are scoped to individual channels.

## Accessing global scripts

1. In the Administrator, navigate to **Channels** in the main menu
2. Click **Edit Global Scripts** in the task panel
3. The Global Scripts editor opens with tabs for each script type

## Script types

### Global deploy script
Executes once when channels are deployed (before individual channel deploy scripts run).

Use cases:
- Initialize server-wide resources
- Set up global map variables used by multiple channels
- Establish shared database connections
- Load configuration data

```javascript
// Example: Load shared lookup table into global map
var conn = DatabaseConnectionFactory.createDatabaseConnection(
    'org.postgresql.Driver', 'jdbc:postgresql://localhost/lookups',
    configurationMap.get('dbUser'), configurationMap.get('dbPass')
);
var result = conn.executeCachedQuery('SELECT code, description FROM lookup_table');
var lookupMap = new java.util.HashMap();
while (result.next()) {
    lookupMap.put(result.getString('code'), result.getString('description'));
}
conn.close();
globalMap.put('lookupTable', lookupMap);
```

### Global undeploy script
Executes once when channels are undeployed (after all individual channel undeploy scripts run).

Use cases:
- Clean up server-wide resources
- Close shared connections
- Flush caches

```javascript
// Example: Close shared resources
var conn = globalMap.get('sharedConnection');
if (conn) {
    conn.close();
    globalMap.remove('sharedConnection');
}
```

### Global preprocessor script
Executes for every message on every channel, before the channel's own preprocessor.

Use cases:
- Server-wide message logging
- Universal message modifications
- Audit trail

```javascript
// Example: Log all incoming messages
logger.info('Message received on channel: ' + channelName);
return message;
```

::: warning
The global preprocessor runs on every message across all channels. Keep it lightweight to avoid performance impact.
:::

### Global postprocessor script
Executes for every message on every channel, after the channel's own postprocessor.

Use cases:
- Server-wide completion logging
- Centralized statistics tracking
- Cross-channel notification

## Available objects

Global scripts have access to:

| Object | Description |
|---|---|
| `globalMap` | Server-wide variable map |
| `globalChannelMap` | Per-channel global map (available when a channel context exists) |
| `configurationMap` | Server configuration key-value pairs |
| `logger` | Logging object |
| `connectorMessage` | ImmutableConnectorMessage (preprocessor only) |
| `message` | Raw message string (preprocessor) or ImmutableMessage (postprocessor) |
| `response` | Response from the channel postprocessor (global postprocessor only) |
| `sourceMap` | Source map variables (postprocessor) |
| `channelMap` | Channel map variables (postprocessor) |
| `responseMap` | Response map variables (postprocessor) |
| `channelName` | Name of the current channel (pre/postprocessor) |
| `channelId` | ID of the current channel (pre/postprocessor) |
| `router` | VMRouter for sending messages to other channels |
| `replacer` | TemplateValueReplacer for variable substitution |
| `DatabaseConnectionFactory` | Factory for creating database connections |
| `alerts` | AlertSender for triggering alerts (when channel context exists) |

## Global scripts vs. channel scripts

| Aspect | Global Scripts | Channel Scripts |
|---|---|---|
| **Scope** | All channels on the server | Single channel only |
| **Execution order** | Global preprocessor runs first; global postprocessor runs last | Channel scripts run between global scripts |
| **Editing** | Edit Global Scripts view | Channel editor Scripts tab |
| **Use case** | Server-wide logic | Channel-specific logic |

### Execution order
```
Global Preprocessor
  → Channel Preprocessor
    → Source Filter/Transformer
      → Destination Filter/Transformer
    → Channel Postprocessor
  → Global Postprocessor
```

## Import / export

Global scripts can be imported and exported via the CLI:

```
importscripts "path"
    Imports global scripts from file

exportscripts "path"
    Exports global scripts to file
```

Scripts are also included when exporting the full server configuration (`exportcfg`).

