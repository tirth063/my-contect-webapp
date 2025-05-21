'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, Users, UserCheck } from 'lucide-react';
import { suggestGroupForContact, type SuggestGroupForContactInput, type SuggestGroupForContactOutput } from '@/ai/flows/smart-group-suggestions';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

interface SmartSuggestionModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  contactName: string;
  existingContactNames: string[];
  familyGroupNames: string[];
  friendGroupNames: string[];
  onSuggestionAccepted: (suggestedGroup: string) => void;
}

export function SmartSuggestionModal({
  isOpen,
  onOpenChange,
  contactName,
  existingContactNames,
  familyGroupNames,
  friendGroupNames,
  onSuggestionAccepted,
}: SmartSuggestionModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<SuggestGroupForContactOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && contactName) {
      fetchSuggestion();
    } else {
      // Reset state when modal is closed or contactName is not available
      setSuggestion(null);
      setError(null);
      setIsLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, contactName]);

  async function fetchSuggestion() {
    if (!contactName) return;

    setIsLoading(true);
    setError(null);
    setSuggestion(null);

    try {
      const input: SuggestGroupForContactInput = {
        contactName,
        existingContactNames,
        familyGroupNames,
        friendGroupNames,
      };
      const result = await suggestGroupForContact(input);
      setSuggestion(result);
    } catch (err) {
      console.error('Error fetching smart suggestion:', err);
      setError('Failed to get suggestion. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  const handleAcceptSuggestion = () => {
    if (suggestion?.suggestedGroup) {
      onSuggestionAccepted(suggestion.suggestedGroup);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            Smart Group Suggestion
          </DialogTitle>
          <DialogDescription>
            AI-powered suggestion for '{contactName}'.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          {isLoading && (
            <div className="flex items-center justify-center h-24">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="ml-2 text-muted-foreground">Analyzing contact...</p>
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {!isLoading && !error && suggestion && (
            <div>
              {suggestion.suggestedGroup ? (
                <Alert variant="default" className="bg-accent/20 border-accent">
                  <UserCheck className="h-5 w-5 text-accent-foreground" />
                  <AlertTitle className="text-accent-foreground">Suggestion Found!</AlertTitle>
                  <AlertDescription className="text-accent-foreground/80">
                    We suggest adding <span className="font-semibold">{contactName}</span> to the{' '}
                    <Badge variant="outline" className="bg-accent text-accent-foreground border-accent-foreground/50">
                      {suggestion.suggestedGroup}
                    </Badge>{' '}
                    group.
                    <p className="text-xs mt-1">Confidence: {Math.round(suggestion.confidence * 100)}%</p>
                  </AlertDescription>
                </Alert>
              ) : (
                 <Alert>
                  <AlertTitle>No Strong Suggestion</AlertTitle>
                  <AlertDescription>
                    We couldn't find a strong suggestion for this contact. You can manually assign a group.
                     <p className="text-xs mt-1">Confidence: {Math.round(suggestion.confidence * 100)}%</p>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          {suggestion?.suggestedGroup && (
            <Button onClick={handleAcceptSuggestion} className="bg-accent hover:bg-accent/90 text-accent-foreground">
              Accept Suggestion
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
