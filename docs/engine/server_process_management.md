---
title: Server Process Management
description: Starting, stopping and checking the OIE service on Windows, Linux and macOS, and running the server in the foreground
---

# Server Process Management

The installer registers OIE as a native service and sets it to start on boot, but it does not start it during installation. After a fresh install, start it once by hand or reboot the machine.

::: warning The service runs as a privileged account
No dedicated service account is created. The service runs as root on Linux and macOS, and as the local system account on Windows.

Channel scripts execute arbitrary code inside the server JVM and inherit whatever privileges the service holds. That is fine for evaluation and development. A production host should run the engine under an unprivileged account with only the access it needs.

A guide to securing an installation, covering the service account, permissions on `conf`, `appdata` and the executable directories, and service definitions, will follow shortly.
:::

On Windows the service appears in the Services manager (`services.msc`) as **Open Integration Engine Service**. Start it, stop it, or switch it between automatic and manual startup there, like any other Windows service. On Linux and macOS it is managed from a terminal.

From a command line:

::: code-group
```powershell [Windows]
# or use the Services manager UI (services.msc), no shell required
Get-Service 'Open Integration Engine Service'      # is it running?
Start-Service 'Open Integration Engine Service'    # start it
Stop-Service 'Open Integration Engine Service'     # stop it
```
```bash [Linux]
sudo systemctl status oieservice   # is it running?
sudo systemctl start oieservice    # start it
sudo systemctl stop oieservice     # stop it
```
```bash [macOS]
sudo launchctl list | grep com.oie.oieservice     # is it running?
sudo launchctl kickstart system/com.oie.oieservice      # start it
sudo launchctl kickstart -k system/com.oie.oieservice   # restart it
```
:::

Starting and stopping the service needs elevation everywhere: an administrator PowerShell on Windows, `sudo` on Linux and macOS. On macOS, plain `kickstart` starts a stopped service and `kickstart -k` restarts one that is already running.

## Starting it in the foreground

`oieserver` runs the server in the foreground, streaming the log to your terminal. It also keeps writing `logs/mirth.log`. Use it for a first look, for development, and for debugging a server that will not start. In production the service does this job.

::: code-group
```bash [Linux/macOS]
cd <installation directory>
sudo ./oieserver
```
```powershell [Windows]
cd <installation directory>
.\oieserver.ps1
```
:::

Stop the service first. Otherwise both processes compete for ports 8080 and 8443.

On first launch the server initializes the database. When it starts correctly you will see output similar to this. Version numbers, paths and addresses will differ:

```log
INFO  2026-01-15 20:07:38.773 [Main Server Thread] com.mirth.connect.server.Mirth: Open Integration Engine server successfully started.
INFO  2026-01-15 20:07:38.776 [Main Server Thread] com.mirth.connect.server.Mirth: This product was developed by NextGen Healthcare (https://www.nextgen.com) and its contributors (c)2005-2024.
INFO  2026-01-15 20:07:38.776 [Main Server Thread] com.mirth.connect.server.Mirth: Open Integration Engine contributors (c)2025.
INFO  2026-01-15 20:07:38.777 [Main Server Thread] com.mirth.connect.server.Mirth: Running OpenJDK 64-Bit Server VM on Mac OS X (15.7.3, aarch64), derby, with charset UTF-8.
INFO  2026-01-15 20:07:38.778 [Main Server Thread] com.mirth.connect.server.Mirth: Web server running at http://192.168.1.X:8080/ and https://192.168.1.X:8443/
```

::: tip
Note these URLs, as you will need them later.
:::

When the server is up, see [Accessing the Administrator](./accessing_the_administrator.md).
