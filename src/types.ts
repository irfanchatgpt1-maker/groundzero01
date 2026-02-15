export enum UserRole {
  ADMIN = 'ADMIN',
  CAMP_MANAGER = 'CAMP_MANAGER',
  VOLUNTEER = 'VOLUNTEER',
}

export interface Camp {
  id: string;
  name: string;
  location: string;
  occupancy: number;
  capacity: number;
  status: string;
  lead: string;
}

export interface Volunteer {
  id: string;
  name: string;
  skills: string[];
  status: string;
  zone: string;
  hours: number;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  minThreshold: number;
}

export interface ResourceRequest {
  id: string;
  requester: string;
  role: string;
  resource: string;
  quantity: string;
  urgency: string;
  status: string;
  eta: string;
}
