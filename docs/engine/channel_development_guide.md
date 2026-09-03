---
title: Channel Development Guide
description: Building channels end-to-end
---

# Channel Development Guide

This guide covers the complete workflow for designing, building, testing, and deploying channels in OIE.

## Planning a channel

Before building, identify:

1. **Source system** - Where messages come from
2. **Message format** - HL7 v2.x, XML, JSON, etc.
3. **Protocol** - TCP/MLLP, HTTP, file, database, etc.
4. **Transformation requirements** - What needs to change
5. **Destination system(s)** - Where messages go
6. **Error handling** - What happens when delivery fails
7. **Volume** - Expected message throughput

## Creating a channel

1. In the Channels view, click **New Channel** in the Channel Tasks pane
2. Enter a channel name and optional description on the **Summary** tab
3. Configure the **Source** tab (connector type and settings)
4. Configure the **Destinations** tab (one or more destination connectors)
5. Optionally configure **Scripts** (deploy, undeploy, preprocessor, postprocessor)
6. Save with `Ctrl+S`

## Setting data types

1. In the **Summary** tab, click **Set Data Types**
2. For each connector, set:
   - **Inbound** data type (how the received message is parsed)
   - **Outbound** data type (how the message is serialized for output)

## The msg and tmp objects

When a message enters a filter or transformer, it is parsed into a JavaScript variable called **msg**. Depending on the data type, `msg` may be an E4X XML object (for XML-based data types like HL7 v2.x), a JavaScript object (for JSON), or a Java String (for raw data types).

The **tmp** variable is similar to `msg`, except it represents the outbound template rather than the inbound message. It is only available in the transformer when an outbound template is configured. Use `tmp` when you want to convert a message from one format to another (e.g. HL7 v2.x to JSON) or selectively include pieces of the inbound message in the outbound message.

## Building transformers

A transformer is made up of multiple **steps**. Each step modifies the message, extracts a piece of it, or performs some other task. Transformers have an **inbound data type** and an **outbound data type** that control how data is parsed and serialized.

### Step types

| Type | Use Case |
|---|---|
| **Mapper** | Extract a value from the message and store it in a variable map |
| **Message Builder** | Map a value into a specific field in the inbound or outbound message |
| **JavaScript** | Custom transformation logic using a full script |
| **External Script** | Reference an external JavaScript file on the server |
| **XSLT** | Apply an XSLT stylesheet to an XML document |
| **Destination Set Filter** | Control which destinations receive the message (source transformer only) |
| **Iterator** | Loop over repeating segments or array elements |

### Mapper step

Extracts data from a field in the message (or an expression) and places it into a variable map.

| Field | Description |
|---|---|
| **Variable** | The variable name / key to store the value under |
| **Add to** | Which map to place the variable in (Channel Map, Connector Map, Response Map, etc.) |
| **Mapping** | The value to extract: a message field or any JavaScript expression |
| **Default Value** | Fallback value if the Mapping is not found or evaluates to empty |
| **String Replacement** | Optional regex-based find/replace applied to the value before it is stored |

Example mapping expression:
```javascript
msg['PID']['PID.5']['PID.5.1'].toString()
```

Once stored, access the variable in JavaScript with the corresponding map's `.get()` method. For example, if you add to Channel Map: `channelMap.get('patientName')`.

### Message Builder step

Maps a value from the message (or an expression) into a specific field in the inbound or outbound message. Use it to modify a field in place, copy a field from one location to another, or map data from the inbound message into the outbound template.

| Field | Description |
|---|---|
| **Message Segment** | The target field in the inbound or outbound message to set (drag from the message tree) |
| **Mapping** | The value to assign: a message field or any JavaScript expression |
| **Default Value** | Fallback value if the Mapping is not found or evaluates to empty |
| **String Replacement** | Optional regex-based find/replace applied to the value before it is inserted |

Example, copying a field from the inbound message to the outbound template:
- **Message Segment:** `tmp['PV1']['PV1.9']['PV1.9.1']`
- **Mapping:** `msg['OBR']['OBR.16']['OBR.16.1'].toString()`

### JavaScript step

Gives you full scripting control for complex transformations:

```javascript
// Conditional transformation
var gender = msg['PID']['PID.8']['PID.8.1'].toString();
if (gender === 'M') {
    tmp['PID']['PID.8']['PID.8.1'] = 'Male';
} else if (gender === 'F') {
    tmp['PID']['PID.8']['PID.8.1'] = 'Female';
} else {
    tmp['PID']['PID.8']['PID.8.1'] = 'Unknown';
}
```

### Destination Set Filter step

A source transformer step that controls which destinations receive the message. Destination Set Filtering removes destinations from processing entirely for the current message. Note that this does not mark the source message as filtered.

| Field | Description |
|---|---|
| **Behavior** | Whether to filter "the following", "all except the following", or "all" destinations |
| **Destinations** | The destinations to include or exclude based on the behavior |
| **Field** | The message field or expression to test |
| **Condition** | Exists, Not Exist, Equals, Not Equal, Contains, or Not Contain |
| **Values** | One or more values to test the field against |

### Iterator step

Loops over repeating segments or array elements, executing child steps for each iteration.

| Field | Description |
|---|---|
| **Iterate On** | The element to iterate over: a list of E4X XML nodes or a Java/JavaScript array (e.g. `msg['PID']`) |
| **Index Variable** | The loop variable name (default `i`) used to index into the element |
| **Drag-and-Drop Substitutions** | Prefixes that will have the index variable injected when dragging fields into child steps |

When you drag a field from the message tree into a child step, the index variable is automatically inserted. For example, if **Iterate On** is `msg['PID']` and the index variable is `i`, then dragging `msg['PID']['PID.3']['PID.3.1'].toString()` into a child step produces `msg['PID'][i]['PID.3']['PID.3.1'].toString()`.

You can create iterators automatically by dragging a repeating node from the inbound message tree onto a node in the outbound tree. OIE will prompt you to set up an iterator with the correct substitutions.

## Building filters

The filter decides whether a message should proceed to the next step or not. It returns **true** (accept) or **false** (filter). A filter is made up of multiple **rules**, each joined by an **AND** or **OR** operator.

- If the **source** filter rejects a message, it will not flow through the source transformer or to any destination.
- If a **destination** filter rejects a message, it will not flow through that destination's transformer or be dispatched outbound, but other destinations may still process the message.

### Filter rule types

| Rule Type | Use Case |
|---|---|
| **Rule Builder** | GUI-based conditions against a message field |
| **JavaScript** | Custom filtering logic (return `true` to accept, `false` to reject) |
| **External Script** | Reference an external JavaScript file on the server |
| **Iterator** | Loop over repeating elements to decide whether to accept or filter |

### Rule Builder

| Field | Description |
|---|---|
| **Behavior** | Always set to **Accept**. If the expression evaluates to true, the message is accepted |
| **Field** | The message field or expression to test (drag from the message tree) |
| **Condition** | **Exists**, **Not Exist**, **Equals**, **Not Equal**, **Contains**, or **Not Contain** |
| **Values** | One or more values to test the field against |

When the Values table has multiple entries, conditions like Equals and Contains return true if the field matches **any** of the values. Not Equal and Not Contain return true if the field matches **none** of the values.

### JavaScript filter
```javascript
// Accept only ADT^A01 messages
var messageType = msg['MSH']['MSH.9']['MSH.9.1'].toString();
var triggerEvent = msg['MSH']['MSH.9']['MSH.9.2'].toString();
return (messageType === 'ADT' && triggerEvent === 'A01');
```

### Combining rules
- Each rule is joined by an **AND** or **OR** operator (click the operator icon next to the rule name to toggle)
- Standard logical precedence applies: **AND** is evaluated before **OR**

## Channel scripts

Four scripts can be configured on the **Scripts** tab of the Edit Channel view.

### Deploy script
Runs once right before a channel is deployed. Use it to initialize variables or load resources.

```javascript
// Initialize a message counter
globalChannelMap.put('messageCount', 0);
```

### Preprocessor
Runs once for every message, after the source connector receives the data and after attachment extraction, but before the message reaches the source filter/transformer. Use it to modify the raw inbound message.

```javascript
// Fix common HL7 formatting issues
message = message.replace(/\n/g, '\r');
return message;
```

### Postprocessor
Runs once for every message after the source connector and all destinations have completed, but before the source connector sends a response back to the originating system. The postprocessor has access to responses from all executed destinations and can return a custom response for the source connector to use.

```javascript
// Log the message ID after processing
logger.info('Finished processing message: ' + message.getMessageId());
return;
```

### Undeploy script
Runs once after a channel is undeployed. Use it to clean up any resources initialized in the deploy script.

```javascript
// Log that the channel is shutting down
logger.info('Channel undeploying');
```

## Response handling

The source connector's **Response** dropdown controls what is sent back to the originating system. Options include:

- **None**. No response is returned
- **Auto-generate (Before processing)**. OIE auto-generates a response from the inbound data type immediately, with a SENT status
- **Auto-generate (After source transformer)**. OIE auto-generates a response from the inbound data type after the source filter/transformer runs
- **Auto-generate (Destinations completed)**. OIE auto-generates a response from the inbound data type after all destinations complete, reflecting overall processing status
- **Postprocessor**. Returns a custom response set in the postprocessor via the response map
- **A specific destination**. Returns the response payload received from that destination (e.g. an ACK from a downstream system)

## Testing channels

### Send test messages
1. Deploy the channel
2. In the Dashboard, select the channel and click **Send Message** in the Dashboard Tasks pane
3. Type a message directly, or load one from a file using **Open Text File** or **Open Binary File**
4. Optionally select which destinations to include and inject source map variables
5. Click **Process Message**
6. Check the Message Browser for results

### Debug mode
Deploy a channel in **Debug Mode** to enable breakpoints and step through channel scripts, including deploy/undeploy scripts, preprocessor/postprocessor, source and destination filter/transformers, destination connector scripts, and response transformers.

### Message storage
Set **Message Storage** to **Development** during testing to capture all content types. Switch to **Production**, **Raw**, **Metadata**, or **Disabled** for production deployments to reduce storage.

