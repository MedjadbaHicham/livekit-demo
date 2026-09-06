"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

const WORDS = ["blue", "north", "quiet", "river", "amber", "solid", "drift", "level"];

function randomCode() {
  const word = WORDS[Math.floor(Math.random() * WORDS.length)];
  const digits = Math.floor(100 + Math.random() * 900);
  return `${word}-${digits}`;
}

export default function Home() {
  const router = useRouter();
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const [name, setName] = useState("");
  const [room, setRoom] = useState("");
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraBlocked, setCameraBlocked] = useState(false);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    navigator.mediaDevices
      .getUserMedia({ video: true, audio: false })
      .then((stream) => {
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        streamRef.current = stream;

        const el = videoRef.current;
        if (el) {
          el.muted = true;
          el.srcObject = stream;
          el.play().catch(() => {});
        }

        setCameraReady(true);
      })
      .catch(() => {
        if (!cancelled) setCameraBlocked(true);
      });

    return () => {
      cancelled = true;
      stopCamera();
    };
  }, [stopCamera]);

  function join() {
    const r = room.trim() || randomCode();
    const n = name.trim() || "guest";
    stopCamera();
    router.push(`/room/${encodeURIComponent(r)}?name=${encodeURIComponent(n)}`);
  }

  return (
    <main className="prejoin">
      <video
        ref={videoRef}
        className={cameraReady ? "preview preview-on" : "preview"}
        autoPlay
        muted
        playsInline
      />
      <div className="scrim" />

      <section className="panel">
        <h1>Start a video room</h1>
        <p className="lede">
          Pick a code and share it. Anyone who enters the same code lands in your call.
        </p>

        <div className="fields">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && join()}
            placeholder="Your name"
            aria-label="Your name"
          />

          <div className="code">
            <input
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && join()}
              placeholder="Room code"
              aria-label="Room code"
            />
            <button className="ghost" onClick={() => setRoom(randomCode())}>
              Pick one for me
            </button>
          </div>
        </div>

        <button className="primary" onClick={join}>
          Join room
        </button>

        {cameraBlocked && (
          <p className="hint">
            Your browser is blocking the camera. Allow it in the address bar, or join
            anyway and turn it on inside the room.
          </p>
        )}
      </section>
    </main>
  );
}
