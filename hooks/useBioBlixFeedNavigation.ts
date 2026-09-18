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
 * Web-only: navigate BioBlix vertical feed with arrow keys + mouse wheel.
 * Avoids relying on mobile touch paging (which is flaky in desktop browsers).
 */
export function useBioBlixFeedNavigation({
  enabled,
  itemCount,
  activeIndex,
  onIndexChange,
}: Options) {
  const indexRef = useRef(activeIndex);
  const lockedRef = useRef(false);

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
      }, 480);
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

      // Stop the page/body from scrolling; FlatList snaps via onIndexChange.
      event.preventDefault();
      withLock(() => {
        if (event.deltaY > 0) goTo(indexRef.current + 1);
        else goTo(indexRef.current - 1);
      });
    };

    window.addEventListener('keydown', onKeyDown, { capture: true });
    window.addEventListener('wheel', onWheel, { passive: false, capture: true });

    return () => {
      window.removeEventListener('keydown', onKeyDown, true);
      window.removeEventListener('wheel', onWheel, true);
    };
  }, [enabled, goTo]);
}
