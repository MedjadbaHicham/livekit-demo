"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

const WORDS = ["harbor", "ember", "willow", "cobalt", "mango", "atlas", "juno", "birch"];

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
  const [status, setStatus] = useState("waking");
  const [resolution, setResolution] = useState("");

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    navigator.mediaDevices
      .getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      })
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

        const track = stream.getVideoTracks()[0];
        const settings = track ? track.getSettings() : null;
        if (settings && settings.width) {
          setResolution(`${settings.width} × ${settings.height}`);
        }

        setStatus("ready");
      })
      .catch(() => {
        if (!cancelled) setStatus("blocked");
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

  const statusLabel =
    status === "ready"
      ? `camera on   ${resolution}`
      : status === "blocked"
        ? "no camera"
        : "starting camera";

  return (
    <main className="page">
      <div className="container">
        <section>
          <span className="eyebrow">Browser video rooms</span>

          <h1>Video calls with no install, no sign-up.</h1>

          <p className="lede">
            Pick a room code and send it to whoever you want. They open the link and
            they&apos;re already there, camera and mic only.
          </p>

          <div className="fields">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && join()}
              placeholder="Your name"
              aria-label="Your name"
            />

            <div className="code-row">
              <input
                className="mono"
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && join()}
                placeholder="Room code"
                aria-label="Room code"
              />
              <button type="button" className="btn-ghost" onClick={() => setRoom(randomCode())}>
                Generate
              </button>
            </div>
          </div>

          <button type="button" className="btn-primary" onClick={join}>
            Join the room
          </button>

          {status === "blocked" && (
            <p className="hint">
              Your browser is holding the camera back. Allow it from the address bar, or
              join anyway and turn it on once you&apos;re inside.
            </p>
          )}
        </section>

        <div className="preview">
          <video
            ref={videoRef}
            className={status === "ready" ? "feed feed-on" : "feed"}
            autoPlay
            muted
            playsInline
          />

          <div className="preview-hud">
            <span className={status === "ready" ? "dot dot-live" : "dot"} />
            {statusLabel}
          </div>
        </div>
      </div>
    </main>
  );
}
