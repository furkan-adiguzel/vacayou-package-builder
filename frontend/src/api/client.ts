import type {
  ApiValidationErrors,
  DraftPayload,
  Inclusion,
  PackageData,
  Property,
} from '../types/package';

interface DataResponse<T> {
  data: T;
}

interface ErrorResponse {
  message?: string;
  errors?: ApiValidationErrors;
}

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly errors: ApiValidationErrors = {},
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as ErrorResponse;
    throw new ApiError(body.message ?? 'Something went wrong. Please try again.', response.status, body.errors);
  }

  return response.json() as Promise<T>;
}

export async function listProperties(search = ''): Promise<Property[]> {
  const params = new URLSearchParams();
  if (search.trim()) params.set('search', search.trim());

  const query = params.size > 0 ? `?${params.toString()}` : '';
  const response = await request<DataResponse<Property[]>>(`/api/properties${query}`);
  return response.data;
}

export async function listInclusions(): Promise<Inclusion[]> {
  const response = await request<DataResponse<Inclusion[]>>('/api/inclusions');
  return response.data;
}

export async function listPackages(): Promise<PackageData[]> {
  const response = await request<DataResponse<PackageData[]>>('/api/packages');
  return response.data;
}

export async function getPackage(id: number): Promise<PackageData> {
  const response = await request<DataResponse<PackageData>>(`/api/packages/${id}`);
  return response.data;
}

export async function createDraft(): Promise<PackageData> {
  const response = await request<DataResponse<PackageData>>('/api/packages', {
    method: 'POST',
    body: JSON.stringify({}),
  });
  return response.data;
}

export async function updateDraft(id: number, payload: DraftPayload): Promise<PackageData> {
  const response = await request<DataResponse<PackageData>>(`/api/packages/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
  return response.data;
}

export async function publishPackage(id: number): Promise<PackageData> {
  const response = await request<DataResponse<PackageData>>(`/api/packages/${id}/publish`, {
    method: 'POST',
    body: JSON.stringify({}),
  });
  return response.data;
}
