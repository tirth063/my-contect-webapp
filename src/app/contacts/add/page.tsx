'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ContactForm, type ContactFormValues } from '@/components/contact-form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function AddContactPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: ContactFormValues) => {
    setIsSubmitting(true);
    console.log('New contact data:', data);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // This is where you would typically add the contact to your data store
    // For now, we'll just show a success message and redirect

    toast({
      title: "Contact Created",
      description: `${data.name} has been successfully added to your contacts.`,
      className: "bg-accent text-accent-foreground", // Muted green for success
    });
    setIsSubmitting(false);
    router.push('/'); // Redirect to home/contacts list page
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
          Fill in the details below to add a new contact to your ContactNexus.
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
