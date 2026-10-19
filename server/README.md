# Lead delivery API — GL-STUDY-24

The public preview remains DEMO. `createDeliveryServer` implements a separate durable Node 24 HTTP service. The original synthetic sandbox is retained in `synthetic-sandbox.mjs` for its earlier contract tests.

## Local integration

Private configuration: `.qa/study24/local-delivery/config.json`. It permits only `Synthetic Test`, `+70000000000` and synthetic parent data. Receivers `local-almaty` and `local-international` are local test identities, not company recipients.

```powershell
node server/local-receiver.mjs
$env:GL_LEAD_CONFIG='.qa/study24/local-delivery/config.json'
node server/lead-api.mjs
```

Ports: receiver 8790, API 8787, both loopback. `/api/readiness` returns configuration gates without secrets. Without configuration the service returns DEMO/not-ready, never fictitious delivery. `config.example.json` is deliberately incomplete and cannot activate production.

## Contract and persistence

`POST /api/leads`: exact configured Origin, JSON, `Idempotency-Key`, `{payload,antiSpam:{website:'',startedAt}}`. The existing LeadPayload/routing contract is preserved. Server validation uses shared phone/routing helpers plus field/enum/date/age/city/program/branch checks. Recipients come exclusively from server routes. Missing online routing is rejected.

SQLite WAL transactions atomically insert the lead and delivery job. The attempt key has a UNIQUE constraint and a normalized payload fingerprint. A retry with the same body reuses the lead, a changed body conflicts, and an explicit new attempt permits a similar request. Queue, rate counters, consent proof and capabilities survive process termination. Lease recovery reconciles ambiguous provider outcomes before replay or fallback.

States: `queued`, `sending`, `retry-pending`, `delivered-primary`, `delivered-reserve`, `failed`. Only a validated provider receipt with matching request/recipient, receipt ID and UTC time confirms delivery. HTTP 202, malformed HTTP 200 and opening WhatsApp do not. Primary and reserve share the request ID; external exactly-once is not promised without provider support. Retry-After and exponential bounded retries apply per channel. Unknown timeout outcomes do not silently switch to reserve.

Configured channels receive POST JSON `{requestId,recipient,payload,consent}` with Idempotency-Key=requestId and optional server-only Bearer token. Expected acknowledgement: `{requestId,recipient,delivered:true,receiptId,deliveredAt}`. A provider status endpoint must return the same receipt or the explicit final negative `{requestId,found:false,final:true}`. Other responses remain unconfirmed.

`POST /api/leads/status` requires the random 256-bit capability as Bearer and returns only request ID, state and confirmation metadata. No public lead list exists. The server records its own UTC time, immutable configured consent document ID/version/text SHA-256, language and safe source. Client timestamps/text hashes are not accepted as legal evidence.

Limits cover methods, body size, content type, exact origins, fields, honeypot/timing and durable socket-based frequency. X-Forwarded-For is ignored. There are no authentication cookies or client form secrets. Responses and logs omit lead contents and secret values. A prepared Turnstile verifier checks provider success/hostname/action/time server-side; no live CAPTCHA is configured or claimed. The prepared frontend challenge is wired on demand after valid form/consent, supports cancellation and keeps the token in RAM/POST only. Live keys/provider approval and real external verification are still required. The frontend build gate also rejects unapproved legal snapshots and unsafe live configuration; DEMO assets contain no provider SDK request.

## Verification

`npm run test:delivery` — real HTTP + SQLite receiver, 16 scenarios. `npm run test:delivery-process` — actual child process termination/restart and durable rate limiting. `npm run test:delivery-browser` — real React form + HTTP + SQLite: consent, queue versus confirmed success, close/reopen, deliberate new attempt, offline retry, abort and success-event deduplication. Provider anti-bot tests are MOCK/CONTRACT, not external verification. Evidence is in private `.qa/study24`.

## Server deployment boundary

GitHub Pages serves only static frontend files. This API, SQLite, queue and secrets need the approved separate server with HTTPS/reverse proxy, protected persistent storage, supervised process, backup/restore, retention and monitoring. The listener binds loopback; no tunnel or public service was created. Production readiness also requires approved legal content, exact routes/channels and anti-bot configuration and explicit external-write approval. Company CRM/staging/reserve receipt verification remains BLOCKED_EXTERNAL. No company messages were sent.
