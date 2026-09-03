---
title: Accessing the Administrator
description: Reaching a running OIE server, choosing between the web and desktop administrators, and logging in
---

# Accessing the Administrator

To verify that the OIE server is available, open a browser and enter the URL from the startup output, `https://<host>:8443/`. See [Server Process Management](./server_process_management.md) if it is not up yet.

After accepting the self-signed certificate in your browser, you will see this page:

![Open Integration Engine Server home Page indicating the service is available with launcher target url and button to explore the Client API](images/gs_web_browser_step_1.png)

From here there are two ways to administer the engine: a browser, or the desktop Administrator.

## Web Administrator

[Web Support](https://github.com/gibson9583/oie-web-support-plugin) is a community extension by Chris Gibson that installs a browser-based administrator into the engine's own web server. It works read/write against the same REST API as the desktop client, covering channel editing, deployment, and the message browser. It requires OIE 4.6.0.

Install it as you would any other extension, described in the [plugin guide](./plugins.md), then restart the engine and open `https://<host>:8443/oie-webadmin/`. No launcher is involved. See [Web Administrator](./web_administrator.md) for what it covers.

## Desktop Administrator

The desktop Administrator is a Java application and needs a launcher to start it. Copy the Administrator Launcher URL from the page above, then use one of the launchers below. See [Launchers](/launchers/) for the full list, and [Desktop Administrator](./desktop_administrator.md) for a tour of the client.

### Ballista

[Ballista](https://github.com/kayyagari/ballista/releases) is an open-source Administrator launcher for Open Integration Engine built on Tauri.

### Launcher

[Launcher](https://github.com/diridium-com/launcher/releases) is a fork of Ballista, also built on Tauri and open source under MPL-2.0.

### MCAL

The original Mirth® Connect Administrator Launcher by NextGen Healthcare (MCAL) works with OIE. Here is how you can use it to launch the OIE Administrator client GUI application.

Open MCAL. If it's the first launch, the left panel with connections is empty.

![MCAL application window showing "no saved connections" in left panel](images/gs_mcal_step_1.png)

To work better with OIE, choose `Bundled Java 17`

And just click on `Launch` at the top right screen.

You should see a progress bar that will load the files necessary to launch the Open Integration Engine client.

## Logging in

::: info
On 4.6.0 a new instance starts with:

* login: **admin**
* password: **admin**

A future release replaces this with a password generated on first boot.
:::

Enter your credentials and click `Login` when the login screen appears. After a brief loading screen, you will see the OIE dashboard.

If this is your first login, you are prompted to change the default password.

![Edit User screen requesting username, password, and optional demographic information](images/gs_oie_credential_update_step_1.png)

Fill the information, and don't forget to set the `New Password` (2 times)

And click on `Finish`

![Application ready to use at the Dashboard screen showing no deployed channels and the server startup messages in the log section](images/gs_oie_dashboard.png)

It's finished. Now you can start to use your OIE server.

::: warning Every account is an administrator
All users are administrators by default, with privilege to write and execute channel scripts on the server. Grant access only to users who should be able to author and execute scripts, or install an RBAC plugin to create low-privileged roles.

[Role Based Access Control](https://github.com/diridium-com/role-based-access-control) is a community extension that replaces the default authorization controller with roles and per-channel grants, and it works in both administrators.
:::
