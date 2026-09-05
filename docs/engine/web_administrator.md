---
title: Web Administrator
description: What the browser-based administrator is, and where its documentation lives
---

# Web Administrator

OIE can be administered from a browser. The web administrator is a full read/write client, not a status page, and it is not the Mirth Connect "Web Dashboard", which OIE does not have.

It installs as an ordinary extension called **Web Support**, so the engine needs no modification, and it is served by the engine's own embedded Jetty on the existing port behind the same credentials. It works against the same REST API as the desktop Administrator, so both can be pointed at one engine at the same time and there is no cutover. Open source under MPL 2.0.

::: info
**Requires OIE 4.6.0.**
:::

To install it, add the Web Support extension as you would any other (see the [Plugin Guide](./plugins.md)), restart the engine, and browse to `https://<host>:8443/oie-webadmin/`.

## Documentation

The web administrator is developed outside the engine repository, and its documentation lives with it rather than here:

[gibson9583/oie-web-client](https://github.com/gibson9583/oie-web-client) holds the administrator itself: what it covers, and standalone Node.js, Docker, and [WAR](https://github.com/gibson9583/oie-web-client/blob/main/WAR-DEPLOYMENT.md) deployment. [gibson9583/oie-web-support-plugin](https://github.com/gibson9583/oie-web-support-plugin) holds the installable extension, its releases, and its installation notes. For writing a web interface for an extension, and the extension points available to it, see [PLUGINS.md](https://github.com/gibson9583/oie-web-client/blob/main/web-administrator/PLUGINS.md).

## Related pages

- [Accessing the Administrator](./accessing_the_administrator.md)
- [Desktop Administrator](./desktop_administrator.md)
- [Plugin Guide](./plugins.md)
