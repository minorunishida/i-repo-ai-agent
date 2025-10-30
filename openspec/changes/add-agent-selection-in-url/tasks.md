## 1. Implementation
- [x] 1.1 Add URL parsing for `/agent/[index]` with root → index 1
- [x] 1.2 On mount, derive agentId from URL and set picker (URL > localStorage)
- [x] 1.3 On picker change, `pushState` URL to `/agent/{index}` without reload
- [x] 1.4 Guard invalid indexes: notice + fallback to default (index 1)
- [x] 1.5 Ensure `useChat` body.agentId reflects URL-synced selection at all times
- [x] 1.6 Maintain thread UI state when URL changes (no full reload)

## 2. Validation
- [x] 2.1 `openspec validate add-agent-selection-in-url --strict`
- [x] 2.2 Manual: direct open `/agent/2` → picker reflects index 2; send works
- [x] 2.3 Manual: change picker → URL updates; streaming continues uninterrupted
- [x] 2.4 Manual: invalid `/agent/999` → notice + default

## 3. Rollout
- [x] 3.1 Backward-compat: `/` behaves as index 1 (no breaking change)

