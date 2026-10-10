const getBaseUrl = () => {
  const envUrl = process.env.NEXT_PUBLIC_API_URL;
  // If envUrl is undefined, empty, or points to local Express port 5001 (which may not be running),
  // seamlessly use internal Next.js relative /api route so browser fetches always succeed!
  if (!envUrl || envUrl.includes('localhost:5001')) {
    return typeof window !== 'undefined' ? '/api' : 'http://localhost:3000/api';
  }
  return envUrl;
};

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
  const baseUrl = getBaseUrl();
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${baseUrl}${cleanEndpoint}`;

  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
  };

  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    });
  } catch (fetchErr) {
    // If the configured URL failed (e.g. port 5001 connection refused), fallback to internal Next.js /api
    if (!url.startsWith('/api') && typeof window !== 'undefined') {
      try {
        response = await fetch(`/api${cleanEndpoint}`, {
          ...options,
          headers: {
            ...defaultHeaders,
            ...options.headers,
          },
        });
      } catch {
        throw fetchErr;
      }
    } else {
      throw fetchErr;
    }
  }

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
