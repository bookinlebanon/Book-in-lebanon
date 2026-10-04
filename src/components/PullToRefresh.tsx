import React, { useEffect, useRef, useState } from 'react';
import { RefreshCw } from 'lucide-react';

const TRIGGER = 70; // px of pull needed to refresh
const MAX_PULL = 110;

/** True when the touch started somewhere that scrolls or drags on its own. */
function isIgnoredTarget(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null;
  if (!el?.closest) return false;
  // Modals, sheets and the bottom bar are position:fixed; maps handle their own drag.
  return !!el.closest('.fixed, .leaflet-container, input, textarea, select');
}

/** Pull down from the top of the page to run `onRefresh`, with a spinner indicator. */
export const PullToRefresh: React.FC<{ onRefresh: () => Promise<unknown> }> = ({ onRefresh }) => {
  const [pull, setPull] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef<number | null>(null);
  const pullRef = useRef(0);
  const refreshingRef = useRef(false);
  const onRefreshRef = useRef(onRefresh);
  onRefreshRef.current = onRefresh;

  useEffect(() => {
    const setPullBoth = (v: number) => {
      pullRef.current = v;
      setPull(v);
    };

    const onStart = (e: TouchEvent) => {
      if (refreshingRef.current || window.scrollY > 0 || e.touches.length !== 1 || isIgnoredTarget(e.target)) {
        startY.current = null;
        return;
      }
      startY.current = e.touches[0].clientY;
    };

    const onMove = (e: TouchEvent) => {
      if (startY.current === null) return;
      const dy = e.touches[0].clientY - startY.current;
      if (dy <= 0 || window.scrollY > 0) {
        if (pullRef.current) setPullBoth(0);
        return;
      }
      // Resist the pull so it feels elastic.
      setPullBoth(Math.min(MAX_PULL, dy * 0.5));
      if (e.cancelable) e.preventDefault();
    };

    const onEnd = async () => {
      if (startY.current === null) return;
      startY.current = null;
      if (pullRef.current < TRIGGER) {
        setPullBoth(0);
        return;
      }
      refreshingRef.current = true;
      setRefreshing(true);
      setPullBoth(TRIGGER);
      try {
        await onRefreshRef.current();
      } finally {
        refreshingRef.current = false;
        setRefreshing(false);
        setPullBoth(0);
      }
    };

    window.addEventListener('touchstart', onStart, { passive: true });
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend', onEnd);
    window.addEventListener('touchcancel', onEnd);
    return () => {
      window.removeEventListener('touchstart', onStart);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onEnd);
      window.removeEventListener('touchcancel', onEnd);
    };
  }, []);

  if (pull === 0 && !refreshing) return null;

  const progress = Math.min(1, pull / TRIGGER);
  return (
    <div
      className="fixed top-0 inset-x-0 z-50 flex justify-center pointer-events-none"
      style={{ transform: `translateY(${pull - 44}px)`, transition: startY.current === null ? 'transform 0.2s' : 'none' }}
    >
      <div className="w-10 h-10 rounded-full bg-white shadow-lg border border-stone-200 flex items-center justify-center">
        <RefreshCw
          className={`w-5 h-5 text-emerald-800 ${refreshing ? 'animate-spin' : ''}`}
          style={refreshing ? undefined : { transform: `rotate(${progress * 270}deg)`, opacity: 0.4 + progress * 0.6 }}
        />
      </div>
    </div>
  );
};
