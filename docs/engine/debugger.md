---
title: Debugger
description: Step-through debugging of channels
---

# Debugger

The OIE Debugger allows you to step through channel JavaScript execution interactively, inspecting variable state at each point in your scripts.

## Overview

The Debugger is built on the Rhino JavaScript engine's debugging API. When a channel is deployed in debug mode, a standalone debugger window opens where you can:

- Set line-level breakpoints in JavaScript source
- Step through execution one line at a time
- Inspect `this` and local scope variables at each breakpoint
- Evaluate expressions and set watches
- Control execution flow (break, resume, step into/over/out)

## Deploying in debug mode

1. Select the channel in the **Channels** view or open it in the channel editor
2. Click **Debug Channel** in the channel tasks panel
3. A **Debug Channel** dialog appears with checkboxes to select which scripts to debug:
   - Deploy/Undeploy/Preprocessor/Postprocessor scripts
   - Attachment/Batch scripts
   - Source connector scripts
   - Source filter/transformer
   - Destination filter/transformer
   - Destination connector scripts
   - Destination response transformer
4. Select the desired script types and click **OK**
5. The channel deploys and the debugger window opens

::: info
Debug mode affects performance. Only use it during development, not in production.
:::

## Debugger window

The Debugger opens as a separate Rhino JavaScript Debugger window with two main areas: source windows for viewing code, and a context panel for inspecting variables.

### Source windows
- Display the JavaScript source for the scripts being debugged
- A yellow arrow in the gutter indicates the currently executing line
- Line numbers and breakpoint markers appear in the left gutter

### Debug controls

| Control | Shortcut | Action |
|---|---|---|
| **Break** | Pause | Pause execution at the current point |
| **Go** | F5 | Resume execution until the next breakpoint |
| **Step Into** | F11 | Step into the current function call |
| **Step Over** | F7 | Execute the current line without entering sub-functions |
| **Step Out** | F8 | Execute until the current function returns |

### Context panel
The context panel has a **Context** dropdown to select the current stack frame, and two sets of tabs:

**Variable tabs:**
- **this**. Displays properties of the current `this` object in a tree table
- **Locals**. Displays local variables in the current scope

**Evaluation tabs:**
- **Watch**. Shows watched expressions and their values
- **Evaluate**. A text area where you can type and execute JavaScript expressions during a breakpoint

## Debugger menus

### File menu
- **Open**. Open a JavaScript source file
- **Run**. Load and run a JavaScript file
- **Exit**. Close the debugger

### Edit menu
- **Cut**, **Copy**, **Paste**. Standard clipboard operations
- **Go to function**. Jump to a function definition
- **Go to line**. Jump to a specific line number (Ctrl+L)

### Debug menu
- **Break**, **Go**, **Step Into**, **Step Over**, **Step Out**. Execution control
- **Break on Exceptions**. Pause when an exception is thrown
- **Break on Function Enter**. Pause at each function entry
- **Break on Function Return**. Pause at each function return

### Window menu
- **Cascade**. Cascade open source windows
- **Tile**. Tile open source windows
- **Console**. Show the console window
- Lists open source file windows for quick navigation

## Setting breakpoints

1. In a source window, click in the left gutter next to a line number
2. A breakpoint indicator appears on that line
3. When execution reaches that line, the debugger pauses
4. Inspect variables in the context panel and use step controls to continue

You can also use the right-click context menu in source windows to set or clear breakpoints.

