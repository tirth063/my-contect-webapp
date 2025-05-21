'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useFieldArray, useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DUMMY_FAMILY_GROUPS, DUMMY_CONTACTS } from '@/lib/dummy-data';
import type { Contact, FamilyGroup } from '@/types';
import { PlusCircle, Trash2, Sparkles, X } from 'lucide-react';
import { SmartSuggestionModal } from './smart-suggestion-modal';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

const MAX_ALTERNATIVE_NUMBERS = 5; // Reduced for better UI, original was 20

const contactFormSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  phoneNumber: z.string().min(10, { message: 'Phone number must be at least 10 digits.' }),
  email: z.string().email({ message: 'Invalid email address.' }).optional().or(z.literal('')),
  avatarUrl: z.string().url({ message: 'Invalid URL.'}).optional().or(z.literal('')),
  alternativeNumbers: z.array(z.object({ value: z.string().min(10, { message: 'Phone number must be at least 10 digits.'}).optional().or(z.literal('')) })).max(MAX_ALTERNATIVE_NUMBERS).optional(),
  familyGroupId: z.string().optional(),
  displayNames: z.object({
    en: z.string().optional(),
    gu: z.string().optional(),
    hi: z.string().optional(),
  }).optional(),
  notes: z.string().optional(),
});

export type ContactFormValues = z.infer<typeof contactFormSchema>;

interface ContactFormProps {
  initialData?: Partial<Contact>;
  onSubmit: (data: ContactFormValues) => void | Promise<void>;
  isSubmitting?: boolean;
}

export function ContactForm({ initialData, onSubmit, isSubmitting }: ContactFormProps) {
  const { toast } = useToast();
  const [isSuggestionModalOpen, setIsSuggestionModalOpen] = useState(false);
  const [contactNameToSuggest, setContactNameToSuggest] = useState('');
  
  // Prepare existing contact names and group names for AI suggestions
  const [existingContactNames, setExistingContactNames] = useState<string[]>([]);
  const [familyGroupNames, setFamilyGroupNames] = useState<string[]>([]);
  const [friendGroupNames, setFriendGroupNames] = useState<string[]>([]); // Assuming friend groups are also family groups for simplicity

  useEffect(() => {
    setExistingContactNames(DUMMY_CONTACTS.map(c => c.name));
    const allGroupNames = DUMMY_FAMILY_GROUPS.map(g => g.name);
    // This is a simplification. In a real app, you'd differentiate family/friend groups.
    setFamilyGroupNames(allGroupNames.filter(name => name.toLowerCase().includes('parent') || name.toLowerCase().includes('sibling') || name.toLowerCase().includes('cousin')));
    setFriendGroupNames(allGroupNames.filter(name => name.toLowerCase().includes('friend')));
  }, []);

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: initialData?.name || '',
      phoneNumber: initialData?.phoneNumber || '',
      email: initialData?.email || '',
      avatarUrl: initialData?.avatarUrl || '',
      alternativeNumbers: initialData?.alternativeNumbers?.map(num => ({ value: num })) || [{ value: '' }],
      familyGroupId: initialData?.familyGroupId || '',
      displayNames: {
        en: initialData?.displayNames?.find(dn => dn.lang === 'en')?.name || '',
        gu: initialData?.displayNames?.find(dn => dn.lang === 'gu')?.name || '',
        hi: initialData?.displayNames?.find(dn => dn.lang === 'hi')?.name || '',
      },
      notes: initialData?.notes || '',
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'alternativeNumbers',
  });

  const watchName = form.watch('name');

  const handleFormSubmit = async (data: ContactFormValues) => {
    try {
      await onSubmit(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save contact. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleOpenSuggestionModal = () => {
    if (watchName) {
      setContactNameToSuggest(watchName);
      setIsSuggestionModalOpen(true);
    } else {
      toast({
        title: "Contact Name Required",
        description: "Please enter a contact name to get suggestions.",
        variant: "default",
      });
    }
  };

  const handleSuggestionAccepted = (suggestedGroupId: string) => {
    // Find the group ID that matches the suggested group name
    const group = DUMMY_FAMILY_GROUPS.find(g => g.name.toLowerCase() === suggestedGroupId.toLowerCase());
    if (group) {
      form.setValue('familyGroupId', group.id);
      toast({
        title: "Suggestion Applied",
        description: `${contactNameToSuggest} assigned to ${suggestedGroupId} group.`,
        className: "bg-accent text-accent-foreground",
      });
    } else {
       toast({
        title: "Group Not Found",
        description: `Could not find group: ${suggestedGroupId}. Please select manually.`,
        variant: "destructive",
      });
    }
  };
  
  const watchedAvatarUrl = form.watch("avatarUrl");

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Column 1: Avatar and Basic Info */}
            <div className="md:col-span-1 space-y-6">
              <FormField
                control={form.control}
                name="avatarUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Avatar URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com/avatar.png" {...field} className="shadow-sm" />
                    </FormControl>
                    {watchedAvatarUrl && (
                      <div className="mt-2 relative w-32 h-32 rounded-full overflow-hidden border-2 border-primary shadow-md mx-auto">
                        <Image src={watchedAvatarUrl} alt="Avatar Preview" layout="fill" objectFit="cover" data-ai-hint="person avatar" />
                      </div>
                    )}
                     {!watchedAvatarUrl && (
                      <div className="mt-2 w-32 h-32 rounded-full bg-muted flex items-center justify-center text-muted-foreground text-4xl font-semibold border-2 border-dashed mx-auto">
                        {watchName ? watchName.substring(0,2).toUpperCase() : "?? "}
                      </div>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., John Doe" {...field} className="shadow-sm" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Primary Phone Number</FormLabel>
                    <FormControl>
                      <Input type="tel" placeholder="e.g., (123) 456-7890" {...field} className="shadow-sm" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address (Optional)</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="e.g., john.doe@example.com" {...field} className="shadow-sm" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Column 2: Additional Info */}
            <div className="md:col-span-1 space-y-6">
              <FormField
                control={form.control}
                name="familyGroupId"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel>Family/Friend Group (Optional)</FormLabel>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleOpenSuggestionModal}
                        className="text-xs text-primary hover:text-primary/80"
                        disabled={!watchName}
                      >
                        <Sparkles className="mr-1 h-3 w-3" /> Get Suggestion
                      </Button>
                    </div>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="shadow-sm">
                          <SelectValue placeholder="Select a group" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">None</SelectItem>
                        {DUMMY_FAMILY_GROUPS.map((group: FamilyGroup) => (
                          <SelectItem key={group.id} value={group.id}>
                            {group.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div>
                <FormLabel>Alternative Phone Numbers (Max {MAX_ALTERNATIVE_NUMBERS})</FormLabel>
                {fields.map((field, index) => (
                  <FormField
                    key={field.id}
                    control={form.control}
                    name={`alternativeNumbers.${index}.value`}
                    render={({ field: itemField }) => (
                      <FormItem className="flex items-center gap-2 mt-2">
                        <FormControl>
                          <Input type="tel" placeholder={`Alternative number ${index + 1}`} {...itemField} className="flex-grow shadow-sm" />
                        </FormControl>
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          onClick={() => remove(index)}
                          className="h-9 w-9 shadow-sm"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </FormItem>
                    )}
                  />
                ))}
                {fields.length < MAX_ALTERNATIVE_NUMBERS && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => append({ value: '' })}
                    className="mt-2 shadow-sm"
                  >
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Number
                  </Button>
                )}
              </div>
              
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes (Optional)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Any notes about this contact..." {...field} className="shadow-sm min-h-[100px]" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Column 3: Display Names */}
            <div className="md:col-span-1 space-y-6">
              <h3 className="text-md font-medium text-foreground">Alternative Display Names (Optional)</h3>
              <FormField
                control={form.control}
                name="displayNames.en"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>English</FormLabel>
                    <FormControl>
                      <Input placeholder="Display name in English" {...field} className="shadow-sm" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="displayNames.gu"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ગુજરાતી (Gujarati)</FormLabel>
                    <FormControl>
                      <Input placeholder="ગુજરાતીમાં નામ દર્શાવો" {...field} className="shadow-sm" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="displayNames.hi"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>हिन्दी (Hindi)</FormLabel>
                    <FormControl>
                      <Input placeholder="हिंदी में नाम प्रदर्शित करें" {...field} className="shadow-sm" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-4 pt-8 border-t">
            <Button type="button" variant="outline" onClick={() => form.reset()} disabled={isSubmitting} className="shadow-md">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="shadow-md hover:shadow-lg transition-shadow">
              {isSubmitting ? 'Saving...' : (initialData?.id ? 'Update Contact' : 'Create Contact')}
            </Button>
          </div>
        </form>
      </Form>

      <SmartSuggestionModal
        isOpen={isSuggestionModalOpen}
        onOpenChange={setIsSuggestionModalOpen}
        contactName={contactNameToSuggest}
        existingContactNames={existingContactNames}
        familyGroupNames={familyGroupNames}
        friendGroupNames={friendGroupNames}
        onSuggestionAccepted={handleSuggestionAccepted}
      />
    </>
  );
}
