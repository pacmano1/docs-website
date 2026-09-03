---
title: Server Configuration
description: Configure ports, database, TLS, and more
---

# Server Configuration

The primary server configuration file is `conf/mirth.properties`. This file controls ports, database connections, TLS settings, password policies, and more.

## Configuration file location

```
OIE_HOME/conf/mirth.properties
```

Changes to this file require a server restart to take effect.

## Ports

```properties
# HTTP port for the launch page and downloading signed client resources
# Comment out or omit this property to only start the web server on HTTPS
http.port = 8080

# HTTPS port for the secure launch page, REST API, Administrator, and CLI
https.port = 8443
```

### Bind addresses

```properties
# Listen on all interfaces (default)
http.host = 0.0.0.0
https.host = 0.0.0.0

# Or restrict to localhost only
# http.host = 127.0.0.1
# https.host = 127.0.0.1
```

## Context path

```properties
# Root context path (default: /)
http.contextpath = /
```

## TLS / SSL configuration

```properties
# HTTP Strict Transport Security (enabled by default)
http.stricttransportsecurity = true

# Client-side TLS protocol versions
https.client.protocols = TLSv1.3,TLSv1.2

# Server-side TLS protocol versions
https.server.protocols = TLSv1.3,TLSv1.2,SSLv2Hello

# Allowed cipher suites (comma-separated)
https.ciphersuites = TLS_CHACHA20_POLY1305_SHA256,...

# Ephemeral Diffie-Hellman key size
https.ephemeraldhkeysize = 2048
```

::: warning
Changing TLS protocol, cipher suite, or DH key size settings can leave your server vulnerable to SSL-based attacks.
:::

### Keystore

```properties
keystore.path = ${dir.appdata}/keystore.jks
keystore.storepass = 81uWxplDtB
keystore.keypass = 81uWxplDtB
keystore.type = JCEKS
```

::: warning
On first startup, if the keystore passwords still equal the default value (`81uWxplDtB`), OIE will automatically replace them with randomly generated passwords. The keystore file stores the server certificate (for the web server and API) and the secret key used to encrypt message data, exports, and other sensitive content. **Back up this file**. If it is lost, any data encrypted with it cannot be recovered.
:::

## Database configuration

```properties
# Database type: derby, mysql, postgres, oracle, sqlserver
database = derby

# JDBC connection URL
database.url = jdbc:derby:${dir.appdata}/mirthdb;create=true

# JDBC Driver class (usually auto-detected from database type)
# database.driver =

# Credentials
database.username =
database.password =

# Connection pool type (default: HikariCP; alternative: DBCP)
# database.pool = HikariCP

# Maximum number of connections for the messaging engine pool
database.max-connections = 20

# Connection pool test query (no default; used by the connection pool for validation)
# database.test-query = SELECT 1

# Retry configuration on startup
database.connection.maxretry = 2
database.connection.retrywaitinmilliseconds = 10000
```

### Read/write pool splitting

When enabled, the connection pool splits into a read-only pool and a read/write pool. The read-only pool serves most Administrator API calls that only fetch data, while the read/write pool handles message processing and any operation that modifies data. You can optionally point the read-only pool at a separate read replica.

```properties
# Enable read/write connection pool splitting (default: true)
database.enable-read-write-split = true

# Read-only pool settings (all default to the main pool values if not set)
# database-readonly =
# database-readonly.url =
# database-readonly.max-connections =

# Use write pool for internal caches (set to true if read replica has lag)
database.write-pool-cache = false
```

See [Database Support](./database_support.md) for connection URL examples for each database type.

## Password policy

```properties
password.minlength = 0        # Minimum password length (0 = no minimum)
password.minupper = 0         # Minimum uppercase characters
password.minlower = 0         # Minimum lowercase characters
password.minnumeric = 0       # Minimum numeric characters
password.minspecial = 0       # Minimum special characters
password.retrylimit = 0       # Max failed login attempts (0 = no limit)
password.lockoutperiod = 0    # Lockout duration in hours (0 = no lockout)
password.expiration = 0       # Days until password expires (0 = never)
password.graceperiod = 0      # Days to allow login after password expiration
password.reuseperiod = 0      # Days before reusing a password (0 = always allow, -1 = never)
password.reuselimit = 0       # Times a password may be reused (0 = no limit, -1 = never)
```

## Server behavior

```properties
# Deploy channels automatically on server startup
server.startupdeploy = true

# Include jars from custom-lib/ on the server classpath
# To avoid classpath conflicts, prefer using Resources instead
server.includecustomlib = false

# Server URL shown in the Administrator launcher (empty = auto-detect)
server.url =

# Auto-generate a new server ID on every startup (useful for containers)
server.id.ephemeral = false

# Interval (ms) to update channel statistics across all channels
donkey.statsupdateinterval = 1000
```

## API security

```properties
# Allow API access over the HTTP port (default: false, HTTPS only)
server.api.allowhttp = false

# Require X-Requested-With header on API requests (CSRF protection)
server.api.require-requested-with = true

# Content-Security-Policy header on API responses
server.api.contentsecuritypolicy = frame-ancestors 'none'

# X-Frame-Options header on API responses
server.api.xframeoptions = DENY
```

### CORS headers

```properties
server.api.accesscontrolalloworigin = *
server.api.accesscontrolallowcredentials = false
server.api.accesscontrolallowmethods = GET, POST, DELETE, PUT
server.api.accesscontrolallowheaders = Content-Type
server.api.accesscontrolexposeheaders =
server.api.accesscontrolmaxage =
```

### Session management

```properties
# Store sessions in the database (for clustered deployments)
server.api.sessionstore = false

# Max session idle time in seconds (default: 259200 = 72 hours, minimum: 60)
server.api.sessionmaxinactiveinterval = 259200
```

## JavaScript engine

```properties
# Rhino JavaScript language version
# Valid values: es6, default, 1.0-1.8
rhino.languageversion = es6

# Rhino optimization level (-1 = interpretive, 0-9 = compiled with increasing optimization)
# -1 is less efficient but allows very large/complex scripts to compile
rhino.optimizationlevel = -1
```

## Administrator client

```properties
# Default maximum heap size for the Administrator client (not the server)
administrator.maxheapsize = 512m

# Heap size options shown on the launch page (default: 256m,512m,1g,2g)
# administrator.maxheapsizeoptions = 256m,512m,1g,2g
```

## Application data

```properties
# Application data directory
dir.appdata = appdata

# Temp data directory
dir.tempdata = ${dir.appdata}/temp

# Configuration map storage: file or database (default: file)
# configurationmap.location = file

# Configuration map file path (when location = file)
configurationmap.path = ${dir.appdata}/configuration.properties
```

## Encryption

```properties
# Encrypt exported channels and files from the Administrator (0 = off, 1 = on)
encryption.export = 0

# Auto-encrypt database.password in this file on next startup (0 = off, 1 = on)
encryption.properties = 0

# Symmetric encryption algorithm (must include mode and padding)
encryption.algorithm = AES/CBC/PKCS5Padding

# Encryption key length
encryption.keylength = 128
```

## Password hashing

```properties
# Digest algorithm for password hashes
digest.algorithm = PBKDF2WithHmacSHA256

# Salt size in bytes
digest.saltsizeinbytes = 8

# Iterations for the digest algorithm
digest.iterations = 600000
```

::: info
After changing `digest.algorithm`, all existing passwords must be reset by an administrator or updated by each user.
:::

## Other configuration files

The `conf/` directory contains additional configuration files:

| File | Purpose |
|---|---|
| `log4j2.properties` | Controls server log levels, file rotation, and output format |
| `log4j2-cli.properties` | Same as above, but specific to the CLI |
| `dbdrivers.xml` | Defines JDBC drivers available in the Database connector's Driver drop-down |
| `mirth-cli-config.properties` | Stores CLI connection defaults (address, user, password) |

The `appdata/` directory contains runtime files:

| File | Purpose |
|---|---|
| `configuration.properties` | Stores the Configuration Map as key-value pairs |
| `extension.properties` | Stores enabled/disabled state of all installed extensions |
| `keystore.jks` | Server certificate, secret encryption key |
| `server.id` | Unique server identifier (auto-generated on first startup) |

## JVM options

JVM settings are configured in `oieserver.vmoptions`:

```
# Set max heap size (default: 256m, set in conf/base_includes.vmoptions)
-Xmx256m

# Custom Java path (alternative to OIE_JAVA_PATH environment variable)
# -java-cmd /path/to/java
```

The `oieserver.vmoptions` file itself contains only `-include-options` directives that load the files below. Custom JVM settings should be added to `conf/custom.vmoptions`.

Additional JVM options files:
- `conf/base_includes.vmoptions` - Base JVM settings (heap size, headless mode)
- `conf/default_modules.vmoptions` - Default module inclusions
- `conf/custom.vmoptions` - User-defined custom JVM options

### Environment variables

| Variable | Purpose |
|---|---|
| `OIE_JAVA_PATH` | Highest-priority path to the `java` executable |
| `JAVA_HOME` | Standard Java installation path |
