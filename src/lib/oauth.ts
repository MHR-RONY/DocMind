/**
 * Browser-side helpers that drive the Google and Apple sign-in SDKs and return
 * the provider-issued ID token (a JWT). That token is then posted to the
 * DocMind backend, which verifies it and issues a session. No profile data is
 * ever trusted client-side — only the signed token is sent onward.
 */

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const APPLE_CLIENT_ID = import.meta.env.VITE_APPLE_CLIENT_ID;
const APPLE_REDIRECT_URI = import.meta.env.VITE_APPLE_REDIRECT_URI;

/** Thrown when a provider isn't configured or the user cancels/closes the flow. */
export class OAuthUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OAuthUnavailableError";
  }
}

interface GoogleCredentialResponse {
  credential?: string;
}

interface GoogleAccountsId {
  initialize(config: {
    client_id: string;
    callback: (response: GoogleCredentialResponse) => void;
  }): void;
  prompt(): void;
}

interface AppleAuthResponse {
  authorization?: { id_token?: string };
}

interface AppleID {
  auth: {
    init(config: {
      clientId: string;
      scope: string;
      redirectURI: string;
      usePopup: boolean;
    }): void;
    signIn(): Promise<AppleAuthResponse>;
  };
}

declare global {
  interface Window {
    google?: { accounts: { id: GoogleAccountsId } };
    AppleID?: AppleID;
  }
}

/** Injects a third-party script once, resolving when it has loaded. */
function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${src}"]`,
    );
    if (existing) {
      if (existing.dataset.loaded === "true") {
        resolve();
        return;
      }
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () =>
        reject(new OAuthUnavailableError("Failed to load sign-in script")),
      );
      return;
    }

    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.defer = true;
    script.addEventListener("load", () => {
      script.dataset.loaded = "true";
      resolve();
    });
    script.addEventListener("error", () =>
      reject(new OAuthUnavailableError("Failed to load sign-in script")),
    );
    document.head.appendChild(script);
  });
}

/**
 * Triggers Google Identity Services and resolves with the returned ID token.
 * Uses the One Tap / prompt flow; the credential is a JWT we forward verbatim.
 */
export async function getGoogleIdToken(): Promise<string> {
  if (!GOOGLE_CLIENT_ID) {
    throw new OAuthUnavailableError(
      "Google sign-in is not configured for this app",
    );
  }
  await loadScript("https://accounts.google.com/gsi/client");
  const accounts = window.google?.accounts.id;
  if (!accounts) {
    throw new OAuthUnavailableError("Google sign-in failed to initialize");
  }

  return new Promise<string>((resolve, reject) => {
    accounts.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: (response) => {
        if (response.credential) {
          resolve(response.credential);
        } else {
          reject(new OAuthUnavailableError("Google sign-in was cancelled"));
        }
      },
    });
    accounts.prompt();
  });
}

/**
 * Triggers Sign in with Apple (popup mode) and resolves with the ID token.
 * NOTE: Apple does not permit `localhost` redirect URIs — this requires a
 * deployed HTTPS origin registered with your Apple Services ID.
 */
export async function getAppleIdToken(): Promise<string> {
  if (!APPLE_CLIENT_ID || !APPLE_REDIRECT_URI) {
    throw new OAuthUnavailableError(
      "Apple sign-in is not configured for this app",
    );
  }
  await loadScript(
    "https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js",
  );
  const appleId = window.AppleID;
  if (!appleId) {
    throw new OAuthUnavailableError("Apple sign-in failed to initialize");
  }

  appleId.auth.init({
    clientId: APPLE_CLIENT_ID,
    scope: "name email",
    redirectURI: APPLE_REDIRECT_URI,
    usePopup: true,
  });

  const response = await appleId.auth.signIn();
  const idToken = response.authorization?.id_token;
  if (!idToken) {
    throw new OAuthUnavailableError("Apple sign-in was cancelled");
  }
  return idToken;
}
