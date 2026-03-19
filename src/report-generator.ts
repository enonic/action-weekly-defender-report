import { DeviceReport } from './types';

export class ReportGenerator {
  generateHtmlReport(report: DeviceReport): string {
    const { device, owner, incidents, recommendations, vulnerabilities, software } = report;

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #323130;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f3f2f1;
    }
    .header {
      background: linear-gradient(135deg, #0078d4 0%, #106ebe 100%);
      color: white;
      padding: 30px;
      border-radius: 8px;
      margin-bottom: 30px;
    }
    .header h1 {
      margin: 0 0 10px 0;
      font-size: 28px;
    }
    .header p {
      margin: 5px 0;
      font-size: 16px;
    }
    .section {
      background: white;
      border-radius: 8px;
      padding: 25px;
      margin-bottom: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .section h2 {
      color: #0078d4;
      border-bottom: 2px solid #0078d4;
      padding-bottom: 10px;
      margin-top: 0;
      font-size: 22px;
    }
    .device-overview {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 15px;
      margin-top: 20px;
    }
    .info-card {
      background: #f3f2f1;
      padding: 15px;
      border-radius: 6px;
      border-left: 4px solid #0078d4;
    }
    .info-card .label {
      font-weight: 600;
      color: #605e5c;
      font-size: 13px;
      text-transform: uppercase;
      margin-bottom: 5px;
    }
    .info-card .value {
      font-size: 16px;
      color: #323130;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 15px;
    }
    th {
      background-color: #f3f2f1;
      color: #323130;
      font-weight: 600;
      text-align: left;
      padding: 12px;
      border-bottom: 2px solid #d2d0ce;
    }
    td {
      padding: 12px;
      border-bottom: 1px solid #edebe9;
    }
    tr:hover {
      background-color: #faf9f8;
    }
    .severity-critical {
      background-color: #d13438;
      color: white;
      padding: 4px 12px;
      border-radius: 4px;
      font-weight: 600;
      display: inline-block;
      font-size: 12px;
    }
    .severity-high {
      background-color: #e81123;
      color: white;
      padding: 4px 12px;
      border-radius: 4px;
      font-weight: 600;
      display: inline-block;
      font-size: 12px;
    }
    .severity-medium {
      background-color: #ff8c00;
      color: white;
      padding: 4px 12px;
      border-radius: 4px;
      font-weight: 600;
      display: inline-block;
      font-size: 12px;
    }
    .severity-low {
      background-color: #ffb900;
      color: #323130;
      padding: 4px 12px;
      border-radius: 4px;
      font-weight: 600;
      display: inline-block;
      font-size: 12px;
    }
    .severity-informational {
      background-color: #0078d4;
      color: white;
      padding: 4px 12px;
      border-radius: 4px;
      font-weight: 600;
      display: inline-block;
      font-size: 12px;
    }
    .status-active {
      color: #d13438;
      font-weight: 600;
    }
    .status-resolved {
      color: #107c10;
      font-weight: 600;
    }
    .status-in-progress {
      color: #ff8c00;
      font-weight: 600;
    }
    .empty-state {
      text-align: center;
      padding: 40px;
      color: #605e5c;
      font-style: italic;
    }
    .footer {
      text-align: center;
      margin-top: 30px;
      padding: 20px;
      color: #605e5c;
      font-size: 14px;
    }
    .badge {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
      margin-right: 5px;
    }
    .badge-danger {
      background-color: #fde7e9;
      color: #d13438;
    }
    .badge-warning {
      background-color: #fff4ce;
      color: #8a8886;
    }
    .badge-success {
      background-color: #dff6dd;
      color: #107c10;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>🛡️ Weekly Security Report</h1>
    <p><strong>Device:</strong> ${this.escapeHtml(device.computerDnsName)}</p>
    <p><strong>Owner:</strong> ${this.escapeHtml(owner.ownerName)} (${this.escapeHtml(owner.ownerEmail)})</p>
    <p><strong>Report Date:</strong> ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
  </div>

  <div class="section">
    <h2>📊 Overview</h2>
    <div class="device-overview">
      <div class="info-card">
        <div class="label">Platform</div>
        <div class="value">${this.escapeHtml(device.osPlatform || 'N/A')}</div>
      </div>
      <div class="info-card">
        <div class="label">OS Version</div>
        <div class="value">${this.escapeHtml(device.osVersion || 'N/A')}</div>
      </div>
      <div class="info-card">
        <div class="label">Health Status</div>
        <div class="value">${this.escapeHtml(device.healthStatus || 'N/A')}</div>
      </div>
      <div class="info-card">
        <div class="label">Risk Score</div>
        <div class="value">${this.escapeHtml(device.riskScore || 'N/A')}</div>
      </div>
      <div class="info-card">
        <div class="label">Exposure Level</div>
        <div class="value">${this.escapeHtml(device.exposureLevel || 'N/A')}</div>
      </div>
      <div class="info-card">
        <div class="label">Last Seen</div>
        <div class="value">${device.lastSeen ? new Date(device.lastSeen).toLocaleString() : 'N/A'}</div>
      </div>
    </div>
  </div>

  <div class="section">
    <h2>🚨 Incidents and Alerts</h2>
    ${this.renderIncidents(incidents)}
  </div>

  <div class="section">
    <h2>💡 Security Recommendations</h2>
    ${this.renderRecommendations(recommendations)}
  </div>

  <div class="section">
    <h2>📦 Software Inventory</h2>
    ${this.renderSoftware(software)}
  </div>

  <div class="section">
    <h2>🔍 Discovered Vulnerabilities</h2>
    ${this.renderVulnerabilities(vulnerabilities)}
  </div>

  <div class="footer">
    <p>This is an automated report generated by Microsoft Defender for Endpoint.</p>
    <p>For more information, visit the <a href="https://security.microsoft.com/">Microsoft Defender Security Center</a>.</p>
  </div>
</body>
</html>
    `;
  }

  private escapeHtml(text: string): string {
    const map: { [key: string]: string } = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
  }

  private renderIncidents(incidents: any[]): string {
    if (!incidents || incidents.length === 0) {
      return '<div class="empty-state">✅ No active incidents or alerts</div>';
    }

    return `
      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Severity</th>
            <th>Status</th>
            <th>Created</th>
            <th>Last Updated</th>
          </tr>
        </thead>
        <tbody>
          ${incidents.map(incident => `
            <tr>
              <td>${this.escapeHtml(incident.title || incident.alertName || 'N/A')}</td>
              <td>${this.renderSeverityBadge(incident.severity)}</td>
              <td class="status-${(incident.status || '').toLowerCase().replace(' ', '-')}">${this.escapeHtml(incident.status || 'N/A')}</td>
              <td>${incident.createdTime ? new Date(incident.createdTime).toLocaleDateString() : 'N/A'}</td>
              <td>${incident.lastUpdateTime ? new Date(incident.lastUpdateTime).toLocaleDateString() : 'N/A'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  }

  private renderRecommendations(recommendations: any[]): string {
    if (!recommendations || recommendations.length === 0) {
      return '<div class="empty-state">✅ No security recommendations</div>';
    }

    return `
      <table>
        <thead>
          <tr>
            <th>Product</th>
            <th>Recommendation</th>
            <th>Category</th>
            <th>Weaknesses</th>
            <th>Vendor</th>
          </tr>
        </thead>
        <tbody>
          ${recommendations.map(rec => `
            <tr>
              <td>${this.escapeHtml(rec.productName || 'N/A')}</td>
              <td>${this.escapeHtml(rec.recommendationName || rec.recommendation || 'N/A')}</td>
              <td>${this.escapeHtml(rec.recommendationCategory || 'N/A')}</td>
              <td>
                ${rec.weaknesses > 0 ? `<span class="badge badge-danger">${rec.weaknesses}</span>` : '<span class="badge badge-success">0</span>'}
              </td>
              <td>${this.escapeHtml(rec.vendor || 'N/A')}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  }

  private renderSoftware(software: any[]): string {
    if (!software || software.length === 0) {
      return '<div class="empty-state">No software inventory available</div>';
    }

    return `
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Vendor</th>
            <th>Version</th>
            <th>Weaknesses</th>
          </tr>
        </thead>
        <tbody>
          ${software.slice(0, 50).map(sw => `
            <tr>
              <td>${this.escapeHtml(sw.name || 'N/A')}</td>
              <td>${this.escapeHtml(sw.vendor || 'N/A')}</td>
              <td>${this.escapeHtml(sw.version || 'N/A')}</td>
              <td>
                ${sw.numberOfWeaknesses > 0 ? `<span class="badge badge-danger">${sw.numberOfWeaknesses}</span>` : '<span class="badge badge-success">0</span>'}
              </td>
            </tr>
          `).join('')}
          ${software.length > 50 ? `<tr><td colspan="4" style="text-align: center; font-style: italic; color: #605e5c;">... and ${software.length - 50} more items</td></tr>` : ''}
        </tbody>
      </table>
    `;
  }

  private renderVulnerabilities(vulnerabilities: any[]): string {
    if (!vulnerabilities || vulnerabilities.length === 0) {
      return '<div class="empty-state">✅ No vulnerabilities discovered</div>';
    }

    return `
      <table>
        <thead>
          <tr>
            <th>Vulnerability</th>
            <th>Severity</th>
            <th>CVSS Score</th>
            <th>Description</th>
            <th>Published</th>
          </tr>
        </thead>
        <tbody>
          ${vulnerabilities.map(vuln => `
            <tr>
              <td><strong>${this.escapeHtml(vuln.name || vuln.id || 'N/A')}</strong></td>
              <td>${this.renderSeverityBadge(vuln.severity)}</td>
              <td>${vuln.cvssScore || vuln.cvssV3 || 'N/A'}</td>
              <td>${this.escapeHtml((vuln.description || '').substring(0, 100))}${(vuln.description || '').length > 100 ? '...' : ''}</td>
              <td>${vuln.publishedOn ? new Date(vuln.publishedOn).toLocaleDateString() : 'N/A'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  }

  private renderSeverityBadge(severity: string): string {
    const sev = (severity || 'Informational').toLowerCase();
    return `<span class="severity-${sev}">${this.escapeHtml(severity || 'Informational')}</span>`;
  }
}
