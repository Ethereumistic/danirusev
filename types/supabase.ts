// types/supabase.ts
export interface Profile {
  id: string;
  updated_at: string | null;
  full_name: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  postal_code: string | null;
  country: string | null;
  phone_number: string | null;
}
