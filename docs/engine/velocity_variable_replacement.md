---
title: Velocity Variable Replacement
description: Template variable syntax and usage
---

# Velocity Variable Replacement

OIE uses **Apache Velocity** syntax for variable substitution in connector templates, file names, directory paths, and other text fields throughout the channel editor. This is distinct from JavaScript and provides a lightweight way to insert dynamic values.

## Basic syntax

Variables stored in maps are referenced using the `${}` syntax:

```
${variableName}
```

This pulls the value from the variable maps (see [Variable Map Priority](#variable-map-priority) below).

### Examples

**In a File Writer filename:**
```
message_${message.messageId}_${date.get('yyyyMMdd')}.hl7
```

**In an HTTP Sender URL:**
```
https://api.example.com/patients/${patientId}/records
```

**In a destination template:**
```
Patient: ${patientLastName}, ${patientFirstName}
MRN: ${medicalRecordNumber}
```

## Conditional statements

Velocity supports `#if` / `#else` / `#elseif` / `#end` for conditional logic within templates:

```text
#if(${gender} == "M")
Male
#elseif(${gender} == "F")
Female
#else
Unknown
#end
```

This is useful when the output format varies based on message content without needing a full JavaScript transformer step.

## For loops

Velocity supports `#foreach` loops for iterating over collections:

```text
#foreach($item in ${itemList})
Item: ${item}
#end
```

## Variable map priority

When you reference `${variableName}`, OIE loads all variable maps into a single Velocity context. Maps loaded later overwrite earlier values for the same key, so later maps have higher priority. The effective priority from highest to lowest is:

1. **Response Map** - Destination response data
2. **Connector Map** - Variables scoped to the current connector
3. **Channel Map** - Variables scoped to the current message across all connectors
4. **Source Map** - Variables populated by the source connector (e.g., remote address, original filename)
5. **Global Channel Map** - Variables shared across all messages in this channel
6. **Global Map** - Variables shared across all channels
7. **Configuration Map** - Server-wide key-value pairs from Settings

If no match is found, the literal string `${variableName}` is output.

## Standard variables and templates

Several built-in variables are always available in Velocity templates:

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

```
${date.get('yyyyMMdd')}          → 20240101
${date.get('yyyy-MM-dd HH:mm')} → 2024-01-01 12:00
${date.get('yyyyMMddHHmmss')}   → 20240101120000
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

Use Velocity for simple value insertion. Use JavaScript transformer steps for complex logic, calculations, and external lookups.
