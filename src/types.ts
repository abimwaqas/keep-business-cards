export interface User {
  id: number;
  email: string;
  is_premium: number;
  scan_count: number;
}

export interface Card {
  id: number;
  user_id: number;
  name: string;
  title: string;
  company: string;
  email: string;
  phone: string;
  website: string;
  address: string;
  notes: string;
  image_url: string;
  created_at: string;
}
