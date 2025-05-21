
'use client';

import type { Contact } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Mail, Phone, Edit, Trash2, MoreVertical, MapPin, MessageCircle } from 'lucide-react'; // Added MessageCircle
import { ContactSourceIcons } from './contact-source-icons';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useLongPress } from '@/hooks/use-long-press';
import { useIsMobile } from '@/hooks/use-mobile';
import { useToast } from '@/hooks/use-toast';
import { useRef } from 'react';

interface ContactCardProps {
  contact: Contact;
  onEdit?: (contactId: string) => void;
  onDelete?: (contactId: string) => void;
}

// WhatsApp SVG Icon Component
const WhatsAppIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.35 3.43 16.84L2.05 22L7.31 20.62C8.75 21.39 10.35 21.82 12.04 21.82H12.05C17.5 21.82 21.95 17.37 21.95 11.91C21.95 6.45 17.5 2 12.04 2M12.05 3.67C16.57 3.67 20.28 7.38 20.28 11.91C20.28 16.44 16.57 20.15 12.05 20.15H12.04C10.56 20.15 9.14 19.78 7.91 19.11L7.54 18.91L4.35 19.75L5.21 16.64L4.97 16.24C4.21 14.93 3.8 13.45 3.8 11.91C3.8 7.38 7.51 3.67 12.05 3.67M17.36 14.45C17.13 14.91 16.22 15.42 15.68 15.54C15.14 15.66 14.47 15.72 14.13 15.57C13.8 15.42 13.05 15.15 12.12 14.28C10.96 13.21 10.25 11.91 10.06 11.61C9.87 11.31 10.11 11.13 10.29 10.95C10.45 10.79 10.63 10.56 10.8 10.37C10.97 10.18 11.03 10.06 11.18 9.81C11.33 9.56 11.27 9.34 11.18 9.18C11.09 9.02 10.56 7.77 10.33 7.3C10.1 6.83 9.87 6.92 9.71 6.91H9.7C9.53 6.91 9.24 6.91 8.97 7.17C8.7 7.43 8.21 7.86 8.21 8.83C8.21 9.8 9 10.71 9.12 10.89C9.24 11.07 10.53 13.17 12.57 14.02C14.22 14.72 14.62 14.58 15.05 14.54C15.49 14.5 16.28 13.97 16.49 13.53C16.7 13.09 16.7 12.73 16.61 12.58C16.52 12.43 16.31 12.34 16.08 12.22C15.85 12.1 15.17 11.76 14.95 11.67C14.73 11.58 14.58 11.52 14.43 11.76C14.28 12.01 13.97 12.37 13.85 12.52C13.73 12.67 13.61 12.7 13.43 12.61C13.25 12.52 12.61 12.31 11.86 11.64C11.25 11.1 10.83 10.42 10.69 10.18C10.55 9.94 10.67 9.81 10.83 9.67C10.96 9.54 11.12 9.37 11.26 9.22C11.41 9.07 11.49 8.92 11.59 8.77C11.7 8.61 11.64 8.41 11.59 8.29C11.53 8.17 10.92 6.77 10.69 6.31C10.47 5.85 10.24 5.91 10.13 5.9C10.02 5.89 9.87 5.89 9.71 5.89Z" />
  </svg>
);


export function ContactCard({ contact, onEdit, onDelete }: ContactCardProps) {
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const dropdownTriggerRef = useRef<HTMLButtonElement>(null);

  const initials = contact.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  const formatAddress = (address?: LabeledAddress) => { // Updated to accept LabeledAddress
    if (!address) return null;
    const parts = [address.street, address.city, address.state, address.zip, address.country].filter(Boolean);
    return parts.join(', ');
  };


  const cleanPhoneNumberForTel = (phone: string) => {
    return phone.replace(/[^0-9+\-]/g, '');
  };

  const cleanPhoneNumberForWhatsApp = (phone: string) => {
    // WhatsApp links generally prefer digits only, especially for international numbers
    // Remove '+' and any other non-digit characters
    return phone.replace(/[^0-9]/g, '');
  };
  
  const cleanPhoneNumberForSms = (phone: string) => {
    // SMS URI can handle '+' for country codes
    return phone.replace(/[^0-9+]/g, '');
  };


  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: `${type} Copied`,
        description: `${text} copied to clipboard.`,
        className: "bg-accent text-accent-foreground",
      });
    } catch (err) {
      toast({
        title: `Failed to Copy ${type}`,
        description: "Could not copy to clipboard. Please try again.",
        variant: "destructive",
      });
    }
  };

  const nameLongPressProps = useLongPress(
    () => { if (isMobile) copyToClipboard(contact.name, "Name"); },
    () => {} 
  );

  const phoneLongPressProps = useLongPress(
    () => { if (isMobile) copyToClipboard(contact.phoneNumber, "Phone Number"); },
    (e) => { 
      e.stopPropagation();
    }
  );

  const cardLongPressProps = useLongPress(
    () => {
      if (isMobile && dropdownTriggerRef.current) {
        dropdownTriggerRef.current.click(); 
      }
    },
    () => {}
  );

  return (
    <Card 
      className="w-full shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col"
      {...(isMobile ? cardLongPressProps : {})}
    >
      <CardHeader className="flex flex-row items-start justify-between gap-4 p-4">
        <div className="flex items-center gap-4 flex-grow min-w-0">
          <Avatar className="h-12 w-12 shrink-0">
            {contact.avatarUrl ? (
              <AvatarImage src={contact.avatarUrl} alt={contact.name} data-ai-hint="person avatar"/>
            ) : (
              <AvatarFallback>{initials}</AvatarFallback>
            )}
          </Avatar>
          <div className="min-w-0">
            <CardTitle 
              className="text-lg truncate" 
              title={contact.name}
              {...(isMobile ? nameLongPressProps : {})}
            >
              {contact.name}
            </CardTitle>
            {contact.email && (
              <a
                href={`mailto:${contact.email}`}
                className="text-xs flex items-center gap-1 text-muted-foreground hover:text-primary hover:underline truncate"
                onClick={(e) => e.stopPropagation()}
                title={contact.email}
              >
                <Mail className="h-3 w-3 shrink-0" /> 
                <span className="truncate">{contact.email}</span>
              </a>
            )}
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild ref={dropdownTriggerRef}>
            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {onEdit && <DropdownMenuItem onClick={() => onEdit(contact.id)}><Edit className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem>}
            {onDelete && <DropdownMenuItem onClick={() => onDelete(contact.id)} className="text-destructive focus:text-destructive focus:bg-destructive/10"><Trash2 className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>}
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="p-4 pt-0 flex-grow">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Phone className="h-4 w-4 shrink-0" />
          <a 
            href={`tel:${cleanPhoneNumberForTel(contact.phoneNumber)}`} 
            className="hover:text-primary hover:underline truncate"
            onClick={(e) => e.stopPropagation()}
            {...(isMobile ? phoneLongPressProps : {})}
            title={`Call ${contact.phoneNumber}`}
          >
            <span className="truncate">{contact.phoneNumber}</span>
          </a>
          <a
            href={`https://wa.me/${cleanPhoneNumberForWhatsApp(contact.phoneNumber)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-green-500"
            title="Open in WhatsApp"
            onClick={(e) => e.stopPropagation()}
          >
            <WhatsAppIcon className="h-4 w-4 shrink-0" />
          </a>
          <a
            href={`sms:${cleanPhoneNumberForSms(contact.phoneNumber)}`}
            className="text-muted-foreground hover:text-primary"
            title="Send SMS/Message"
            onClick={(e) => e.stopPropagation()}
          >
            <MessageCircle className="h-4 w-4 shrink-0" />
          </a>
        </div>
        {contact.alternativeNumbers && contact.alternativeNumbers.length > 0 && (
          <div className="text-xs text-muted-foreground mb-2 ml-6">
            Other: {contact.alternativeNumbers.map((num, idx) => (
              <span key={idx}>
                <a 
                  href={`tel:${cleanPhoneNumberForTel(num)}`}
                  className="hover:text-primary hover:underline"
                  onClick={(e) => e.stopPropagation()}
                  title={`Call ${num}`}
                >
                  {num}
                </a>
                {idx < contact.alternativeNumbers.length - 1 ? ', ' : ''}
              </span>
            ))}
          </div>
        )}
        {contact.addresses && contact.addresses.map((addr, index) => {
          const formattedAddress = formatAddress(addr);
          if (!formattedAddress) return null;
          return (
            <div key={index} className="flex items-start gap-2 text-xs text-muted-foreground mb-2">
              <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0" />
              <div className="break-words">
                {addr.label && <span className="font-medium">{addr.label}: </span>}
                {formattedAddress}
              </div>
            </div>
          );
        })}
         {contact.notes && (
          <p className="text-xs text-muted-foreground italic border-l-2 border-primary pl-2 py-1 my-2 bg-secondary/30 rounded-r-sm break-words">
            {contact.notes}
          </p>
        )}
        <div className="flex justify-between items-center mt-auto pt-3">
          <ContactSourceIcons sources={contact.sources} />
           {contact.groupIds && contact.groupIds.length > 0 && ( // Check if groupIds exist and is not empty
            // Placeholder for group display. Actual names would require fetching/mapping.
            <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full border border-blue-300">
              {contact.groupIds.length} Group(s)
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
