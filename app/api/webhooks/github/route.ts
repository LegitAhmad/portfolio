import { NextResponse } from "next/server";
import { verifyWebhookSignature, handleWebhookEvent } from "@/lib/github/webhooks";

/**
 * GitHub App Webhook Endpoint.
 * 
 * Verifies the HMAC-SHA256 signature using GITHUB_WEBHOOK_SECRET,
 * handles push, repository, and star events, and synchronously returns
 * an immediate 200 response to stay within platform execution limits.
 */
export async function POST(request: Request) {
  const signature = request.headers.get("x-hub-signature-256");
  const event = request.headers.get("x-github-event");

  if (!signature || !event) {
    return NextResponse.json(
      { error: "Missing x-hub-signature-256 or x-github-event header" },
      { status: 400 }
    );
  }

  const rawBody = await request.text();
  const isValid = verifyWebhookSignature(rawBody, signature);

  if (!isValid) {
    return NextResponse.json(
      { error: "Invalid HMAC-SHA256 signature" },
      { status: 401 }
    );
  }

  try {
    const payload = JSON.parse(rawBody);
    const result = await handleWebhookEvent(event, payload);

    return NextResponse.json(
      { success: true, event, action: result.action },
      { status: 200 }
    );
  } catch (err) {
    console.warn("Failed to process GitHub webhook event payload:", err);
    return NextResponse.json(
      { error: "Malformed payload" },
      { status: 400 }
    );
  }
}
