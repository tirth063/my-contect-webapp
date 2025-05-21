
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // Added
import { DUMMY_FAMILY_GROUPS, DUMMY_CONTACTS } from '@/lib/dummy-data';
import type { FamilyGroup, Contact } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Users, Edit2, Trash2, Search, ChevronDown, ChevronRight, Eye } from 'lucide-react';
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

// Helper function to recursively count members in a group and its subgroups
const getFullMemberCount = (
  groupId: string,
  allGroups: FamilyGroup[],
  allContacts: Contact[]
): number => {
  let count = allContacts.filter(contact => contact.groupIds?.includes(groupId)).length;
  const childGroups = allGroups.filter(group => group.parentId === groupId);
  for (const child of childGroups) {
    count += getFullMemberCount(child.id, allGroups, allContacts);
  }
  return count;
};

export default function FamilyGroupsPage() {
  const router = useRouter(); // Added
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
    // Simulate fetching groups and contacts
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
    setGroups(prevGroups => {
      const groupToDelete = prevGroups.find(g => g.id === groupId);
      if (!groupToDelete) return prevGroups;

      const childrenOfDeleted = prevGroups.filter(g => g.parentId === groupId);
      
      const updatedGroups = prevGroups.filter(g => g.id !== groupId);

      childrenOfDeleted.forEach(child => {
        const childIndex = updatedGroups.findIndex(g => g.id === child.id);
        if (childIndex !== -1) {
          updatedGroups[childIndex] = { ...updatedGroups[childIndex], parentId: groupToDelete.parentId };
        }
      });
      
      return updatedGroups;
    });
    toast({ title: "Group Deleted", description: "Group deleted. Subgroups were re-parented.", variant: "default" });
  };

  const toggleExpand = (groupId: string) => {
    setExpandedGroups(prev => ({ ...prev, [groupId]: !prev[groupId] }));
  };
  
  const buildGroupHierarchy = (allCurrentGroups: FamilyGroup[], parentId?: string, level = 0): GroupWithHierarchy[] => {
    return allCurrentGroups
      .filter(group => group.parentId === parentId)
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
                    
                    let currentParentIdToCheck = g.id;
                    while(currentParentIdToCheck) {
                      const parentGroup = groups.find(p => p.id === currentParentIdToCheck);
                      if (!parentGroup) break;
                      if (parentGroup.id === editingGroup.id) return false; // Found editingGroup in ancestors of g
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
    
