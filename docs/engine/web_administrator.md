---
title: Web Administrator
description: Administering OIE from a browser
---

# Web Administrator

OIE can be administered from a browser. The web administrator is open source under MPL 2.0 and installs as an ordinary extension, so the engine itself needs no modification. It works read/write against the same REST API the desktop Administrator uses.

This is not the Mirth Connect™ "Web Dashboard", which OIE does not have. It is a full administrator, not a status page.

::: info
**Requires OIE 4.6.0.**
:::

## What it replaces

Getting into the desktop Administrator has always taken several steps: install a launcher, supply or accept a Java runtime with JavaFX, let the launcher pull down the client, then log in. The web administrator collapses that to opening a browser and logging in.

Both clients talk to the same engine, so there is no cutover. The desktop Administrator continues to work exactly as before while people move across at whatever pace suits them.

## What it does

The web administrator is read/write across the areas you would expect to use day to day.

| Area | Capability |
|---|---|
| **Channels** | Full channel editing, including source and destination configuration, filters, and transformers, plus deployment |
| **Messages** | Search, browse, reprocess, and resend, with the full message tree for any selected message |
| **Dashboard** | Live channel status, throughput, and deployment state |
| **Extensions** | Installed extensions are listed, and any that ship a web interface are served automatically |
| **Themes** | Light and dark |

Three details are worth calling out because they determine whether what you see in the browser matches what the engine actually does.

**Message serialization runs through the engine's own data type serializers.** The message tree is produced server-side by the same code that builds `msg` and `tmp` at runtime, so the tree matches the runtime representation byte for byte rather than approximating it in the browser.

**JavaScript is validated by the engine's Rhino.** Scripts are compiled by the same engine that will execute them, so a script that validates in the browser is a script that compiles at runtime. Browser-side syntax checking would not give you that.

**Plugin interfaces are served by the engine.** An installed extension that ships a web UI is detected and served without any separate deployment step, the community plugin store included. Plugins follow the engine they are installed on.

The script editor is Monaco, bundled and served locally rather than pulled from a CDN, so it works on air-gapped servers. There is a plain-editor fallback if it cannot load.

## Installation

The web administrator ships as the **Web Support** extension. It installs the administrator into the engine's own embedded Jetty, along with the server-side APIs it needs for message serialization, JavaScript validation, and serving other plugins' web interfaces.

1. In the desktop Administrator, go to **Extensions** and install the Web Support extension
2. Restart the engine
3. Browse to `https://<host>:8443/oie-webadmin/`

It is served on the engine's existing port and behind the same credentials, so there is no second service to secure and no separate user directory.

Node.js and Docker deployments are also available if you would rather run the administrator separately from the engine.

Source and releases: [gibson9583/oie-web-support-plugin](https://github.com/gibson9583/oie-web-support-plugin)

## Plugins in the Web Administrator

The web administrator does not treat its own features as special. Its connectors, data types, transformer steps, attachment viewers, and dashboard tabs are all plugins loaded through the same mechanism your own plugin would use.

A web plugin is a directory containing a manifest and a compiled React entry point, placed in a plugins directory and picked up on the next browser refresh.

If you already maintain an engine extension with a Swing panel, the engine half is unchanged. You write only the web interface, calling the REST endpoints the extension already exposes. Each Swing extension point has a web counterpart:

- Dashboard tabs and dashboard columns
- Settings panels
- Channel tabs and channel tasks
- Transformer steps and filter rules
- Attachment viewers
- Connector panels
- Data types
- Transmission modes
- Resource types
- The authorization controller

Because discovery happens at runtime, one extension install serves both administrators. Nobody maintains a separate web build, and a plugin cannot drift out of step with the engine it is installed on.

Plugin development guide: [PLUGINS.md](https://github.com/gibson9583/oie-web-client/blob/main/web-administrator/PLUGINS.md)

## Related pages

- [Desktop Administrator](./desktop_administrator.md) - the desktop client
- [Extension Catalog](./extension_catalog.md) - the plugin catalog and extension model
- [Dashboard and Monitoring](./dashboard_and_monitoring.md)
- [Security and Compliance](./security_and_compliance.md)
