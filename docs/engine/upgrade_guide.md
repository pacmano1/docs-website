---
title: Upgrade Guide
description: How to upgrade to a newer version
---

# Upgrade Guide

This guide covers how to upgrade your OIE installation to a newer version.

## Before you upgrade

### 1. Back up everything

Before upgrading, create backups of:

- **Server configuration**: Export via the Administrator (**Settings > Server Tab > Server Tasks > Backup Config**) or via the CLI (`exportcfg "path"`). The server configuration includes channels, code templates, alerts, global scripts, and server properties.

  > **Warning:** The Server Configuration file does **not** include user accounts, events, or message/attachment data. Back those up separately if needed.

- **Database**: If using the embedded Derby database, back up the `appdata/mirthdb` folder. If using an external database (PostgreSQL, MySQL, Oracle, SQL Server), create a backup using your database administration tool.
- **Application data directory** (`appdata/`): Contains keystore, embedded database, and configuration map
- **Configuration files** (`conf/`): Especially `mirth.properties` and any customized files
- **Custom database driver entries**: If you have added entries to `conf/dbdrivers.xml`, back up that file
- **JVM parameters**: If you have modified heap size or other JVM settings, back up all `*.vmoptions` files in the installation directory
- **CLI configuration**: If you have customized `conf/mirth-cli-config.properties`, back up that file
- **Custom libraries** (`custom-lib/`): Any user-provided JARs

### 2. Review release notes

Check the [Releases page](https://github.com/OpenIntegrationEngine/engine/releases) for:
- Breaking changes
- New features
- Deprecated features
- Database migration notes
- Java version requirements

::: info
If you are upgrading through multiple versions (e.g., from 3.x to 4.x), review the release notes for **all** intermediate versions you are skipping. Each version may introduce changes that affect your installation.
:::

### 3. Plan downtime

Upgrading requires stopping the server. Plan a maintenance window during low-traffic periods.

### 4. Test in a non-production environment

If possible, test the upgrade in a staging environment first:
1. Restore your production backup to a test instance
2. Perform the upgrade
3. Verify channels start and process correctly
4. Test critical workflows end-to-end

## Upgrade process

### Using the installer

The platform installer supports in-place upgrades:

1. Exit and stop the **Administrator** and **server service/daemon** before proceeding
2. Run the new version installer, choosing the update option
3. Point it to the existing installation directory
4. The installer preserves your `appdata/`, `conf/`, `custom-lib/`, and other user data
5. Restore any custom changes you made to `*.vmoptions` files and `conf/mirth-cli-config.properties` (the installer may overwrite these with new defaults)
6. Start the server
7. The server automatically runs any required database schema migrations on startup

### Using pre-packaged distributions

For archive-based installations (ZIP/TAR.GZ):

1. Exit and stop the **Administrator** and **server service/daemon**
2. Back up the entire installation directory
3. Extract the new version to a temporary location
4. Copy your existing `conf/mirth.properties` to the new installation
5. Copy your `appdata/` directory to the new installation
6. Copy any `custom-lib/` files
7. Copy any custom extensions from `extensions/`
8. Restore custom changes to `conf/dbdrivers.xml`, `*.vmoptions`, and `conf/mirth-cli-config.properties` as needed
9. Start the server from the new installation directory

### Using Docker

Update the image tag in your Docker configuration:

```bash
docker pull openintegrationengine/engine:<new-version>
```

Ensure your data volumes are preserved across container updates.

## After the upgrade

### 1. Verify server startup

Check the server logs (`logs/mirth.log`) for:
- Successful startup messages
- Database migration completion
- Extension loading
- Any errors or warnings

### 2. Check Database Tasks

Navigate to **Settings > Database Tasks** in the Administrator. Some upgrades create cleanup or optimization tasks for the underlying database. If no tasks appear, the database is up to date.

- These tasks are **not** run automatically. You must select a task row and click **Run Task** in the task panel on the left
- Some tasks require affected channels to be **stopped** before they can execute
- Tasks may take a long time on large databases; monitor progress via the Status column and server logs

### 3. Verify channels

1. Check that all channels are in their expected state (deployed/undeployed)
2. Start channels and verify message processing
3. Check the Message Browser for any errors
4. Test critical interfaces end-to-end

### 4. Verify extensions

Check **Extensions** in the Administrator to ensure all plugins and connectors loaded correctly. Custom extensions may not work after an upgrade; check the server log for errors and install updated versions if needed.

## Rollback plan

If the upgrade fails:

1. Stop the server
2. Restore from your backup:
   - Replace the installation directory with the backup
   - Restore the database from backup (if using an external database) or restore the `appdata/mirthdb` folder (if using embedded Derby)
   - Restore `conf/mirth.properties` and any other customized configuration files
3. Start the old version

You can also restore a server configuration backup via the Administrator (**Settings > Server Tab > Server Tasks > Restore Config**). Note that this overwrites all current channels, alerts, code templates, server properties, global scripts, and plugin properties. A confirmation dialog gives you the option to automatically deploy all channels after the restore.

::: warning
If database migrations have already run, you must restore the database to its pre-upgrade state. You cannot simply run the old version against a migrated database.
:::

## Common upgrade issues

### Java version mismatch
Newer OIE versions may require a newer Java version. Check the release notes for the minimum Java requirement and update Java before upgrading.

### Extension compatibility
Custom or third-party extensions may not be compatible with the new version. Check with extension providers for updated versions.

### Configuration changes
New versions may introduce new configuration properties or change defaults. Compare the new `mirth.properties` template with your existing file and merge any new properties. Also check for changes to `dbdrivers.xml`, `log4j2.properties`, and `*.vmoptions` files.

### Large database migrations
Some version upgrades include significant database schema changes. These migrations can take a long time on large databases. Plan accordingly and monitor the `logs/mirth.log` for progress.

## Version-specific notes

Check the [GitHub Releases](https://github.com/OpenIntegrationEngine/engine/releases) page for version-specific upgrade instructions, known issues, and migration notes.

### Upgrading to 4.6.0

Four changes in 4.6.0 can break a working installation or change behavior silently. Read these before upgrading.

**Java 17 is the minimum.** Older JVMs are no longer supported. Later Java LTS releases should work but are not officially tested, so a server pinned to Java 11 needs its runtime updated first.

**Xerces and xml-apis have been removed.** Custom code that imports `org.apache.xerces.*` directly will fail to load. Migrate those imports to `javax.xml.parsers.*` and `org.xml.sax.*`. This affects code templates, channel scripts, and custom extensions alike, so search your scripts for the old package before you upgrade rather than after.

**Logins are case-insensitive by default.** `admin`, `Admin`, and `ADMIN` now resolve to the same account. Existing accounts that relied on case-sensitive usernames continue to work through a compatibility path, but two accounts differing only in case are worth resolving before the upgrade rather than discovering afterward.

**HTTP parameter map ordering is now preserved.** Previously the order was non-deterministic. Any script that happened to depend on the old ordering, deliberately or not, may behave differently.

Two operational notes:

- Installers remove the prior release as part of the upgrade, preserving the directories that must survive it, including `appdata`, `conf`, `extensions`, and `logs`.
- The release remediates 24 known CVEs (1 critical, 10 high, 12 medium, 1 low) through dependency upgrades, among them log4j, the PostgreSQL JDBC driver, jSch, commons-lang3, and commons-text. That makes it a security upgrade as much as a feature one.

The full release notes, including the complete dependency and CVE list, are published with the [v4.6.0 release](https://github.com/OpenIntegrationEngine/engine/releases/tag/v4.6.0).
