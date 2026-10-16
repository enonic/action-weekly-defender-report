# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A GitHub Action (Node 24 runtime) that fetches vulnerability data from Microsoft Defender for Endpoint and emails a personalized HTML security report to each device owner via SMTP. The workflow in `.github/workflows/weekly-report.yml` runs every Monday 01:00 UTC, or manually via `workflow_dispatch` with an optional `device-name` filter.

## Commands

```bash
npm run build    # Bundle src/ with ncc → dist/index.js (required before committing)
npm run format   # Prettier on src/
npm run lint     # Currently fails: there is no ESLint config file in the repo
npm run test     # Placeholder — no tests exist
```

**Always run `npm run build` before committing source changes.** `dist/index.js` is checked in, and it is the file GitHub Actions runs (`action.yml` → `runs.main`). If you change `src/` without rebuilding, the deployed behavior does not change. Dependency bumps also need a rebuild (see commit "Rebuild dist bundle with axios …").

You can't run the action locally without real Azure AD and SMTP credentials. To test, trigger the workflow manually with a single `device-name`.

## Architecture

`src/index.ts` orchestrates the pipeline:

1. It reads the inputs, loads `device-owners.json`, and optionally filters to one device (case-insensitive match).
2. It verifies the SMTP connection once up front and aborts the whole run if that fails.
3. It processes devices **sequentially**. Each device is wrapped in its own try/catch, so one failure doesn't stop the others:
   - `getDeviceByName` looks the device up in Defender by `computerDnsName`. If the device isn't found, it counts as a failure.
   - Alerts, recommendations and vulnerabilities are fetched with `Promise.allSettled`. If one of these calls fails, the run logs a warning and that report section is empty; the email is still sent.
   - Alerts are filtered client-side to the last 7 days.
   - `configurations` is always `[]` (placeholder).
4. It sets the outputs `devices-processed` and `devices-failed`. The run only fails if **zero** devices succeed.

Modules:
- **`defender-client.ts`** calls the Defender REST API (`https://api.securitycenter.microsoft.com/api`) directly with axios. It gets a client-credentials token from `login.microsoftonline.com` and caches it with a 5-minute refresh buffer.
- **`report-generator.ts`** builds a self-contained HTML email with inline CSS. All dynamic values go through `escapeHtml`, so keep using it for any new fields.
- **`email-sender.ts`** sends mail with nodemailer. It sets `secure: true` only when the port is 465; other ports use STARTTLS.
- **`types.ts`** holds the shared interfaces.

## Configuration

**`device-owners.json`** maps Defender device DNS names to owners. This is the file edited most often (adding or removing people):
```json
[{ "deviceName": "dns-name-in-defender", "ownerName": "Full Name", "ownerEmail": "owner@example.com" }]
```

**Workflow inputs:** the Enonic tenant ID and client ID are hardcoded in the workflow. Secrets are `DEFENDER_REPORT_CLIENT_SECRET` and `SMTP_PASSWORD`. `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER` and `SMTP_FROM` are repository **variables** (`vars.*`), not secrets. README.md and SETUP.md still describe them as secrets.

**Client secret expiry:** the current `DEFENDER_REPORT_CLIENT_SECRET` was created 2026-10-15 and **expires 2027-10-15**. After it expires, every device fails with `Authentication failed: … 401` from `getAccessToken`. Renewal steps are in SETUP.md ("Renewing the Client Secret"). If the date is near or past, tell the user.

**Azure AD app permissions:** `Machine.Read.All`, `Vulnerability.Read.All`, `Alert.Read.All`, `SecurityRecommendation.Read.All`, `Software.Read.All`.

## Notes

- TypeScript strict mode is enabled.
- README.md describes software inventory and device configuration sections that the code no longer fetches or renders.
