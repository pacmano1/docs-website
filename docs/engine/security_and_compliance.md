---
title: Security and Compliance
description: TLS, CSRF and CORS settings, authentication, and encryption
---

# Security and Compliance

This page covers the TLS, CSRF and CORS keys in `conf/mirth.properties`, authentication and access control, and what the engine encrypts. The hardening checklist is on [Security Posture and Hardening](./security_posture_and_hardening.md#hardening-checklist).

## Transport Layer Security (TLS)

### Server TLS configuration

These keys in `conf/mirth.properties` are read at startup. `https.server.protocols` goes to the HTTPS listener that serves the REST API and the Administrator, and to the DICOM Listener. `https.client.protocols` covers TLS connections the server opens (HTTP Sender, Web Service Sender, SMTP Sender, DICOM Sender). `https.ciphersuites` is one list shared by the HTTPS listener and by the HTTP Sender, Web Service Sender, SMTP Sender and alert email, so shortening it for the listener also changes what those senders negotiate; the DICOM connectors read the protocol lists only. The cipher suite list is split on commas, and any name the JVM does not support is dropped before the rest are enabled, so a misspelt name is ignored rather than reported. `https.ephemeraldhkeysize` is copied into the JVM's `jdk.tls.ephemeralDHKeySize`, clamped to 1024 through 2048, unless that system property is already set. The values are the shipped defaults, with the cipher suite list on one line and shown in full.

```properties
# TLS protocol versions for connections the server opens
https.client.protocols = TLSv1.3,TLSv1.2

# TLS protocol versions accepted by the HTTPS listener
https.server.protocols = TLSv1.3,TLSv1.2,SSLv2Hello

# Enabled cipher suites, comma-separated on one line
https.ciphersuites = TLS_CHACHA20_POLY1305_SHA256,TLS_ECDHE_ECDSA_WITH_CHACHA20_POLY1305_SHA256,TLS_ECDHE_RSA_WITH_CHACHA20_POLY1305_SHA256,TLS_DHE_RSA_WITH_CHACHA20_POLY1305_SHA256,TLS_AES_256_GCM_SHA384,TLS_AES_128_GCM_SHA256,TLS_ECDHE_ECDSA_WITH_AES_256_GCM_SHA384,TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384,TLS_RSA_WITH_AES_256_GCM_SHA384,TLS_ECDH_ECDSA_WITH_AES_256_GCM_SHA384,TLS_ECDH_RSA_WITH_AES_256_GCM_SHA384,TLS_DHE_RSA_WITH_AES_256_GCM_SHA384,TLS_DHE_DSS_WITH_AES_256_GCM_SHA384,TLS_ECDHE_ECDSA_WITH_AES_128_GCM_SHA256,TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256,TLS_RSA_WITH_AES_128_GCM_SHA256,TLS_ECDH_ECDSA_WITH_AES_128_GCM_SHA256,TLS_ECDH_RSA_WITH_AES_128_GCM_SHA256,TLS_DHE_RSA_WITH_AES_128_GCM_SHA256,TLS_DHE_DSS_WITH_AES_128_GCM_SHA256,TLS_EMPTY_RENEGOTIATION_INFO_SCSV

# Ephemeral Diffie-Hellman key size in bits
https.ephemeraldhkeysize = 2048
```

### Keystore management

The keystore holds the certificate the HTTPS listener presents and the secret key behind the server's encryptor. These keys in `conf/mirth.properties` name it. On the first start with no keystore file, the server creates one, generates a certificate authority and a server certificate signed by it (both valid for 50 years), and, when both passwords still equal the shipped default `81uWxplDtB`, replaces them with random 12-character values and writes `mirth.properties` back. A keystore file that already exists at `keystore.path` is loaded with whatever `mirth.properties` holds, default included, and when only one of the two passwords was changed by hand neither is replaced. The block shows the keys as they stand after a first start that created the keystore; the passwords are placeholders for the generated values, so this block is read, not pasted.

```properties
keystore.path = ${dir.appdata}/keystore.jks
keystore.storepass = (generated)
keystore.keypass = (generated)
keystore.type = JCEKS
```

Passwords set by hand before the first start are kept as they are. The [TLS Manager](https://openintegrationengine.org/plugins/) community extension adds certificate management for this keystore and the Java trust store; it is not part of the engine.

### Connector-level TLS

What each connector encrypts in 4.6.0:
- **HTTP Sender** and **Web Service Sender** - an `https://` URL opens a TLS connection using `https.client.protocols` and `https.ciphersuites`
- **SMTP Sender** - the Encryption setting is None, TLS (STARTTLS after connecting) or SSL (TLS on connect), with the same protocol and cipher suite lists
- **File Reader/Writer** - SFTP, and HTTPS for the WebDAV scheme. FTP is plain; there is no FTPS
- **DICOM Listener/Sender** - a TLS setting on each connector (No TLS, AES, 3DES, or Without encryption) with its own key store and trust store; the listener uses `https.server.protocols`, the sender `https.client.protocols`
- **TCP Listener/Sender**, **HTTP Listener** and **Web Service Listener** - plain sockets and plain HTTP. Each builds its connections from a class named in a server property (`tcpConfigurationClass`, `httpConfigurationClass`, `wsConfigurationClass`), which an extension can set to a class that adds TLS; the engine ships none

## CSRF protection

The REST API requires an `X-Requested-With` header by default. The key in `conf/mirth.properties`:

```properties
server.api.require-requested-with = true
```

The header's value is not inspected; any non-blank value passes. A request without it gets HTTP 400 and never reaches the API. This is the Cross-Site Request Forgery guard, and every API client must send the header.

## CORS configuration

The `ApiOriginFilter` reads six keys from `conf/mirth.properties` at startup and adds the matching `Access-Control-*` header to every API response. A key left blank adds no header. The block shows the shipped values:

```properties
# CORS headers
server.api.accesscontrolalloworigin = *
server.api.accesscontrolallowcredentials = false
server.api.accesscontrolallowmethods = GET, POST, DELETE, PUT
server.api.accesscontrolallowheaders = Content-Type
server.api.accesscontrolexposeheaders =
server.api.accesscontrolmaxage =
```

`accesscontrolalloworigin` is sent verbatim as `Access-Control-Allow-Origin`; the filter does not compare it with the request's `Origin` header, and the header takes a single origin or `*`. `accesscontrolallowcredentials` is sent as `true` or `false`, and `accesscontrolmaxage` as a number of seconds, falling back to `300` when the value does not parse. Keep comments on their own line: everything after the `=` is the value, so a trailing `# note` would be sent as part of the header.

**For production:** Replace `*` with the one origin that needs access.

## Authentication and access control

### Password policy
The `password.*` keys in `conf/mirth.properties` all ship at `0`, which turns each check off. [User Management](./user_management.md#password-policy) lists every key and what each one controls.

### Account lockout
Configure automatic lockout after failed login attempts:
- `password.retrylimit` - Consecutive failed logins allowed before the account locks; `0` disables lockout
- `password.lockoutperiod` - Hours the account stays locked, counted from the last failed login; `0` means the account never locks, whatever `password.retrylimit` says

### Multi-factor authentication
OIE supports extensible authentication through the `MultiFactorAuthenticationPlugin` abstract class, which implements the `ServicePlugin` interface. After primary authentication succeeds, a registered MFA plugin can trigger secondary authentication via a client-side plugin.

### Role-based access control (RBAC)
The engine has no role model. `DefaultAuthorizationController.isUserAuthorized` returns `true` for every user and operation, so every account can do everything the API allows. The [Role Based Access Control](https://openintegrationengine.org/plugins/) community extension adds roles and per-channel grants.

## Encryption

### Data at rest
- With `encryption.properties = 1` in `conf/mirth.properties` (the key is not in the shipped file and defaults to off), the server encrypts `database.password` and `database-readonly.password` with the keystore's secret key at the next start and writes them back to `mirth.properties` with an `{enc}` prefix; the keystore holds the key, not the credential
- The `EncryptionUtil` scripting class encrypts and decrypts strings and byte arrays with the server's encryptor, which is keyed from the keystore and uses `AES/CBC/PKCS5Padding` by default
- Attachments can be stored encrypted

### Data in transit
- All Administrator-to-server communication uses TLS
- Connector-level encryption via TLS for supported protocols

### Keystore
The JCEKS keystore holds two entries:
- The HTTPS listener's certificate and private key, alias `mirthconnect`
- The secret key of the server's encryptor, alias `encryption`

No credential is stored in it.

## Reporting security vulnerabilities

Report security vulnerabilities to: **security@openintegrationengine.org**

See [SECURITY.md](https://github.com/OpenIntegrationEngine/engine/blob/main/SECURITY.md) for the full security policy.
