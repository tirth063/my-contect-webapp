
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
import { DUMMY_FAMILY_GROUPS, DUMMY_CONTACTS } from '@/lib/dummy-data';
import type { Contact, FamilyGroup, LabeledAddress } from '@/types';
import { PlusCircle, Trash2, Sparkles, UserCircle, MapPin, ChevronDown } from 'lucide-react';
import { SmartSuggestionModal } from './smart-suggestion-modal';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from '@/components/ui/scroll-area';

const MAX_ALTERNATIVE_NUMBERS = 5;
const MAX_ADDRESSES = 3;

const labeledAddressSchema = z.object({
  label: z.string().optional(),
  street: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip: z.string().optional().refine(val => !val || /^\d{5}(-\d{4})?$/.test(val), { message: "Invalid ZIP code format." }),
  country: z.string().optional(),
});

const contactFormSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  phoneNumber: z.string().min(10, { message: 'Phone number must be at least 10 digits.' }),
  email: z.string().email({ message: 'Invalid email address.' }).optional().or(z.literal('')),
  avatarUrl: z.string().optional(),
  alternativeNumbers: z.array(z.object({ value: z.string().min(10, { message: 'Phone number must be at least 10 digits.'}).optional().or(z.literal('')) })).max(MAX_ALTERNATIVE_NUMBERS).optional(),
  groupIds: z.array(z.string()).optional(),
  displayNames: z.object({
    en: z.string().optional(),
    gu: z.string().optional(),
    hi: z.string().optional(),
  }).optional(),
  notes: z.string().optional(),
  addresses: z.array(labeledAddressSchema).max(MAX_ADDRESSES).optional(),
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
  
  const [existingContactNames, setExistingContactNames] = useState<string[]>([]);
  const [familyGroupNames, setFamilyGroupNames] = useState<string[]>([]); // For suggestion AI
  const [friendGroupNames, setFriendGroupNames] = useState<string[]>([]); // For suggestion AI

  useEffect(() => {
    setExistingContactNames(DUMMY_CONTACTS.map(c => c.name));
    const allGroupNames = DUMMY_FAMILY_GROUPS.map(g => g.name);
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
      groupIds: initialData?.groupIds || [],
      displayNames: {
        en: initialData?.displayNames?.find(dn => dn.lang === 'en')?.name || '',
        gu: initialData?.displayNames?.find(dn => dn.lang === 'gu')?.name || '',
        hi: initialData?.displayNames?.find(dn => dn.lang === 'hi')?.name || '',
      },
      notes: initialData?.notes || '',
      addresses: initialData?.addresses?.slice(0, MAX_ADDRESSES) || [{ label: '', street: '', city: '', state: '', zip: '', country: '' }],
    },
  });

  const { fields: altNumFields, append: appendAltNum, remove: removeAltNum } = useFieldArray({
    control: form.control,
    name: 'alternativeNumbers',
  });

  const { fields: addressFields, append: appendAddress, remove: removeAddress } = useFieldArray({
    control: form.control,
    name: 'addresses',
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

  const handleSuggestionAccepted = (suggestedGroupName: string) => {
    const group = DUMMY_FAMILY_GROUPS.find(g => g.name.toLowerCase() === suggestedGroupName.toLowerCase());
    if (group) {
      const currentGroupIds = form.getValues('groupIds') || [];
      if (!currentGroupIds.includes(group.id)) {
        form.setValue('groupIds', [...currentGroupIds, group.id]);
      }
      toast({
        title: "Suggestion Applied",
        description: `${contactNameToSuggest} added to ${suggestedGroupName} group.`,
        className: "bg-accent text-accent-foreground",
      });
    } else {
       toast({
        title: "Group Not Found",
        description: `Could not find group: ${suggestedGroupName}. Please select manually.`,
        variant: "destructive",
      });
    }
  };
  
  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {/* Column 1: Avatar and Basic Info */}
            <div className="md:col-span-1 space-y-6">
               <FormField
                control={form.control}
                name="avatarUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Avatar</FormLabel>
                    <div className="mt-1 mb-2 flex flex-col items-center">
                      {field.value ? (
                        <div className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-primary shadow-md">
                          <Image src={field.value} alt="Avatar Preview" layout="fill" objectFit="cover" data-ai-hint="contact preview" />
                        </div>
                      ) : (
                        <div className="w-32 h-32 rounded-full bg-muted flex items-center justify-center text-muted-foreground border-2 border-dashed">
                          <UserCircle className="w-24 h-24" />
                        </div>
                      )}
                      {field.value && (
                        <Button
                          type="button"
                          variant="link"
                          size="sm"
                          className="mt-2 text-destructive hover:text-destructive/80"
                          onClick={() => form.setValue('avatarUrl', '', { shouldValidate: true })}
                        >
                          Remove Image
                        </Button>
                      )}
                    </div>
                    <FormControl>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              form.setValue('avatarUrl', reader.result as string, { shouldValidate: true });
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="shadow-sm"
                      />
                    </FormControl>
                     <FormDescription>
                      Upload a photo or leave empty for default icon. Max 1MB.
                    </FormDescription>
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

            {/* Column 2: Groups, Alt Phones, Notes, Addresses Part 1 */}
            <div className="md:col-span-1 space-y-6">
              <FormField
                control={form.control}
                name="groupIds"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel>Family/Friend Groups (Optional)</FormLabel>
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
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="w-full justify-between shadow-sm">
                          <span>
                            {field.value && field.value.length > 0
                              ? `${field.value.length} group(s) selected`
                              : "Select groups"}
                          </span>
                          <ChevronDown className="h-4 w-4 opacity-50" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width]">
                        <DropdownMenuLabel>Assign to Groups</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <ScrollArea className="h-[200px]">
                          {DUMMY_FAMILY_GROUPS.map((group: FamilyGroup) => (
                            <DropdownMenuCheckboxItem
                              key={group.id}
                              checked={field.value?.includes(group.id)}
                              onCheckedChange={(isChecked) => {
                                const currentGroupIds = field.value || [];
                                if (isChecked) {
                                  form.setValue('groupIds', [...currentGroupIds, group.id]);
                                } else {
                                  form.setValue('groupIds', currentGroupIds.filter(id => id !== group.id));
                                }
                              }}
                            >
                              {group.name}
                            </DropdownMenuCheckboxItem>
                          ))}
                        </ScrollArea>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div>
                <FormLabel>Alternative Phone Numbers (Max {MAX_ALTERNATIVE_NUMBERS})</FormLabel>
                {altNumFields.map((field, index) => (
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
                          onClick={() => removeAltNum(index)}
                          className="h-9 w-9 shadow-sm"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                         <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
                {altNumFields.length < MAX_ALTERNATIVE_NUMBERS && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => appendAltNum({ value: '' })}
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
              
              <h3 className="text-md font-medium text-foreground pt-2 border-t">
                <MapPin className="inline-block mr-2 h-5 w-5 text-primary" />
                Addresses (Max {MAX_ADDRESSES}) (Optional)
              </h3>
              {addressFields.map((item, index) => (
                <div key={item.id} className="space-y-3 p-3 border rounded-md shadow-sm relative">
                  {addressFields.length > 1 && (
                     <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeAddress(index)}
                      className="absolute top-1 right-1 h-7 w-7 text-destructive hover:text-destructive/80"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                  <FormField
                    control={form.control}
                    name={`addresses.${index}.label`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Label (e.g., Home, Work)</FormLabel>
                        <FormControl>
                          <Input placeholder="Address Label" {...field} className="shadow-sm" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`addresses.${index}.street`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Street</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., 123 Main St" {...field} className="shadow-sm" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`addresses.${index}.city`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Anytown" {...field} className="shadow-sm" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              ))}
               {addressFields.length < MAX_ADDRESSES && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => appendAddress({ label: '', street: '', city: '', state: '', zip: '', country: '' })}
                  className="mt-2 shadow-sm"
                >
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Address
                </Button>
              )}
            </div>

            {/* Column 3: Addresses Part 2 & Display Names */}
            <div className="md:col-span-1 space-y-6">
              {addressFields.map((item, index) => (
                 <div key={`${item.id}-col3`} className={`space-y-3 ${index > 0 ? 'pt-6 border-t' : ''}`}>
                    {index === 0 && addressFields.length > MAX_ADDRESSES && <p className='text-sm text-muted-foreground'>Additional address fields for index {index}</p>}
                    <FormField
                      control={form.control}
                      name={`addresses.${index}.state`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>State / Province {addressFields.length > 1 ? `(Address ${index +1})`: ''}</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., CA" {...field} className="shadow-sm" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`addresses.${index}.zip`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>ZIP / Postal Code {addressFields.length > 1 ? `(Address ${index +1})`: ''}</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., 90210" {...field} className="shadow-sm" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`addresses.${index}.country`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Country {addressFields.length > 1 ? `(Address ${index +1})`: ''}</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., USA" {...field} className="shadow-sm" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                 </div>
               ))}


              <h3 className="text-md font-medium text-foreground pt-4 border-t">Alternative Display Names (Optional)</h3>
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
            <Button type="button" variant="outline" onClick={() => form.reset(
                 { // Reset to initialData or completely empty form
                    name: initialData?.name || '',
                    phoneNumber: initialData?.phoneNumber || '',
                    email: initialData?.email || '',
                    avatarUrl: initialData?.avatarUrl || '',
                    alternativeNumbers: initialData?.alternativeNumbers?.map(num => ({ value: num })) || [{ value: '' }],
                    groupIds: initialData?.groupIds || [],
                    displayNames: {
                      en: initialData?.displayNames?.find(dn => dn.lang === 'en')?.name || '',
                      gu: initialData?.displayNames?.find(dn => dn.lang === 'gu')?.name || '',
                      hi: initialData?.displayNames?.find(dn => dn.lang === 'hi')?.name || '',
                    },
                    notes: initialData?.notes || '',
                    addresses: initialData?.addresses?.slice(0, MAX_ADDRESSES) || [{ label: '', street: '', city: '', state: '', zip: '', country: '' }],
                  }
            )} disabled={isSubmitting} className="shadow-md">
              Cancel / Reset
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

