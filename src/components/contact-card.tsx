import type { Contact } from '@/types';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Mail, Phone, Edit, Trash2, MoreVertical } from 'lucide-react';
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

  return (
    <Card className="w-full shadow-lg hover:shadow-xl transition-shadow duration-300">
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
              <CardDescription className="text-xs flex items-center gap-1">
                <Mail className="h-3 w-3" /> {contact.email}
              </CardDescription>
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
      <CardContent className="p-4 pt-0">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Phone className="h-4 w-4" />
          <span>{contact.phoneNumber}</span>
        </div>
        {contact.alternativeNumbers && contact.alternativeNumbers.length > 0 && (
          <div className="text-xs text-muted-foreground mb-2">
            Other numbers: {contact.alternativeNumbers.join(', ')}
          </div>
        )}
         {contact.notes && (
          <p className="text-xs text-muted-foreground italic border-l-2 border-primary pl-2 py-1 my-2 bg-secondary/30 rounded-r-sm">
            {contact.notes}
          </p>
        )}
        <div className="flex justify-between items-center mt-3">
          <ContactSourceIcons sources={contact.sources} />
           {contact.familyGroupId && (
            <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full border border-blue-300">
              Group ID: {contact.familyGroupId}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
