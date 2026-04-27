import axios, { AxiosInstance } from 'axios';
import { DefenderDevice, VulnerabilityInfo, SecurityRecommendation, IncidentAlert, SoftwareInventory } from './types';

export class DefenderClient {
  private accessToken: string = '';
  private tokenExpiry: number = 0;
  private axiosInstance: AxiosInstance;

  constructor(
    private tenantId: string,
    private clientId: string,
    private clientSecret: string
  ) {
    this.axiosInstance = axios.create({
      baseURL: 'https://api.securitycenter.microsoft.com/api',
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  private async getAccessToken(): Promise<string> {
    // Check if token is still valid (with 5 minute buffer)
    if (this.accessToken && Date.now() < this.tokenExpiry - 300000) {
      return this.accessToken;
    }

    const tokenUrl = `https://login.microsoftonline.com/${this.tenantId}/oauth2/v2.0/token`;
    const params = new URLSearchParams();
    params.append('client_id', this.clientId);
    params.append('scope', 'https://api.securitycenter.microsoft.com/.default');
    params.append('client_secret', this.clientSecret);
    params.append('grant_type', 'client_credentials');

    try {
      const response = await axios.post(tokenUrl, params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      this.accessToken = response.data.access_token;
      this.tokenExpiry = Date.now() + (response.data.expires_in * 1000);

      return this.accessToken;
    } catch (error) {
      console.error('Failed to get access token:', error);
      throw new Error(`Authentication failed: ${error}`);
    }
  }

  private async makeRequest<T>(endpoint: string, params?: any): Promise<T> {
    const token = await this.getAccessToken();

    try {
      const response = await this.axiosInstance.get<T>(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        params
      });

      return response.data;
    } catch (error: any) {
      console.error(`API request failed for ${endpoint}:`, error.response?.data || error.message);
      throw error;
    }
  }

  async getDeviceByName(deviceName: string): Promise<DefenderDevice | null> {
    try {
      const response = await this.makeRequest<{ value: DefenderDevice[] }>('/machines', {
        $filter: `computerDnsName eq '${deviceName}'`
      });

      if (response.value && response.value.length > 0) {
        return response.value[0];
      }

      return null;
    } catch (error) {
      console.error(`Failed to get device ${deviceName}:`, error);
      return null;
    }
  }

  async getAllDevices(): Promise<DefenderDevice[]> {
    try {
      const response = await this.makeRequest<{ value: DefenderDevice[] }>('/machines');
      return response.value || [];
    } catch (error) {
      console.error('Failed to get all devices:', error);
      return [];
    }
  }

  async getDeviceVulnerabilities(deviceId: string): Promise<VulnerabilityInfo[]> {
    try {
      const response = await this.makeRequest<{ value: VulnerabilityInfo[] }>(
        `/machines/${deviceId}/vulnerabilities`
      );
      return response.value || [];
    } catch (error) {
      console.error(`Failed to get vulnerabilities for device ${deviceId}:`, error);
      return [];
    }
  }

  async getDeviceRecommendations(deviceId: string): Promise<SecurityRecommendation[]> {
    try {
      const response = await this.makeRequest<{ value: SecurityRecommendation[] }>(
        `/machines/${deviceId}/recommendations`
      );
      return response.value || [];
    } catch (error) {
      console.error(`Failed to get recommendations for device ${deviceId}:`, error);
      return [];
    }
  }

  async getDeviceAlerts(deviceId: string): Promise<IncidentAlert[]> {
    try {
      const response = await this.makeRequest<{ value: IncidentAlert[] }>(
        `/machines/${deviceId}/alerts`
      );
      return response.value || [];
    } catch (error) {
      console.error(`Failed to get alerts for device ${deviceId}:`, error);
      return [];
    }
  }

  async getDeviceSoftware(deviceId: string): Promise<SoftwareInventory[]> {
    try {
      const response = await this.makeRequest<{ value: SoftwareInventory[] }>(
        `/machines/${deviceId}/software`
      );
      return response.value || [];
    } catch (error) {
      console.error(`Failed to get software inventory for device ${deviceId}:`, error);
      return [];
    }
  }
}
