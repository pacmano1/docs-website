---
title: Desktop Administrator
description: Using the desktop Administrator client
---

# Desktop Administrator

The Administrator is a Java-based desktop application for managing and configuring your OIE server. It provides a graphical interface for building channels, monitoring message traffic, managing users, and adjusting server settings.

::: info
As of 4.6.0 this is no longer the only graphical option. The [Web Administrator](./web_administrator.md) does the same job in a browser, and both can be pointed at the same engine at the same time.
:::

Starting the client and logging in are covered in [Accessing the Administrator](./accessing_the_administrator.md). It connects to the server over HTTPS on port `8443` by default.

## Interface layout

The Administrator window is divided into several key regions:

| Area | Description |
|---|---|
| **Title Bar** | Displays the server name and OIE version |
| **View Title** | Shows the name of the active view (e.g. "Dashboard") |
| **Main Navigation** | A list of top-level views on the left side: Dashboard, Channels, Users, Settings, Alerts, Events, Extensions. The highlighted item indicates which view is currently active. |
| **Context Tasks** | Action buttons below the navigation that change depending on the current view (e.g. Deploy, Start, Stop when on the Dashboard) |
| **Other Tasks** | A fixed set of utility links available from every view: Notifications, View User API, View Client API, Help, About, Logout |
| **Content Area** | The main panel on the right side where the selected view is displayed |
| **Status Bar** | Shows the server connection URL, logged-in user, and server time with timezone at the bottom of the window |
| **Progress Bar** | Indicates background task progress in the bottom-right corner |

## Working with tables

Many screens in the Administrator display data in configurable tables. The following interactions are available across most table views:

- **Rearrange columns**. Drag a column header to a new position. Adjacent columns shift automatically.
- **Show or hide columns**. Right-click the header row and toggle column visibility, or use the table control icon in the top-right corner of the table.
- **Sort data**. Click a column header to sort ascending; click again for descending. Not all tables support sorting.
- **Expand or collapse rows**. Click the plus/minus icon next to a row, or right-click the header and choose Expand All / Collapse All.
- **Select multiple rows**. Hold Shift and click for a contiguous range. Hold Ctrl (or Cmd on macOS) and click for individual non-contiguous rows.
- **Search within the table**. Press Ctrl+F (or Cmd+F) to open a find dialog that locates and highlights matching rows.
- **Delete a row**. Select the row and press the Delete key (where the table supports deletion).

## Key views

### Dashboard

The first screen you see after logging in. It shows all deployed channels with their current state, message counts, and connection activity. From here you can start, stop, pause, and undeploy channels.

See [Dashboard and Monitoring](./dashboard_and_monitoring.md) for full details.

### Channels

The main management screen for every channel configured on the server. You can create, delete, import, export, clone, enable, disable, and deploy channels. Channels are organized into groups, and you can filter by name or tag.

### Users

Displays all user accounts that can access the server, whether through the Administrator, the CLI, or the REST API. You can add, edit, and remove users from this view.

See [User Management](./user_management.md) for full details.

### Settings

A tabbed configuration area covering server-wide options:

| Tab | Purpose |
|---|---|
| **Server** | Server name, usage statistics preference, default queue buffer size, default metadata columns, and SMTP email configuration |
| **Administrator** | UI preferences such as dashboard refresh interval and confirmation dialog behavior |
| **Tags** | Create and manage channel tags |
| **Configuration Map** | Key-value pairs accessible from channel scripts at runtime |
| **Database Tasks** | View and manage pending or completed database migration tasks |
| **Resources** | Custom class-path library resources available to channels |
| **Data Pruner** | Global settings for automatic message pruning |

### Alerts

Lists all configured alerts with their enabled/disabled status and the number of times each has fired. From here you can create, edit, import, export, enable, and disable alerts.

See [Alerts and Notifications](./alerts_and_notifications.md) for full details.

### Events

A searchable log of user actions and system events: logins, channel deployments, configuration changes, server startup/shutdown, data pruner activity, and more. Events can be filtered by date, severity level, user, outcome, and other criteria, and exported to CSV.

### Extensions

Shows all installed plugins and connectors with their status, author, and version. You can enable or disable individual extensions from this view.

## Channel Editor

Opening a channel for editing brings up a multi-tabbed workspace:

| Tab | Purpose |
|---|---|
| **Summary** | Channel name, description, data types, initial state, storage and pruning settings, tags, dependencies, and custom metadata columns |
| **Source** | Source connector type and its settings |
| **Destinations** | One or more destination connectors, each with their own filter and transformer configuration |
| **Scripts** | Channel-level scripts: Deploy, Undeploy, Preprocessor, and Postprocessor |

### Transformer and filter editors

Within the Source and Destinations tabs, you can open dedicated editors for building filters and transformers:

- **Filter Editor**. Define rules (Rule Builder, JavaScript, External Script) connected by AND/OR operators. Messages matching the criteria are accepted; others are rejected.
- **Transformer Editor**. Build a sequence of steps (Mapper, Message Builder, JavaScript, External Script, XSLT, Iterator, Destination Set Filter) to reshape message content. The inbound and outbound message trees let you drag fields to auto-generate mapping steps.

See [Filters and Transformers](./filters_and_transformers.md) for full details.

## Message Browser

Select a channel on the Dashboard and choose **View Messages** (or double-click the channel) to open the Message Browser. This view lets you inspect every message that has passed through the channel, including all content snapshots (Raw, Transformed, Encoded, Sent, Response), variable mappings, errors, and attachments.

Key capabilities:
- Search by date range, message status, connector, text content, and custom metadata
- View all content types for any connector message
- Import, export, reprocess, and remove messages
- Inspect error details and stack traces

See [Dashboard and Monitoring](./dashboard_and_monitoring.md) for full details on the Message Browser.

## Other tasks

The bottom-left section of every view provides a set of global utility links:

| Task | Description |
|---|---|
| **Notifications** | Displays OIE release announcements fetched from the project's GitHub repository. New unread items trigger a count badge. |
| **View User API** | Opens the User API (Javadoc) documentation in your browser |
| **View Client API** | Opens the REST API documentation in your browser |
| **Help** | Opens the OIE GitHub discussions in your browser |
| **About** | Shows version, build date, server ID, Java version, and third-party software acknowledgements |
| **Logout** | Ends your session and returns to the login screen |
