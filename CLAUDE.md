# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A GitHub Action that fetches vulnerability data from Microsoft Defender for Endpoint and emails personalized HTML security reports to device owners via SMTP. Runs on a weekly schedule (Monday 01:00 UTC) or manual trigger.

## Commands

```bash
npm run build    # Bundle TypeScript → dist/index.js (required before committing)
npm run lint     # ESLint on src/
npm run format   # Prettier on src/
npm run test     # Placeholder — no tests yet
```

**Always run `npm run build` before committing** — `dist/index.js` is checked in and is the actual file GitHub Actions executes.

## Architecture

Data flows through four modules in `src/`:

1. **`index.ts`** — Entry point. Reads GitHub Action inputs, loads `device-owners.json`, and orchestrates the pipeline: authenticate → fetch → render → send, once per device. Devices are processed independently (failure in one doesn't stop others).

2. **`defender-client.ts`** — Wraps the Microsoft Defender for Endpoint REST API (`https://api.securitycenter.microsoft.com/api`). Acquires OAuth 2.0 tokens from Azure AD and caches them with a 5-minute refresh buffer. For each device, fetches machine metadata, alerts, recommendations, vulnerabilities, and software inventory — the last four in parallel via `Promise.all()`.

3. **`report-generator.ts`** — Produces self-contained HTML emails with inline CSS (Microsoft Fluent UI color scheme). Escapes all user-supplied data to prevent XSS. Limits software tables to 50 rows.

4. **`email-sender.ts`** — Delivers the HTML report via nodemailer over SMTP (TLS port 587 or SSL port 465). Verifies the SMTP connection before sending.

**`types.ts`** holds all shared TypeScript interfaces (`DeviceOwner`, `DefenderDevice`, `VulnerabilityInfo`, etc.).

## Key Configuration

**`device-owners.json`** — maps Defender device DNS names to owner names and emails:
```json
[{ "deviceName": "dns-name-in-defender", "ownerName": "Full Name", "ownerEmail": "owner@example.com" }]
```

**`action.yml`** defines all Action inputs. Required inputs: `tenant-id`, `client-id`, `client-secret`, `smtp-host`, `smtp-port`, `smtp-user`, `smtp-password`, `smtp-from`. Optional: `device-name` (filter to a single device), `device-owners-file` (defaults to `device-owners.json`).

**GitHub Secrets** (configured in repo settings): `DEFENDER_REPORT_CLIENT_SECRET`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM`.

Enonic's Azure AD tenant ID and client ID are hardcoded in the workflow — only the secret is stored separately.

## Azure AD API Permissions Required

`Machine.Read.All`, `Vulnerability.Read.All`, `Alert.Read.All`, `SecurityRecommendation.Read.All`, `Software.Read.All`

## Notes

- `@azure/identity` and `@microsoft/microsoft-graph-client` are installed but unused — the Defender API is called directly via `axios`.
- TypeScript strict mode is enabled (`tsconfig.json`).
- `dist/` is intentionally tracked in git (GitHub Actions requirement).
