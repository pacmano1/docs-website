---
title: Velocity Variable Replacement
description: Template variable syntax and usage
---

# Velocity Variable Replacement

OIE uses **Apache Velocity** syntax for variable substitution in connector templates, file names, directory paths, and other text fields throughout the channel editor. This is distinct from JavaScript and provides a lightweight way to insert dynamic values.

## Basic syntax

Variables stored in maps are referenced using the `${}` syntax:

```velocity
${variableName}
```

This pulls the value from the variable maps (see [Variable Map Priority](#variable-map-priority) below).

A key you name yourself, such as `patientId`, is in a map only because a transformer step stored it: a [Mapper step](./filters_and_transformers.md#mapper-step) writes to the map chosen by its scope setting (the channel map by default), and a JavaScript step calls `channelMap.put('patientId', value)`.

## Variable map priority

When you reference `${variableName}`, OIE loads all variable maps into a single Velocity context. Maps loaded later overwrite earlier values for the same key, so later maps have higher priority. The effective priority from highest to lowest is:

1. **Response Map** - Destination response data
2. **Connector Map** - Variables scoped to the current connector
3. **Channel Map** - Variables scoped to the current message across all connectors
4. **Source Map** - Variables populated by the source connector (e.g., remote address, original filename)
5. **[Global Channel Map](./glossary.md#global-channel-map)** - Variables shared across all messages in this channel
6. **Global Map** - Variables shared across all channels
7. **Configuration Map** - Server-wide key-value pairs from Settings

If no match is found, the literal string `${variableName}` is output.

A template with a Velocity syntax error is not replaced at all: the engine logs `Could not replace template values` at WARN and uses the field's text as written.

## Standard variables and templates

The utility variables `date`, `DATE`, `COUNT`, `UUID` and `SYSTIME` go into the context first, so a key with the same name in any map replaces them. `message`, `channelId`, `channelName` and `HASH` go in after the configuration, global and global channel maps and before the source, channel, connector and response maps, so only a key in one of those four per-message maps replaces them. `originalFilename` is set to its timestamp default only when no map supplied one. The `message` properties, `${HASH}` and `${originalFilename}` exist only when a template is replaced for a connector message, as the destination connector fields in the examples below are. A field replaced without a message, such as the File Reader directory, gets the utility variables, `${channelId}`, `${channelName}`, and the global channel, global and configuration maps only. There `${channelId}` and `${channelName}` go in before the global channel map, so a global channel map key with the same name replaces them.

### Message properties

| Variable | Description |
|---|---|
| `${message.messageId}` | The current message ID |
| `${message.encodedData}` | The encoded (outbound) message content |
| `${message.rawData}` | The raw inbound message content |
| `${message.transformedData}` | The transformed message content |
| `${message.channelId}` | The channel ID for this message |
| `${message.channelName}` | The channel name for this message |
| `${message.connectorName}` | The name of the current connector |
| `${message.metaDataId}` | The metadata ID of the current connector |
| `${channelId}` | The current channel's UUID |
| `${channelName}` | The current channel's name |

### Utility variables

| Variable | Description |
|---|---|
| `${date.get('yyyyMMdd')}` | Current date/time formatted with a Java `SimpleDateFormat` pattern |
| `${DATE}` | Current timestamp formatted as `dd-MM-yy_HH-mm-ss.SS` |
| `${COUNT}` | Auto-incrementing counter (increments each time it is referenced) |
| `${UUID}` | A random UUID string |
| `${SYSTIME}` | Current system time in milliseconds |
| `${HASH}` | SHA-256 hash of the encoded message content (falls back to raw if encoded is unavailable) |
| `${originalFilename}` | Original filename from the source connector (defaults to `<timestamp>.dat` if unset) |

### Date formatting examples

```text
${date.get('yyyyMMdd')}          → 20240101
${date.get('yyyy-MM-dd HH:mm')} → 2024-01-01 12:00
${date.get('yyyyMMddHHmmss')}   → 20240101120000
```

## Examples

Each example is a destination connector field, replaced for each message with that message's maps in the context. `message` and `date` are the built-in objects listed above. `patientId`, `patientLastName`, `patientFirstName` and `medicalRecordNumber` are keys a transformer step stored in the channel map.

**In a File Writer filename:**
```velocity
message_${message.messageId}_${date.get('yyyyMMdd')}.hl7
```

**In an HTTP Sender URL:**
```velocity
https://api.example.com/patients/${patientId}/records
```

**In a destination template:**
```velocity
Patient: ${patientLastName}, ${patientFirstName}
MRN: ${medicalRecordNumber}
```

## Conditional statements

Velocity supports `#if` / `#else` / `#elseif` / `#end` for conditional logic within templates. `gender` here is a channel map key stored by a transformer step. A key that is in none of the maps compares as not equal, so the `#else` branch is taken and no error is raised:

```velocity
#if(${gender} == "M")
Male
#elseif(${gender} == "F")
Female
#else
Unknown
#end
```

## For loops

Velocity supports `#foreach` loops for iterating over collections. `itemList` must be a collection a transformer step stored in a map: a JavaScript array and a `java.util.List` both iterate. If the key is missing, or its value is not a collection (a string, for example), the loop produces no output and no error. `${item}` and `$item` are the same reference; the braces only mark where the name ends:

```velocity
#foreach(${item} in ${itemList})
Item: ${item}
#end
```

## Where Velocity is used

| Location | Example |
|---|---|
| **Destination templates** | Message body content |
| **File Writer directory/filename** | `/output/${channelName}/${date.get('yyyyMMdd')}/` |
| **HTTP Sender URL** | `https://host/api/${patientId}` |
| **HTTP headers/parameters** | Header values with dynamic content |
| **Email subject/body** | SMTP sender fields |
| **Database Writer SQL** | Parameterized INSERT statements |
| **Alert templates** | Alert notification content |

## Velocity vs. JavaScript

| Aspect | Velocity `${}` | JavaScript |
|---|---|---|
| **Use case** | Simple variable insertion in templates | Complex logic and transformations |
| **Syntax** | `${varName}` | `channelMap.get('varName')` |
| **Where** | Template fields, filenames, URLs | Transformer/filter steps, scripts |
| **Conditionals** | `#if/#else/#end` | `if/else` |
| **Loops** | `#foreach` | `for`, `while` |
| **Power** | Lightweight substitution | Full programming language |
