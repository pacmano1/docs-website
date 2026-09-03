---
title: Polling Settings
description: Interval, time, and cron schedule configuration
---

# Polling Settings

Source connectors that poll for data (Database Reader, File Reader, JavaScript Reader) support configurable polling schedules. This page covers the available scheduling options.

## Polling schedule types

### Interval

Polls at a fixed interval, starting from when the channel is deployed.

| Setting | Description |
|---|---|
| **Polling Frequency** | Time between polls. Enter a number and select the unit: milliseconds, seconds, minutes, or hours. The value must be less than 24 hours. |

Example: Poll every 5 seconds.

This is the simplest option. The timer starts when the channel deploys, and polls occur at the configured interval regardless of time of day.

### Time

Polls once per day at a specific time.

| Setting | Description |
|---|---|
| **Time** | The time of day to poll (hour and minute) |

Example: Poll once daily at 6:00 AM.

Use this when data should be picked up at the same time each day.

### Cron

Polls according to one or more cron expressions, providing the most flexible scheduling.

| Setting | Description |
|---|---|
| **Cron Jobs** | A table of cron expressions, each with an optional description |

#### Cron expression format

Cron expressions must be in Quartz format with at least 6 fields:

```
second minute hour day-of-month month day-of-week [year]
```

**Note:** Specifying both a day-of-week and day-of-month value is not supported. A `?` must be used in one of these fields.

| Field | Values | Special Characters |
|---|---|---|
| Second | 0-59 | `, - * /` |
| Minute | 0-59 | `, - * /` |
| Hour | 0-23 | `, - * /` |
| Day of Month | 1-31 | `, - * ? / L W` |
| Month | 1-12 or JAN-DEC | `, - * /` |
| Day of Week | 1-7 or SUN-SAT | `, - * ? / L #` |
| Year (optional) | 1970-2099 | `, - * /` |

#### Examples

| Expression | Schedule |
|---|---|
| `0 0/5 * * * ?` | Every 5 minutes |
| `0 0 8 * * ?` | Daily at 8:00 AM |
| `0 0 8,17 * * ?` | Daily at 8:00 AM and 5:00 PM |
| `0 0 */2 * * ?` | Every 2 hours |
| `0 0 9-17 ? * MON-FRI` | Hourly from 9 AM to 5 PM, weekdays only |
| `0 30 6 ? * MON` | Every Monday at 6:30 AM |
| `0 0 0 1 * ?` | First day of every month at midnight |

## Common settings

These settings are available regardless of which schedule type is selected:

| Setting | Description |
|---|---|
| **Schedule Type** | Interval, Time, or Cron |
| **Poll Once on Start** | Execute a poll immediately when the channel starts, before the scheduled poll |

### Poll Once on Start
When enabled, the connector immediately polls for data when the channel is started or deployed, without waiting for the first scheduled poll time. This is useful for catching up on data that arrived while the channel was stopped.

## Advanced polling settings

The Advanced Settings dialog (wrench icon) is available for Interval and Time schedule types, but not for Cron. It provides additional control over when polling occurs.

### Active Days

Controls which days polling is allowed to occur.

| Mode | Description |
|---|---|
| **Weekly** | Select specific days of the week (Sunday through Saturday) when polling is active. At least one day must be selected. |
| **Monthly** | Select a specific day of the month (1-31) when polling is active. |

### Active Time (Interval only)

Controls the time window during which interval-based polling is active. This setting is not available for Time schedule type (since Time already specifies a single poll time).

| Mode | Description |
|---|---|
| **All Day** | Polling may occur at any time during the day (default). |
| **Range** | Polling only occurs during the specified time range (e.g., 8:00 AM - 5:00 PM). |

## Polling vs. listener connectors

| Behavior | Polling (Reader) | Listener |
|---|---|---|
| **Initiation** | OIE pulls data on a schedule | External system pushes data |
| **Connectors** | Database Reader, File Reader, JavaScript Reader | TCP Listener, HTTP Listener, Channel Reader, JMS Listener, Web Service Listener, DICOM Listener |
| **Schedule** | Interval, time, or cron | N/A (always listening) |
| **Resource usage** | Active only during polls | Continuous |
| **Latency** | Depends on poll interval | Near real-time |

