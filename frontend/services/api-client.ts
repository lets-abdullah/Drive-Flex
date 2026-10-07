const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

export class ApiError extends Error {
  code?: string;
  status: number;
  existingBooking?: {
    customer?: string;
    pickup?: string;
    returnDate?: string;
  };

  constructor(message: string, status: number, code?: string, existingBooking?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.existingBooking = existingBooking;
  }
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
  };

  const response = await fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  });

  let data: any = null;
  try {
    data = await response.json();
  } catch {
    // Non-JSON response
  }

  if (!response.ok) {
    const message = data?.message || `Request failed with status ${response.status}`;
    const code = data?.code;
    const existingBooking = data?.existingBooking;
    throw new ApiError(message, response.status, code, existingBooking);
  }

  return data;
}
