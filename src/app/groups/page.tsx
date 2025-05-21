
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; 
import { DUMMY_FAMILY_GROUPS, DUMMY_CONTACTS } from '@/lib/dummy-data';
import type { FamilyGroup, Contact, LabeledAddress } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Users, Edit2, Trash2, Search, ChevronDown, ChevronRight, Eye, Share2 } from 'lucide-react'; // Added Share2
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from "@/hooks/use-toast";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface GroupWithHierarchy extends FamilyGroup {
  children?: GroupWithHierarchy[];
  level: number;
  memberCount: number;
  subGroupCount: number;
}


const getAllDescendantGroupIds = (groupId: string, allGroupsData: FamilyGroup[]): string[] => {
  const ids: string[] = [groupId];
  const children = allGroupsData.filter(g => g.parentId === groupId);
  for (const child of children) {
    ids.push(...getAllDescendantGroupIds(child.id, allGroupsData));
  }
  return Array.from(new Set(ids)); 
};

const getFullMemberCount = (
  groupId: string,
  allGroups: FamilyGroup[],
  allContacts: Contact[]
): number => {
  const relevantGroupIds = getAllDescendantGroupIds(groupId, allGroups);
  return allContacts.filter(contact => contact.groupIds?.some(cgId => relevantGroupIds.includes(cgId))).length;
};

export default function FamilyGroupsPage() {
  const router = useRouter(); 
  const [groups, setGroups] = useState<FamilyGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<FamilyGroup | null>(null);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDescription, setNewGroupDescription] = useState('');
  const [newGroupParentId, setNewGroupParentId] = useState<string | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  const { toast } = useToast();

  useEffect(() => {
    setGroups(DUMMY_FAMILY_GROUPS);
    setIsLoading(false);
  }, []);

  const handleAddOrUpdateGroup = () => {
    if (!newGroupName.trim()) {
      toast({ title: "Group name required", variant: "destructive" });
      return;
    }

    if (editingGroup) {
      setGroups(prevGroups => prevGroups.map(g => g.id === editingGroup.id ? { ...g, name: newGroupName, description: newGroupDescription, parentId: newGroupParentId } : g));
      DUMMY_FAMILY_GROUPS.forEach((group, index) => {
        if (group.id === editingGroup.id) {
          DUMMY_FAMILY_GROUPS[index] = { ...group, name: newGroupName, description: newGroupDescription, parentId: newGroupParentId };
        }
      });
      toast({ title: "Group Updated", description: `Group "${newGroupName}" updated successfully.`, className: "bg-accent text-accent-foreground" });
    } else {
      const newGroupData: FamilyGroup = {
        id: `group-${Date.now()}`,
        name: newGroupName,
        description: newGroupDescription,
        parentId: newGroupParentId,
        members: [], 
      };
      setGroups(prevGroups => [...prevGroups, newGroupData]);
      DUMMY_FAMILY_GROUPS.push(newGroupData);
      toast({ title: "Group Created", description: `Group "${newGroupName}" created successfully.`, className: "bg-accent text-accent-foreground" });
    }
    closeModal();
  };

  const openModalForEdit = (group: FamilyGroup) => {
    setEditingGroup(group);
    setNewGroupName(group.name);
    setNewGroupDescription(group.description || '');
    setNewGroupParentId(group.parentId);
    setIsModalOpen(true);
  };

  const openModalForNew = (parentId?: string) => {
    setEditingGroup(null);
    setNewGroupName('');
    setNewGroupDescription('');
    setNewGroupParentId(parentId);
    setIsModalOpen(true);
  };
  
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingGroup(null);
    setNewGroupName('');
    setNewGroupDescription('');
    setNewGroupParentId(undefined);
  };

  const handleDeleteGroup = (groupId: string) => {
    const groupToDelete = groups.find(g => g.id === groupId);
    if (!groupToDelete) return;

    const childrenOfDeleted = groups.filter(g => g.parentId === groupId);
    
    const updatedGlobalGroups = DUMMY_FAMILY_GROUPS.filter(g => g.id !== groupId);
    childrenOfDeleted.forEach(child => {
      const childIndexInGlobal = updatedGlobalGroups.findIndex(g => g.id === child.id);
      if (childIndexInGlobal !== -1) {
        updatedGlobalGroups[childIndexInGlobal] = { ...updatedGlobalGroups[childIndexInGlobal], parentId: groupToDelete.parentId };
      }
    });
    
    DUMMY_FAMILY_GROUPS.length = 0; // Clear original
    DUMMY_FAMILY_GROUPS.push(...updatedGlobalGroups); // Push updated
    setGroups(updatedGlobalGroups); // Update state
    
    toast({ title: "Group Deleted", description: `Group "${groupToDelete.name}" deleted. Subgroups (if any) were re-parented.`, variant: "default" });
  };

  const toggleExpand = (groupId: string) => {
    setExpandedGroups(prev => ({ ...prev, [groupId]: !prev[groupId] }));
  };
  
  const buildGroupHierarchy = (allCurrentGroups: FamilyGroup[], parentId?: string, level = 0): GroupWithHierarchy[] => {
    return allCurrentGroups
      .filter(group => group.parentId === parentId)
      .sort((a, b) => a.name.localeCompare(b.name)) // Sort groups at the same level
      .map(group => {
        const children = buildGroupHierarchy(allCurrentGroups, group.id, level + 1);
        const memberCount = getFullMemberCount(group.id, allCurrentGroups, DUMMY_CONTACTS);
        const subGroupCount = children.length;
        return {
          ...group,
          level,
          children,
          memberCount,
          subGroupCount,
        };
      });
  };

  const filterHierarchyForDisplay = (hierarchy: GroupWithHierarchy[], term: string): GroupWithHierarchy[] => {
    if (!term.trim()) return hierarchy;
    const lowerTerm = term.toLowerCase();

    return hierarchy.reduce((acc, group) => {
      const selfMatches = group.name.toLowerCase().includes(lowerTerm) ||
                          (group.description || '').toLowerCase().includes(lowerTerm);
      
      const filteredChildren = group.children ? filterHierarchyForDisplay(group.children, term) : [];

      if (selfMatches || filteredChildren.length > 0) {
        acc.push({ ...group, children: filteredChildren });
      }
      return acc;
    }, [] as GroupWithHierarchy[]);
  };
  
  const fullHierarchy = buildGroupHierarchy(groups);
  const displayedGroupsHierarchy = filterHierarchyForDisplay(fullHierarchy, searchTerm);

  const handleViewContacts = (groupId: string) => {
    router.push(`/?groupId=${groupId}`);
  };

  const formatSingleAddressForShare = (address?: LabeledAddress) => {
    if (!address) return null;
    const parts = [address.street, address.city, address.state, address.zip, address.country].filter(Boolean);
    return parts.join(', ');
  };

  const handleShareGroup = async (group: GroupWithHierarchy) => {
    const relevantGroupIds = getAllDescendantGroupIds(group.id, groups);
    const memberContacts = DUMMY_CONTACTS.filter(contact => 
      contact.groupIds?.some(cgId => relevantGroupIds.includes(cgId))
    );

    let shareText = `Group: ${group.name}\n`;
    if (group.description) {
      shareText += `Description: ${group.description}\n`;
    }
    shareText += `Total Members (including subgroups): ${group.memberCount}\n\n--- Members ---\n`;

    if (memberContacts.length > 0) {
      memberContacts.forEach(contact => {
        shareText += `\nName: ${contact.name}\nPhone: ${contact.phoneNumber}`;
        if (contact.email) shareText += `\nEmail: ${contact.email}`;
        if (contact.addresses && contact.addresses.length > 0) {
          contact.addresses.forEach(addr => {
            const formattedAddr = formatSingleAddressForShare(addr);
            if (formattedAddr) {
                shareText += `\nAddress${addr.label ? ` (${addr.label})` : ''}: ${formattedAddr}`;
            }
          });
        }
        shareText += `\n----------------\n`;
      });
    } else {
      shareText += "No members in this group or its subgroups.\n";
    }

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Group: ${group.name}`,
          text: shareText,
        });
        toast({ title: "Shared", description: "Group details sent to share dialog." });
      } catch (error) {
        console.error('Error sharing group:', error);
        toast({ title: "Share Failed", description: "Could not share group.", variant: "destructive" });
      }
    } else {
      // Fallback: Copy to clipboard if Web Share API is not available
      try {
        await navigator.clipboard.writeText(shareText);
        toast({ title: "Web Share API not available", description: "Group details copied to clipboard instead." });
      } catch (err) {
        toast({ title: "Copy Failed", description: "Could not copy group details.", variant: "destructive"});
      }
    }
  };

  const renderGroupItem = (group: GroupWithHierarchy) => (
    <div key={group.id} style={{ marginLeft: `${group.level * 1.5}rem` }} className="my-1">
      <Card 
        className="shadow-sm hover:shadow-md transition-shadow group/card"
      >
        <CardContent 
          className="p-3 flex items-center justify-between gap-2 cursor-pointer"
          onClick={() => handleViewContacts(group.id)}
        >
          <div className="flex items-center flex-grow min-w-0">
            {group.children && group.children.length > 0 ? (
               <TooltipProvider delayDuration={100}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => { e.stopPropagation(); toggleExpand(group.id);}}
                      className="mr-2 h-7 w-7 flex-shrink-0"
                      aria-expanded={expandedGroups[group.id]}
                      aria-controls={`subgroups-of-${group.id}`}
                    >
                      {expandedGroups[group.id] ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" align="start" className="max-w-xs">
                    <p className="font-semibold text-sm mb-1">Contains Subgroups:</p>
                    <ul className="list-disc list-inside text-xs space-y-0.5">
                      {group.children.slice(0, 5).map(child => (
                        <li key={child.id} className="truncate" title={child.name}>{child.name}</li>
                      ))}
                      {group.children.length > 5 && <li className="italic">...and {group.children.length - 5} more</li>}
                    </ul>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : (
              <div className="mr-2 h-7 w-7 flex-shrink-0"></div> 
            )}
            <div className={`flex-grow min-w-0 ${group.children && group.children.length > 0 ? '' : 'ml-0'}`}>
              <div className="flex items-baseline gap-2">
                <p className="font-semibold text-md text-foreground truncate group-hover/card:text-primary transition-colors" title={group.name}>{group.name}</p>
                <Badge variant="secondary" className="text-xs whitespace-nowrap flex-shrink-0">
                  {group.memberCount} {group.memberCount === 1 ? 'member' : 'members'}
                </Badge>
                 {group.subGroupCount > 0 && (
                  <Badge variant="outline" className="text-xs whitespace-nowrap flex-shrink-0">
                    {group.subGroupCount} {group.subGroupCount === 1 ? 'subgroup' : 'subgroups'}
                  </Badge>
                )}
              </div>
              {group.description && <p className="text-xs text-muted-foreground truncate mt-0.5" title={group.description}>{group.description}</p>}
            </div>
          </div>
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
             <Button 
                variant="ghost" 
                size="sm" 
                onClick={(e) => { e.stopPropagation(); handleViewContacts(group.id); }}
                className="text-xs px-1 sm:px-2 text-primary hover:text-primary/80"
                title="View contacts in this group"
            >
                <Eye className="h-3.5 w-3.5 sm:mr-1" /> <span className="hidden sm:inline">View</span>
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={(e) => { e.stopPropagation(); handleShareGroup(group); }}
              className="text-xs px-1 sm:px-2"
              title="Share group"
            >
              <Share2 className="h-3.5 w-3.5 sm:mr-1" /> <span className="hidden sm:inline">Share</span>
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={(e) => { e.stopPropagation(); openModalForNew(group.id); }} 
              className="text-xs px-1 sm:px-2"
              title="Add subgroup"
            >
              <PlusCircle className="h-3.5 w-3.5 sm:mr-1" /> <span className="hidden sm:inline">Add Sub</span>
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={(e) => { e.stopPropagation(); openModalForEdit(group); }} 
              className="h-7 w-7"
              title="Edit group"
            >
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button 
              variant="destructive" 
              size="icon" 
              onClick={(e) => { e.stopPropagation(); handleDeleteGroup(group.id);}} 
              className="h-7 w-7"
              title="Delete group"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
      {expandedGroups[group.id] && group.children && group.children.map(renderGroupItem)}
    </div>
  );
  

  if (isLoading) {
    return <div className="text-center py-10">Loading groups...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Family & Friend Groups</h1>
        <Button onClick={() => openModalForNew()} className="shadow-md hover:shadow-lg transition-shadow">
          <PlusCircle className="mr-2 h-5 w-5" /> Create New Group
        </Button>
      </div>
      
      <div className="p-4 bg-card rounded-lg shadow">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search groups by name or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full shadow-inner"
          />
        </div>
      </div>

      {displayedGroupsHierarchy.length > 0 ? (
        <div>
          {displayedGroupsHierarchy.map(renderGroupItem)}
        </div>
      ) : (
        <Card className="text-center py-12 shadow">
          <CardHeader>
            <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <CardTitle>No Groups Found</CardTitle>
            <CardDescription>
              {searchTerm ? "Try a different search term or clear the search." : "Create a group to organize your contacts."}
            </CardDescription>
          </CardHeader>
          {searchTerm && (
            <CardContent>
              <Button variant="outline" onClick={() => setSearchTerm('')}>Clear Search</Button>
            </CardContent>
          )}
        </Card>
      )}

      <Dialog open={isModalOpen} onOpenChange={closeModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingGroup ? 'Edit Group' : 'Create New Group'}</DialogTitle>
            <DialogDescription>
              {editingGroup ? `Update the details for "${editingGroup.name}".` : 'Enter details for the new group.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="groupName">Group Name</Label>
              <Input id="groupName" value={newGroupName} onChange={(e) => setNewGroupName(e.target.value)} placeholder="e.g., Close Friends" className="shadow-sm"/>
            </div>
            <div>
              <Label htmlFor="groupDescription">Description (Optional)</Label>
              <Textarea id="groupDescription" value={newGroupDescription} onChange={(e) => setNewGroupDescription(e.target.value)} placeholder="e.g., Friends from college" className="shadow-sm"/>
            </div>
            <div>
              <Label htmlFor="groupParent">Parent Group (Optional)</Label>
               <select
                id="groupParent"
                value={newGroupParentId || ""}
                onChange={(e) => setNewGroupParentId(e.target.value || undefined)}
                className="w-full p-2 border rounded-md shadow-sm bg-background text-foreground border-input focus:ring-ring focus:ring-2 focus:outline-none"
              >
                <option value="">None (Top-level group)</option>
                {groups
                  .filter(g => {
                    if (!editingGroup) return true; 
                    if (g.id === editingGroup.id) return false; 
                    
                    let currentParentIdToCheck = g.parentId;
                    while(currentParentIdToCheck) {
                      if (currentParentIdToCheck === editingGroup.id) return false; 
                      const parentGroup = groups.find(p => p.id === currentParentIdToCheck);
                      if (!parentGroup) break;
                       currentParentIdToCheck = parentGroup.parentId;
                    }
                    return true;
                  })
                  .map(group => ( 
                  <option key={group.id} value={group.id}>{group.name}</option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeModal} className="shadow-md">Cancel</Button>
            <Button onClick={handleAddOrUpdateGroup} className="shadow-md hover:shadow-lg transition-shadow">{editingGroup ? 'Save Changes' : 'Create Group'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
    
