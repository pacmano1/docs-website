---
title: Filters and Transformers
description: Message routing and transformation
---

# Filters and Transformers

Filters and transformers are the core tools for controlling message flow and shaping message content in OIE. Filters gate which messages proceed through the pipeline, while transformers handle format conversion and data manipulation.

## About filters

Filters act as gatekeepers on connectors. They evaluate a message and produce a boolean result: **true** means the message is **accepted** and continues, **false** means the message is **filtered** and stops.

Both source and destination connectors can have filters:
- When a source filter rejects a message, it never reaches any destination, processing halts entirely.
- When a destination filter rejects a message, that particular destination skips it, but other destinations on the channel may still process it.

### Filter rules

A filter contains one or more **rules** connected by **operators**, either **AND** or **OR**. Standard boolean precedence applies, meaning AND binds more tightly than OR. For instance:

> Rule 1 **OR** Rule 2 **AND** Rule 3

is evaluated as: Rule 1 OR (Rule 2 AND Rule 3).

### The "msg" object

Before a filter runs, the incoming message is parsed into an internal representation exposed as the **msg** variable. Depending on the data type in use, this could be an E4X XML object, a JavaScript object, or a Java String.

### Filter rule types

| Rule Type | Description |
|---|---|
| **Rule Builder** | A visual rule editor supporting common comparisons like equals, not equals, contains, etc. |
| **JavaScript** | Write custom logic in JavaScript. Return `true` to accept the message, `false` to reject it. |
| **External Script** | Points to a JavaScript file on the server filesystem |
| **Iterator** | Iterates over repeating segments or elements, applying child rules to each one |

#### Rule Builder Example

To accept only ADT messages:
- Field: `msg['MSH']['MSH.9']['MSH.9.1']`
- Condition: Equals
- Value: `ADT`

#### JavaScript rule example

```javascript
// Accept messages from specific sending facilities
var facility = msg['MSH']['MSH.4']['MSH.4.1'].toString();
var allowedFacilities = ['HOSP_A', 'HOSP_B', 'LAB_1'];
return allowedFacilities.indexOf(facility) !== -1;
```

## About transformers

Transformers handle the work of reshaping messages, changing field values, converting between formats, and pulling out data for use later in the pipeline. Like filters, they can be placed on both source and destination connectors.

Every transformer has an **inbound data type** and an **outbound data type**. When these are the same (e.g., HL7 v2.x in and HL7 v2.x out), you are modifying a message in place. When they differ (e.g., HL7 v2.x in and JSON out), you are performing a format conversion. See [Data Types and Formats](./data_types_and_formats.md) for more.

Transformers are made up of individual **steps**, each performing a specific action: setting a field, extracting a value, running custom logic, etc.

### The "msg" object

Same as in filters: the parsed internal representation of the incoming message.

### The "tmp" object

When a transformer has an outbound template configured, a second variable called **tmp** becomes available. It holds the parsed form of that template. You use `tmp` when building an outbound message in a different format. For example, reading fields from `msg` (the incoming HL7 v2.x message) and placing them into `tmp` (a JSON template). It can also be used to cherry-pick just the fields you need from the inbound message rather than forwarding everything.

### Transformer step types

| Step Type | Description |
|---|---|
| **Mapper** | Extracts a value from the inbound message and stores it as a named variable in a selected map (defaults to the channel map) |
| **Message Builder** | Writes a value into a specific field of the outbound template |
| **JavaScript** | Runs arbitrary JavaScript for complex transformations |
| **External Script** | Loads and runs a JavaScript file from the server filesystem |
| **XSLT Step** | Applies an XSLT stylesheet to a specified XML source and stores the result in the channel map |
| **Destination Set Filter** | Dynamically controls which destinations will receive the message by modifying the destination set |
| **Iterator** | Loops through repeating segments or elements, executing child steps for each iteration |

#### Mapper step

Pulls a value from the message and saves it as a variable.

| Field | Description |
|---|---|
| **Variable** | The name under which the value is stored |
| **Mapping** | The expression to evaluate (e.g. `msg['PID']['PID.3']['PID.3.1'].toString()`) |
| **Default Value** | Fallback value when the mapping returns empty |
| **Scope** | Which map to store the variable in: Channel Map (default), Connector Map, Global Channel Map, Global Map, or Response Map |

Once mapped, the variable can be accessed in JavaScript using the corresponding map object (e.g., `channelMap.get('variableName')` for Channel Map scope) and in Velocity template fields (such as File Writer paths) with `${variableName}`.

#### Message Builder step

Assigns a value to a field in the outbound template.

| Field | Description |
|---|---|
| **Message Segment** | The target field in the outbound message (drag from the message tree) |
| **Mapping** | The value to assign. Can be a literal, an expression, or a variable reference (e.g. `channelMap.get('variableName')`) |

#### JavaScript step

Gives you full scripting control for complex transformations:

```javascript
// Reformat a date field
var dob = msg['PID']['PID.7']['PID.7.1'].toString();
if (dob.length === 8) {
    var year = dob.substring(0, 4);
    var month = dob.substring(4, 6);
    var day = dob.substring(6, 8);
    tmp['PID']['PID.7']['PID.7.1'] = year + '-' + month + '-' + day;
}
```

#### Iterator step

Handles repeating segments or elements:

1. Set the **Target** to the repeating element path
2. Add child steps (Mapper, Message Builder, JavaScript) inside the iterator
3. Use the iteration variable to access the current element

## Response transformers

Response transformers are a specialized variant that only exists on destination connectors. Rather than operating on the channel's message data, they work on the reply that comes back from the external system after a destination dispatches its payload.

In addition to the response content itself, a destination response includes a **status** (e.g., SENT, ERROR), a **status message**, and an **error message**. A response transformer can modify any of these. A common use case is overriding an ERROR status. If your custom logic determines that the response is actually acceptable, you can change the status to SENT.

::: info
A response transformer only runs when there is actual response data to work with. If, for instance, an HTTP Sender cannot establish a connection at all, no response exists and the transformer is skipped. The exception is when the response inbound data type is set to Raw. Since Raw requires no parsing, the response transformer will always fire regardless of whether response data was received.
:::

## Message trees

The transformer editor provides two tree views of the message structure:

| Tree | Description |
|---|---|
| **Inbound Message Tree** | Shows the parsed structure of the incoming message (`msg`) |
| **Outbound Message Tree** | Shows the structure of the outbound template (`tmp`) |

### Using message trees
- **Drag and drop** fields from the inbound tree to create Mapper steps
- **Drag and drop** fields from the outbound tree to create Message Builder steps
- Click on any field to see its path expression
- Load sample messages to populate the tree structure

## Execution order

```
Source Filter Rules (in order)
    ↓ (if accepted)
Source Transformer Steps (in order)
    ↓
Destination 1 Filter Rules (in order)
    ↓ (if accepted)
Destination 1 Transformer Steps (in order)
    ↓
Destination 1 Connector sends message
    ↓
Destination 1 Response Transformer Steps (in order)
    ↓
Destination 2 Filter...
    ↓
... (repeat for each destination)
```
