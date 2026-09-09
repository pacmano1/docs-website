---
title: Troubleshooting
description: Symptoms and causes for a server that will not start, an Administrator that will not connect, channels that will not run, and the errors you are most likely to see
---

# Troubleshooting

## Server will not start

### Java not found

**Symptom:** an error about a missing Java runtime or an unsupported version.

Confirm the version with `java -version`; OIE 4.6.0 requires Java 17 or later.

If more than one runtime is installed, the launcher picks one in a fixed order and uses the
first it finds that is version 17 or higher:

1. `OIE_JAVA_PATH`, an environment variable holding the full path to the `java` executable.
   Highest priority, and validated immediately: if it points at something that is not a
   suitable Java executable, the launcher stops rather than falling through to the next entry.
2. `-java-cmd` in `conf/custom.vmoptions`, the path to the `java` executable. This is the
   launcher's own preferred way to declare a version, and it may be a path relative to the
   script. `OIE_JAVA_PATH` overrides it.
3. `JAVA_HOME`.
4. Whatever `java` resolves to on the `PATH`.

SDKMAN users can run `sdk env install` in the source tree to pick up the version the project
declares.

### Port already in use

**Symptom:** `Address already in use` on startup.

Find the process holding the port (`lsof -i :8443` on Linux and macOS, `netstat -ano | findstr 8443` on Windows), then stop it or move OIE. The ports live in `conf/mirth.properties`:

```properties
http.port = 8080
https.port = 8443
```

### Database connection failed

**Symptom:** `Error establishing connection to database, retrying startup in <n> milliseconds`,
followed by `Error establishing connection to database, aborting startup.` once the retries run out.

Check that the database is running and reachable through any firewall between it and OIE, then confirm `database`, `database.url`, `database.username`, and `database.password` in `mirth.properties`. The account needs rights to create and alter tables on first start, not just to read and write. `database.connection.maxretry` and `database.connection.retrywaitinmilliseconds` control how hard the server tries before giving up.

### Out of memory

**Symptom:** `OutOfMemoryError` in the log.

Raise the heap in `conf/custom.vmoptions`:

```
-Xmx1024m
```

If that only delays the failure, the cause is usually retained state rather than heap size: a global or global channel map that grows per message and is never cleared, or a channel loading an unbounded result set. Both hold their memory until the server restarts.

## Administrator cannot connect

### Connection refused

Verify the server is running and that port 8443 is reachable. Check `https.host` in `mirth.properties`: set to `127.0.0.1` it accepts local connections only, which looks identical to a firewall problem from another machine.

### Certificate errors

The certificate generated on first start is self-signed, so browsers and the desktop Administrator will warn. For production, install a CA-signed certificate into the keystore. If the handshake fails outright rather than warning, compare `https.client.protocols` and `https.ciphersuites` against what the client offers.

### Login fails

Confirm the credentials, then check whether the account is locked after exceeding `password.retrylimit`, or whether the password has expired under `password.expiration`. Reset from the CLI with `user changepw admin "newpassword"`.

## Channel issues

### Channel will not start

Check the Server Log panel on the Dashboard tab first; a channel that refuses to start almost always logged why. The usual causes are a source connector port already in use, a channel dependency that is not started, an exception thrown from a deploy script, or an external resource named in the channel that is unreachable.

### Messages not being received

Confirm the sending system is pointing at the right host and port and that nothing between them is blocking it. For TCP and MLLP, a mismatched transmission mode presents as a connection that opens and then goes quiet. For File Reader, check the directory and the filename filter. For Database Reader, run the query by hand against the same account. The Connector Status panel on the Dashboard shows connection events as they happen.

### Messages stuck in queue

Open the destination's failures in the Message Browser and read the error rather than the count. Common causes are an unreachable destination, an authentication failure that retries forever, and a retry interval long enough that the queue looks stalled when it is only slow. Queue settings are per destination.

### Transformer errors

Open the message in the Message Browser and read the Errors tab. `TypeError` usually means a field path that does not exist in this message, `ReferenceError` an undefined variable, most often `tmp` in a transformer with no outbound template configured. Load a real sample message in the transformer editor and check the path against the actual structure rather than the specification.

To capture what a script saw for a specific message, put it in the channel map rather than the log. It then appears on that message's Mappings tab in the Message Browser, attached to the message it describes:

```javascript
$c('debugMessageType', msg['MSH']['MSH.9']['MSH.9.1'].toString());
```

### Filter not working

Check rule order and the AND/OR operators between rules, and confirm field paths against a real message. In a JavaScript filter, `return true` accepts the message and `return false` rejects it. A filter shares its scope with the transformer on the same connector, so a value the filter writes to `msg`, or to `tmp` where an outbound template exists, is still there when the transformer runs.

## Performance

### High CPU

Look for high-volume channels with expensive transformers, polling sources set to poll far more often than the data arrives, and loops in scripts over repeating segments that rescan the message each iteration. Raising processing threads helps only where message order does not matter.

### High memory

Reduce the message storage mode, enable content pruning, and check for large messages that would be better handled as attachments. Review global and global channel map usage: anything put there stays until the server restarts or something removes it.

### Slow database

Enable `database.enable-read-write-split` where a read replica exists, keep statistics and indexes current, and raise `database.max-connections` if the pool is saturated. Configure pruning before tuning anything else; most slow-database reports are a message table nobody ever pruned.

## Common error messages

| Error | Cause | Where to look |
|---|---|---|
| `Address already in use` | Port conflict | Change the port or stop the conflicting process |
| `Error establishing connection to database` | Database unreachable or credentials wrong | `database.*` settings and network path |
| `OutOfMemoryError` | Heap exhausted, or retained state | `-Xmx`, then map growth |
| `SSLHandshakeException` | No protocol or cipher in common | `https.client.protocols`, `https.ciphersuites` |
| `ConnectException: Connection refused` | Destination unreachable | Host, port, firewall |
| `SocketTimeoutException` | Network or downstream timeout | Connector timeout settings |
| `ScriptCompileException` | JavaScript syntax error | The four channel scripts of the channel id named in the message |
| `MirthJavascriptTransformerException` | Runtime error in a filter or transformer script | Errors tab in the Message Browser |

## Getting help

- **Logs:** `logs/mirth.log` on the server
- **Event Browser:** system events for operational issues
- **Discord:** [join the community](https://discord.gg/azdehW2Zrx)
- **GitHub Issues:** [report a bug](https://github.com/OpenIntegrationEngine/engine/issues)
- **Security issues:** security@openintegrationengine.org
