import type { ContactSource } from '@/types';
import { Mail, Smartphone, MessageSquare, Globe } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ContactSourceIconsProps {
  sources?: ContactSource[];
  className?: string;
}

const sourceIconMap: Record<ContactSource, React.ElementType> = {
  gmail: Mail,
  sim: Smartphone,
  whatsapp: MessageSquare,
  other: Globe,
};

const sourceNameMap: Record<ContactSource, string> = {
  gmail: 'Gmail',
  sim: 'SIM Card',
  whatsapp: 'WhatsApp',
  other: 'Other',
};

export function ContactSourceIcons({ sources, className }: ContactSourceIconsProps) {
  if (!sources || sources.length === 0) {
    return null;
  }

  return (
    <TooltipProvider>
      <div className={`flex space-x-1.5 ${className}`}>
        {sources.map((source) => {
          const IconComponent = sourceIconMap[source];
          const sourceName = sourceNameMap[source];
          if (!IconComponent) return null;
          return (
            <Tooltip key={source}>
              <TooltipTrigger asChild>
                <span className="flex items-center justify-center p-1 bg-secondary rounded-full">
                  <IconComponent className="h-3 w-3 text-muted-foreground" />
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p>{sourceName}</p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
}
