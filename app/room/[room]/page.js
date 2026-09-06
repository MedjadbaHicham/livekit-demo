"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { LiveKitRoom, VideoConference } from "@livekit/components-react";
import "@livekit/components-styles";

function Room() {
  const params = useParams();
  const search = useSearchParams();
  const router = useRouter();

  const room = params.room;
  const name = search.get("name") || "guest";

  const [token, setToken] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    fetch(`/api/token?room=${encodeURIComponent(room)}&name=${encodeURIComponent(name)}`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "token request failed");
        if (!cancelled) setToken(data.token);
      })
      .catch((e) => {
        if (!cancelled) setError(e.message);
      });

    return () => {
      cancelled = true;
    };
  }, [room, name]);

  if (error) return <p className="status">Error: {error}</p>;
  if (!token) return <p className="status">Connecting to {room}...</p>;

  return (
    <LiveKitRoom
      token={token}
      serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
      connect
      video
      audio
      data-lk-theme="default"
      style={{ height: "100dvh" }}
      onDisconnected={() => router.push("/")}
    >
      <VideoConference />
    </LiveKitRoom>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<p className="status">Loading...</p>}>
      <Room />
    </Suspense>
  );
}
