
export type ContactSource = 'gmail' | 'sim' | 'whatsapp' | 'other';

export interface DisplayName {
  lang: 'en' | 'gu' | 'hi';
  name: string;
}

export interface Address {
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
}

export interface Contact {
  id: string;
  name: string;
  phoneNumber: string;
  email?: string;
  alternativeNumbers?: string[];
  familyGroupId?: string;
  displayNames?: DisplayName[];
  sources?: ContactSource[];
  avatarUrl?: string;
  notes?: string;
  address?: Address;
}

export interface FamilyGroup {
  id: string;
  name: string;
  parentId?: string; // For hierarchy
  members?: string[]; // Array of contact IDs
  description?: string;
}
