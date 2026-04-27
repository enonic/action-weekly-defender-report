import { DeviceReport } from './types';
export interface EmailConfig {
    host: string;
    port: number;
    user: string;
    password: string;
    from: string;
}
export declare class EmailSender {
    private config;
    private transporter;
    constructor(config: EmailConfig);
    sendReport(report: DeviceReport, htmlContent: string): Promise<void>;
    verifyConnection(): Promise<boolean>;
}
