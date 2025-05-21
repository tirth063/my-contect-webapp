
'use client';

import type { ChangeEvent } from 'react'; // Added for potential future use with more complex inputs
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ContactForm, type ContactFormValues } from '@/components/contact-form';
import { Card, CardContent } from '@/components/ui/card'; // Removed CardDescription as it wasn't used
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, UserCog } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import type { Contact, DisplayName, LabeledAddress } from '@/types';
import { DUMMY_CONTACTS } from '@/lib/dummy-data'; // Simulating data fetching

export default function EditContactPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [contact, setContact] = useState<Contact | null | undefined>(undefined); // undefined: loading, null: not found

  const contactId = params.id as string;

  useEffect(() => {
    if (contactId) {
      // Simulate fetching contact data
      const foundContact = DUMMY_CONTACTS.find(c => c.id === contactId);
      setContact(foundContact || null);
    }
  }, [contactId]);

  const handleSubmit = async (data: ContactFormValues) => {
    setIsSubmitting(true);
    console.log('Updated contact form data for ID:', contactId, data);

    const contactIndex = DUMMY_CONTACTS.findIndex(c => c.id === contactId);

    if (contactIndex === -1) {
      toast({
        title: "Error",
        description: "Contact not found for update.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      router.push('/');
      return;
    }

    // Transform displayNames from form object to array of DisplayName objects
    const displayNamesArray: DisplayName[] = [];
    if (data.displayNames) {
      if (data.displayNames.en) displayNamesArray.push({ lang: 'en', name: data.displayNames.en });
      if (data.displayNames.gu) displayNamesArray.push({ lang: 'gu', name: data.displayNames.gu });
      if (data.displayNames.hi) displayNamesArray.push({ lang: 'hi', name: data.displayNames.hi });
    }

    // Transform alternativeNumbers from array of objects to array of strings
    const alternativeNumbersArray: string[] = data.alternativeNumbers
      ?.map(numObj => numObj.value)
      .filter((num): num is string => typeof num === 'string' && num.trim() !== '') || [];

    // Transform addresses, ensuring empty strings become undefined for optional fields
    const addressesArray: LabeledAddress[] = data.addresses?.map(addr => ({
        label: addr.label || undefined,
        street: addr.street || undefined,
        city: addr.city || undefined,
        state: addr.state || undefined,
        zip: addr.zip || undefined,
        country: addr.country || undefined,
      })).filter(addr => 
        addr.label || addr.street || addr.city || addr.state || addr.zip || addr.country
      ) || [];


    const updatedContact: Contact = {
      ...(DUMMY_CONTACTS[contactIndex]), 
      name: data.name,
      phoneNumber: data.phoneNumber,
      email: data.email || undefined,
      avatarUrl: data.avatarUrl || undefined,
      notes: data.notes || undefined,
      
      groupIds: data.groupIds || [], // Handle array of group IDs
      
      addresses: addressesArray.length > 0 ? addressesArray : undefined,
      displayNames: displayNamesArray.length > 0 ? displayNamesArray : undefined,
      alternativeNumbers: alternativeNumbersArray.length > 0 ? alternativeNumbersArray : undefined,
      // sources are not part of the form, so they remain unchanged from the original contact
    };

    DUMMY_CONTACTS[contactIndex] = updatedContact;
    console.log('Updated DUMMY_CONTACTS:', DUMMY_CONTACTS);

    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
    
    toast({
      title: "Contact Updated",
      description: `${data.name} has been successfully updated.`,
      className: "bg-accent text-accent-foreground",
    });
    setIsSubmitting(false);
    router.push('/'); 
  };

  if (contact === undefined) {
    return (
      <div className="max-w-5xl mx-auto text-center py-10">
        <UserCog className="mx-auto h-12 w-12 text-muted-foreground animate-spin mb-4" />
        <p className="text-lg text-foreground">Loading contact details...</p>
      </div>
    );
  }

  if (contact === null) {
    return (
      <div className="max-w-5xl mx-auto text-center py-10">
        <h1 className="text-2xl font-bold text-destructive mb-4">Contact Not Found</h1>
        <p className="text-muted-foreground mb-6">
          The contact you are trying to edit does not exist.
        </p>
        <Button variant="outline" asChild>
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Contacts
          </Link>
        </Button>
      </div>
    );
  }
  
  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <Button variant="outline" asChild className="mb-4 shadow-sm">
           <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Contacts
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Edit Contact: {contact.name}</h1>
        <p className="text-muted-foreground">
          Modify the details below for {contact.name}.
        </p>
      </div>
      <Card className="shadow-xl">
        <CardContent className="p-6 md:p-8">
          <ContactForm 
            initialData={contact} // Pass the full contact object
            onSubmit={handleSubmit} 
            isSubmitting={isSubmitting} 
          />
        </CardContent>
      </Card>
    </div>
  );
}
