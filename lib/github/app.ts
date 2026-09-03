/**
 * Server-only GitHub App authentication module.
 * 
 * Generates signed RS256 JWTs using the GitHub App's private key and exchanges
 * them for short-lived installation access tokens.
 * 
 * Rules:
 * - Never run in the browser.
 * - Private key is kept strictly in server memory.
 * - Minimum required permissions: Read-only repository contents / metadata.
 */

import crypto from "node:crypto";

interface CachedInstallationToken {
  token: string;
  expiresAt: number; // Unix timestamp in ms
}

let cachedToken: CachedInstallationToken | null = null;

/**
 * Returns true if the server environment has GitHub App credentials configured.
 */
export function isGitHubAppConfigured(): boolean {
  if (typeof window !== "undefined") {
    return false;
  }

  const appId = process.env.GITHUB_APP_ID;
  const privateKey = process.env.GITHUB_APP_PRIVATE_KEY;
  const installationId = process.env.GITHUB_APP_INSTALLATION_ID;

  return Boolean(
    appId &&
    privateKey &&
    installationId &&
    !appId.includes("example") &&
    !installationId.includes("example")
  );
}

/**
 * Normalizes the private key from either raw PEM or Base64-encoded string.
 */
function getNormalizedPrivateKey(): string | null {
  const raw = process.env.GITHUB_APP_PRIVATE_KEY;
  if (!raw) return null;

  let key = raw.trim();

  // Handle base64-encoded PEM
  if (!key.includes("BEGIN RSA PRIVATE KEY") && !key.includes("BEGIN PRIVATE KEY")) {
    try {
      const decoded = Buffer.from(key, "base64").toString("utf-8");
      if (decoded.includes("BEGIN")) {
        key = decoded;
      }
    } catch {
      // Not base64, continue
    }
  }

  // Handle literal escaped newlines ("\n")
  if (key.includes("\\n")) {
    key = key.replace(/\\n/g, "\n");
  }

  return key;
}

/**
 * Generates an RS256 signed JWT for authenticating as the GitHub App.
 * Lifetime: 9 minutes (max allowed by GitHub is 10 minutes).
 */
export function generateAppJwt(): string | null {
  if (typeof window !== "undefined") {
    throw new Error("generateAppJwt cannot be called from the browser.");
  }

  const appId = process.env.GITHUB_APP_ID;
  const privateKey = getNormalizedPrivateKey();

  if (!appId || !privateKey) {
    return null;
  }

  try {
    const now = Math.floor(Date.now() / 1000);
    const payload = {
      iat: now - 60, // 60 seconds clock drift allowance
      exp: now + 9 * 60, // 9 minutes expiration
      iss: appId,
    };

    const header = {
      alg: "RS256",
      typ: "JWT",
    };

    const encodedHeader = Buffer.from(JSON.stringify(header)).toString("base64url");
    const encodedPayload = Buffer.from(JSON.stringify(payload)).toString("base64url");
    const signingInput = `${encodedHeader}.${encodedPayload}`;

    const signer = crypto.createSign("RSA-SHA256");
    signer.update(signingInput);
    const signature = signer.sign(privateKey, "base64url");

    return `${signingInput}.${signature}`;
  } catch (err) {
    console.warn("Failed to generate GitHub App JWT:", err);
    return null;
  }
}

/**
 * Obtains an installation access token for the configured GitHub App installation.
 * Automatically caches and reuses the token until 60 seconds before expiration.
 */
export async function getInstallationAccessToken(): Promise<string | null> {
  if (typeof window !== "undefined") {
    throw new Error("getInstallationAccessToken cannot be called from the browser.");
  }

  const now = Date.now();
  if (cachedToken && cachedToken.expiresAt > now + 60 * 1000) {
    return cachedToken.token;
  }

  const installationId = process.env.GITHUB_APP_INSTALLATION_ID;
  const jwt = generateAppJwt();

  if (!installationId || !jwt) {
    return null;
  }

  try {
    const response = await fetch(
      `https://api.github.com/app/installations/${installationId}/access_tokens`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${jwt}`,
          Accept: "application/vnd.github+json",
          "User-Agent": "Portfolio-GitHub-Sync/1.0",
          "X-GitHub-Api-Version": "2022-11-28",
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.warn(
        `GitHub installation token error (${response.status}):`,
        errorText
      );
      return null;
    }

    const data = (await response.json()) as {
      token: string;
      expires_at: string;
    };

    cachedToken = {
      token: data.token,
      expiresAt: new Date(data.expires_at).getTime(),
    };

    return cachedToken.token;
  } catch (err) {
    console.warn("Failed to fetch GitHub installation access token:", err);
    return null;
  }
}
