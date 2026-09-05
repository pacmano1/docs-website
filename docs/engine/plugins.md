# OIE Plugin Guide

Plugins extend the functionality of Open Integration Engine (OIE), allowing you to add custom features, connectors, and capabilities. This guide covers everything you need to know about installing, managing, and troubleshooting plugins.  Resources are provided for developing custom plugins.

## Overview

Open Integration Engine supports a plugin architecture that enables:

- Custom connectors and protocols
- Extended transformers and filters
- Additional data types and formats
- Custom UI components in the Administrator

## Accessing the extensions/plugins section

To manage plugins in Open Integration Engine:

1. Launch and login to the **OIE Administrator Client**
2. Select **Extensions** from the **Engine** sidebar menu
3. You will see a list of all installed plugins along with their status and other details.

This screen installs, enables, disables and uninstalls extensions. It is not where an
extension is configured. A plugin that ships a settings panel adds its own tab under
**Engine** > **Settings**, named by the plugin, and that is where its configuration lives.

That list is also the answer to "what does OIE already do out of the box." Most of
what looks like core functionality is an extension loaded the same way a third-party
plugin is: the connectors, the data types, the filter and transformer steps, the
attachment viewers, and MLLP framing all ship as extensions and all appear here. You
rarely need to think about that, since each is documented as the feature it provides
rather than as the extension that carries it. It is worth knowing once, because it is
why a new connector from a plugin behaves exactly like a bundled one.

Community extensions are cataloged at [openintegrationengine.org/plugins](https://openintegrationengine.org/plugins/).

## Installing plugins

### Installing via the Administrator UI

The easiest way to install a plugin is through the Administrator interface:

1. Download the plugin `.zip` file from a trusted source
2. Launch and login to the **OIE Administrator Client**
3. Select **Extensions** from the **Engine** sidebar menu
4. Click the **Browse** button
5. Locate and select the plugin `.zip` file
6. Click **Open**
7. Click **Install**
8. **Restart** the OIE Server for the plugin to take effect

::: info
Always restart the OIE Server after installing or uninstalling plugins to ensure changes take effect.
:::

### Manual installation

For environments where UI-based installation is not feasible, you can install plugins manually:

1. Stop the OIE Server
2. Extract the plugin `.zip` file
3. Copy the extracted plugin folder to the `extensions/` directory in your OIE installation. In these samples `/opt/oie` and `C:\Program Files\OIE` stand for wherever OIE is installed:
   ::: code-group
   ```bash [Linux/macOS]
   cp -r my-plugin /opt/oie/extensions/
   ```
   ```powershell [Windows]
   Copy-Item -Recurse my-plugin "C:\Program Files\OIE\extensions\"
   ```
   :::
4. **(Linux/macOS only)** Ensure proper file permissions so the OIE process can read the plugin files. The plugin files should be owned by the same user that runs OIE:
   ::: code-group
   ```bash [Linux/macOS]
   # Replace 'oie' with the user account that runs the OIE Server
   chown -R oie:oie /opt/oie/extensions/my-plugin
   ```
   :::
   ::: tip
   OIE does not create a dedicated system user during installation. It runs as the user who starts the service. Check which user owns your OIE installation directory or runs the OIE process.
   :::
5. Start the OIE Server

### Installing in the OIE Docker container

When running OIE in a Docker container, you have several options for installing plugins:

#### Example 1: Docker CLI with `custom-extensions` volume mount

Mount a host directory containing plugin zip files to the container's `custom-extensions` directory. The container's entrypoint script will unzip and install them to the `extensions` directory prior to launching the server. Port 8443 is the one the Administrator connects on:

```bash
docker run -d \
  -p 8443:8443 \
  -v /path/to/local/custom-extensions:/opt/engine/custom-extensions \
  openintegrationengine/engine:latest
```

Before it starts the server, the entrypoint prints `Found N custom extensions.`, with N the number of zip files, but only when it found at least one. If `docker logs` on the container shows no such line, the mounted directory held no `.zip` files.

#### Example 2: Custom Dockerfile with manual installation

Extract the plugin `.zip` file on the build host and copy the folder into the image's `extensions/` directory. The base image runs as the `engine` user and owns everything under `/opt/engine`, so the copied files are given to the same user:

::: code-group
```dockerfile [Dockerfile]
FROM openintegrationengine/engine:latest

COPY --chown=engine:engine my-plugin/ /opt/engine/extensions/my-plugin/
```
:::

Build and run:

```bash
docker build -t oie-with-plugins .
docker run -d -p 8443:8443 oie-with-plugins
```

#### Example 3: Docker Compose with `EXTENSIONS_DOWNLOAD` URL

The container supports downloading a bundle of extensions from a remote web server and installing them prior to launching the server. The bundle file is a zip file that contains one or more extension zip files to be installed. The extension zips must sit at the top level of the bundle; the entrypoint only unzips `*.zip` files directly inside the extracted bundle, and zips nested in a folder are ignored:

::: code-group
```yaml [compose.yaml]
services:
  oie:
    image: openintegrationengine/engine:latest
    environment:
      - EXTENSIONS_DOWNLOAD=https://my-bucket.s3.us-east-1.amazonaws.com/my-oie-extensions-bundle.zip
    ports:
      - "8080:8080"
      - "8443:8443"
```
:::

A failed download is not fatal. The entrypoint prints `problem with extensions download` and starts the server with no extensions installed, so check `docker logs` for that line when the extensions are missing.

## Uninstalling plugins

### Via the Administrator UI

1. Select **Extensions** from the **Engine** sidebar menu
2. Select the extension you want to remove in the **Installed Connectors** or **Installed Plugins** table
3. Select **Uninstall Extension** from the **Extension Tasks** menu
4. Confirm the uninstallation when prompted
5. **Restart** the OIE Server

### Manual uninstallation

1. Stop the OIE Server
2. Navigate to the `extensions/` directory
3. Remove the plugin folder:
   ::: code-group
   ```bash [Linux/macOS]
   rm -rf /opt/oie/extensions/my-plugin
   ```
   ```powershell [Windows]
   Remove-Item -Recurse -Force "C:\Program Files\OIE\extensions\my-plugin"
   ```
   :::
4. Start the OIE Server

Deleting the folder removes the code only. **Uninstall Extension** in the Administrator also queues removal of the extension's saved properties and any database uninstall statements the plugin supplies, and the server applies both at the next start.

## Enabling and disabling plugins

You can temporarily disable plugins without uninstalling them:

### To disable a plugin

1. Select **Extensions** from the **Engine** sidebar menu
2. Select the extension in the **Installed Connectors** or **Installed Plugins** table
3. Select **Disable Extension** from the **Extension Tasks** menu
4. **Restart** the OIE Server

### To enable a plugin

1. Select **Extensions** from the **Engine** sidebar menu
2. Select the disabled extension in the **Installed Connectors** or **Installed Plugins** table
3. Select **Enable Extension** from the **Extension Tasks** menu
4. **Restart** the OIE Server

::: tip
Disabling plugins is useful for troubleshooting. If you suspect a plugin is causing issues, disable it and restart the server to confirm.
:::

## Plugin compatibility and version requirements

### Checking compatibility

Before installing a plugin, verify:

1. **OIE Version**: Check the plugin documentation for supported OIE versions
2. **Java Version**: Some plugins may require specific Java versions
3. **Dependencies**: Review any additional dependencies the plugin requires

::: info
A plugin declares the server versions it supports as a comma-separated list of exact versions. A version range is not supported.
:::

## Troubleshooting common issues

### Plugin not appearing after installation

**Possible causes and solutions:**

1. **Server not restarted**: Restart the OIE Server after installation
2. **Incorrect directory**: Verify the plugin is in the correct `extensions/` folder
3. **File permissions**: Ensure the OIE process has read access to the plugin files
4. **Corrupted archive**: Re-download and reinstall the plugin

### Plugin causing server startup failures

If the server fails to start after installing a plugin:

1. Check the server log in `logs/mirth.log` for error messages
2. Try starting the server with the plugin disabled:
   ::: code-group
   ```bash [Linux/macOS]
   # Move the plugin out of extensions; the server loads only folders inside it
   mv /opt/oie/extensions/problem-plugin /opt/oie/
   ```
   ```powershell [Windows]
   # Move the plugin out of extensions; the server loads only folders inside it
   Move-Item "C:\Program Files\OIE\extensions\problem-plugin" "C:\Program Files\OIE\"
   ```
   :::
3. If the server starts successfully, the plugin is likely incompatible

### Plugin features not working

1. Verify the extension shows **Enabled** in the **Status** column under **Engine** > **Extensions**
2. Review server logs for runtime errors
3. Check `logs/mirth.log` for `could not locate library`, which the server logs at startup for each library the plugin declares but does not ship

### Common error messages

| Error | Cause | Solution |
|-------|-------|----------|
| `ClassNotFoundException` | A library the plugin declares in its metadata is missing from its folder | Look for `could not locate library` in `logs/mirth.log` and restore the file it names |
| `NoSuchMethodError` | Version mismatch | Use compatible plugin version |

## Developing extensions

### Extension directory structure

Each extension lives in its own subdirectory under `OIE_HOME/extensions/`. Connectors
describe themselves with `source.xml`, `destination.xml`, or both, depending on which
sides they provide, while plugins and data types use `plugin.xml`.

```text
extensions/
├── http/                         # Connector example
│   ├── http-server.jar           # Server-side classes
│   ├── http-client.jar           # Client-side classes (downloaded to the Administrator)
│   ├── http-shared.jar           # Shared classes (loaded on both sides)
│   ├── source.xml                # Source connector metadata
│   └── destination.xml           # Destination connector metadata
└── datapruner/                   # Plugin example
    ├── datapruner-server.jar
    ├── datapruner-client.jar
    ├── datapruner-shared.jar
    └── plugin.xml                # Plugin metadata descriptor
```

Some extensions also carry a `lib/` subdirectory for third-party dependencies.
Client-only extensions, such as the Mapper and Rule Builder steps, ship no server jar
at all.

### Extension metadata

A metadata descriptor declares:

- Extension name, author, and version
- Server-side and client-side class names
- Library JAR paths and their type (server, client, or shared)
- API provider classes, meaning servlet interfaces and their implementations

### Server-side extension points

| Extension Type | Class/Interface |
|---|---|
| **Server Plugin** | `ServerPlugin` (interface) |
| **Service Plugin** | `ServicePlugin` (interface, extends ServerPlugin) |
| **Channel Plugin** | `ChannelPlugin` (interface, extends ServerPlugin) |
| **Data Type** | `DataTypeServerPlugin` (abstract class) |
| **Resource Plugin** | `ResourcePlugin` (interface, extends ServerPlugin) |
| **Library Plugin** | `LibraryPlugin` (interface, extends ResourcePlugin) |
| **Authorization Plugin** | `AuthorizationPlugin` (interface, extends ServerPlugin) |
| **Transmission Mode** | `TransmissionModeProvider` (abstract class, implements ServerPlugin) |
| **Code Template Plugin** | `CodeTemplateServerPlugin` (interface, extends ServerPlugin) |
| **Multi-Factor Auth Plugin** | `MultiFactorAuthenticationPlugin` (abstract class, implements ServicePlugin) |

All ten live in `com.mirth.connect.plugins`.

### Building an extension

1. Produce the server-side, client-side, or shared JARs the extension needs
2. Write the metadata descriptor (`plugin.xml`, or `source.xml` and `destination.xml` for connectors)
3. Package it into the extension directory layout
4. Test against a running OIE instance

Extensions are discovered at runtime, so one install serves both the
[Desktop Administrator](./desktop_administrator.md) and the
[Web Administrator](./web_administrator.md) with no separate web build. To add a
browser interface, the server half stays as it is and you write only the web UI
against the REST endpoints the extension already exposes. The web extension points
and manifest format are documented in
[PLUGINS.md](https://github.com/gibson9583/oie-web-client/blob/main/web-administrator/PLUGINS.md)
in the web client repository.

### Key resources

- **Plugin Author's Guide**: [mirth-plugin-guide](https://github.com/kpalang/mirth-plugin-guide) - Comprehensive guide for plugin development on OIE, Mirth Connect (Open Source Versions) and BridgeLink.
- **Sample Plugin**: [mirth-sample-plugin](https://github.com/kpalang/mirth-sample-plugin) - A working example plugin to use as a template for OIE, Mirth Connect (Open Source Versions) and BridgeLink.

## See also

- [Contributing to Open Integration Engine](./contributing.md)
- [OIE Docker Hub](https://hub.docker.com/u/openintegrationengine)
- [OIE GitHub Repository](https://github.com/OpenIntegrationEngine/engine)
