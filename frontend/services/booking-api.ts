import { apiClient } from './api-client';
import type { DemoBooking } from '@/types';

export interface CreateBookingPayload {
  vehicleId: string;
  customer: string;
  pickup: string;
  returnDate: string;
  totalAmount?: number;
}

export const BookingApi = {
  /**
   * Fetch all bookings
   */
  async getAll(): Promise<DemoBooking[]> {
    const res = await apiClient<{ success: boolean; data: DemoBooking[] }>('/bookings');
    return res.data;
  },

  /**
   * Fetch single booking by ID
   */
  async getById(id: string): Promise<DemoBooking> {
    const res = await apiClient<{ success: boolean; data: DemoBooking }>(`/bookings/${id}`);
    return res.data;
  },

  /**
   * Create a new booking with backend availability validation
   */
  async create(payload: CreateBookingPayload): Promise<DemoBooking> {
    const res = await apiClient<{ success: boolean; data: DemoBooking; message: string }>('/bookings', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return res.data;
  },

  /**
   * Cancel booking by ID
   */
  async cancel(id: string): Promise<void> {
    await apiClient(`/bookings/${id}`, {
      method: 'DELETE',
    });
  },
};
