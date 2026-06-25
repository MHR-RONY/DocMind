import { config } from './env';

/**
 * Minimal typed transport for the Voyage AI HTTP API.
 *
 * Voyage AI ships no official Node SDK, so this thin client wraps native
 * `fetch`, injecting the Bearer token and JSON headers. Higher-level services
 * (e.g. the embedding service) call `post<T>()` with the desired path and body.
 *
 * The API key is never included in thrown errors or logs.
 */

const VOYAGE_BASE_URL = 'https://api.voyageai.com/v1';

export class VoyageClient {
  private readonly baseUrl: string;
  private readonly apiKey: string;

  constructor(apiKey: string, baseUrl: string = VOYAGE_BASE_URL) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  /**
   * Issues a POST request to the Voyage API and returns the parsed JSON body.
   *
   * @param path Path relative to the base URL (e.g. `/embeddings`).
   * @param body Request payload, serialized as JSON.
   * @throws Error with the HTTP status and response text on any non-2xx
   *         response. The API key is never included in the message.
   */
  async post<T>(path: string, body: unknown): Promise<T> {
    const url = `${this.baseUrl}${path.startsWith('/') ? path : `/${path}`}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      let detail = '';
      try {
        detail = await response.text();
      } catch {
        detail = '<unreadable response body>';
      }
      throw new Error(
        `Voyage API request to ${path} failed with status ${response.status}: ${detail}`,
      );
    }

    return (await response.json()) as T;
  }
}

/**
 * Shared Voyage client instance, configured from validated env.
 */
export const voyageClient = new VoyageClient(config.voyage.apiKey);
