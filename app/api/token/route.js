import { AccessToken } from "livekit-server-sdk";

export const dynamic = "force-dynamic";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const room = searchParams.get("room");
  const name = searchParams.get("name");

  if (!room || !name) {
    return Response.json({ error: "room and name are required" }, { status: 400 });
  }

  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;

  if (!apiKey || !apiSecret) {
    return Response.json({ error: "missing LiveKit credentials" }, { status: 500 });
  }

  const suffix = Math.random().toString(36).slice(2, 7);

  const at = new AccessToken(apiKey, apiSecret, {
    identity: `${name}-${suffix}`,
    name,
    ttl: "2h",
  });

  at.addGrant({
    room,
    roomJoin: true,
    canPublish: true,
    canSubscribe: true,
    canPublishData: true,
  });

  return Response.json({ token: await at.toJwt() });
}