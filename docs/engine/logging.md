---
title: Logging
description: Log configuration and troubleshooting
---

# Logging

OIE uses **Log4j 2** for server-side logging. Logs are essential for troubleshooting, auditing, and monitoring server and channel behavior.

## Log files

Default log location: `OIE_HOME/logs/`

| File | Contents |
|---|---|
| `mirth.log` | Main server log (current) |
| `mirth.log.1` ... `mirth.log.20` | Rotated log files |

## Configuration

The logging configuration file is:
```
OIE_HOME/conf/log4j2.properties
```

### Default configuration

```properties
# Root logger: ERROR level, outputs to console and file
rootLogger = ERROR,stdout,fout

# Console appender
appender.console.type = Console
appender.console.name = stdout
appender.console.layout.type = PatternLayout
appender.console.layout.pattern = %-5p %d{yyyy-MM-dd HH:mm:ss.SSS} [%t] %c: %m%n
appender.console.layout.charset = UTF-8

# File appender (rolling)
dir.logs = logs
appender.rolling.type = RollingFile
appender.rolling.name = fout
appender.rolling.fileName = logs/mirth.log
appender.rolling.filePattern = logs/mirth.log.%i
appender.rolling.policies.type = Policies
appender.rolling.policies.size.type = SizeBasedTriggeringPolicy
appender.rolling.policies.size.size = 500KB
appender.rolling.strategy.type = DefaultRolloverStrategy
appender.rolling.strategy.max = 20
appender.rolling.layout.type = PatternLayout
appender.rolling.layout.pattern = %-5p %d{yyyy-MM-dd HH:mm:ss.SSS} [%t] %c: %m%n
```

### Log rotation
- Files rotate when they reach **500 KB**
- Up to **20** rotated files are retained
- Oldest files are deleted when the limit is reached

Adjust for production:
```properties
# Increase file size for production
appender.rolling.policies.size.size = 10MB

# Retain more history
appender.rolling.strategy.max = 50
```

## Log levels

| Level | Description |
|---|---|
| `ERROR` | Errors that need attention |
| `WARN` | Warning conditions |
| `INFO` | Informational messages |
| `DEBUG` | Detailed debugging information |
| `TRACE` | Most verbose level |

The root logger is set to `ERROR` by default. Specific loggers override this for important components.

## Server loggers

Pre-configured server loggers:

```properties
# Server startup/shutdown
logger.mirth.name = com.mirth.connect.server.Mirth
logger.mirth.level = INFO

# Channel deployment
logger.donkeyEngineController.name = com.mirth.connect.server.controllers.DonkeyEngineController
logger.donkeyEngineController.level = INFO

# Message recovery
logger.recoveryTask.name = com.mirth.connect.donkey.server.channel.RecoveryTask
logger.recoveryTask.level = INFO

# File connector
logger.fileReceiver.name = com.mirth.connect.connectors.file.FileReceiver
logger.fileReceiver.level = WARN
```

## Channel script loggers

These loggers capture output from `logger.*` calls in channel scripts:

```properties
logger.transformer.name = transformer
logger.transformer.level = DEBUG

logger.preprocessor.name = preprocessor
logger.preprocessor.level = DEBUG

logger.postprocessor.name = postprocessor
logger.postprocessor.level = DEBUG

logger.deploy.name = deploy
logger.deploy.level = DEBUG

logger.undeploy.name = undeploy
logger.undeploy.level = DEBUG

logger.filter.name = filter
logger.filter.level = DEBUG

logger.db-connector.name = db-connector
logger.db-connector.level = DEBUG

logger.js-connector.name = js-connector
logger.js-connector.level = DEBUG

logger.attachment.name = attachment
logger.attachment.level = DEBUG

logger.batch.name = batch
logger.batch.level = DEBUG

logger.response.name = response
logger.response.level = DEBUG

logger.shutdown.name = shutdown
logger.shutdown.level = DEBUG
```

## Using the logger in scripts

```javascript
// Available in all channel script contexts
logger.info('Message received from: ' + sourceMap.get('remoteAddress'));
logger.debug('Patient ID: ' + msg['PID']['PID.3']['PID.3.1'].toString());
logger.warn('Missing optional field PID.13');
logger.error('Failed to connect to external system');
```

### Logger output
Logger output appears in:
1. `logs/mirth.log` (file)
2. The server console (stdout)
3. The **Server Log** plugin panel in the Administrator

## Server Log Plugin

The **Server Log** plugin provides a real-time log viewer in the Administrator:
- View log entries as they are written
- Double-click an entry to view its full content
- Pause/resume log polling
- Clear the displayed log
- Configure the maximum number of displayed entries

## CLI log configuration

A separate log configuration exists for the CLI:
```
OIE_HOME/conf/log4j2-cli.properties
```

## SQL logging

To debug database queries:
```properties
logger.sql.name = java.sql
logger.sql.level = DEBUG    # Change from ERROR to DEBUG
```

::: warning
SQL logging at DEBUG level is extremely verbose. Use only for targeted debugging.
:::

## Troubleshooting with logs

### Common patterns

**Channel won't start:**
- Check for `ERROR` entries around the channel name
- Look for port conflicts, database connection issues, or script errors

**Messages stuck in queue:**
- Check destination connector errors
- Look for connection timeout or refused errors

**High memory usage:**
- Enable DEBUG on the server Mirth logger
- Check for large message volumes or unbounded map growth

### Increasing log verbosity

Temporarily increase logging for specific packages:
```properties
# Debug all server controllers
logger.controllers.name = com.mirth.connect.server.controllers
logger.controllers.level = DEBUG

# Debug HTTP connector
logger.httpConnector.name = com.mirth.connect.connectors.http
logger.httpConnector.level = DEBUG
```

Remember to revert to production levels after debugging.
