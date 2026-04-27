import { DeviceReport } from './types';
export declare class ReportGenerator {
    generateHtmlReport(report: DeviceReport): string;
    private escapeHtml;
    private renderIncidents;
    private renderRecommendations;
    private renderVulnerabilities;
    private renderSeverityBadge;
}
