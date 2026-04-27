import nodemailer from 'nodemailer';
import { DeviceReport } from './types';

export interface EmailConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  from: string;
}

export class EmailSender {
  private transporter: nodemailer.Transporter;

  constructor(private config: EmailConfig) {
    this.transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.port === 465,
      auth: {
        user: config.user,
        pass: config.password
      }
    });
  }

  async sendReport(report: DeviceReport, htmlContent: string): Promise<void> {
    const subject = `Weekly Security Report for ${report.device.computerDnsName} - ${new Date().toLocaleDateString()}`;

    const vulnerabilityCount = report.vulnerabilities.length;
    const alertCount = report.incidents.length;
    const recommendationCount = report.recommendations.length;

    let summaryText = `Weekly Security Report for ${report.device.computerDnsName}\n\n`;
    summaryText += `Owner: ${report.owner.ownerName}\n`;
    summaryText += `Report Date: ${new Date().toLocaleDateString()}\n\n`;
    summaryText += `Summary:\n`;
    summaryText += `- ${alertCount} active incident(s) and alert(s)\n`;
    summaryText += `- ${vulnerabilityCount} discovered vulnerabilit(ies)\n`;
    summaryText += `- ${recommendationCount} security recommendation(s)\n\n`;
    summaryText += `Please see the HTML version of this email for detailed information.\n`;

    try {
      await this.transporter.sendMail({
        from: this.config.from,
        to: report.owner.ownerEmail,
        subject: subject,
        text: summaryText,
        html: htmlContent
      });

      console.log(`✅ Report sent successfully to ${report.owner.ownerEmail}`);
    } catch (error) {
      console.error(`❌ Failed to send email to ${report.owner.ownerEmail}:`, error);
      throw error;
    }
  }

  async verifyConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      console.log('✅ SMTP connection verified');
      return true;
    } catch (error) {
      console.error('❌ SMTP connection failed:', error);
      return false;
    }
  }
}
