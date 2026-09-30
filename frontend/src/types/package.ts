export type PackageStatus = 'draft' | 'published';

export type InclusionCategory = 'spa' | 'activity' | 'dining' | 'transfer';

export interface Property {
  id: number;
  name: string;
  location: string;
  nightly_rate: number;
}

export interface Inclusion {
  id: number;
  name: string;
  category: InclusionCategory;
  price: number;
}

export interface PackageData {
  id: number;
  status: PackageStatus;
  property_id: number | null;
  property: Property | null;
  inclusion_ids: number[];
  inclusions: Inclusion[];
  title: string | null;
  subtitle: string | null;
  description: string | null;
  price: number | null;
  travel_start_date: string | null;
  travel_end_date: string | null;
  current_step: number;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface DraftPayload {
  property_id: number | null;
  inclusion_ids: number[];
  title: string | null;
  subtitle: string | null;
  description: string | null;
  price: number | null;
  travel_start_date: string | null;
  travel_end_date: string | null;
  current_step: number;
}

export type ApiValidationErrors = Record<string, string[]>;
