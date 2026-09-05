---
title: Server Configuration
description: Configure ports, database, TLS, and more
---

# Server Configuration

The primary server configuration file is `conf/mirth.properties`. This file controls ports, database connections, TLS settings, password policies, and more.

## Configuration file location

```text
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
https.ciphersuites = TLS_CHACHA20_POLY1305_SHA256,TLS_ECDHE_ECDSA_WITH_CHACHA20_POLY1305_SHA256,TLS_ECDHE_RSA_WITH_CHACHA20_POLY1305_SHA256,TLS_DHE_RSA_WITH_CHACHA20_POLY1305_SHA256,TLS_AES_256_GCM_SHA384,TLS_AES_128_GCM_SHA256,TLS_ECDHE_ECDSA_WITH_AES_256_GCM_SHA384,TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384,TLS_RSA_WITH_AES_256_GCM_SHA384,TLS_ECDH_ECDSA_WITH_AES_256_GCM_SHA384,TLS_ECDH_RSA_WITH_AES_256_GCM_SHA384,TLS_DHE_RSA_WITH_AES_256_GCM_SHA384,TLS_DHE_DSS_WITH_AES_256_GCM_SHA384,TLS_ECDHE_ECDSA_WITH_AES_128_GCM_SHA256,TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256,TLS_RSA_WITH_AES_128_GCM_SHA256,TLS_ECDH_ECDSA_WITH_AES_128_GCM_SHA256,TLS_ECDH_RSA_WITH_AES_128_GCM_SHA256,TLS_DHE_RSA_WITH_AES_128_GCM_SHA256,TLS_DHE_DSS_WITH_AES_128_GCM_SHA256,TLS_EMPTY_RENEGOTIATION_INFO_SCSV

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
When the server starts with no keystore file at `keystore.path` and both passwords still equal the default value (`81uWxplDtB`), OIE replaces them with randomly generated passwords, writes the new values back to `mirth.properties`, and creates the keystore. The keystore file stores the server certificate (for the web server and API) and the secret key used to encrypt message data, exports, and other sensitive content. **Back up this file**. If it is lost, any data encrypted with it cannot be recovered.
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

# Retry configuration on startup
database.connection.maxretry = 2
database.connection.retrywaitinmilliseconds = 10000
```

The pool's validation query is not read from this file. The engine derives it from the database type, and the default HikariCP pool applies it only when the type is `sqlserver`.

### Read/write pool splitting

When enabled, the connection pool splits into a read-only pool and a read/write pool. The read-only pool serves most Administrator API calls that only fetch data, while the read/write pool handles message processing and any operation that modifies data. You can optionally point the read-only pool at a separate read replica.

```properties
# Enable read/write connection pool splitting (default: true)
database.enable-read-write-split = true

# Maximum number of connections for the read-only pool
# (defaults to database.max-connections when not set)
database-readonly.max-connections = 20

# Read-only pool overrides (each defaults to the main pool value when not set)
# Database type for the read-only pool: derby, mysql, postgres, oracle, sqlserver
# database-readonly =
# database-readonly.url =
# database-readonly.driver =
# database-readonly.username =
# database-readonly.password =
# database-readonly.pool =

# Use the write pool for internal caches (set to true if the read replica lags)
database.write-pool-cache = false
```

See [Database Support](./database_support.md) for connection URL examples for each database type.

## Password policy

```properties
# Minimum password length (0 = no minimum)
password.minlength = 0

# Minimum uppercase characters
password.minupper = 0

# Minimum lowercase characters
password.minlower = 0

# Minimum numeric characters
password.minnumeric = 0

# Minimum special characters
password.minspecial = 0

# Failed login attempts allowed before lockout (0 = no lockout)
password.retrylimit = 0

# Lockout duration in hours (0 = no lockout, even when retrylimit is set)
password.lockoutperiod = 0

# Days until a password expires (0 = never)
password.expiration = 0

# Days a user may still log in after the password expires (0 = unlimited, -1 = no grace period)
password.graceperiod = 0

# Days before a previous password may be reused (0 = always allow, -1 = never)
password.reuseperiod = 0

# Times a previous password may be reused (0 = no limit, -1 = never)
password.reuselimit = 0
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

# Derive the hash with a password-based key derivation function (0 = off, 1 = on)
digest.usepbe = 1

# Derived key size in bits, used when digest.usepbe = 1
digest.keysizeinbits = 256
```

::: info
A stored hash is the salt followed by the digest, with none of these values recorded alongside it. After changing any of them, an existing hash keeps verifying only while `digest.fallback.algorithm`, `digest.fallback.saltsizeinbytes`, `digest.fallback.iterations`, `digest.fallback.usepbe`, and `digest.fallback.keysizeinbits` describe the scheme that produced it. When the fallback keys are absent the engine tries SHA256 with 8 salt bytes, 1000 iterations, and no PBE, the defaults of releases before 4.4.0, not the values above. Otherwise every existing password must be reset by an administrator or changed by its user.
:::

## Other configuration files

The `conf/` directory contains additional configuration files:

| File | Purpose |
|---|---|
| `log4j2.properties` | Controls server log levels, file rotation, and output format |
| `log4j2-cli.properties` | Same as above, but specific to the CLI |
| `dbdrivers.xml` | Read for the Database connector's Driver drop-down only while no driver list is stored in the database. Saving the list from the Administrator's driver dialog, or an upgrade from a schema older than 3.8.0, stores a copy in the database and the file is no longer read |
| `mirth-cli-config.properties` | Stores CLI connection defaults (address, user, password) |

The `appdata/` directory contains runtime files:

| File | Purpose |
|---|---|
| `configuration.properties` | Stores the Configuration Map as key-value pairs |
| `extension.properties` | Stores enabled/disabled state of all installed extensions |
| `keystore.jks` | Server certificate, secret encryption key |
| `server.id` | Unique server identifier (auto-generated on first startup) |

## JVM options

The launcher reads `oieserver.vmoptions`, which contains only `-include-options` directives for the files below and must not be edited. Put JVM settings in `conf/custom.vmoptions`:

```text
# Maximum heap size. conf/base_includes.vmoptions sets -Xmx256m; custom.vmoptions
# is included last, so the value here takes effect.
-Xmx1g

# Pin the java binary. The OIE_JAVA_PATH environment variable overrides this
# directive; JAVA_HOME and then the PATH are tried only when neither is set.
# -java-cmd /path/to/java
# -java-cmd C:\path\to\java.exe
```

The files `oieserver.vmoptions` includes, in order:
- `conf/base_includes.vmoptions` - Base JVM settings (heap size, headless mode)
- `conf/default_modules.vmoptions` - Default module inclusions
- `conf/custom.vmoptions` - User-defined custom JVM options

### Environment variables

| Variable | Purpose |
|---|---|
| `OIE_JAVA_PATH` | Highest-priority path to the `java` executable |
| `JAVA_HOME` | Standard Java installation path |
