
import type { Contact, FamilyGroup } from '@/types';

export const DUMMY_FAMILY_GROUPS: FamilyGroup[] = [
  { id: 'fam1', name: 'Parents' },
  { id: 'fam2', name: 'Siblings', parentId: 'fam1' },
  { id: 'fam3', name: 'Cousins' },
  { id: 'friends1', name: 'Close Friends' },
  { id: 'colleagues', name: 'Colleagues' },
  { id: 'clubX', name: 'Book Club', parentId: 'friends1' },
];

export const DUMMY_CONTACTS: Contact[] = [
  {
    id: '1',
    name: 'Alice Wonderland',
    phoneNumber: '123-456-7890',
    email: 'alice@example.com',
    sources: ['gmail', 'whatsapp'],
    groupIds: ['fam2', 'friends1'], // Alice is a Sibling and a Close Friend
    avatarUrl: 'https://placehold.co/100x100.png',
    alternativeNumbers: ['111-222-3333'],
    displayNames: [
      { lang: 'en', name: 'Alice W.' },
      { lang: 'hi', name: 'एलिस वंडरलैंड' }
    ],
    notes: 'Met at the tech conference.',
    addresses: [
      {
        label: 'Home',
        street: '123 Main St',
        city: 'Anysville',
        state: 'CA',
        zip: '90210',
        country: 'USA',
      },
      {
        label: 'Work',
        street: '456 Business Rd',
        city: 'Workville',
        state: 'CA',
        zip: '90211',
        country: 'USA',
      }
    ]
  },
  {
    id: '2',
    name: 'Bob The Builder',
    phoneNumber: '234-567-8901',
    email: 'bob@example.com',
    sources: ['sim'],
    groupIds: ['colleagues'],
    avatarUrl: 'https://placehold.co/100x100.png',
    alternativeNumbers: [],
    notes: 'Childhood friend.',
     addresses: [{
      label: 'Main',
      street: '456 Oak Ave',
      city: 'Builderton',
      state: 'TX',
      zip: '73301',
      country: 'USA',
    }]
  },
  {
    id: '3',
    name: 'Charlie Brown',
    phoneNumber: '345-678-9012',
    sources: ['whatsapp'],
    groupIds: ['fam3', 'friends1', 'clubX'],
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
    groupIds: ['friends1'],
    avatarUrl: 'https://placehold.co/100x100.png',
    notes: 'Works at the museum.',
    addresses: [{
      label: 'Island Home',
      city: 'Themyscira',
      country: 'Paradise Island'
    }]
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

