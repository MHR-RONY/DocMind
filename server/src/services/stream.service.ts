import { Request, Response } from 'express';
import { config } from '../config/env';
import { anthropicClient } from '../config/anthropic';
import { MessageRole } from '../types/enums';
import { ITokenUsage } from '../types/message.types';
import { sanitizeChatMessage } from '../utils/sanitize';
import * as chatSessionService from './chatSession.service';
import * as chatService from './chat.service';
import * as ragService from './rag.service';
import * as voyageService from './voyage.service';

/**
 * Streaming chat service (Server-Sent Events).
 *
 * Drives the full RAG query pipeline and streams the assistant's answer to the
 * client token-by-token over SSE. Critical invariants (see CLAUDE.md):
 *  - SSE headers are set exactly once, before any event is written.
 *  - Every `data:` payload is JSON-serialized (never hand-concatenated), since
 *    model/user text may contain quotes or newlines.
 *  - Raw Anthropic errors are NEVER forwarded to the client; a generic error
 *    event is emitted and the true error is logged server-side.
 *  - On client disconnect the upstream Anthropic stream is aborted to stop
 *    token usage immediately.
 *  - The assembled assistant message is persisted only after a successful
 *    stream completion.
 */

/** Parameters required to open and drive a streaming chat response. */
interface StreamChatParams {
  res: Response;
  req: Request;
  sessionId: string;
  userId: string;
  userMessage: string;
}

/**
 * Writes a single SSE event frame. Guards against writing after the response
 * has already ended (e.g. the client disconnected mid-stream).
 */
const writeSseEvent = (res: Response, payload: unknown): void => {
  if (res.writableEnded) {
    return;
  }
  res.write(`data: ${JSON.stringify(payload)}\n\n`);
};

/**
 * Streams an assistant response for a chat session over SSE.
 *
 * Ownership is verified BEFORE any header is written, so a failed check can
 * surface as a normal ApiError for the controller to render as JSON. Once the
 * SSE stream is open, all failures are reported through the SSE error event.
 */
export const streamChatResponse = async (
  params: StreamChatParams,
): Promise<void> => {
  const { res, req, sessionId, userId, userMessage } = params;

  // 1. Verify session existence + ownership before opening the stream. Any
  //    failure here throws an ApiError the controller handles as JSON.
  await chatSessionService.getSession(sessionId, userId);

  // Trust-but-verify: the validator already sanitized, but re-sanitize so the
  // persisted/embedded content can never exceed limits or carry HTML.
  const sanitizedMessage = sanitizeChatMessage(userMessage);

  // 2. Open the SSE stream with the exact required headers.
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  let clientClosed = false;

  try {
    // 3. Persist the user's message.
    await chatService.saveMessage(
      sessionId,
      MessageRole.USER,
      sanitizedMessage,
    );

    // 4. Embed the query. 5. Retrieve context. 6. Load history.
    const embedding = await voyageService.generateEmbedding(sanitizedMessage);
    const { context, sourceDocs } = await ragService.buildContext(embedding);
    const history = await chatService.getHistory(
      sessionId,
      config.chatHistoryLimit,
    );

    // 7. Build the prompt (system prompt is server-side and authoritative).
    const { system, messages } = chatService.buildPrompt(
      context,
      history,
      sanitizedMessage,
    );

    // 8. Open the Anthropic stream (never waitForCompletion).
    const stream = anthropicClient.messages.stream({
      model: config.anthropic.model,
      max_tokens: config.anthropic.maxTokens,
      system,
      messages,
    });

    // 9. Abort upstream immediately if the client disconnects, to stop token
    //    usage. Flag the closure so we skip the success path below.
    req.on('close', () => {
      clientClosed = true;
      stream.abort();
    });

    // 10. Stream text deltas to the client as they arrive, accumulating the
    //     full assistant text for later persistence.
    let assembled = '';
    stream.on('text', (textDelta: string): void => {
      assembled += textDelta;
      writeSseEvent(res, { type: 'delta', content: textDelta });
    });

    // 11. Await the final message for authoritative token usage.
    const finalMessage = await stream.finalMessage();

    // If the client disconnected, the stream was aborted; do not emit a done
    // event or persist a partial/aborted response.
    if (clientClosed || res.writableEnded) {
      return;
    }

    const tokenUsage: ITokenUsage = {
      inputTokens: finalMessage.usage.input_tokens,
      outputTokens: finalMessage.usage.output_tokens,
    };

    // 12. Emit completion, then persist the assembled assistant message.
    writeSseEvent(res, {
      type: 'done',
      tokenUsage,
      sourceDocs,
    });

    await chatService.saveMessage(
      sessionId,
      MessageRole.ASSISTANT,
      assembled,
      tokenUsage,
      sourceDocs,
    );

    res.end();
  } catch (error: unknown) {
    // A client-initiated abort surfaces here as an error; it is expected and
    // not something to report back (the socket is already gone).
    if (clientClosed) {
      if (!res.writableEnded) {
        res.end();
      }
      return;
    }

    // 13. Never leak the raw Anthropic/transport error to the client. Log the
    //     real cause server-side and emit a generic SSE error event.
    // eslint-disable-next-line no-console
    console.error('Streaming chat response failed:', error);

    writeSseEvent(res, { type: 'error', message: 'Something went wrong' });

    if (!res.writableEnded) {
      res.end();
    }
  }
};
