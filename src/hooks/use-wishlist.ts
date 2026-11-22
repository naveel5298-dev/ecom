import { useState, useCallback, useEffect } from "react";

let wishlistIds: Set<string> = new Set();
const listeners = new Set<() => void>();
function emit() {
  listeners.forEach((l) => l());
}

export function useWishlist() {
  const [, rerender] = useState(0);
  useEffect(() => {
    const cb = () => rerender((n) => n + 1);
    listeners.add(cb);
    return () => {
      listeners.delete(cb);
    };
  }, []);

  const toggle = useCallback((id: string) => {
    if (wishlistIds.has(id)) wishlistIds.delete(id);
    else wishlistIds.add(id);
    wishlistIds = new Set(wishlistIds);
    emit();
  }, []);

  const isWishlisted = useCallback((id: string) => wishlistIds.has(id), []);

  return { wishlistIds, toggle, isWishlisted, count: wishlistIds.size };
}
