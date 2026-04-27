# Setup Instructions

This document provides step-by-step instructions for setting up the Weekly Defender Vulnerability Report Action.

## Prerequisites

- GitHub repository with admin access
- Microsoft Defender for Endpoint access
- Azure AD application with required permissions (already configured)
- SMTP email server credentials

## Required Repository Secrets

Configure these secrets in your GitHub repository:

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret** and add each of the following:

### Microsoft Defender Credentials

| Secret Name | Value | Notes |
|-------------|-------|-------|
| `DEFENDER_REPORT_CLIENT_SECRET` | `<your-client-secret>` | Azure AD application client secret |

### SMTP Email Configuration

| Secret Name | Example Value | Notes |
|-------------|---------------|-------|
| `SMTP_HOST` | `smtp.gmail.com` | Your SMTP server hostname |
| `SMTP_PORT` | `587` | Usually 587 for TLS or 465 for SSL |
| `SMTP_USER` | `reports@enonic.com` | SMTP authentication username |
| `SMTP_PASSWORD` | `<your-password>` | SMTP authentication password |
| `SMTP_FROM` | `security-reports@enonic.com` | Email sender address |

## SMTP Configuration Examples

### Gmail
- Host: `smtp.gmail.com`
- Port: `587`
- User: Your Gmail address
- Password: App-specific password (not your regular password)
- Note: You need to enable "App Passwords" in Google Account settings

### Microsoft 365 / Outlook
- Host: `smtp.office365.com`
- Port: `587`
- User: Your Microsoft 365 email address
- Password: Your account password

### SendGrid
- Host: `smtp.sendgrid.net`
- Port: `587`
- User: `apikey`
- Password: Your SendGrid API key

## Device Configuration

Edit `device-owners.json` to add or update devices and their owners:

```json
[
  {
    "deviceName": "device-hostname",
    "ownerName": "Employee Name",
    "ownerEmail": "employee@enonic.com"
  }
]
```

**Important Notes:**
- The `deviceName` must exactly match the computer DNS name in Microsoft Defender
- Device names are case-sensitive
- After updating, commit and push changes to the repository

## Testing the Action

### Test with a Single Device

1. Go to **Actions** tab in your repository
2. Select **Weekly Defender Vulnerability Report** workflow
3. Click **Run workflow**
4. Enter a device name from your `device-owners.json` file (e.g., `JSI-14in-macbook-pro`)
5. Click **Run workflow** button
6. Monitor the workflow execution
7. Check the recipient's email inbox for the report

### Test with All Devices

1. Go to **Actions** tab
2. Select **Weekly Defender Vulnerability Report** workflow
3. Click **Run workflow**
4. Leave device name empty
5. Click **Run workflow** button
6. Monitor the workflow execution
7. Check that all device owners receive their reports

## Scheduled Execution

The action is configured to run automatically every Monday at 01:00 UTC.

To change the schedule:
1. Edit `.github/workflows/weekly-report.yml`
2. Modify the cron expression:
   ```yaml
   schedule:
     - cron: '0 1 * * 1'  # Minute Hour Day-of-Month Month Day-of-Week
   ```
3. Commit and push changes

### Cron Schedule Examples

- Every Monday at 01:00 UTC: `0 1 * * 1`
- Every day at 09:00 UTC: `0 9 * * *`
- Every Friday at 17:00 UTC: `0 17 * * 5`
- First day of month at 08:00 UTC: `0 8 1 * *`

## Troubleshooting

### Workflow Fails with Authentication Error

**Problem:** "Authentication failed" or "401 Unauthorized"

**Solutions:**
1. Verify `DEFENDER_REPORT_CLIENT_SECRET` is correctly set
2. Check that the Azure AD application permissions are consented
3. Ensure the application is not expired

### Device Not Found

**Problem:** "Device not found in Microsoft Defender"

**Solutions:**
1. Verify the device name in `device-owners.json` exactly matches the Defender portal
2. Check the device is onboarded to Microsoft Defender
3. Confirm the device is active and reporting

### Email Not Sent

**Problem:** "Failed to send email" error

**Solutions:**
1. Verify all SMTP secrets are correctly configured
2. Test SMTP credentials independently
3. Check firewall/network rules allow SMTP connections
4. For Gmail, ensure "App Passwords" is enabled
5. For corporate SMTP, verify authentication method

### No Data in Report

**Problem:** Report shows empty sections

**Solutions:**
1. Check that the Azure AD application has all required permissions
2. Verify permissions are granted with admin consent
3. Ensure the device has been active and scanning in Defender

## Viewing Workflow Logs

1. Go to **Actions** tab
2. Click on a workflow run
3. Click on the **send-reports** job
4. Expand each step to view detailed logs

## Support

For issues or questions:
- Create an issue in this repository
- Check workflow logs for detailed error messages
- Verify all secrets are correctly configured

## Azure AD Permissions Required

The Azure AD application requires these Microsoft Defender API permissions:
- `Machine.Read.All`
- `Vulnerability.Read.All`
- `Alert.Read.All`
- `SecurityRecommendation.Read.All`
- `Software.Read.All`

These should already be configured, but verify if experiencing authentication issues.
