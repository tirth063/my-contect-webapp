
'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ContactCard } from '@/components/contact-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DUMMY_CONTACTS, DUMMY_FAMILY_GROUPS } from '@/lib/dummy-data';
import type { Contact, FamilyGroup, ContactSource, LabeledAddress, DisplayName } from '@/types';
import { PlusCircle, Search, LayoutGrid, ListFilter, Users, Upload, Download } from 'lucide-react';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from "@/hooks/use-toast";
import { sourceNameMap } from '@/components/contact-source-icons';
import { ImportContactsModal } from '@/components/import-contacts-modal';
import { ExportContactsModal } from '@/components/export-contacts-modal'; // Added ExportContactsModal

const ALL_CONTACT_SOURCES: ContactSource[] = ['gmail', 'sim', 'whatsapp', 'other', 'csv'];


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
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [allGroups, setAllGroups] = useState<FamilyGroup[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState('name-asc');
  const [selectedGroupId, setSelectedGroupId] = useState<string | undefined>(undefined);
  const [selectedSources, setSelectedSources] = useState<ContactSource[]>([]);

  const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);


  const [sourceCounts, setSourceCounts] = useState<Record<ContactSource, number>>({
    gmail: 0,
    sim: 0,
    whatsapp: 0,
    other: 0,
    csv: 0,
  });

  useEffect(() => {
    setContacts(DUMMY_CONTACTS);
    setAllGroups([...DUMMY_FAMILY_GROUPS].sort((a,b) => a.name.localeCompare(b.name)));
    
    const counts = DUMMY_CONTACTS.reduce((acc, contact) => {
      contact.sources?.forEach(source => {
        acc[source] = (acc[source] || 0) + 1;
      });
      return acc;
    }, { gmail: 0, sim: 0, whatsapp: 0, other: 0, csv: 0 } as Record<ContactSource, number>);
    setSourceCounts(prev => ({...prev, ...counts}));

    setIsLoading(false);

    const groupIdFromQuery = searchParams.get('groupId');
    if (groupIdFromQuery) {
      const groupExists = DUMMY_FAMILY_GROUPS.some(g => g.id === groupIdFromQuery);
      if (groupExists) {
        setSelectedGroupId(groupIdFromQuery);
      } else {
        router.replace('/'); 
        console.warn(`Group ID "${groupIdFromQuery}" from query parameter not found.`);
      }
    }

    const action = searchParams.get('action');
    if (action === 'import') {
      setIsImportModalOpen(true);
      router.replace('/', { scroll: false }); // Remove query param after opening
    } else if (action === 'export') {
      setIsExportModalOpen(true);
      router.replace('/', { scroll: false }); // Remove query param after opening
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]); // Removed router from deps to avoid re-triggering on replace

  const filteredContacts = (() => {
    let contactsToProcess = [...contacts];

    if (selectedGroupId && selectedGroupId !== 'all') {
      const relevantGroupIds = getAllDescendantGroupIds(selectedGroupId, allGroups);
      contactsToProcess = contactsToProcess.filter(contact =>
        contact.groupIds?.some(cgId => relevantGroupIds.includes(cgId))
      );
    }

    if (selectedSources.length > 0) {
      contactsToProcess = contactsToProcess.filter(contact =>
        contact.sources?.some(cs => selectedSources.includes(cs))
      );
    }

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
          (contact.addresses && contact.addresses.some(addr =>
            searchIn(addr.label) ||
            searchIn(addr.street) ||
            searchIn(addr.city) ||
            searchIn(addr.state) ||
            searchIn(addr.zip) ||
            searchIn(addr.country)
          )) ||
          (contact.displayNames && contact.displayNames.some(dn => searchIn(dn.name)))
        );

        if (!matchesSearch && contact.groupIds) {
          const contactGroupNames = contact.groupIds
            .map(gid => allGroups.find(g => g.id === gid)?.name)
            .filter((name): name is string => !!name); 
          if (contactGroupNames.some(groupName => searchIn(groupName))) {
            matchesSearch = true;
          }
        }
        return matchesSearch;
      });
    }

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
    const contactIndex = DUMMY_CONTACTS.findIndex(c => c.id === contactId);
    if (contactIndex > -1) {
      DUMMY_CONTACTS.splice(contactIndex, 1); 
    }
    const updatedContacts = contacts.filter(c => c.id !== contactId);
    setContacts(updatedContacts);

    const counts = updatedContacts.reduce((acc, contact) => {
        contact.sources?.forEach(source => {
          acc[source] = (acc[source] || 0) + 1;
        });
        return acc;
      }, { gmail: 0, sim: 0, whatsapp: 0, other: 0, csv: 0 } as Record<ContactSource, number>);
    setSourceCounts(counts);

    toast({ title: "Contact Deleted", description: "The contact has been removed.", variant: "default" });
  };

  const handleCreateGroup = () => {
    if (!newGroupName.trim()) {
      toast({ title: "Group Name Required", description: "Please enter a name for the new group.", variant: "destructive" });
      return;
    }
    const newGroupData: FamilyGroup = {
      id: `group-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: newGroupName.trim(),
      members: [], 
    };

    DUMMY_FAMILY_GROUPS.push(newGroupData);
    setAllGroups([...DUMMY_FAMILY_GROUPS].sort((a,b) => a.name.localeCompare(b.name)));

    toast({ title: "Group Created", description: `Group "${newGroupData.name}" created successfully.`, className: "bg-accent text-accent-foreground" });
    closeCreateGroupModal();
  };

  const openCreateGroupModal = () => setIsCreateGroupModalOpen(true);
  const closeCreateGroupModal = () => {
    setIsCreateGroupModalOpen(false);
    setNewGroupName(''); 
  };

  const handleSourceSelectionChange = (source: ContactSource) => {
    setSelectedSources(prev =>
      prev.includes(source)
        ? prev.filter(s => s !== source)
        : [...prev, source]
    );
  };

  const handleImportedContacts = (importedContacts: Contact[]) => {
    if (importedContacts.length === 0) {
      toast({ title: "No Contacts Imported", description: "The CSV file might be empty or not in the correct format." });
      return;
    }

    const newContactsWithIds = importedContacts.map(contact => ({
      ...contact,
      id: `contact-${Date.now()}-${Math.random().toString(36).substring(2,9)}`,
      sources: contact.sources || ['csv'] as ContactSource[],
    }));

    DUMMY_CONTACTS.push(...newContactsWithIds);
    setContacts([...DUMMY_CONTACTS]); 

    const counts = DUMMY_CONTACTS.reduce((acc, contact) => {
      contact.sources?.forEach(source => {
        acc[source] = (acc[source] || 0) + 1;
      });
      return acc;
    }, { gmail: 0, sim: 0, whatsapp: 0, other: 0, csv: 0 } as Record<ContactSource, number>);
    setSourceCounts(counts);
    
    toast({
      title: "Import Successful",
      description: `${newContactsWithIds.length} contact(s) imported from CSV.`,
      className: "bg-accent text-accent-foreground",
    });
  };

  const triggerDownload = (filename: string, content: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  };

  const exportContactsAsCSV = (contactsToExport: Contact[]) => {
    if (contactsToExport.length === 0) {
      toast({ title: "No Contacts to Export", description: "There are no contacts matching the current filters.", variant: "default" });
      return;
    }
    const MAX_ADDRESSES_EXPORT = 3; // Align with form's MAX_ADDRESSES if needed
    const MAX_ALT_NUMBERS_EXPORT = 5; // Align with form's MAX_ALTERNATIVE_NUMBERS

    const headers = [
      'ID', 'Name', 'PhoneNumber', 'Email', 'Notes', 'AvatarURL',
      ...Array.from({ length: MAX_ADDRESSES_EXPORT }, (_, i) => `Address${i + 1}_Label`).join(',').split(','),
      ...Array.from({ length: MAX_ADDRESSES_EXPORT }, (_, i) => `Address${i + 1}_Street`).join(',').split(','),
      ...Array.from({ length: MAX_ADDRESSES_EXPORT }, (_, i) => `Address${i + 1}_City`).join(',').split(','),
      ...Array.from({ length: MAX_ADDRESSES_EXPORT }, (_, i) => `Address${i + 1}_State`).join(',').split(','),
      ...Array.from({ length: MAX_ADDRESSES_EXPORT }, (_, i) => `Address${i + 1}_Zip`).join(',').split(','),
      ...Array.from({ length: MAX_ADDRESSES_EXPORT }, (_, i) => `Address${i + 1}_Country`).join(',').split(','),
      'DisplayNames_EN', 'DisplayNames_GU', 'DisplayNames_HI',
      'GroupNames',
      ...Array.from({ length: MAX_ALT_NUMBERS_EXPORT }, (_, i) => `AlternativeNumber${i + 1}`).join(',').split(','),
      'Sources'
    ];

    const csvRows = contactsToExport.map(contact => {
      const row: (string | undefined)[] = [
        contact.id,
        contact.name,
        contact.phoneNumber,
        contact.email,
        contact.notes,
        contact.avatarUrl,
      ];

      for (let i = 0; i < MAX_ADDRESSES_EXPORT; i++) {
        const addr = contact.addresses?.[i];
        row.push(addr?.label || '');
        row.push(addr?.street || '');
        row.push(addr?.city || '');
        row.push(addr?.state || '');
        row.push(addr?.zip || '');
        row.push(addr?.country || '');
      }
      
      row.push(contact.displayNames?.find(dn => dn.lang === 'en')?.name || '');
      row.push(contact.displayNames?.find(dn => dn.lang === 'gu')?.name || '');
      row.push(contact.displayNames?.find(dn => dn.lang === 'hi')?.name || '');

      const groupNames = contact.groupIds?.map(gid => allGroups.find(g => g.id === gid)?.name).filter(Boolean).join('; ') || '';
      row.push(groupNames);

      for (let i = 0; i < MAX_ALT_NUMBERS_EXPORT; i++) {
        row.push(contact.alternativeNumbers?.[i] || '');
      }
      
      row.push(contact.sources?.join('; ') || '');

      return row.map(field => `"${(field || '').replace(/"/g, '""')}"`).join(',');
    });

    const csvString = [headers.join(','), ...csvRows].join('\r\n');
    triggerDownload('contacts.csv', csvString, 'text/csv;charset=utf-8;');
    toast({ title: "Export Successful", description: `${contactsToExport.length} contacts exported as CSV.`, className: "bg-accent text-accent-foreground" });
  };

  const exportContactsAsTXT = (contactsToExport: Contact[]) => {
     if (contactsToExport.length === 0) {
      toast({ title: "No Contacts to Export", description: "There are no contacts matching the current filters.", variant: "default" });
      return;
    }
    let txtContent = `ContactNexus Export - ${new Date().toLocaleString()}\n`;
    txtContent += `Total Contacts: ${contactsToExport.length}\n\n`;

    contactsToExport.forEach(contact => {
      txtContent += `------------------------------\n`;
      txtContent += `Name: ${contact.name || 'N/A'}\n`;
      txtContent += `Phone Number: ${contact.phoneNumber || 'N/A'}\n`;
      if (contact.email) txtContent += `Email: ${contact.email}\n`;
      if (contact.notes) txtContent += `Notes: ${contact.notes}\n`;
      if (contact.avatarUrl) txtContent += `Avatar URL: ${contact.avatarUrl}\n`;

      if (contact.displayNames && contact.displayNames.length > 0) {
        contact.displayNames.forEach(dn => {
          txtContent += `Display Name (${dn.lang.toUpperCase()}): ${dn.name}\n`;
        });
      }
      
      const groupNames = contact.groupIds?.map(gid => allGroups.find(g => g.id === gid)?.name).filter(Boolean).join(', ');
      if (groupNames) txtContent += `Groups: ${groupNames}\n`;

      if (contact.alternativeNumbers && contact.alternativeNumbers.length > 0) {
        txtContent += `Alternative Numbers: ${contact.alternativeNumbers.join(', ')}\n`;
      }

      if (contact.addresses && contact.addresses.length > 0) {
        contact.addresses.forEach((addr, index) => {
          txtContent += `Address ${index + 1}${addr.label ? ` (${addr.label})` : ''}:\n`;
          if (addr.street) txtContent += `  Street: ${addr.street}\n`;
          if (addr.city) txtContent += `  City: ${addr.city}\n`;
          if (addr.state) txtContent += `  State: ${addr.state}\n`;
          if (addr.zip) txtContent += `  Zip: ${addr.zip}\n`;
          if (addr.country) txtContent += `  Country: ${addr.country}\n`;
        });
      }
      if (contact.sources && contact.sources.length > 0) {
        txtContent += `Sources: ${contact.sources.map(s => sourceNameMap[s] || s).join(', ')}\n`;
      }
      txtContent += `------------------------------\n\n`;
    });
    triggerDownload('contacts.txt', txtContent, 'text/plain;charset=utf-8;');
    toast({ title: "Export Successful", description: `${contactsToExport.length} contacts exported as TXT.`, className: "bg-accent text-accent-foreground" });
  };


  const handleExport = (format: 'csv' | 'txt') => {
    const contactsToExport = filteredContacts; // Export based on current filters
    if (format === 'csv') {
      exportContactsAsCSV(contactsToExport);
    } else if (format === 'txt') {
      exportContactsAsTXT(contactsToExport);
    }
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">All Contacts ({filteredContacts.length})</h1>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
           {/* Buttons moved to sidebar via AppShellClient */}
           <Button onClick={openCreateGroupModal} variant="outline" className="shadow-sm hover:shadow-lg transition-shadow w-full sm:w-auto">
            <PlusCircle className="mr-2 h-5 w-5" /> Create New Group
          </Button>
          <Button asChild className="shadow-md hover:shadow-lg transition-shadow w-full sm:w-auto">
            <Link href="/contacts/add">
              <PlusCircle className="mr-2 h-5 w-5" /> Add New Contact
            </Link>
          </Button>
        </div>
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
              {ALL_CONTACT_SOURCES.map(source => (
                <DropdownMenuCheckboxItem
                  key={source}
                  checked={selectedSources.includes(source)}
                  onCheckedChange={() => handleSourceSelectionChange(source)}
                >
                  {sourceNameMap[source] || source} ({sourceCounts[source] || 0})
                </DropdownMenuCheckboxItem>
              ))}
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
            {searchTerm || (selectedGroupId && selectedGroupId !== 'all') || selectedSources.length > 0
              ? "Try adjusting your search or filter criteria."
              : "Add a new contact to get started."}
          </p>
        </div>
      )}

      <Dialog open={isCreateGroupModalOpen} onOpenChange={closeCreateGroupModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Group</DialogTitle>
            <DialogDescription>
              Enter a name for your new group. You can manage subgroups and descriptions on the main Groups page.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="newGroupName">Group Name</Label>
              <Input
                id="newGroupName"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                placeholder="e.g., College Friends"
                className="shadow-sm"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeCreateGroupModal} className="shadow-md">Cancel</Button>
            <Button onClick={handleCreateGroup} className="shadow-md hover:shadow-lg transition-shadow">Create Group</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ImportContactsModal
        isOpen={isImportModalOpen}
        onOpenChange={setIsImportModalOpen}
        onImport={handleImportedContacts}
        allExistingGroups={allGroups}
      />
      <ExportContactsModal
        isOpen={isExportModalOpen}
        onOpenChange={setIsExportModalOpen}
        onExport={handleExport}
        contactCount={filteredContacts.length}
      />
    </div>
  );
}
