
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ContactForm, type ContactFormValues } from '@/components/contact-form';
import { Card, CardContent, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, UserCog } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import type { Contact } from '@/types';
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
    console.log('Updated contact data for ID:', contactId, data);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // This is where you would typically update the contact in your data store
    // For now, we'll just show a success message and redirect

    toast({
      title: "Contact Updated",
      description: `${data.name} has been successfully updated.`,
      className: "bg-accent text-accent-foreground",
    });
    setIsSubmitting(false);
    router.push('/'); // Redirect to home/contacts list page
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
  
  // Transform displayNames array to the object structure expected by the form
  const initialFormValues: Partial<ContactFormValues> = {
    ...contact,
    displayNames: contact.displayNames?.reduce((acc, dn) => {
      acc[dn.lang] = dn.name;
      return acc;
    }, {} as Record<'en' | 'gu' | 'hi', string | undefined>) || {},
  };


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
            initialData={initialFormValues} 
            onSubmit={handleSubmit} 
            isSubmitting={isSubmitting} 
          />
        </CardContent>
      </Card>
    </div>
  );
}
