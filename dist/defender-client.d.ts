import { DefenderDevice, VulnerabilityInfo, SecurityRecommendation, IncidentAlert, SoftwareInventory } from './types';
export declare class DefenderClient {
    private tenantId;
    private clientId;
    private clientSecret;
    private accessToken;
    private tokenExpiry;
    private axiosInstance;
    constructor(tenantId: string, clientId: string, clientSecret: string);
    private getAccessToken;
    private makeRequest;
    getDeviceByName(deviceName: string): Promise<DefenderDevice | null>;
    getAllDevices(): Promise<DefenderDevice[]>;
    getDeviceVulnerabilities(deviceId: string): Promise<VulnerabilityInfo[]>;
    getDeviceRecommendations(deviceId: string): Promise<SecurityRecommendation[]>;
    getDeviceAlerts(deviceId: string): Promise<IncidentAlert[]>;
    getDeviceSoftware(deviceId: string): Promise<SoftwareInventory[]>;
}
