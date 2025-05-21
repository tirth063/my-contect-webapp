
export type ContactSource = 'gmail' | 'sim' | 'whatsapp' | 'other' | 'csv';

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

export interface LabeledAddress extends Address {
  label?: string; // e.g., "Home", "Work", "Other"
}

export interface Contact {
  id: string;
  name: string;
  phoneNumber: string;
  email?: string;
  alternativeNumbers?: string[];
  groupIds?: string[]; // Changed from familyGroupId
  displayNames?: DisplayName[];
  sources?: ContactSource[];
  avatarUrl?: string;
  notes?: string;
  addresses?: LabeledAddress[]; // Changed from address
}

export interface FamilyGroup {
  id: string;
  name: string;
  parentId?: string; // For hierarchy
  // Members array in FamilyGroup might be less critical if contacts store their groupIds
  // but can be kept for quick lookups if needed. For now, we'll primarily rely on contact.groupIds
  members?: string[]; 
  description?: string;
}

