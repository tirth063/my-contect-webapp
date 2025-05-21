'use server';

/**
 * @fileOverview Provides AI-powered suggestions for adding contacts to family and friend lists
 * based on name similarity with existing contacts.
 *
 * - suggestGroupForContact - A function that suggests which group (family/friend) a contact should be added to.
 * - SuggestGroupForContactInput - The input type for the suggestGroupForContact function.
 * - SuggestGroupForContactOutput - The return type for the suggestGroupForContact function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestGroupForContactInputSchema = z.object({
  contactName: z.string().describe('The name of the contact to suggest a group for.'),
  existingContactNames: z
    .array(z.string())
    .describe('The names of existing contacts in the user\'s address book.'),
  familyGroupNames: z
    .array(z.string())
    .describe('The names of existing groups that are family groups'),
  friendGroupNames: z
    .array(z.string())
    .describe('The names of existing groups that are friend groups'),
});
export type SuggestGroupForContactInput = z.infer<typeof SuggestGroupForContactInputSchema>;

const SuggestGroupForContactOutputSchema = z.object({
  suggestedGroup: z
    .string()
    .describe(
      'The suggested group (family or friend) to add the contact to, or null if no suggestion is appropriate.'
    )
    .nullable(),
  confidence: z
    .number()
    .describe('A confidence score (0-1) indicating the certainty of the suggestion.'),
});
export type SuggestGroupForContactOutput = z.infer<typeof SuggestGroupForContactOutputSchema>;

export async function suggestGroupForContact(
  input: SuggestGroupForContactInput
): Promise<SuggestGroupForContactOutput> {
  return suggestGroupForContactFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestGroupForContactPrompt',
  input: {schema: SuggestGroupForContactInputSchema},
  output: {schema: SuggestGroupForContactOutputSchema},
  prompt: `You are a contact management assistant helping users organize their contacts.

  Given the contact name "{{contactName}}" and the existing contact names: "{{existingContactNames}}", and the existing family group names: "{{familyGroupNames}}", and the existing friend group names: "{{friendGroupNames}}", suggest whether the contact should be added to a family or friend group based on name similarity.

  Return null if no suggestion is appropriate, and a confidence score between 0 and 1.`,
});

const suggestGroupForContactFlow = ai.defineFlow(
  {
    name: 'suggestGroupForContactFlow',
    inputSchema: SuggestGroupForContactInputSchema,
    outputSchema: SuggestGroupForContactOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
