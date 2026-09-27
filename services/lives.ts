import {
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
  limit,
  type DocumentData,
  type Unsubscribe,
} from 'firebase/firestore';

import type { LiveSession } from '@/types';
import { COLLECTIONS, db } from '@/lib/firebase';

function mapLive(id: string, data: DocumentData): LiveSession {
  return {
    id,
    hostUserId: typeof data.hostUserId === 'string' ? data.hostUserId : '',
    hostDisplayName:
      typeof data.hostDisplayName === 'string' ? data.hostDisplayName : '',
    title: typeof data.title === 'string' ? data.title : 'Live',
    roomName: typeof data.roomName === 'string' ? data.roomName : id,
    status: data.status === 'ended' ? 'ended' : 'live',
    startedAt: data.startedAt ?? null,
    endedAt: data.endedAt ?? null,
  };
}

/** One-shot list of currently live sessions. */
export async function listActiveLives(max = 20): Promise<LiveSession[]> {
  const { getDocs } = await import('firebase/firestore');
  const q = query(
    collection(db, COLLECTIONS.lives),
    where('status', '==', 'live'),
    orderBy('startedAt', 'desc'),
    limit(max)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => mapLive(d.id, d.data()));
}

/** Subscribe to active lives (feed). */
export function subscribeActiveLives(
  onChange: (lives: LiveSession[]) => void,
  onError?: (err: Error) => void,
  max = 20
): Unsubscribe {
  const q = query(
    collection(db, COLLECTIONS.lives),
    where('status', '==', 'live'),
    orderBy('startedAt', 'desc'),
    limit(max)
  );
  return onSnapshot(
    q,
    (snap) => {
      onChange(snap.docs.map((d) => mapLive(d.id, d.data())));
    },
    (err) => {
      onError?.(err instanceof Error ? err : new Error(String(err)));
    }
  );
}
