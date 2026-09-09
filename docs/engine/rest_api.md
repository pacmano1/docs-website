---
title: REST API
description: Server API endpoints
---

# REST API

OIE exposes a REST API that powers the desktop Administrator, the Web Administrator, and the CLI. You can use it directly for custom integrations, automation, and monitoring. The engine serves its own endpoint reference, so the routes, parameters, and schemas are documented below under [Swagger / OpenAPI](#swagger-openapi) rather than repeated here.

## Base URL

```text
https://<host>:8443/api
```

The port comes from `https.port` and the prefix before `/api` from `http.contextpath`, both in `mirth.properties`; the defaults are shown. The API is served over HTTPS, and every request must be authenticated. All requests must also carry an `X-Requested-With` header for CSRF protection; any non-blank value is accepted (`server.api.require-requested-with`, default `true`).

## Authentication

### Session-based
1. POST a form body (`application/x-www-form-urlencoded`) with `username` and `password` fields to `/api/users/_login`
2. Send the `JSESSIONID` cookie from the response on subsequent requests

### HTTP headers
| Header | Required | Description |
|---|---|---|
| `X-Requested-With` | Yes (by default) | CSRF protection header (any value) |
| `Authorization` | If no session | HTTP Basic (`username:password`) |
| `Content-Type` | For POST/PUT | `application/xml` or `application/json` |
| `Accept` | Optional | `application/xml` (the default) or `application/json` |

### Example (curl)

Lists every channel with HTTP Basic authentication and returns the channel definitions as JSON. Any non-blank `X-Requested-With` value passes the CSRF filter, and `-k` skips verification of the certificate the server generates for itself. Without the `Accept` header the response is XML.

```bash
curl -k \
  -H "X-Requested-With: OIE" \
  -H "Accept: application/json" \
  -u admin:admin \
  https://localhost:8443/api/channels
```

## API documentation

### Swagger / OpenAPI

The API base URL, opened in a browser, serves the Swagger UI:
```text
https://<host>:8443/api
```

The OpenAPI spec is available in JSON and YAML formats at `/api/openapi.json` and `/api/openapi.yaml`. Both live inside the API context, so they need the `X-Requested-With` header but no login:

```bash
curl -k -H "X-Requested-With: OIE" https://localhost:8443/api/openapi.json
```

The Swagger UI includes parameter descriptions, request/response schemas, and example payloads.

### User API Javadocs

Generated Javadocs for the User API (classes available in channel scripts) are served at:
```text
https://<host>:8443/javadocs/user-api/
```

`/javadocs/` on its own is a directory listing of the installation's `docs/javadocs` folder, with `user-api/` as its entry.

## Error handling

API errors return standard HTTP status codes:

| Code | Meaning |
|---|---|
| `200` | Success |
| `400` | Bad request (invalid parameters, or the `X-Requested-With` header is missing) |
| `401` | Unauthorized (no session and no valid credentials) |
| `403` | Forbidden (insufficient permissions) |
| `404` | Not found |
| `500` | Internal server error |
| `503` | Server still starting or otherwise unavailable |

Error responses include an error message in the response body.
