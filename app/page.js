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

        const track = stream.getVideoTracks()[0];
        const settings = track ? track.getSettings() : null;
        if (settings && settings.width) {
          setResolution(`${settings.width} \u00d7 ${settings.height}`);
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
      ? `camera live   ${resolution}`
      : status === "blocked"
        ? "no camera"
        : "waking the camera";

  return (
    <main className="stage">
      <video
        ref={videoRef}
        className={status === "ready" ? "feed feed-on" : "feed"}
        autoPlay
        muted
        playsInline
      />

      <div className="grade" />
      <div className="scrim" />
      <div className="grain" />

      <span className="corner tl" />
      <span className="corner tr" />
      <span className="corner bl" />
      <span className="corner br" />

      <div className="hud">
        <span className={status === "ready" ? "dot dot-live" : "dot"} />
        {statusLabel}
      </div>

      <section className="panel">
        <h1>
          Get everyone <em>in the room.</em>
        </h1>

        <p className="lede">
          Pick a code. Send it to whoever you want. They open a link and they are
          already there. Nothing to download, nothing to install.
        </p>

        <div className="fields">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && join()}
            placeholder="who are you?"
            aria-label="Your name"
          />

          <div className="code">
            <input
              className="mono"
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && join()}
              placeholder="room code"
              aria-label="Room code"
            />
            <button className="ghost" onClick={() => setRoom(randomCode())}>
              make me one
            </button>
          </div>
        </div>

        <button className="go" onClick={join}>
          Join the room
        </button>

        {status === "blocked" && (
          <p className="hint">
            Your browser is holding the camera back. Allow it from the address bar, or
            walk in anyway and switch it on once you are inside.
          </p>
        )}
      </section>
    </main>
  );
}
