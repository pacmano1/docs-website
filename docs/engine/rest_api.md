---
title: REST API
description: Server API endpoints
---

# REST API

OIE exposes a REST API that powers the desktop Administrator, the Web Administrator, and the CLI. You can use it directly for custom integrations, automation, and monitoring.

## Base URL

```
https://<host>:8443/api
```

The API requires HTTPS and authentication. By default, all requests must include an `X-Requested-With` header for CSRF protection.

## Authentication

### Session-based
1. POST to `/api/users/_login` with credentials
2. Use the returned session cookie for subsequent requests

### HTTP headers
| Header | Required | Description |
|---|---|---|
| `X-Requested-With` | Yes (by default) | CSRF protection header (any value) |
| `Authorization` | Yes | Basic auth or session token |
| `Content-Type` | For POST/PUT | `application/xml` or `application/json` |
| `Accept` | Optional | `application/xml` or `application/json` |

### Example (curl)
```bash
curl -k -X GET \
  -H "X-Requested-With: OIE" \
  -u admin:admin \
  https://localhost:8443/api/channels
```

## API endpoints

### Channels

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/channels` | List all channels |
| `GET` | `/api/channels/{channelId}` | Get a specific channel |
| `POST` | `/api/channels` | Create a new channel |
| `PUT` | `/api/channels/{channelId}` | Update a channel |
| `DELETE` | `/api/channels/{channelId}` | Delete a channel |

### Channel deployment

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/channels/_redeployAll` | Redeploy all channels |
| `POST` | `/api/channels/{channelId}/_deploy` | Deploy a single channel |
| `POST` | `/api/channels/_deploy` | Deploy selected channels |
| `POST` | `/api/channels/{channelId}/_undeploy` | Undeploy a single channel |
| `POST` | `/api/channels/_undeploy` | Undeploy selected channels |

### Channel status and control

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/channels/statuses` | Get all channel statuses |
| `GET` | `/api/channels/{channelId}/status` | Get a single channel status |
| `POST` | `/api/channels/{channelId}/_start` | Start a channel |
| `POST` | `/api/channels/{channelId}/_stop` | Stop a channel |
| `POST` | `/api/channels/{channelId}/_pause` | Pause a channel |
| `POST` | `/api/channels/{channelId}/_resume` | Resume a channel |
| `POST` | `/api/channels/{channelId}/_halt` | Halt a channel |
| `POST` | `/api/channels/{channelId}/connector/{metaDataId}/_start` | Start a connector |
| `POST` | `/api/channels/{channelId}/connector/{metaDataId}/_stop` | Stop a connector |

### Channel groups

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/channelgroups` | List all channel groups |
| `POST` | `/api/channelgroups/_bulkUpdate` | Update channel groups |

### Channel statistics

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/channels/statistics` | Get statistics for all channels |
| `GET` | `/api/channels/{channelId}/statistics` | Get statistics for a channel |
| `POST` | `/api/channels/_clearStatistics` | Clear statistics for specific channels |
| `POST` | `/api/channels/_clearAllStatistics` | Clear all statistics including lifetime |

### Messages

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/channels/{channelId}/messages` | Search messages |
| `GET` | `/api/channels/{channelId}/messages/{messageId}` | Get a specific message |
| `POST` | `/api/channels/{channelId}/messages` | Send a new message |
| `DELETE` | `/api/channels/{channelId}/messages` | Remove messages |
| `POST` | `/api/channels/{channelId}/messages/_reprocess` | Reprocess messages |
| `GET` | `/api/channels/{channelId}/messages/{messageId}/attachments` | Get message attachments |
| `GET` | `/api/channels/{channelId}/messages/{messageId}/attachments/{attachmentId}` | Get a specific attachment |

### Configuration

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/server/configuration` | Get full server configuration |
| `PUT` | `/api/server/configuration` | Update server configuration |
| `GET` | `/api/server/settings` | Get server settings |
| `PUT` | `/api/server/settings` | Update server settings |
| `GET` | `/api/server/configurationMap` | Get configuration map |
| `PUT` | `/api/server/configurationMap` | Update configuration map |

### Users

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/users` | List all users |
| `GET` | `/api/users/{userId}` | Get a specific user |
| `POST` | `/api/users` | Create a user |
| `PUT` | `/api/users/{userId}` | Update a user |
| `DELETE` | `/api/users/{userId}` | Delete a user |
| `PUT` | `/api/users/{userId}/password` | Change password |
| `POST` | `/api/users/_login` | Log in |
| `POST` | `/api/users/_logout` | Log out |

### Alerts

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/alerts` | List all alerts |
| `GET` | `/api/alerts/{alertId}` | Get a specific alert |
| `POST` | `/api/alerts` | Create an alert |
| `PUT` | `/api/alerts/{alertId}` | Update an alert |
| `DELETE` | `/api/alerts/{alertId}` | Delete an alert |

### Code templates

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/codeTemplateLibraries` | List code template libraries |
| `GET` | `/api/codeTemplates` | List code templates |
| `PUT` | `/api/codeTemplateLibraries` | Update libraries |

### Events

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/events` | Search events |
| `GET` | `/api/events/{eventId}` | Get a specific event |

### Extensions

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/extensions/connectors` | List installed connector metadata |
| `GET` | `/api/extensions/plugins` | List installed plugin metadata |
| `GET` | `/api/extensions/{extensionName}` | Get extension metadata |
| `GET` | `/api/extensions/{extensionName}/enabled` | Check if extension is enabled |
| `POST` | `/api/extensions/{extensionName}/_setEnabled` | Enable or disable an extension |
| `GET` | `/api/extensions/{extensionName}/properties` | Get extension properties |
| `PUT` | `/api/extensions/{extensionName}/properties` | Set extension properties |

### System

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/system/info` | Get system information |
| `GET` | `/api/system/stats` | Get system statistics |

### Database Tasks

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/databaseTasks` | List database tasks |

## API documentation

### Swagger / OpenAPI

OIE provides an interactive Swagger UI and OpenAPI specification:
```
https://<host>:8443/api
```

The OpenAPI spec is available in JSON and YAML formats at `/api/openapi.json` and `/api/openapi.yaml`. The Swagger UI includes parameter descriptions, request/response schemas, and example payloads.

### User API Javadocs

Generated Javadocs for the User API (classes available in channel scripts) are served at:
```
https://<host>:8443/javadocs/
```

## Error handling

API errors return standard HTTP status codes:

| Code | Meaning |
|---|---|
| `200` | Success |
| `400` | Bad request (invalid parameters) |
| `401` | Unauthorized (invalid credentials) |
| `403` | Forbidden (insufficient permissions) |
| `404` | Not found |
| `500` | Internal server error |

Error responses include an error message in the response body.
