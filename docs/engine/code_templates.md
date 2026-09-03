---
title: Code Templates
description: Reusable code libraries
---

# Code Templates

Code templates are reusable code snippets and function libraries that can be shared across multiple channels. They reduce duplication and centralize common logic.

## Overview

Code templates are organized into **libraries**. Each library can be assigned to specific channels or made available globally.

```
Code Template Library
├── Code Template 1 (Function)
├── Code Template 2 (Compiled Code Block)
└── Code Template 3 (Drag-and-Drop Code Block)
```

## Managing code templates

### Code Template Panel
Access via the main menu or navigation panel:
- View all libraries and their templates
- Create, edit, and delete templates
- Assign libraries to channels

### Creating a library
1. Open the **Code Templates** panel
2. Click **New Library**
3. Name the library
4. Select which channels should have access to this library

### Creating a Code Template
1. Select a library
2. Click **New Code Template**
3. Configure:
   - **Name** - Descriptive name
   - **Type** - Function, Drag-and-Drop Code Block, or Compiled Code Block
   - **Context** - Where it can be used (see below)
   - **Code** - The JavaScript implementation

## Template types

### Function
A named function that can be called from channel scripts. Functions are automatically added to the script context of assigned channels.

```javascript
/**
 * Formats a patient name from HL7 components.
 * @param {string} lastName
 * @param {string} firstName
 * @return {string} Formatted name
 */
function formatPatientName(lastName, firstName) {
    return lastName.toUpperCase() + ', ' + firstName;
}
```

Usage in a channel transformer:
```javascript
var name = formatPatientName(
    msg['PID']['PID.5']['PID.5.1'].toString(),
    msg['PID']['PID.5']['PID.5.2'].toString()
);
```

### Compiled code block
A block of code that is compiled and added to the script context, similar to a function. Useful for shared initialization code or constants.

### Drag-and-drop code block
A code block that can be dragged from the reference list into the script editor. Unlike Functions and Compiled Code Blocks, Drag-and-Drop Code Blocks are **not** automatically added to the script context.

## Execution contexts

Code templates can be restricted to specific contexts. There are 15 context types organized into three categories:

| Category | Context |
|---|---|
| **Global** | Deploy Script |
| **Global** | Undeploy Script |
| **Global** | Preprocessor Script |
| **Global** | Postprocessor Script |
| **Channel** | Deploy Script |
| **Channel** | Undeploy Script |
| **Channel** | Preprocessor Script |
| **Channel** | Postprocessor Script |
| **Channel** | Attachment Script |
| **Channel** | Batch Script |
| **Connector** | Source Receiver Script(s) |
| **Connector** | Source Filter / Transformer Script |
| **Connector** | Destination Filter / Transformer Script |
| **Connector** | Destination Dispatcher Script |
| **Connector** | Destination Response Transformer Script |

Select the appropriate contexts when creating a template. Templates are only available in their assigned contexts.

## Library assignment

Each library must be explicitly assigned to channels:

1. Open the library properties
2. Check the channels that should have access
3. Use **Select All** to make the library globally available
4. Save and redeploy affected channels

Changes to code templates require **redeployment** of all channels that use the affected library.

## Import / export

### GUI
- Right-click a library or template to export as XML
- Use **Import** to load from XML files

### CLI
```
codetemplate library list [includecodetemplates]
codetemplate list
codetemplate import "path" [force]
codetemplate library import "path" [force]
codetemplate export id|name "path"
codetemplate library export id|name|* "path"
codetemplate remove id|name
codetemplate library remove id|name|*
```

## Reference list

The Administrator includes a built-in **Reference List** panel in the script editor that provides quick access to:
- Available code template functions
- Built-in utility functions (`ChannelUtil`, `DateUtil`, `FileUtil`, etc.)
- Variable references (`msg`, `tmp`, `channelMap`, etc.)
- Example code snippets
