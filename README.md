# Weekly Defender Vulnerability Report Action

A GitHub Action that automatically sends weekly vulnerability reports from Microsoft Defender for Endpoint to device owners via email.

## Overview

This action connects to Microsoft Defender for Endpoint, retrieves security information for registered devices, and sends personalized HTML email reports to each device owner. The reports include:

- **Overview**: Device details, health status, risk score, exposure level
- **Incidents and Alerts**: Active security incidents and alerts
- **Security Recommendations**: Recommended actions to improve security
- **Software Inventory**: Installed software and associated weaknesses
- **Discovered Vulnerabilities**: Known vulnerabilities affecting the device
- **Device Configuration**: Security configuration status (when available)

## Features

- 🕐 **Scheduled Execution**: Automatically runs every Monday at 01:00 UTC
- 🎯 **Manual Execution**: Can be triggered manually with optional device filtering
- 📧 **HTML Email Reports**: Professional, styled reports similar to the Defender portal
- 🔒 **Secure Authentication**: Uses Azure AD client credentials for API access
- 📝 **Easy Device Management**: Device-owner mappings in a simple JSON file
- ⚡ **Parallel Processing**: Efficiently processes multiple devices

## Setup

### 1. Repository Secrets

Configure the following secrets in your GitHub repository:

- `DEFENDER_REPORT_CLIENT_SECRET`: Azure AD application client secret
- `SMTP_HOST`: SMTP server hostname (e.g., `smtp.gmail.com`)
- `SMTP_PORT`: SMTP server port (e.g., `587` for TLS, `465` for SSL)
- `SMTP_USER`: SMTP username
- `SMTP_PASSWORD`: SMTP password
- `SMTP_FROM`: Email sender address (e.g., `security-reports@enonic.com`)

### 2. Device Owners Configuration

Edit the `device-owners.json` file to add or remove devices and their owners:

```json
[
  {
    "deviceName": "JSI-14in-macbook-pro",
    "ownerName": "Jørgen Koren Sivesind",
    "ownerEmail": "jsi@enonic.com"
  },
  {
    "deviceName": "dhumon",
    "ownerName": "Daniel Huluka",
    "ownerEmail": "dhu@enonic.com"
  }
]
```

**Note**: The `deviceName` must match the computer DNS name as it appears in Microsoft Defender.

### 3. Microsoft Defender Configuration

This action is pre-configured with Enonic's Defender credentials:

- **Tenant ID**: `391eb9f6-3a99-4286-ae83-9ab26ad79c7f`
- **Client ID**: `2751bf1a-e192-49c1-b4b5-c18806e973dc`

The Azure AD application requires the following permissions:
- `Machine.Read.All` - Read all machine profiles
- `Vulnerability.Read.All` - Read vulnerability information
- `Alert.Read.All` - Read alert information
- `SecurityRecommendation.Read.All` - Read security recommendations
- `Software.Read.All` - Read software inventory

## Usage

### Scheduled Execution

The action runs automatically every Monday at 01:00 UTC and processes all devices in the `device-owners.json` file.

### Manual Execution

1. Go to the "Actions" tab in your GitHub repository
2. Select "Weekly Defender Vulnerability Report" workflow
3. Click "Run workflow"
4. Optionally enter a specific device name to process only that device
5. Click "Run workflow" button

### Using as a Composite Action

You can also use this action in other workflows:

```yaml
- name: Send Defender Reports
  uses: enonic/action-weekly-defender-report@main
  with:
    tenant-id: '391eb9f6-3a99-4286-ae83-9ab26ad79c7f'
    client-id: '2751bf1a-e192-49c1-b4b5-c18806e973dc'
    client-secret: ${{ secrets.DEFENDER_REPORT_CLIENT_SECRET }}
    device-name: ''  # Empty for all devices, or specify a device name
    smtp-host: ${{ secrets.SMTP_HOST }}
    smtp-port: ${{ secrets.SMTP_PORT }}
    smtp-user: ${{ secrets.SMTP_USER }}
    smtp-password: ${{ secrets.SMTP_PASSWORD }}
    smtp-from: ${{ secrets.SMTP_FROM }}
    device-owners-file: 'device-owners.json'
```

## Inputs

| Input | Description | Required | Default |
|-------|-------------|----------|---------|
| `tenant-id` | Azure AD Tenant ID | Yes | - |
| `client-id` | Azure AD Application (Client) ID | Yes | - |
| `client-secret` | Azure AD Client Secret | Yes | - |
| `device-name` | Specific device to process (empty for all) | No | `''` |
| `smtp-host` | SMTP server hostname | Yes | - |
| `smtp-port` | SMTP server port | Yes | `587` |
| `smtp-user` | SMTP username | Yes | - |
| `smtp-password` | SMTP password | Yes | - |
| `smtp-from` | Email sender address | Yes | - |
| `device-owners-file` | Path to device owners JSON file | No | `device-owners.json` |

## Outputs

| Output | Description |
|--------|-------------|
| `devices-processed` | Number of devices successfully processed |
| `devices-failed` | Number of devices that failed to process |

## Report Contents

Each email report includes:

### Overview Section
- Platform and OS version
- Health status
- Risk score and exposure level
- Last seen timestamp

### Incidents and Alerts
- Alert title and severity
- Current status
- Creation and update timestamps

### Security Recommendations
- Product name and vendor
- Recommendation details
- Number of weaknesses
- Recommended versions

### Software Inventory
- Installed software list
- Version information
- Associated vulnerabilities

### Discovered Vulnerabilities
- Vulnerability names (CVE IDs)
- Severity levels
- CVSS scores
- Descriptions and publication dates

## Development

### Building the Action

```bash
npm install
npm run build
```

The build process uses `@vercel/ncc` to compile the TypeScript code and dependencies into a single `dist/index.js` file.

### Project Structure

```
.
├── src/
│   ├── index.ts              # Main entry point
│   ├── defender-client.ts    # Microsoft Defender API client
│   ├── report-generator.ts   # HTML report generation
│   ├── email-sender.ts       # Email sending functionality
│   └── types.ts              # TypeScript interfaces
├── .github/workflows/
│   └── weekly-report.yml     # Workflow definition
├── device-owners.json        # Device-owner mapping
├── action.yml                # Action metadata
├── package.json              # Dependencies
└── tsconfig.json             # TypeScript configuration
```

## Troubleshooting

### Device Not Found
If a device is not found in Microsoft Defender, ensure:
- The device name in `device-owners.json` matches exactly (case-sensitive)
- The device is onboarded to Microsoft Defender
- The Azure AD application has proper permissions

### Email Delivery Issues
- Verify SMTP credentials are correct
- Check that the SMTP port is correct (587 for TLS, 465 for SSL)
- Ensure firewall rules allow outbound SMTP connections
- Some SMTP servers require "less secure app access" to be enabled

### API Authentication Errors
- Verify the tenant ID, client ID, and client secret
- Ensure the Azure AD application has consented to required permissions
- Check that the application is not expired

## License

Apache-2.0

## Support

For issues or questions, please open an issue in this repository.
