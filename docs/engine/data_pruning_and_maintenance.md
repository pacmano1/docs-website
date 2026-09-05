---
title: Data Pruning and Maintenance
description: Message retention and cleanup
---

# Data Pruning and Maintenance

OIE stores message data in the database. Without regular maintenance, this data can grow unbounded and impact performance. The Data Pruner automates message cleanup.

## Data Pruner

The Data Pruner is a built-in plugin that automatically removes old message data based on configurable retention policies.

### Accessing the Data Pruner
Navigate to **Settings > Data Pruner** in the Administrator.

### Global settings

| Setting | Description |
|---|---|
| **Enabled** | Enable/disable the data pruner (disabled by default) |
| **Pruning Schedule** | Interval, daily time, or cron expression for when pruning runs |
| **Pruning Block Size** | Number of messages processed per pruning batch (default 1000; range 50 to 10000) |
| **Archiving Enabled** | Enable message archiving before pruning (disabled by default) |
| **Archiver Block Size** | Number of messages per archiver batch (default 50; max 1000) |
| **Include Attachments** | Include message attachments in archives (disabled by default) |
| **Prune Events** | Enable pruning of server events |
| **Max Event Age** | Maximum age of events to retain when event pruning is enabled |

### Per-channel pruning

Each channel can have its own pruning settings configured in the channel properties:

| Setting | Description |
|---|---|
| **Prune metadata older than N days** | Remove message metadata after this many days |
| **Prune content older than N days** | Remove message content (but keep metadata) after this many days |
| **Archive before pruning** | Write messages to archive before deletion (enabled by default) |
| **Prune errored messages** | Include errored messages in pruning (disabled by default; by default messages with ERROR, QUEUED, or PENDING status are skipped) |

### Pruning strategy

The pruner operates in two phases:
1. **Metadata Pruning** - Removes entire messages (metadata, content, custom metadata, attachments, and connector messages) older than the metadata retention period
2. **Content Pruning** - Removes only message content and attachments while preserving metadata, for messages older than the content retention period but newer than the metadata retention period

This allows you to keep lightweight metadata longer than full content. For example:
- Keep content for 7 days (for troubleshooting)
- Keep metadata for 30 days (for audit/reporting)

## Message storage modes

Message storage settings work together with pruning to control data volume:

| Mode | What's Stored | Pruning Impact |
|---|---|---|
| **Development** | All content types (raw, transformed, encoded, sent, response, maps, etc.) | Largest storage footprint |
| **Production** | Raw, encoded, sent, response, and maps (excludes processed raw, transformed, response transformed, and processed response) | Moderate storage |
| **Raw** | Only raw content (no maps, encoded, sent, or response content; message recovery and durability disabled) | Smaller storage |
| **Metadata** | Only custom metadata and attachments, no message content or maps (message recovery disabled) | Minimal storage |
| **Disabled** | Nothing stored | No pruning needed |

Set storage mode per-channel in the channel properties.

## Manual message cleanup

### Desktop Administrator
1. Open the **Message Browser** for a channel
2. Use filters to find messages
3. Select messages and click **Remove**

### CLI

These commands are typed at the prompt of the CLI shell, started with `java -jar mirth-cli-launcher.jar` (see [Command Line Interface](./command_line_interface.md#launching-the-cli)). They are not operating-system commands. `clearallmessages` acts on every channel: a running channel is stopped, emptied, and started again, and statistics are kept. `resetstats` resets the current statistics of every deployed channel and its connectors. `resetstats lifetime` resets current and lifetime statistics for every channel. The shell ignores anything after `#`, so the block can be pasted as is.

```text
# Remove all messages from all channels, restarting any that are running
clearallmessages

# Reset current statistics
resetstats

# Reset current and lifetime statistics
resetstats lifetime
```

### REST API

The request below removes every message from one channel. Run it from any shell with `curl`, with `{channelId}` replaced by the channel's ID.

```bash
# Remove all messages from one channel, restarting it if it is running
curl -k -X DELETE \
  -H "X-Requested-With: OpenIntegrationEngine" \
  -u admin:admin \
  "https://localhost:8443/api/channels/{channelId}/messages/_removeAll?restartRunningChannels=true"
```

`restartRunningChannels` defaults to false, and then a deployed channel that is not stopped is skipped: the request succeeds and nothing is removed. With it set to true the channel is stopped, emptied, and started again. A stopped or undeployed channel is emptied either way. `clearStatistics` defaults to true, so the channel's statistics are reset as well; add `&clearStatistics=false` to keep them. These defaults are the reverse of the CLI's `clearallmessages`, which restarts running channels and keeps statistics.

::: info
The `X-Requested-With` header is required on all API requests. Any non-empty value is accepted.
:::

## Database tasks

The **Settings > Database Tasks** panel shows available database cleanup or optimization tasks. Tasks appear when applicable conditions are detected (e.g., legacy tables exist that can be removed). Each task can be triggered manually from the panel.

## Archiving

When archiving is enabled, the Data Pruner exports messages before deleting them:

- Individual messages are serialized as XML files
- Files can optionally be bundled into a `zip`, `tar.gz`, or `tar.bz2` archive
- The archive directory, file pattern, and compression format are all configurable
- Attachment inclusion is optional (disabled by default)
- Archives written in the default XML serialized message format can be imported back into a deployed channel with Import Messages in the Message Browser, with the CLI `importmessages` command, or through the message import endpoints of the REST API. A file, a folder, or an archive is accepted, and the importer reads archive entries in place

Configure archiving in the Data Pruner settings panel.

