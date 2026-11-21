"use client";

/* Reusable interactive like button with local persistence and optimistic counter updates. */

import { useEffect, useState } from "react";
import { isWorkLiked, toggleWorkLiked } from "@/lib/likes";
import { fmtLikes } from "./WorkCard";

export function LikeButton({
  id,
  initialLikes = 0,
  size = 14,
}: {
  id: string;
  initialLikes?: number;
  size?: number;
}) {
  const [liked, setLiked] = useState(() => isWorkLiked(id));
  const [count, setCount] = useState(initialLikes);

  useEffect(() => {
    const handleSync = (e: Event) => {
      const customEvent = e as CustomEvent<{ id: string; liked: boolean }>;
      if (customEvent.detail && customEvent.detail.id === id) {
        setLiked(customEvent.detail.liked);
        setCount((prev) => (customEvent.detail.liked ? prev + 1 : Math.max(0, prev - 1)));
      }
    };

    window.addEventListener("cadastra:likes_changed", handleSync);
    return () => window.removeEventListener("cadastra:likes_changed", handleSync);
  }, [id]);

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const nextState = toggleWorkLiked(id);
    setLiked(nextState);
    setCount((prev) => (nextState ? prev + 1 : Math.max(0, prev - 1)));
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      className="card-likes"
      aria-label={liked ? "Unlike asset" : "Like asset"}
      style={{
        background: "transparent",
        border: "none",
        cursor: "pointer",
        padding: "2px 4px",
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        color: liked ? "var(--sig-red)" : "inherit",
        transition: "transform 0.12s, color 0.12s",
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill={liked ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="2"
        aria-hidden="true"
      >
        <path d="M12 21s-8-4.9-8-10.4A4.6 4.6 0 0 1 12 7a4.6 4.6 0 0 1 8 3.6C20 16.1 12 21 12 21z" />
      </svg>
      <span>{fmtLikes(count)}</span>
    </button>
  );
}
