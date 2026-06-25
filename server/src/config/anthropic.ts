import Anthropic from '@anthropic-ai/sdk';
import { config } from './env';

/**
 * Shared Anthropic SDK client, configured from validated env.
 * The API key lives only on the server and is never exposed to clients.
 */
export const anthropicClient = new Anthropic({
  apiKey: config.anthropic.apiKey,
});
