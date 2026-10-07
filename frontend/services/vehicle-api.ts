import { apiClient } from './api-client';
import type { Vehicle } from '@/types';

export interface VehicleStatusResponse {
  vehicleId: string;
  status: 'available' | 'booked';
  bookable: boolean;
  currentBooking: {
    id: string;
    customer: string;
    pickup: string;
    returnDate: string;
    status: string;
  } | null;
}

export const VehicleApi = {
  /**
   * Fetch all vehicles with live availability status from backend
   */
  async getAll(): Promise<Vehicle[]> {
    const res = await apiClient<{ success: boolean; data: Vehicle[] }>('/vehicles');
    return res.data;
  },

  /**
   * Fetch vehicle by ID or slug with booking status
   */
  async getByIdOrSlug(idOrSlug: string): Promise<Vehicle> {
    const res = await apiClient<{ success: boolean; data: Vehicle }>(`/vehicles/${idOrSlug}`);
    return res.data;
  },

  /**
   * Fetch live availability status of a vehicle
   */
  async getStatus(id: string): Promise<VehicleStatusResponse> {
    const res = await apiClient<{ success: boolean; data: VehicleStatusResponse }>(`/vehicles/${id}/status`);
    return res.data;
  },
};
