
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { DownloadCloud, FileText, Columns } from 'lucide-react'; // Using Columns for CSV

type ExportFormat = 'csv' | 'txt';

interface ExportContactsModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onExport: (format: ExportFormat) => void;
  contactCount: number; // This will now be the total number of contacts
}

export function ExportContactsModal({
  isOpen,
  onOpenChange,
  onExport,
  contactCount,
}: ExportContactsModalProps) {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('csv');

  const handleExportClick = () => {
    onExport(selectedFormat);
    onOpenChange(false); // Close modal after initiating export
  };

  const closeModal = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DownloadCloud className="h-6 w-6 text-primary" />
            Export Contacts
          </DialogTitle>
          <DialogDescription>
            Choose a format to export all {contactCount} contacts.
            PDF export is not available at this time.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <RadioGroup
            value={selectedFormat}
            onValueChange={(value) => setSelectedFormat(value as ExportFormat)}
            className="space-y-2"
          >
            <div className="flex items-center space-x-2 p-3 border rounded-md hover:bg-accent/50 transition-colors cursor-pointer has-[[data-state=checked]]:bg-accent has-[[data-state=checked]]:text-accent-foreground">
              <RadioGroupItem value="csv" id="csv" />
              <Label htmlFor="csv" className="flex-grow cursor-pointer">
                <div className="flex items-center gap-2">
                  <Columns className="h-5 w-5" />
                  <div>
                    <p className="font-semibold">CSV (Comma Separated Values)</p>
                    <p className="text-xs text-muted-foreground">Best for spreadsheets (Excel, Google Sheets).</p>
                  </div>
                </div>
              </Label>
            </div>
            <div className="flex items-center space-x-2 p-3 border rounded-md hover:bg-accent/50 transition-colors cursor-pointer has-[[data-state=checked]]:bg-accent has-[[data-state=checked]]:text-accent-foreground">
              <RadioGroupItem value="txt" id="txt" />
              <Label htmlFor="txt" className="flex-grow cursor-pointer">
                 <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  <div>
                    <p className="font-semibold">TXT (Plain Text)</p>
                    <p className="text-xs text-muted-foreground">Simple text file, human-readable.</p>
                  </div>
                </div>
              </Label>
            </div>
          </RadioGroup>
           {contactCount === 0 && (
            <p className="text-sm text-destructive text-center">
              No contacts are available to export.
            </p>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={closeModal}>
            Cancel
          </Button>
          <Button onClick={handleExportClick} disabled={contactCount === 0}>
            Export as {selectedFormat.toUpperCase()}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

