# Making Magic Console

> Governance + Orchestration Control Console

**This is not a dashboard. This is a control plane.**

---

## Identity

A single-pane-of-glass for Intent, Policy, Time, and Execution.

| Question | Panel |
|----------|-------|
| What is the system trying to do? | MomentIntent Queue |
| Is it allowed to do it? | MomentIntent Detail (Policy) |
| Is it happening now, later, or never? | MomentIntent Detail (TemporalPhase) |
| What did it produce? | MomentIntent Detail (Assets) |
| What did it cost? | Budget & Costs |
| Can it be stopped instantly? | Emergency Controls |
| Is the system safe to run? | System Health |

---

## 6 Canonical Panels

1. **MomentIntent Queue** — Primary screen, all intents
2. **MomentIntent Detail** — TemporalPhase, Signals, Assets, Audit
3. **System Health** — Provider status, circuit breakers
4. **Emergency Controls** — Kill switches
5. **Budget & Costs** — Spend tracking
6. **Settings** — Connected accounts, webhooks

---

## What This Console Does NOT Do

- Generate content (that's The-Studio)
- Decide policy (that's Governance Core)
- Decide timing (that's Making-Magic orchestration)
- Run pipelines (that's Making-Magic workers)

---

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- React Query

---

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Canonical Spec

See: `/mountain-jewels-platform/docs/CONSOLE-CANONICAL-SPEC.md`

---

## Status

🚧 **In Active Development**

Built with precision by the Making Magic team.
