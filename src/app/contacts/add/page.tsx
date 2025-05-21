'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ContactForm, type ContactFormValues } from '@/components/contact-form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import type { Contact, DisplayName, LabeledAddress, ContactSource } from '@/types'; // Added Contact
import { DUMMY_CONTACTS } from '@/lib/dummy-data'; // For adding to dummy data

export default function AddContactPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: ContactFormValues) => {
    setIsSubmitting(true);
    console.log('New contact form data:', data);

    // Transform form data to Contact structure
    const displayNamesArray: DisplayName[] = [];
    if (data.displayNames) {
      if (data.displayNames.en) displayNamesArray.push({ lang: 'en', name: data.displayNames.en });
      if (data.displayNames.gu) displayNamesArray.push({ lang: 'gu', name: data.displayNames.gu });
      if (data.displayNames.hi) displayNamesArray.push({ lang: 'hi', name: data.displayNames.hi });
    }

    const alternativeNumbersArray: string[] = data.alternativeNumbers
      ?.map(numObj => numObj.value)
      .filter((num): num is string => typeof num === 'string' && num.trim() !== '') || [];
    
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

    const newContact: Contact = {
      id: `contact-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`, // Generate unique ID
      name: data.name,
      phoneNumber: data.phoneNumber,
      email: data.email || undefined,
      avatarUrl: data.avatarUrl || undefined,
      notes: data.notes || undefined,
      groupIds: data.groupIds || [],
      addresses: addressesArray.length > 0 ? addressesArray : undefined,
      displayNames: displayNamesArray.length > 0 ? displayNamesArray : undefined,
      alternativeNumbers: alternativeNumbersArray.length > 0 ? alternativeNumbersArray : undefined,
      sources: ['other'] as ContactSource[], // Default source, can be refined
    };

    DUMMY_CONTACTS.push(newContact); // Add to our dummy data source
    console.log('Added to DUMMY_CONTACTS:', newContact);
    
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
    
    toast({
      title: "Contact Created",
      description: `${data.name} has been successfully added to your contacts.`,
      className: "bg-accent text-accent-foreground",
    });
    setIsSubmitting(false);
    router.push('/'); 
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <Button variant="outline" asChild className="mb-4 shadow-sm">
           <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Contacts
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Add New Contact</h1>
        <p className="text-muted-foreground">
          Fill in the details below to add a new contact to My-Contact.
        </p>
      </div>
      <Card className="shadow-xl">
        <CardContent className="p-6 md:p-8">
          <ContactForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
        </CardContent>
      </Card>
    </div>
  );
}
