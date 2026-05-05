export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Part {
  id: string;
  name: string;
  sku: string;
  category: string;
  brand: string;
  compatibility: string[];
  quantity: number;
  minQuantity: number;
  price: number;
  marketPrices?: {
    min: number;
    avg: number;
    max: number;
    bestProvider: string;
    lastUpdated: string;
  };
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export type OSStatus = 'open' | 'in-progress' | 'completed' | 'cancelled';

export interface ServiceOrder {
  id: string;
  customerId?: string;
  customerName: string;
  vehicleInfo: string;
  status: OSStatus;
  parts: {
    partId: string;
    name: string;
    quantity: number;
    unitPrice: number;
  }[];
  laborCost: number;
  totalCost: number;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface Movement {
  id: string;
  partId: string;
  userId: string;
  type: 'in' | 'out';
  quantity: number;
  osId?: string;
  timestamp: string;
}

export type AppointmentStatus = 'scheduled' | 'confirmed' | 'completed' | 'cancelled';

export interface Appointment {
  id: string;
  customerId?: string;
  customerName: string;
  vehicleInfo: string;
  serviceType: string;
  dateTime: string;
  status: AppointmentStatus;
}
