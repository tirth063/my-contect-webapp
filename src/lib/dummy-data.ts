import type { Contact, FamilyGroup } from '@/types';

export const DUMMY_FAMILY_GROUPS: FamilyGroup[] = [
  { id: 'fam1', name: 'Parents' },
  { id: 'fam2', name: 'Siblings', parentId: 'fam1' },
  { id: 'fam3', name: 'Cousins' },
  { id: 'friends1', name: 'Close Friends' },
];

export const DUMMY_CONTACTS: Contact[] = [
  {
    id: '1',
    name: 'Alice Wonderland',
    phoneNumber: '123-456-7890',
    email: 'alice@example.com',
    sources: ['gmail', 'whatsapp'],
    familyGroupId: 'fam2',
    avatarUrl: 'https://placehold.co/100x100.png',
    alternativeNumbers: ['111-222-3333'],
    displayNames: [
      { lang: 'en', name: 'Alice W.' },
      { lang: 'hi', name: 'एलिस वंडरलैंड' }
    ],
    notes: 'Met at the tech conference.',
  },
  {
    id: '2',
    name: 'Bob The Builder',
    phoneNumber: '234-567-8901',
    email: 'bob@example.com',
    sources: ['sim'],
    avatarUrl: 'https://placehold.co/100x100.png',
    alternativeNumbers: [],
    notes: 'Childhood friend.',
  },
  {
    id: '3',
    name: 'Charlie Brown',
    phoneNumber: '345-678-9012',
    sources: ['whatsapp'],
    familyGroupId: 'fam3',
    avatarUrl: 'https://placehold.co/100x100.png',
    displayNames: [
      { lang: 'en', name: 'Chuck' },
    ],
    notes: 'Loves playing baseball.',
  },
  {
    id: '4',
    name: 'Diana Prince',
    phoneNumber: '456-789-0123',
    email: 'diana@example.com',
    sources: ['gmail'],
    familyGroupId: 'friends1',
    avatarUrl: 'https://placehold.co/100x100.png',
    notes: 'Works at the museum.',
  },
  {
    id: '5',
    name: 'Edward Scissorhands',
    phoneNumber: '567-890-1234',
    sources: ['other'],
    avatarUrl: 'https://placehold.co/100x100.png',
    alternativeNumbers: ['555-555-5555', '555-555-5556'],
    notes: 'Great at landscaping.',
  },
];
