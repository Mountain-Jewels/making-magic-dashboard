# Concierge Idle Contract (F1)

This frontend integrates with the backend `POST /concierge/idle` endpoint exposed by The Studio engine.

## Request

```json
{
  "session_id": "uuid",
  "timestamp": "2026-02-24T20:30:00Z",
  "event": "idle_imminent"
}
```

`event` values:
- `active`
- `idle_imminent`
- `idle_confirmed`

## Response

```json
{
  "status": "ok",
  "next_action": "none"
}
```

`next_action` values:
- `none`
- `offer_resume`
- `downgrade_streaming`
- `go_dormant`

## Frontend handling

- `downgrade_streaming`: set `conciergeResponse.downgrade_to_gltf = true`
- `active` or `offer_resume`: clear `conciergeResponse.downgrade_to_gltf`
- `go_dormant`: currently informational for UI; no forced transition in dashboard

## Session key

The dashboard stores a local session id in browser storage at:

- `mj.concierge.session_id`
