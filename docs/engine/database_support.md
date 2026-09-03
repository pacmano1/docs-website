---
title: Database Support
description: Supported databases and configuration
---

# Database Support

OIE ships with an embedded Apache Derby database by default. Derby works for trying things out, but you should switch to an external database for any production use.

## Supported databases

- **Apache Derby** (embedded, default)
- **PostgreSQL**
- **MySQL**
- **Oracle**
- **SQL Server** (via jTDS or Microsoft driver)

## Changing the database

Database settings live in `conf/mirth.properties`. The key properties are:

- `database` - The database type (`derby`, `postgres`, `mysql`, `oracle`, `sqlserver`)
- `database.url` - JDBC connection URL
- `database.username` / `database.password` - Credentials (not needed for Derby)
- `database.driver` - Override the default JDBC driver class if needed

The properties file contains commented-out examples for each supported database. Uncomment and edit the ones you need.

## Connection pool settings

The properties file also includes settings for connection pool sizing:

- `database.max-connections` - Max connections for read/write operations (default: 20)
- `database-readonly.max-connections` - Max connections for read-only operations (default: 20)

Read-write splitting is enabled by default (`database.enable-read-write-split = true`), which separates read-only queries onto their own connection pool. By default the read-only pool uses the same connection information as the main pool, but you can point it at a different host (e.g., a read replica) using the `database-readonly.*` properties.

## Startup retry

If the database is unavailable when the server starts, OIE can retry the connection. This is controlled by:

- `database.connection.maxretry` - Number of retry attempts (default: 2)
- `database.connection.retrywaitinmilliseconds` - Wait between retries in ms (default: 10000)

## Database drivers for connectors

The file `conf/dbdrivers.xml` defines the database drivers available in the **Database Reader** and **Database Writer** connectors. These are separate from the server's own database connection. They control which databases your channels can connect to.

## Schema and migration

OIE creates and updates its database schema automatically on startup. After an upgrade, check **Settings > Database Tasks** in the Administrator for optional cleanup tasks such as removing old tables from prior versions or adding missing indexes.
