
import type { Contact } from '@/types';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Mail, Phone, Edit, Trash2, MoreVertical, MapPin, MessageSquare } from 'lucide-react';
import { ContactSourceIcons } from './contact-source-icons';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface ContactCardProps {
  contact: Contact;
  onEdit?: (contactId: string) => void;
  onDelete?: (contactId: string) => void;
}

export function ContactCard({ contact, onEdit, onDelete }: ContactCardProps) {
  const initials = contact.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  const formatAddress = (address: Contact['address']) => {
    if (!address) return null;
    const parts = [address.street, address.city, address.state, address.zip, address.country].filter(Boolean);
    return parts.join(', ');
  };

  const displayAddress = formatAddress(contact.address);

  const cleanPhoneNumberForTel = (phone: string) => {
    return phone.replace(/[^0-9+\-]/g, '');
  };

  const cleanPhoneNumberForWhatsApp = (phone: string) => {
    return phone.replace(/[^0-9]/g, ''); // WhatsApp links usually prefer digits only
  };

  return (
    <Card className="w-full shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col">
      <CardHeader className="flex flex-row items-start justify-between gap-4 p-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-12 w-12">
            {contact.avatarUrl ? (
              <AvatarImage src={contact.avatarUrl} alt={contact.name} data-ai-hint="person avatar"/>
            ) : (
              <AvatarFallback>{initials}</AvatarFallback>
            )}
          </Avatar>
          <div>
            <CardTitle className="text-lg">{contact.name}</CardTitle>
            {contact.email && (
              <a
                href={`mailto:${contact.email}`}
                className="text-xs flex items-center gap-1 text-muted-foreground hover:text-primary hover:underline"
                onClick={(e) => e.stopPropagation()} // Prevent card click if any
              >
                <Mail className="h-3 w-3" /> {contact.email}
              </a>
            )}
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
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
          <Phone className="h-4 w-4" />
          <a 
            href={`tel:${cleanPhoneNumberForTel(contact.phoneNumber)}`} 
            className="hover:text-primary hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            {contact.phoneNumber}
          </a>
          <a
            href={`https://wa.me/${cleanPhoneNumberForWhatsApp(contact.phoneNumber)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-green-500"
            title="Open in WhatsApp"
            onClick={(e) => e.stopPropagation()}
          >
            <MessageSquare className="h-4 w-4" />
          </a>
        </div>
        {contact.alternativeNumbers && contact.alternativeNumbers.length > 0 && (
          <div className="text-xs text-muted-foreground mb-2 ml-6"> {/* Indent alternative numbers slightly */}
            Other: {contact.alternativeNumbers.map((num, idx) => (
              <span key={idx}>
                <a 
                  href={`tel:${cleanPhoneNumberForTel(num)}`}
                  className="hover:text-primary hover:underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  {num}
                </a>
                {idx < contact.alternativeNumbers!.length - 1 ? ', ' : ''}
              </span>
            ))}
          </div>
        )}
        {displayAddress && (
          <div className="flex items-start gap-2 text-xs text-muted-foreground mb-2">
            <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0" />
            <span>{displayAddress}</span>
          </div>
        )}
         {contact.notes && (
          <p className="text-xs text-muted-foreground italic border-l-2 border-primary pl-2 py-1 my-2 bg-secondary/30 rounded-r-sm break-words">
            {contact.notes}
          </p>
        )}
        <div className="flex justify-between items-center mt-auto pt-3">
          <ContactSourceIcons sources={contact.sources} />
           {contact.familyGroupId && (
            <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full border border-blue-300">
              {/* TODO: Display group name instead of ID if possible, requires fetching group by ID */}
              Group ID: {contact.familyGroupId}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
