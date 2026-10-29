'use server';
/**
 * @fileOverview An AI assistant for planning Festa Junina events.
 *
 * - aiPartyPlanningAssistant - A function that provides decoration, music, and recipe suggestions.
 * - AiPartyPlanningAssistantInput - The input type for the aiPartyPlanningAssistant function.
 * - AiPartyPlanningAssistantOutput - The return type for the aiPartyPlanningAssistant function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AiPartyPlanningAssistantInputSchema = z.object({
  eventSize:
    z.string()
      .describe(
        'The size of the Festa Junina event (e.g., "small gathering", "medium party", "large school event", "10 people", "50 guests").'
      ),
  theme:
    z.string()
      .describe(
        'The specific theme or style of the Festa Junina (e.g., "traditional", "modern", "rustic", "kids friendly", "country style").'
      ),
});
export type AiPartyPlanningAssistantInput = z.infer<typeof AiPartyPlanningAssistantInputSchema>;

const AiPartyPlanningAssistantOutputSchema = z.object({
  decorationIdeas:
    z.array(z.string())
      .describe(
        'A list of creative and specific decoration ideas suitable for the specified event size and theme. Include colors and materials.'
      ),
  musicPlaylistSuggestions:
    z.array(z.string())
      .describe(
        'A list of music playlist suggestions, including genres, specific songs, or artists that fit the Festa Junina theme and event vibe.'
      ),
  recipeSuggestions:
    z.array(z.string())
      .describe(
        'A list of traditional or themed Festa Junina recipe suggestions, including both savory and sweet options, appropriate for the event size.'
      ),
});
export type AiPartyPlanningAssistantOutput = z.infer<typeof AiPartyPlanningAssistantOutputSchema>;

export async function aiPartyPlanningAssistant(
  input: AiPartyPlanningAssistantInput
): Promise<AiPartyPlanningAssistantOutput> {
  return aiPartyPlanningAssistantFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiPartyPlanningAssistantPrompt',
  input: { schema: AiPartyPlanningAssistantInputSchema },
  output: { schema: AiPartyPlanningAssistantOutputSchema },
  prompt: `You are an expert Festa Junina party planner assistant. Your goal is to help users organize an unforgettable Festa Junina by providing tailored suggestions.\n\nThe user is planning a Festa Junina event with the following characteristics:\nEvent Size: {{{eventSize}}}\nTheme: {{{theme}}}\n\nPlease provide creative and specific suggestions for:\n1.  **Decoration Ideas**: Be detailed about specific elements, colors, and materials.\n2.  **Music Playlist Suggestions**: Include genres, artists, or specific songs that fit the Festa Junina spirit.\n3.  **Recipe Suggestions**: Suggest traditional Festa Junina foods, both savory and sweet, keeping the event size in mind.\n\nEnsure the suggestions are practical and inspiring.`,
});

const aiPartyPlanningAssistantFlow = ai.defineFlow(
  {
    name: 'aiPartyPlanningAssistantFlow',
    inputSchema: AiPartyPlanningAssistantInputSchema,
    outputSchema: AiPartyPlanningAssistantOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
