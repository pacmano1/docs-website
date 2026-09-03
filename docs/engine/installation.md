---
title: Installing Open Integration Engine
description: System requirements, choosing an installer, and installing on Windows, macOS and Linux
---

# Installation

Open Integration Engine™️, also called OIE™️ in this documentation, installs from a native
installer on Windows, macOS and Linux.

## System requirements

The OIE Server operates as a completely self-contained application and does not depend on any external application server.

### Java requirements

The Open Integration Engine requires Java 17+ to work. The server starts with a 256 MB heap, set in `conf/base_includes.vmoptions`. See [JVM options](./server_configuration.md#jvm-options) for raising it.

### Database requirements

OIE uses an embedded Apache Derby database by default, which allows you to store configuration and messages, for the purpose of rapid deployment, development and testing.

For production deployments, it is recommended to use only database versions currently receiving official security and maintenance support from their respective vendors. The following database engines are supported as backends:

* PostgreSQL
* MySQL / MariaDB
* Oracle
* SQL Server

These requirements govern only the database the server itself stores configuration and messages in. Channels can read from and write to any JDBC-accessible database, whatever its type or version. See [Database Support](./database_support.md) for changing the backing database and [Connector Reference](./connector_reference.md#database-jdbc) for the channel-side drivers.

## Download and installation

Every release publishes native installers for Windows, macOS and Linux on the [releases page](https://github.com/OpenIntegrationEngine/engine/releases/latest), plus `.tar.gz` and `.zip` archives for Linux and Windows. The installer is the quickest way to get started: it installs the application, registers OIE as a native service, and sets it to start on boot. If you would rather do it by hand, see [Installing from an archive](#installing-from-an-archive).

### Choosing an installer

Each platform ships in two flavors.

**With JRE** bundles Azul Zulu 17, so nothing else needs installing and the runtime the server uses is known and fixed. Take this one unless you have a reason not to.

**Without JRE** is smaller and runs on whatever Java 17 or newer is already on the machine. Choose it when Java is managed centrally or already hardened to a standard you have to meet.

The bundled flavor is between about 55MB and 280MB larger depending on platform, which is the only difference between the two.

Pick the build that matches your architecture: `aarch` for Apple silicon and `x86` for Intel Macs, `x64` or `arm64` on Windows. Each release also publishes `sha256sums` and `md5sums`.

### Installing

Open the file you downloaded:

* **Windows**: run the `.exe`.
* **macOS**: mount the `.dmg` and launch the installer inside it.
* **Linux**: make the `.sh` executable with `chmod +x`, then run it.

Then follow the wizard: accept the Mozilla Public License 2.0, choose an installation directory, and click `Finish`. The installer requires administrative rights, because registering a system service does.

On a headless machine the installer detects that no display is available and runs as a console installer instead. No flag is required, so the same file works on a server and on a desktop.

::: warning Your operating system will warn about the installer
Windows and macOS check downloaded programs for a code signature. That is a stamp the publisher puts on a file, so the operating system can confirm where it came from and that nobody has changed it. The OIE installer does not have one, so you will see a security warning.

On Windows the warning comes from SmartScreen, and often from the browser as well. On macOS, Gatekeeper blocks the `.dmg` the first time you open it. Allow it under System Settings, Privacy & Security. The wording varies by version.

The jars inside are signed. The Administrator client and the bundled extensions carry a signature from a certificate authority with a trusted timestamp. Only the installer that wraps them is missing one.

Check your download against the published `sha256sums` and continue.
:::

::: warning Install directory and sudo
Installing into a directory you do not own, such as the default `/Applications/OpenIntegrationEngine` on macOS, means anything you later run by hand needs `sudo`.
:::

### Installing from an archive

The release also publishes `oie_unix_<version>.tar.gz` and `oie_windows-<arch>_<version>.zip` for a manual install. Unpack the archive wherever you want it and run `oieserver` from the extracted directory.

Nothing is registered with the service manager and nothing starts on boot, so you have to wire it into systemd, launchd or the Windows service manager yourself. Take this route when you want that control, or when you cannot give an installer administrative rights.

## Directory layout

After installation the directory contains:

```
OIE_HOME/
├── appdata/                # Application data
│   ├── mirthdb/            # Embedded Derby database, when Derby is in use
│   ├── keystore.jks        # TLS keystore
│   ├── extension.properties        # Installed extension state
│   ├── server.id           # Unique server identifier
│   └── configuration.properties    # Configuration map, created at runtime
├── cli-lib/                # CLI libraries
├── client-lib/             # Administrator client libraries
├── conf/                   # Configuration files
│   ├── mirth.properties            # Main server configuration
│   ├── dbdrivers.xml               # Database driver definitions
│   ├── log4j2.properties           # Logging configuration
│   ├── mirth-cli-config.properties # CLI defaults
│   ├── base_includes.vmoptions     # Base JVM options, do not modify
│   ├── custom.vmoptions            # Your JVM options
│   └── default_modules.vmoptions   # Java module system options
├── custom-lib/             # User-provided libraries, disabled by default
├── docs/                   # Licenses and the user API javadocs
├── extensions/             # Connectors and plugins
├── logs/                   # Server log files
├── public_html/            # Web server root
├── public_api_html/        # REST API documentation
├── server-launcher-lib/    # Launcher support libraries
├── server-lib/             # Server libraries
├── webapps/                # Web applications
├── mirth-server-launcher.jar   # Server launcher JAR
├── mirth-cli-launcher.jar      # CLI launcher JAR
├── oiecommand              # CLI launcher
├── oieserver               # Server launcher, foreground
├── oieserver.ps1           # Server launcher script, Windows PowerShell
├── oieservice              # Service launcher, registered with the OS
├── oieserver.vmoptions     # JVM options for the foreground launcher
└── oieservice.vmoptions    # JVM options for the service
```

Runtime-created directories such as `appdata/` are kept when the installer runs over an existing installation. See [Upgrade Guide](./upgrade_guide.md) before doing that on a server you care about.

## Next steps

* [Server Process Management](./server_process_management.md) to start it.
* [Accessing the Administrator](./accessing_the_administrator.md) to log in.
* [Database Support](./database_support.md) to move off Derby before production.
