---
title: Code Templates
description: Reusable code libraries
---

# Code Templates

Code templates are reusable code snippets and function libraries that can be shared across multiple channels. They reduce duplication and centralize common logic.

## Overview

Code templates are organized into **libraries**. Each library can be assigned to specific channels or made available globally.

```text
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

The engine parses the comment block at the top of a Function template. The text before the first `@` tag becomes the template's description, and the `@param {type} name - text` and `@return {type} text` lines supply the parameter and return details that the Reference List and the editor's auto-complete show for the function. The format the engine expects is the one below, each line indented and without a leading asterisk. It is what a new Function template starts with, and what the **Generate JSDoc** / **Update JSDoc** button in the template editor writes. With a `*` at the start of each line no `@` tag is recognized: the whole comment, asterisks included, becomes the description, and every parameter shows as type `Any` with no description. The block is stripped from the code before the function is added to channel scripts.

```javascript
/**
    Formats a patient name from HL7 components.

    @param {String} lastName - Family name, PID.5.1
    @param {String} firstName - Given name, PID.5.2
    @return {String} The name as LAST, First
*/
function formatPatientName(lastName, firstName) {
    return lastName.toUpperCase() + ', ' + firstName;
}
```

The call below runs in the source or destination transformer of a channel whose inbound data type is HL7 v2, with the template's library assigned to the channel and the Filter / Transformer context selected on the template. `msg` is the parsed inbound message, an E4X XML object the engine builds from the inbound data type before the transformer runs (see [Message (`msg`)](./javascript_scripting_reference.md#message-msg)); the `PID.5.1` and `PID.5.2` element names exist only under HL7 v2. No outbound template is needed. `$c` is the channel map shorthand the engine adds to every script: one argument reads a key, two arguments write one.

```javascript
var patientName = formatPatientName(
    msg['PID']['PID.5']['PID.5.1'].toString(),
    msg['PID']['PID.5']['PID.5.2'].toString()
);
$c('patientName', patientName);
```

For a PID.5 of `DOE^JOHN` the channel map entry `patientName` holds `DOE, JOHN`, shown on the message in the Message Browser's Mappings tab.

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
3. Check **[New Channels]** to include every channel not explicitly unchecked, including channels created or imported later
4. Save and redeploy affected channels

A channel's own assignments are also editable from the channel editor: **Set Dependencies** opens the Channel Dependencies dialog, whose **Code Template Libraries** tab lists every library with Select All and Deselect All links.

Changes to code templates require **redeployment** of all channels that use the affected library.

## Import / export

### GUI
- Right-click a library or template to export as XML
- Use **Import** to load from XML files

### CLI
These commands are typed at the prompt of the CLI shell, which connects to a running server (see [Launching the CLI](./command_line_interface.md#launching-the-cli)); they are not operating-system commands. `path` is quoted when it contains spaces. Each command is described under [Code templates](./command_line_interface.md#code-templates) on that page.

```text
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
