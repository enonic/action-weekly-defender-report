import * as core from '@actions/core';
import * as fs from 'fs';
import * as path from 'path';
import { DefenderClient } from './defender-client';
import { ReportGenerator } from './report-generator';
import { EmailSender } from './email-sender';
import { DeviceOwner, DeviceReport } from './types';

async function run(): Promise<void> {
  try {
    // Get inputs
    const tenantId = core.getInput('tenant-id', { required: true });
    const clientId = core.getInput('client-id', { required: true });
    const clientSecret = core.getInput('client-secret', { required: true });
    const deviceName = core.getInput('device-name');
    const smtpHost = core.getInput('smtp-host', { required: true });
    const smtpPort = parseInt(core.getInput('smtp-port', { required: true }), 10);
    const smtpUser = core.getInput('smtp-user', { required: true });
    const smtpPassword = core.getInput('smtp-password', { required: true });
    const smtpFrom = core.getInput('smtp-from', { required: true });
    const deviceOwnersFile = core.getInput('device-owners-file') || 'device-owners.json';

    console.log('🚀 Starting Weekly Defender Vulnerability Report Action');
    console.log(`📋 Device filter: ${deviceName || 'All devices'}`);

    // Load device owners
    const deviceOwnersPath = path.resolve(process.cwd(), deviceOwnersFile);
    if (!fs.existsSync(deviceOwnersPath)) {
      throw new Error(`Device owners file not found: ${deviceOwnersPath}`);
    }

    const deviceOwners: DeviceOwner[] = JSON.parse(
      fs.readFileSync(deviceOwnersPath, 'utf-8')
    );

    console.log(`📱 Loaded ${deviceOwners.length} device owner(s) from ${deviceOwnersFile}`);

    // Filter device owners if specific device is requested
    let targetDevices = deviceOwners;
    if (deviceName) {
      targetDevices = deviceOwners.filter(
        (owner) => owner.deviceName.toLowerCase() === deviceName.toLowerCase()
      );

      if (targetDevices.length === 0) {
        throw new Error(`Device "${deviceName}" not found in device owners list`);
      }
    }

    console.log(`🎯 Processing ${targetDevices.length} device(s)`);

    // Initialize clients
    const defenderClient = new DefenderClient(tenantId, clientId, clientSecret);
    const reportGenerator = new ReportGenerator();
    const emailSender = new EmailSender({
      host: smtpHost,
      port: smtpPort,
      user: smtpUser,
      password: smtpPassword,
      from: smtpFrom
    });

    // Verify SMTP connection
    console.log('🔌 Verifying SMTP connection...');
    const smtpVerified = await emailSender.verifyConnection();
    if (!smtpVerified) {
      throw new Error('SMTP connection verification failed');
    }

    // Process each device
    let successCount = 0;
    let failureCount = 0;

    for (const deviceOwner of targetDevices) {
      try {
        console.log(`\n📡 Processing device: ${deviceOwner.deviceName}`);

        // Get device from Defender
        const device = await defenderClient.getDeviceByName(deviceOwner.deviceName);

        if (!device) {
          console.warn(`⚠️  Device "${deviceOwner.deviceName}" not found in Microsoft Defender`);
          failureCount++;
          continue;
        }

        console.log(`✅ Found device in Defender: ${device.computerDnsName} (ID: ${device.id})`);

        // Gather all report data in parallel, capturing individual errors
        console.log('📊 Gathering report data...');
        const [incidentsResult, recommendationsResult, vulnerabilitiesResult, softwareResult] = await Promise.allSettled([
          defenderClient.getDeviceAlerts(device.id),
          defenderClient.getDeviceRecommendations(device.id),
          defenderClient.getDeviceVulnerabilities(device.id),
          defenderClient.getDeviceSoftware(device.id)
        ]);

        const incidents       = incidentsResult.status       === 'fulfilled' ? incidentsResult.value       : [];
        const recommendations = recommendationsResult.status === 'fulfilled' ? recommendationsResult.value : [];
        const vulnerabilities = vulnerabilitiesResult.status === 'fulfilled' ? vulnerabilitiesResult.value : [];
        const software        = softwareResult.status        === 'fulfilled' ? softwareResult.value        : [];

        if (incidentsResult.status       === 'rejected') core.warning(`  ⚠️  Failed to fetch alerts for ${deviceOwner.deviceName}: ${incidentsResult.reason}`);
        if (recommendationsResult.status === 'rejected') core.warning(`  ⚠️  Failed to fetch recommendations for ${deviceOwner.deviceName}: ${recommendationsResult.reason}`);
        if (vulnerabilitiesResult.status === 'rejected') core.warning(`  ⚠️  Failed to fetch vulnerabilities for ${deviceOwner.deviceName}: ${vulnerabilitiesResult.reason}`);
        if (softwareResult.status        === 'rejected') core.warning(`  ⚠️  Failed to fetch software inventory for ${deviceOwner.deviceName}: ${softwareResult.reason}`);

        console.log(`  - ${incidents.length} incident(s)/alert(s)`);
        console.log(`  - ${recommendations.length} recommendation(s)`);
        console.log(`  - ${vulnerabilities.length} vulnerabilit(ies)`);
        console.log(`  - ${software.length} software item(s)`);

        // Create report
        const report: DeviceReport = {
          device,
          owner: deviceOwner,
          incidents,
          recommendations,
          vulnerabilities,
          software,
          configurations: []
        };

        // Generate HTML
        console.log('📝 Generating HTML report...');
        const htmlContent = reportGenerator.generateHtmlReport(report);

        // Send email
        console.log(`📧 Sending report to ${deviceOwner.ownerEmail}...`);
        await emailSender.sendReport(report, htmlContent);

        successCount++;
      } catch (error) {
        console.error(`❌ Failed to process device ${deviceOwner.deviceName}:`, error);
        failureCount++;
      }
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Successfully processed: ${successCount} device(s)`);
    console.log(`❌ Failed: ${failureCount} device(s)`);
    console.log('='.repeat(60));

    if (failureCount > 0) {
      core.warning(`${failureCount} device(s) failed to process`);
    }

    if (successCount === 0) {
      core.setFailed('No devices were successfully processed');
    }

    core.setOutput('devices-processed', successCount);
    core.setOutput('devices-failed', failureCount);
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message);
    } else {
      core.setFailed('An unexpected error occurred');
    }
  }
}

run();
