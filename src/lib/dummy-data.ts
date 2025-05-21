
import type { Contact, FamilyGroup } from '@/types';

export const DUMMY_FAMILY_GROUPS: FamilyGroup[] = [
  // Top Level Society
  { id: 'patel-society', name: 'Patel Society', description: 'Main community group' },

  // Savani Family Hierarchy
  { id: 'savani-family', name: 'Savani Parivar', parentId: 'patel-society', description: 'Savani kutumb members' },
  { id: 'savani-bhavnagar', name: 'Savani - Bhavnagar Branch', parentId: 'savani-family', description: 'Immediate family in Bhavnagar' },
  { id: 'savani-nanasurka', name: 'Savani - Nanasurka Village', parentId: 'savani-family', description: 'Relatives from Nanasurka' },
  { id: 'savani-elders', name: 'Savani Elders', parentId: 'savani-family', description: 'Uncles, Aunts from Savani side' },
  { id: 'savani-cousins', name: 'Savani Cousins', parentId: 'savani-family', description: 'Cousins from Savani side' },

  // Golakiya Family Hierarchy
  { id: 'golakiya-family', name: 'Golakiya Parivar', parentId: 'patel-society', description: 'Golakiya kutumb members' },
  { id: 'golakiya-immediate', name: 'Golakiya - Immediate Circle', parentId: 'golakiya-family', description: 'Close family members' },
  { id: 'golakiya-relatives', name: 'Golakiya Relatives', parentId: 'golakiya-family', description: 'Extended family' },

  // Soni Family Hierarchy
  { id: 'soni-family', name: 'Soni Parivar', parentId: 'patel-society', description: 'Soni kutumb members' },
  { id: 'soni-main', name: 'Soni - Main Household', parentId: 'soni-family' },

  // Friends Groups
  { id: 'friends-main', name: 'Friends Circle', description: 'General friends group' },
  { id: 'friends-college', name: 'College Buddies', parentId: 'friends-main', description: 'Friends from engineering college' },
  { id: 'friends-childhood', name: 'Childhood Friends', parentId: 'friends-main' },

  // Professional Groups
  { id: 'prof-network', name: 'Professional Network', description: 'Work and career related contacts' },
  { id: 'prof-colleagues', name: 'Work Colleagues - Tech Solutions Inc.', parentId: 'prof-network' },
  { id: 'prof-teachers-school', name: 'School Teachers (VKM High)', parentId: 'prof-network' },
  { id: 'prof-professors-college', name: 'College Professors (NIT Surat)', parentId: 'prof-network' },
  { id: 'clients-customers', name: 'Clients & Customers', parentId: 'prof-network', description: 'Business clients' },
  
  // Other general groups
  { id: 'club-sports', name: 'Sports Club Members' },
];

export const DUMMY_CONTACTS: Contact[] = [
  // Savani Family Contacts
  {
    id: 'contact-ramesh-savani',
    name: 'Rameshbhai Savani',
    phoneNumber: '9825011111',
    email: 'ramesh.savani@example.in',
    sources: ['sim', 'whatsapp'],
    groupIds: ['savani-family', 'savani-bhavnagar', 'patel-society'],
    avatarUrl: 'https://placehold.co/100x100.png',
    notes: 'Head of Bhavnagar Savani family. Retired businessman.',
    addresses: [
      { label: 'Home (Bhavnagar)', street: '101, Diamond Chowk', city: 'Bhavnagar', state: 'Gujarat', zip: '364001', country: 'India' }
    ],
    displayNames: [{ lang: 'gu', name: 'રમેશભાઈ સવાણી' }]
  },
  {
    id: 'contact-nita-savani',
    name: 'Nitaben Savani',
    phoneNumber: '9825011112',
    groupIds: ['savani-family', 'savani-bhavnagar', 'patel-society'],
    avatarUrl: 'https://placehold.co/100x100.png',
    notes: 'Rameshbhai\'s wife.',
    addresses: [
      { label: 'Home (Bhavnagar)', street: '101, Diamond Chowk', city: 'Bhavnagar', state: 'Gujarat', zip: '364001', country: 'India' }
    ]
  },
  {
    id: 'contact-mukesh-savani',
    name: 'Mukesh Savani',
    phoneNumber: '9925022222',
    email: 'mukesh.s@example.in',
    sources: ['gmail', 'whatsapp'],
    groupIds: ['savani-family', 'savani-nanasurka', 'patel-society', 'savani-elders'],
    avatarUrl: 'https://placehold.co/100x100.png',
    notes: 'Lives in Nanasurka village. Farmer.',
    addresses: [
      { label: 'Home (Nanasurka)', street: 'Savani Faliyu', city: 'Nanasurka', state: 'Gujarat', zip: '364060', country: 'India' }
    ]
  },
  {
    id: 'contact-priya-savani',
    name: 'Priya Savani',
    phoneNumber: '9727033333',
    email: 'priya.savani.doc@example.in',
    sources: ['gmail'],
    groupIds: ['savani-family', 'savani-bhavnagar', 'patel-society', 'prof-network'],
    avatarUrl: 'https://placehold.co/100x100.png',
    notes: 'Doctor (Pediatrician). Rameshbhai\'s daughter.',
    addresses: [
      { label: 'Clinic', street: 'Aashirwad Clinic, Waghawadi Road', city: 'Bhavnagar', state: 'Gujarat', zip: '364002', country: 'India' },
      { label: 'Home (Bhavnagar)', street: '101, Diamond Chowk', city: 'Bhavnagar', state: 'Gujarat', zip: '364001', country: 'India' }
    ],
    displayNames: [{ lang: 'gu', name: 'પ્રિયા સવાણી' }]
  },
  {
    id: 'contact-rahul-savani',
    name: 'Rahul Savani',
    phoneNumber: '9624044444',
    email: 'rahul.s.eng@example.in',
    sources: ['whatsapp'],
    groupIds: ['savani-family', 'savani-bhavnagar', 'patel-society', 'prof-network', 'friends-college'],
    avatarUrl: 'https://placehold.co/100x100.png',
    notes: 'Software Engineer at Tech Solutions Inc. Rameshbhai\'s son.',
    addresses: [
      { label: 'Work', street: '5th Floor, Tech Park', city: 'Ahmedabad', state: 'Gujarat', zip: '380015', country: 'India' },
      { label: 'Current Apt (Ahmedabad)', street: 'B-303, Skyview Heights', city: 'Ahmedabad', state: 'Gujarat', zip: '380058', country: 'India'}
    ],
    alternativeNumbers: ['8800544444']
  },
  {
    id: 'contact-aarav-savani',
    name: 'Aarav Savani',
    phoneNumber: '9586055555',
    groupIds: ['savani-family', 'savani-nanasurka', 'savani-cousins', 'patel-society', 'friends-childhood'],
    avatarUrl: 'https://placehold.co/100x100.png',
    notes: 'Mukeshbhai\'s son. Studying in college.',
    addresses: [
      { label: 'Hostel', street: 'Room 12, Boys Hostel', city: 'Rajkot', state: 'Gujarat', zip: '360005', country: 'India' }
    ]
  },

  // Golakiya Family Contacts
  {
    id: 'contact-ashok-golakiya',
    name: 'Ashokbhai Golakiya',
    phoneNumber: '9879012345',
    email: 'ashok.g@example.in',
    sources: ['sim'],
    groupIds: ['golakiya-family', 'golakiya-immediate', 'patel-society', 'clients-customers'],
    avatarUrl: 'https://placehold.co/100x100.png',
    notes: 'Owns a hardware store.',
    addresses: [
      { label: 'Store', street: 'Golakiya Hardware, Station Road', city: 'Surat', state: 'Gujarat', zip: '395003', country: 'India' },
      { label: 'Home', street: 'A-1, Vesu Residency', city: 'Surat', state: 'Gujarat', zip: '395007', country: 'India' }
    ]
  },
  {
    id: 'contact-meena-golakiya',
    name: 'Meenaben Golakiya',
    phoneNumber: '9879012346',
    groupIds: ['golakiya-family', 'golakiya-immediate', 'patel-society'],
    avatarUrl: 'https://placehold.co/100x100.png',
    notes: 'Ashokbhai\'s wife. Homemaker.',
     addresses: [
      { label: 'Home', street: 'A-1, Vesu Residency', city: 'Surat', state: 'Gujarat', zip: '395007', country: 'India' }
    ]
  },
  {
    id: 'contact-deepak-golakiya',
    name: 'Deepak Golakiya',
    phoneNumber: '9712067890',
    email: 'deepak.golakiya@example.in',
    sources: ['gmail', 'whatsapp'],
    groupIds: ['golakiya-family', 'golakiya-relatives', 'patel-society', 'prof-colleagues'],
    avatarUrl: 'https://placehold.co/100x100.png',
    notes: 'Works at Tech Solutions Inc. with Rahul.',
    addresses: [
      { label: 'Work', street: '5th Floor, Tech Park', city: 'Ahmedabad', state: 'Gujarat', zip: '380015', country: 'India' }
    ]
  },

  // Soni Family Contacts
  {
    id: 'contact-hitesh-soni',
    name: 'Hitesh Soni',
    phoneNumber: '9426054321',
    email: 'hsoni.jewellers@example.com',
    groupIds: ['soni-family', 'soni-main', 'patel-society', 'clients-customers'],
    avatarUrl: 'https://placehold.co/100x100.png',
    notes: 'Jeweller.',
    addresses: [
      { label: 'Shop', street: 'Soni Jewellers, MG Road', city: 'Mumbai', state: 'Maharashtra', zip: '400001', country: 'India' }
    ]
  },
  {
    id: 'contact-kavita-soni',
    name: 'Kavita Soni',
    phoneNumber: '9426054322',
    groupIds: ['soni-family', 'soni-main', 'patel-society'],
    avatarUrl: 'https://placehold.co/100x100.png',
    notes: 'Hitesh\'s wife.',
  },

  // Friends Contacts
  {
    id: 'contact-tirth-shah',
    name: 'Tirth Shah',
    phoneNumber: '9099010101',
    email: 'tirth.shah@example.com',
    sources: ['whatsapp', 'gmail'],
    groupIds: ['friends-main', 'friends-college', 'prof-colleagues'],
    avatarUrl: 'https://placehold.co/100x100.png',
    notes: 'Rahul\'s college friend and colleague.',
    displayNames: [{ lang: 'gu', name: 'તીર્થ શાહ' }]
  },
  {
    id: 'contact-jay-patel',
    name: 'Jay Patel',
    phoneNumber: '9099020202',
    sources: ['whatsapp'],
    groupIds: ['friends-main', 'friends-college', 'club-sports'],
    avatarUrl: 'https://placehold.co/100x100.png',
    notes: 'Plays cricket with Rahul.',
  },
  {
    id: 'contact-fenil-mehta',
    name: 'Fenil Mehta',
    phoneNumber: '9099030303',
    email: 'fenil.m@example.com',
    groupIds: ['friends-main', 'friends-childhood'],
    avatarUrl: 'https://placehold.co/100x100.png',
  },
  {
    id: 'contact-vansh-dave',
    name: 'Vansh Dave',
    phoneNumber: '9099040404',
    groupIds: ['friends-main', 'friends-college'],
    avatarUrl: 'https://placehold.co/100x100.png',
  },
  {
    id: 'contact-suresh-kumar',
    name: 'Suresh Kumar',
    phoneNumber: '9099050505',
    groupIds: ['friends-main'],
    avatarUrl: 'https://placehold.co/100x100.png',
    notes: 'Met at a community event.'
  },
  {
    id: 'contact-yash-joshi',
    name: 'Yash Joshi',
    phoneNumber: '9099060606',
    email: 'yash.j@example.org',
    groupIds: ['friends-main', 'friends-college'],
    avatarUrl: 'https://placehold.co/100x100.png',
  },
  {
    id: 'contact-harsh-pandya',
    name: 'Harsh Pandya',
    phoneNumber: '9099070707',
    groupIds: ['friends-main', 'friends-childhood', 'club-sports'],
    avatarUrl: 'https://placehold.co/100x100.png',
  },
  {
    id: 'contact-shreeja-iyer',
    name: 'Shreeja Iyer',
    phoneNumber: '9099080808',
    email: 'shreeja.iyer@example.com',
    sources: ['gmail'],
    groupIds: ['friends-main', 'friends-college', 'prof-colleagues'],
    avatarUrl: 'https://placehold.co/100x100.png',
    notes: 'Team lead at Tech Solutions Inc.',
    displayNames: [{ lang: 'hi', name: 'श्रीजा अय्यर'}]
  },
  {
    id: 'contact-diya-sharma',
    name: 'Diya Sharma',
    phoneNumber: '9099090909',
    groupIds: ['friends-main', 'friends-childhood'],
    avatarUrl: 'https://placehold.co/100x100.png',
  },

  // Professional Contacts
  {
    id: 'contact-prof-anil',
    name: 'Professor Anil Kumar',
    phoneNumber: '9820012345',
    email: 'anil.kumar.prof@nits.ac.in',
    groupIds: ['prof-network', 'prof-professors-college'],
    avatarUrl: 'https://placehold.co/100x100.png',
    notes: 'Rahul\'s HOD at NIT Surat.',
    addresses: [{label: 'Office', street: 'Dept. of Computer Engg, NIT', city: 'Surat', state: 'Gujarat', zip: '395007', country: 'India'}]
  },
  {
    id: 'contact-mrs-desai',
    name: 'Mrs. Desai',
    phoneNumber: '9427056789',
    groupIds: ['prof-network', 'prof-teachers-school'],
    avatarUrl: 'https://placehold.co/100x100.png',
    notes: 'Math teacher from VKM High School.',
  },
  {
    id: 'contact-mr-sharma-client',
    name: 'Mr. Sharma (Client)',
    phoneNumber: '9327011223',
    email: 'sharma.industries@example.net',
    groupIds: ['clients-customers', 'prof-network'],
    avatarUrl: 'https://placehold.co/100x100.png',
    notes: 'Key client for Tech Solutions Inc.'
  },
  {
    id: 'contact-vijay-colleague',
    name: 'Vijay Verma',
    phoneNumber: '9988776655',
    email: 'vijay.verma@techsolutions.com',
    groupIds: ['prof-colleagues', 'prof-network', 'friends-main'],
    avatarUrl: 'https://placehold.co/100x100.png',
    notes: 'Senior Developer, mentor to Rahul.'
  },

  // Generic Contacts for volume
   {
    id: 'contact-alok-nath',
    name: 'Alok Nath',
    phoneNumber: '8880001111',
    groupIds: ['patel-society', 'savani-elders'],
    avatarUrl: 'https://placehold.co/100x100.png',
  },
  {
    id: 'contact-sunita-gandhi',
    name: 'Sunita Gandhi',
    phoneNumber: '8880002222',
    email: 'sunita.g@example.com',
    groupIds: ['golakiya-relatives', 'club-sports'],
    avatarUrl: 'https://placehold.co/100x100.png',
  },
  {
    id: 'contact-mohan-joshi',
    name: 'Mohan Joshi',
    phoneNumber: '8880003333',
    groupIds: ['friends-main', 'prof-network'],
    avatarUrl: 'https://placehold.co/100x100.png',
    notes: 'Freelance consultant.'
  },
   {
    id: 'contact-chetna-vyas',
    name: 'Chetna Vyas',
    phoneNumber: '7770001111',
    groupIds: ['patel-society', 'savani-cousins'],
    avatarUrl: 'https://placehold.co/100x100.png',
    notes: 'Priya\'s cousin, lives in Canada.',
    addresses: [{label: 'Home', city: 'Toronto', country: 'Canada'}]
  },
  {
    id: 'contact-rajesh-mehta',
    name: 'Rajesh Mehta',
    phoneNumber: '7770002222',
    email: 'rajesh.mehta.biz@example.com',
    groupIds: ['clients-customers', 'prof-network'],
    avatarUrl: 'https://placehold.co/100x100.png',
    notes: 'Owns a textile business.'
  },
   {
    id: 'contact-kiran-desai',
    name: 'Kiran Desai',
    phoneNumber: '6660001111',
    groupIds: ['friends-childhood', 'club-sports'],
    avatarUrl: 'https://placehold.co/100x100.png',
  },
];
