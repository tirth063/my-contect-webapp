
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ContactCard } from '@/components/contact-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DUMMY_CONTACTS, DUMMY_FAMILY_GROUPS } from '@/lib/dummy-data';
import type { Contact, FamilyGroup } from '@/types';
import { PlusCircle, Search, LayoutGrid, ListFilter, Users } from 'lucide-react'; // Added Users
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Helper function to get a flat list of a group ID and all its descendant group IDs
const getAllDescendantGroupIds = (groupId: string, allGroupsData: FamilyGroup[]): string[] => {
  const ids: string[] = [groupId];
  const children = allGroupsData.filter(g => g.parentId === groupId);
  for (const child of children) {
    ids.push(...getAllDescendantGroupIds(child.id, allGroupsData));
  }
  return Array.from(new Set(ids)); // Ensure unique IDs
};

export default function AllContactsPage() {
  const router = useRouter();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [allGroups, setAllGroups] = useState<FamilyGroup[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState('name-asc');
  const [selectedGroupId, setSelectedGroupId] = useState<string | undefined>(undefined);

  useEffect(() => {
    // Simulate fetching contacts and groups
    setContacts(DUMMY_CONTACTS);
    setAllGroups(DUMMY_FAMILY_GROUPS);
    setIsLoading(false);
  }, []);

  const filteredContacts = (() => {
    let contactsToProcess = [...contacts];

    // 1. Filter by selected group (including subgroups)
    if (selectedGroupId && selectedGroupId !== 'all') {
      const relevantGroupIds = getAllDescendantGroupIds(selectedGroupId, allGroups);
      contactsToProcess = contactsToProcess.filter(contact =>
        contact.familyGroupId && relevantGroupIds.includes(contact.familyGroupId)
      );
    }

    // 2. Filter by search term
    if (searchTerm.trim()) {
      contactsToProcess = contactsToProcess.filter((contact) => {
        const lowerSearchTerm = searchTerm.toLowerCase();
        const searchIn = (value?: string) => value?.toLowerCase().includes(lowerSearchTerm) ?? false;

        let matchesSearch = (
          searchIn(contact.name) ||
          searchIn(contact.phoneNumber) ||
          (contact.alternativeNumbers && contact.alternativeNumbers.some(num => searchIn(num))) ||
          searchIn(contact.email) ||
          searchIn(contact.notes) ||
          (contact.address && (
            searchIn(contact.address.street) ||
            searchIn(contact.address.city) ||
            searchIn(contact.address.state) ||
            searchIn(contact.address.zip) ||
            searchIn(contact.address.country)
          )) ||
          (contact.displayNames && contact.displayNames.some(dn => searchIn(dn.name)))
        );

        if (!matchesSearch && contact.familyGroupId) {
          const group = allGroups.find(g => g.id === contact.familyGroupId);
          if (group && searchIn(group.name)) {
            matchesSearch = true;
          }
        }
        return matchesSearch;
      });
    }

    // 3. Sort
    return contactsToProcess.sort((a, b) => {
      if (sortOrder === 'name-asc') {
        return a.name.localeCompare(b.name);
      }
      if (sortOrder === 'name-desc') {
        return b.name.localeCompare(a.name);
      }
      return 0;
    });
  })();

  const handleEdit = (contactId: string) => {
    router.push(`/contacts/edit/${contactId}`);
  };

  const handleDelete = (contactId: string) => {
    console.log('Delete contact:', contactId);
    setContacts(prevContacts => prevContacts.filter(c => c.id !== contactId));
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse bg-muted h-10 w-1/3 rounded-md"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-muted h-48 rounded-lg shadow-md"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">All Contacts ({filteredContacts.length})</h1>
        <Button asChild className="shadow-md hover:shadow-lg transition-shadow">
          <Link href="/contacts/add">
            <PlusCircle className="mr-2 h-5 w-5" /> Add New Contact
          </Link>
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-card rounded-lg shadow">
        <div className="relative flex-grow w-full sm:w-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by name, phone, email, address, notes, group..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full shadow-inner"
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Select value={sortOrder} onValueChange={setSortOrder}>
            <SelectTrigger className="w-full sm:w-[180px] shadow-sm">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name-asc">Name (A-Z)</SelectItem>
              <SelectItem value="name-desc">Name (Z-A)</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedGroupId || 'all'} onValueChange={(value) => setSelectedGroupId(value === 'all' ? undefined : value)}>
            <SelectTrigger className="w-full sm:w-[200px] shadow-sm">
              <Users className="mr-2 h-4 w-4 text-muted-foreground" />
              <SelectValue placeholder="Filter by Group" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Groups</SelectItem>
              {allGroups.map(group => (
                <SelectItem key={group.id} value={group.id}>{group.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
           <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="shadow-sm w-full sm:w-auto">
                <ListFilter className="mr-2 h-4 w-4" /> Filters
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Filter by Source</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem>Gmail</DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem>SIM</DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem>WhatsApp</DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {filteredContacts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 md:gap-6">
          {filteredContacts.map((contact) => (
            <ContactCard key={contact.id} contact={contact} onEdit={handleEdit} onDelete={handleDelete} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <LayoutGrid className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold text-foreground">No Contacts Found</h3>
          <p className="text-muted-foreground">
            {searchTerm || (selectedGroupId && selectedGroupId !== 'all') ? "Try adjusting your search or filter criteria." : "Add a new contact to get started."}
          </p>
        </div>
      )}
    </div>
  );
}
