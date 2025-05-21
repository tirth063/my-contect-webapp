'use client';

import { useState, useEffect } from 'react';
import { DUMMY_FAMILY_GROUPS } from '@/lib/dummy-data';
import type { FamilyGroup } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlusCircle, Users, Edit2, Trash2, Search, ChevronDown, ChevronRight } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from "@/hooks/use-toast";

interface GroupWithHierarchy extends FamilyGroup {
  children?: GroupWithHierarchy[];
  level: number;
}

export default function FamilyGroupsPage() {
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
      setGroups(groups.map(g => g.id === editingGroup.id ? { ...g, name: newGroupName, description: newGroupDescription, parentId: newGroupParentId } : g));
      toast({ title: "Group Updated", description: `Group "${newGroupName}" updated successfully.`, className: "bg-accent text-accent-foreground" });
    } else {
      const newGroup: FamilyGroup = {
        id: `group-${Date.now()}`,
        name: newGroupName,
        description: newGroupDescription,
        parentId: newGroupParentId,
        members: [],
      };
      setGroups([...groups, newGroup]);
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
    // Also need to handle children or prevent deletion if it has children/members
    setGroups(groups.filter(g => g.id !== groupId && g.parentId !== groupId)); // Basic child removal
    toast({ title: "Group Deleted", description: "Group deleted successfully.", variant: "default" });
  };

  const toggleExpand = (groupId: string) => {
    setExpandedGroups(prev => ({ ...prev, [groupId]: !prev[groupId] }));
  };
  
  const buildGroupHierarchy = (parentId?: string, level = 0): GroupWithHierarchy[] => {
    return groups
      .filter(group => group.parentId === parentId)
      .filter(group => group.name.toLowerCase().includes(searchTerm.toLowerCase()))
      .map(group => ({
        ...group,
        level,
        children: buildGroupHierarchy(group.id, level + 1),
      }));
  };

  const displayedGroupsHierarchy = buildGroupHierarchy();

  const renderGroupItem = (group: GroupWithHierarchy) => (
    <div key={group.id} style={{ marginLeft: `${group.level * 2}rem` }} className="my-1">
      <Card className="shadow-sm hover:shadow-md transition-shadow">
        <CardContent className="p-3 flex items-center justify-between">
          <div className="flex items-center">
            {group.children && group.children.length > 0 && (
              <Button variant="ghost" size="icon" onClick={() => toggleExpand(group.id)} className="mr-2 h-7 w-7">
                {expandedGroups[group.id] ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </Button>
            )}
            <div className={`${group.children && group.children.length > 0 ? '' : 'ml-9'}`}> {/* Indent if no expand icon */}
              <p className="font-semibold text-md text-foreground">{group.name}</p>
              {group.description && <p className="text-xs text-muted-foreground">{group.description}</p>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => openModalForNew(group.id)} className="text-xs">
              <PlusCircle className="h-3 w-3 mr-1" /> Add Subgroup
            </Button>
            <Button variant="outline" size="icon" onClick={() => openModalForEdit(group)} className="h-7 w-7">
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button variant="destructive" size="icon" onClick={() => handleDeleteGroup(group.id)} className="h-7 w-7">
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
        <Input
            type="search"
            placeholder="Search groups..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full shadow-inner"
            icon={<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />}
          />
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
              {searchTerm ? "Try a different search term." : "Create a group to organize your contacts."}
            </CardDescription>
          </CardHeader>
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
                className="w-full p-2 border rounded-md shadow-sm bg-background text-foreground border-input"
              >
                <option value="">None (Top-level group)</option>
                {groups.filter(g => g.id !== editingGroup?.id).map(group => ( // Prevent self-parenting
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
