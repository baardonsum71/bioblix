import { useCallback, useEffect, useRef } from 'react';
import { Platform } from 'react-native';

type Options = {
  enabled: boolean;
  itemCount: number;
  activeIndex: number;
  onIndexChange: (index: number) => void;
};

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return (
    tag === 'INPUT' ||
    tag === 'TEXTAREA' ||
    tag === 'SELECT' ||
    target.isContentEditable
  );
}

/**
 * Web: navigate vertical feed with arrow keys, mouse wheel, and touch swipe.
 * Touch swipe is critical on iPhone Safari where FlatList paging is flaky.
 */
export function useBioBlixFeedNavigation({
  enabled,
  itemCount,
  activeIndex,
  onIndexChange,
}: Options) {
  const indexRef = useRef(activeIndex);
  const lockedRef = useRef(false);
  const touchStartY = useRef<number | null>(null);

  useEffect(() => {
    indexRef.current = activeIndex;
  }, [activeIndex]);

  const goTo = useCallback(
    (next: number) => {
      if (itemCount <= 0) return;
      const clamped = Math.max(0, Math.min(itemCount - 1, next));
      if (clamped === indexRef.current) return;
      onIndexChange(clamped);
    },
    [itemCount, onIndexChange]
  );

  useEffect(() => {
    if (!enabled || Platform.OS !== 'web' || typeof window === 'undefined') {
      return;
    }

    const withLock = (fn: () => void) => {
      if (lockedRef.current) return;
      lockedRef.current = true;
      fn();
      window.setTimeout(() => {
        lockedRef.current = false;
      }, 420);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (isEditableTarget(event.target)) return;

      if (event.key === 'ArrowDown' || event.key === 'PageDown' || event.key === 'j') {
        event.preventDefault();
        withLock(() => goTo(indexRef.current + 1));
      } else if (event.key === 'ArrowUp' || event.key === 'PageUp' || event.key === 'k') {
        event.preventDefault();
        withLock(() => goTo(indexRef.current - 1));
      }
    };

    const onWheel = (event: WheelEvent) => {
      if (isEditableTarget(event.target)) return;
      if (Math.abs(event.deltaY) < 20) return;
      event.preventDefault();
      withLock(() => {
        if (event.deltaY > 0) goTo(indexRef.current + 1);
        else goTo(indexRef.current - 1);
      });
    };

    const onTouchStart = (event: TouchEvent) => {
      if (isEditableTarget(event.target)) return;
      touchStartY.current = event.touches[0]?.clientY ?? null;
    };

    const onTouchEnd = (event: TouchEvent) => {
      if (touchStartY.current == null) return;
      const endY = event.changedTouches[0]?.clientY;
      if (endY == null) {
        touchStartY.current = null;
        return;
      }
      const delta = touchStartY.current - endY;
      touchStartY.current = null;
      if (Math.abs(delta) < 48) return;
      withLock(() => {
        if (delta > 0) goTo(indexRef.current + 1);
        else goTo(indexRef.current - 1);
      });
    };

    window.addEventListener('keydown', onKeyDown, { capture: true });
    window.addEventListener('wheel', onWheel, { passive: false, capture: true });
    window.addEventListener('touchstart', onTouchStart, { capture: true, passive: true });
    window.addEventListener('touchend', onTouchEnd, { capture: true, passive: true });

    return () => {
      window.removeEventListener('keydown', onKeyDown, true);
      window.removeEventListener('wheel', onWheel, true);
      window.removeEventListener('touchstart', onTouchStart, true);
      window.removeEventListener('touchend', onTouchEnd, true);
    };
  }, [enabled, goTo]);
}
