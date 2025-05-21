
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; // Import useRouter
import { ContactCard } from '@/components/contact-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DUMMY_CONTACTS } from '@/lib/dummy-data';
import type { Contact } from '@/types';
import { PlusCircle, Search, LayoutGrid, ListFilter } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function AllContactsPage() {
  const router = useRouter(); // Initialize useRouter
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState('name-asc');

  useEffect(() => {
    // Simulate fetching contacts
    setContacts(DUMMY_CONTACTS);
    setIsLoading(false);
  }, []);

  const filteredContacts = contacts
    .filter((contact) => {
      const lowerSearchTerm = searchTerm.toLowerCase();
      const searchIn = (value?: string) => value?.toLowerCase().includes(lowerSearchTerm) ?? false;

      return (
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
    })
    .sort((a, b) => {
      if (sortOrder === 'name-asc') {
        return a.name.localeCompare(b.name);
      }
      if (sortOrder === 'name-desc') {
        return b.name.localeCompare(a.name);
      }
      // Add more sort options if needed
      return 0;
    });

  const handleEdit = (contactId: string) => {
    router.push(`/contacts/edit/${contactId}`);
  };

  const handleDelete = (contactId: string) => {
    console.log('Delete contact:', contactId);
    // For now, just filter out from local state. 
    // In a real app, you'd call an API and then re-fetch or update state.
    setContacts(prevContacts => prevContacts.filter(c => c.id !== contactId));
    // Potentially show a toast message here
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
            placeholder="Search by name, phone, email, address, notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full shadow-inner"
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Select value={sortOrder} onValueChange={setSortOrder}>
            <SelectTrigger className="w-full sm:w-[180px] shadow-sm">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name-asc">Name (A-Z)</SelectItem>
              <SelectItem value="name-desc">Name (Z-A)</SelectItem>
              {/* Add more sort options here */}
            </SelectContent>
          </Select>
           <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="shadow-sm">
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
            {searchTerm ? "Try adjusting your search or filter criteria." : "Add a new contact to get started."}
          </p>
        </div>
      )}
    </div>
  );
}
