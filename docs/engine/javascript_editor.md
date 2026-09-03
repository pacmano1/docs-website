---
title: JavaScript Editor
description: The built-in code editor features and shortcuts
---

# JavaScript Editor

The JavaScript Editor is the built-in code editor used throughout OIE for writing filter rules, transformer steps, channel scripts, and code templates. It is built on the RSyntaxTextArea library and provides syntax highlighting, auto-completion, and other features to aid development.

## Features

### Syntax highlighting
The editor provides color-coded syntax highlighting for JavaScript, including OIE-specific keywords and variables such as `msg`, `tmp`, `connectorMap`, `channelMap`, `logger`, `FileUtil`, `DateUtil`, and map shorthand functions (`$c`, `$g`, `$s`, `$r`, etc.).

### Auto-completion
Press `Ctrl+Space` to open the auto-completion popup. It provides suggestions for:
- Built-in JavaScript functions and objects
- OIE utility classes and methods (`ChannelUtil`, `DateUtil`, `FileUtil`, `DatabaseConnectionFactory`, `SMTPConnectionFactory`, etc.)
- Variable map methods (`channelMap.put`, `globalMap.get`, etc.)
- Code template functions available in the current context

Auto-completion can also be triggered automatically after typing certain characters (`.` by default). These settings are configurable under Code Editor Preferences.

### Find and replace
`Ctrl+F` opens the Find / Replace dialog:
- **Find text** / **Replace with**: Search and replace fields with history dropdowns
- **Direction**: Forward or Backward
- **Wrap Search**: Search wraps around the end of the file
- **Match Case**: Toggle case sensitivity
- **Regular Expression**: Use regular expressions for search patterns
- **Whole Word**: Match whole words only

### Code folding
Collapse and expand code blocks:
- Click the fold icons in the gutter (left margin)
- Collapse functions, if/else blocks, loops, and other block structures
- Use the Folding submenu in the context menu or keyboard shortcuts to collapse/expand folds

## Context menu

Right-click in the editor to access:

| Option | Description |
|---|---|
| **Undo / Redo** | Undo/redo recent changes |
| **Cut / Copy / Paste / Delete** | Standard clipboard operations |
| **Select All** | Select all code in the editor |
| **Find/Replace** | Open the find/replace dialog |
| **Find Next** | Find the next occurrence |
| **Clear Marked Occurrences** | Clear highlighted search results |
| **Folding** | Submenu: Collapse Fold, Expand Fold, Collapse All Folds, Collapse All Comment Folds, Expand All Folds |
| **Display** | Submenu: Show Tab Lines, Show Whitespace, Show Line Endings, Wrap Lines |
| **Code** | Submenu: Format Code, Toggle Comment |
| **Macro** | Submenu: Begin Macro, End Macro, Playback Macro |
| **View User API** | Open the User API documentation |

## Keyboard shortcuts

Default shortcuts (on Windows/Linux):

| Shortcut | Action |
|---|---|
| `Ctrl+Space` | Open auto-completion popup |
| `Ctrl+F` | Find and Replace |
| `Ctrl+G` | Find Next |
| `Ctrl+Z` | Undo |
| `Ctrl+Y` | Redo |
| `Ctrl+/` | Toggle line comment |
| `Ctrl+Shift+F` | Format code |
| `Ctrl+D` | Delete line |
| `Ctrl+J` | Join lines |
| `Ctrl+[` | Go to matching bracket |
| `Ctrl+A` | Select all |
| `Ctrl+-` | Collapse fold |
| `Ctrl++` | Expand fold |
| `Tab` | Indent selected lines |
| `Shift+Tab` | Unindent selected lines |

All keyboard shortcuts can be remapped under **Settings > Administrator > Code Editor Preferences** using the Shortcut Key Mappings table.

## Reference list

Adjacent to the script editor, the **Reference List** panel provides quick access to categorized functions, code snippets, and variables. Use the **Category** dropdown to filter by category and the **Filter** field to search within the selected category.

### Categories
- **Conversion Functions** - Data format conversion helpers
- **Logging and Alerts** - Logging and alert functions
- **Database Functions** - Database connection and query helpers
- **Utility Functions** - File I/O, routing, attachments, and other utilities
- **Date Functions** - Date formatting and conversion
- **Message Functions** - Message access and manipulation
- **Response Transformer** - Response transformation helpers
- **Map Functions** - Variable map operations
- **Channel Functions** - Channel utility methods
- **Postprocessor Functions** - Postprocessor-specific references
- **User Defined Code** - User-created code templates (code type)
- **User Defined Functions** - User-created code templates (function type)

Click an item to see its description, then drag it into the editor to insert the code.

### Variables
Variables are included in the reference list alongside functions and code snippets. Which variables appear depends on the current script context. Examples include:
- `msg` (inbound message in filter/transformer scripts), `tmp` (outbound template in filter/transformer scripts)
- `connectorMessage` (in connector scripts)
- `message` (completed message object in the postprocessor)
- `response`, `responseStatus`, `responseErrorMessage`, `responseStatusMessage` (in response transformer scripts)
- Map objects: `connectorMap`, `channelMap`, `sourceMap`, `globalChannelMap`, `globalMap`, `configurationMap`, `responseMap`
- `logger`, `router`, `alerts`, `replacer`, `contextFactory`

## Code editor preferences

Configure editor behavior in **Settings > Administrator > Code Editor Preferences**:

| Preference | Description |
|---|---|
| **Auto-Complete Characters** | Characters that trigger the auto-completion popup (default: `.`) |
| **Include Letters** | If enabled, auto-completion triggers after any letter is typed |
| **Activation Delay (ms)** | Time to wait after typing a trigger character before showing the popup (default: 300 ms) |
| **Shortcut Key Mappings** | Table of all remappable editor actions with their current keyboard shortcuts; double-click a shortcut to change it |
| **Restore Defaults** | Reset all shortcut key mappings to their defaults |

