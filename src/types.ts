export interface DeviceOwner {
  deviceName: string;
  ownerName: string;
  ownerEmail: string;
}

export interface DefenderDevice {
  id: string;
  computerDnsName: string;
  osPlatform: string;
  osVersion: string;
  lastSeen: string;
  healthStatus: string;
  riskScore: string;
  exposureLevel: string;
}

export interface VulnerabilityInfo {
  id: string;
  name: string;
  description: string;
  severity: string;
  cvssScore?: number;
  publishedOn?: string;
  updatedOn?: string;
}

export interface SecurityRecommendation {
  id: string;
  productName: string;
  recommendationName: string;
  weaknesses: number;
  vendor: string;
  recommendedVersion?: string;
  recommendationCategory: string;
}

export interface IncidentAlert {
  id: string;
  title: string;
  severity: string;
  status: string;
  classification?: string;
  determination?: string;
  assignedTo?: string;
  createdTime: string;
  lastUpdateTime: string;
}

export interface SoftwareInventory {
  id: string;
  name: string;
  vendor: string;
  version: string;
  numberOfWeaknesses: number;
  installedOn?: string;
}

export interface DeviceReport {
  device: DefenderDevice;
  owner: DeviceOwner;
  incidents: IncidentAlert[];
  recommendations: SecurityRecommendation[];
  vulnerabilities: VulnerabilityInfo[];
  software: SoftwareInventory[];
  configurations?: any[];
}
