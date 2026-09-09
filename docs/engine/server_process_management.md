---
title: Server Process Management
description: Starting, stopping and checking the OIE service on Windows, Linux and macOS, and running the server in the foreground
---

# Server Process Management

The installer registers OIE as a native service and sets it to start on boot. After a fresh install, check whether it is running and start it by hand if it is not.

::: warning The service runs as a privileged account
No dedicated service account is created. The service runs as root on Linux and macOS, and as the local system account on Windows.

Channel scripts execute arbitrary code inside the server JVM and inherit whatever privileges the service holds. That is fine for evaluation and development. A production host should run the engine under an unprivileged account with only the access it needs.

See [Security posture and hardening](./security_posture_and_hardening.md) for the service account and file permissions.
:::

On Windows the service appears in the Services manager (`services.msc`) as **Open Integration Engine Service**. Start it, stop it, or switch it between automatic and manual startup there, like any other Windows service. On Linux and macOS it is managed from a terminal.

From a command line:

::: code-group
```powershell [Windows]
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
sudo launchctl list | grep com.oie.oieservice     # is it loaded, and running?
sudo launchctl kickstart system/com.oie.oieservice      # start it
sudo launchctl kickstart -k system/com.oie.oieservice   # restart it
sudo launchctl bootout system/com.oie.oieservice        # stop it and unload it
sudo launchctl bootstrap system /Library/LaunchDaemons/com.oie.oieservice.plist   # load and start it again after bootout
```
:::

Starting and stopping the service needs elevation everywhere: an administrator PowerShell on Windows, `sudo` on Linux and macOS. On macOS, `launchctl list` prints the PID in its first column, and `-` there means the daemon is loaded but not running. Plain `kickstart` starts a loaded daemon that is not running, and `kickstart -k` restarts one that is. `bootout` stops the daemon and unloads it, so it stays stopped until the next reboot or until `bootstrap` reloads it. `kickstart` cannot start a daemon that has been booted out. The installer writes the daemon definition to `/Library/LaunchDaemons/com.oie.oieservice.plist` with `RunAtLoad` set, so loading it also starts it.

## Starting it in the foreground

`oieserver` runs the server in the foreground, streaming the log to your terminal. It also keeps writing `logs/mirth.log`. Use it for a first look, for development, and for debugging a server that will not start. In production the service does this job. Windows ships two foreground launchers that start the same server. Open a command prompt for `oieserver.exe`, or a PowerShell prompt for `oieserver.ps1`. A command prompt cannot run the PowerShell script.

::: code-group
```bash [Linux/macOS]
cd <installation directory>
sudo ./oieserver
```
```bat [Windows command prompt]
cd <installation directory>
oieserver.exe
```
```powershell [Windows PowerShell]
cd <installation directory>
.\oieserver.ps1
```
:::

Stop the service first. Otherwise both processes compete for ports 8080 and 8443.

On first launch the server initializes the database. When it starts correctly you will see output similar to this. Version numbers, build dates and addresses will differ:

```log
INFO  2026-09-04 09:39:11.168 [Main Server Thread] com.mirth.connect.server.Mirth: Open Integration Engine 4.6.0 (Built on July 9, 2026) server successfully started.
INFO  2026-09-04 09:39:11.169 [Main Server Thread] com.mirth.connect.server.Mirth: This product was developed by NextGen Healthcare (https://www.nextgen.com) and its contributors (c)2005-2024.
INFO  2026-09-04 09:39:11.169 [Main Server Thread] com.mirth.connect.server.Mirth: Open Integration Engine contributors (c)2025.
INFO  2026-09-04 09:39:11.169 [Main Server Thread] com.mirth.connect.server.Mirth: Running OpenJDK 64-Bit Server VM 17.0.17 on Mac OS X (26.6.2, aarch64), derby, with charset UTF-8.
INFO  2026-09-04 09:39:11.174 [Main Server Thread] com.mirth.connect.server.Mirth: Web server running at http://192.168.1.20:8080/ and https://192.168.1.20:8443/
```

::: tip
Note these URLs, as you will need them later.
:::

When the server is up, see [Accessing the Administrator](./accessing_the_administrator.md).

The launcher finds a Java runtime by checking, in order, the `OIE_JAVA_PATH` environment variable, a `-java-cmd` line in `oieserver.vmoptions` or a file it includes, `JAVA_HOME`, and finally `java` on the `PATH`. It takes the first entry that resolves to Java 17 or higher, except that a bad `OIE_JAVA_PATH` stops the launcher rather than falling through.
