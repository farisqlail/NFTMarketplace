/* Reusable helper for tracking client-side liked works with localStorage persistence. */

const LIKED_STORAGE_KEY = "cadastra_liked_works";

export function getLikedWorks(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LIKED_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function isWorkLiked(id: string): boolean {
  if (typeof window === "undefined") return false;
  const list = getLikedWorks();
  return list.includes(id);
}

export function toggleWorkLiked(id: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    const list = getLikedWorks();
    const index = list.indexOf(id);
    let nextList: string[];
    let isNowLiked: boolean;

    if (index >= 0) {
      nextList = list.filter((item) => item !== id);
      isNowLiked = false;
    } else {
      nextList = [...list, id];
      isNowLiked = true;
    }

    localStorage.setItem(LIKED_STORAGE_KEY, JSON.stringify(nextList));
    window.dispatchEvent(new CustomEvent("cadastra:likes_changed", { detail: { id, liked: isNowLiked } }));
    return isNowLiked;
  } catch {
    return false;
  }
}
